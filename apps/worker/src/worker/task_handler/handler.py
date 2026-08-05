import json
import logging


def process_task(ch, method, properties, body):
    logging.info(f"Received task: {body.decode()}")
    task = json.loads(body)
    result = {"status": "done", "data": task}

    ch.basic_publish(
        exchange="",
        routing_key="results",
        body=json.dumps(result),
        # properties=pika.BasicProperties(correlation_id=properties.correlation_id)
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)
    logging.info(f"Processed task: {task} and sent result: {result}")
