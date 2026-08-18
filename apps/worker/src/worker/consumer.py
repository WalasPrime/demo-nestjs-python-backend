import logging
import os

import pika
from dotenv import load_dotenv

from .task_handler import process_task
from .telemetry import configure_tracing

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    tracer_provider = configure_tracing()
    try:
        conn = pika.BlockingConnection(pika.URLParameters(os.getenv("RABBITMQ_URL")))
        ch = conn.channel()
        ch.queue_declare(queue="jobs", durable=True)
        ch.basic_qos(
            prefetch_count=1
        )  # Otherwise will take more jobs than it can handle
        ch.basic_consume(queue="jobs", on_message_callback=process_task)
        logger.info("Worker started. Waiting for tasks...")
        ch.start_consuming()
    finally:
        tracer_provider.shutdown()


if __name__ == "__main__":
    main()
