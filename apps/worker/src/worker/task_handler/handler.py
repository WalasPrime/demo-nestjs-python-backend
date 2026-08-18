import json
import logging

from src.worker.task_handler.models import (
    DoneResultMessage,
    JobMessageAdapter,
    ResultMessageAdapter,
)


def process_task(ch, method, properties, body):
    body_text = body.decode()
    logging.info(f"Received task: {body_text}")

    try:
        payload = json.loads(body_text)
        task = JobMessageAdapter.validate_python(payload)

        result_model = DoneResultMessage(status="done", id=task.id, data=task.model_dump())
        validated_result = ResultMessageAdapter.validate_python(result_model.model_dump())

        ch.basic_publish(
            exchange="results_exchange",
            routing_key=task.replyTo,
            body=json.dumps(validated_result.model_dump()),
            # properties=pika.BasicProperties(correlation_id=properties.correlation_id)
        )
        ch.basic_ack(delivery_tag=method.delivery_tag)
        logging.info(
            f"Processed task: {task.model_dump()} and sent result to {task.replyTo}: {validated_result.model_dump()}"
        )
    except Exception:
        logging.exception(
            f"Failed to process task: {body_text}"
        )
        try:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        except Exception:
            logging.debug("basic_nack is unavailable; leaving message unacked.")
