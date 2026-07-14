import pika
import json
import logging
import os
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)

def process_task(ch, method, properties, body):
    logging.info(f"Received task: {body.decode()}")
    task = json.loads(body)
    result = {"status": "done", "data": task}
    
    ch.basic_publish(
        exchange='',
        routing_key='results',
        body=json.dumps(result),
        #properties=pika.BasicProperties(correlation_id=properties.correlation_id)
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)
    logging.info(f"Processed task: {task} and sent result: {result}")

def main():
    conn = pika.BlockingConnection(pika.URLParameters(os.getenv('RABBITMQ_URL')))
    ch = conn.channel()
    ch.queue_declare(queue='jobs', durable=True)
    ch.queue_declare(queue='results', durable=True)
    ch.basic_qos(prefetch_count=1)
    ch.basic_consume(queue='jobs', on_message_callback=process_task)
    ch.start_consuming()
    logging.info("Worker started. Waiting for tasks...")

if __name__ == '__main__':
    main()