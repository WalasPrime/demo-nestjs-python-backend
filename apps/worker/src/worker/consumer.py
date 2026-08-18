import logging
import os

import pika
from dotenv import load_dotenv

from .task_handler import process_task

load_dotenv()

logging.basicConfig(level=logging.INFO)

def main():
    conn = pika.BlockingConnection(pika.URLParameters(os.getenv('RABBITMQ_URL')))
    ch = conn.channel()
    ch.queue_declare(queue='jobs', durable=True)
    ch.basic_qos(prefetch_count=1) # Otherwise will take more jobs than it can handle
    ch.basic_consume(queue='jobs', on_message_callback=process_task)
    ch.start_consuming()
    logging.info("Worker started. Waiting for tasks...")

if __name__ == '__main__':
    main()