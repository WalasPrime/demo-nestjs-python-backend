import json
import logging

import pika
from opentelemetry import propagate, trace
from opentelemetry.trace import Status, StatusCode

from worker.task_handler.models import (
    DoneResultMessage,
    JobMessageAdapter,
    ResultMessageAdapter,
)

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)


def process_task(ch, method, properties, body):
    body_text = body.decode()
    logger.info(f"Received task: {body_text}")

    message_headers = getattr(properties, "headers", None)
    parent_context = propagate.extract(
        message_headers if isinstance(message_headers, dict) else {}
    )
    with tracer.start_as_current_span(
        "worker.job.received",
        context=parent_context,
        attributes={
            "messaging.system": "rabbitmq",
            "messaging.destination.name": "jobs",
        },
    ) as job_span:
        try:
            payload = json.loads(body_text)
            task = JobMessageAdapter.validate_python(payload)
            job_span.set_attribute("job.id", task.id)

            result_model = DoneResultMessage(
                status="done", id=task.id, data=task.model_dump()
            )
            validated_result = ResultMessageAdapter.validate_python(
                result_model.model_dump()
            )

            with tracer.start_as_current_span(
                "worker.result.published",
                attributes={
                    "messaging.system": "rabbitmq",
                    "messaging.destination.name": "results_exchange",
                    "messaging.rabbitmq.destination.routing_key": task.replyTo,
                    "job.id": task.id,
                },
            ):
                result_headers = {}
                propagate.inject(result_headers)
                publish_properties = (
                    pika.BasicProperties(headers=result_headers)
                    if result_headers
                    else None
                )
                ch.basic_publish(
                    exchange="results_exchange",
                    routing_key=task.replyTo,
                    body=json.dumps(validated_result.model_dump()),
                    **(
                        {"properties": publish_properties} if publish_properties else {}
                    ),
                )
            ch.basic_ack(delivery_tag=method.delivery_tag)
            logger.info(
                f"Processed task: {task.model_dump()} and sent result to {task.replyTo}: {validated_result.model_dump()}"
            )
        except Exception as error:
            job_span.record_exception(error)
            job_span.set_status(Status(StatusCode.ERROR, str(error)))
            logger.exception(f"Failed to process task: {body_text}")
            try:
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
            except pika.exceptions.AMQPError:
                logger.debug("basic_nack is unavailable; leaving message unacked.")
