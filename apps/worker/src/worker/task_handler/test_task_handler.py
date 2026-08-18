import json
from unittest.mock import Mock

from worker.task_handler import process_task


def test_process_task_publishes_result_for_envelope_payload():
    channel = Mock()
    method = Mock(delivery_tag="dummy-tag")
    properties = Mock()
    body = b'{"type": "example", "id": "abc123", "replyTo": "def456", "payload": {"data": "sample"}}'

    process_task(channel, method, properties, body)

    channel.basic_publish.assert_called_once_with(
        exchange="results_exchange",
        routing_key="def456",
        body=json.dumps(
            {
                "status": "done",
                "id": "abc123",
                "data": {
                    "type": "example",
                    "id": "abc123",
                    "replyTo": "def456",
                    "payload": {"data": "sample"},
                },
            }
        ),
    )
    channel.basic_ack.assert_called_once_with(delivery_tag="dummy-tag")


def test_process_task_invalid_message_does_not_ack_and_requeues():
    channel = Mock()
    method = Mock(delivery_tag="invalid-tag")
    properties = Mock()
    body = b'{"type": "unknown", "payload": {"data": 123}}'

    process_task(channel, method, properties, body)

    channel.basic_ack.assert_not_called()
    channel.basic_publish.assert_not_called()
    channel.basic_nack.assert_called_once_with(delivery_tag="invalid-tag", requeue=True)
