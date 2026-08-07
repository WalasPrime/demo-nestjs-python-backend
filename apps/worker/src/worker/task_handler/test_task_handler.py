import json
from unittest.mock import Mock

from src.worker.task_handler import process_task


def test_process_task_publishes_result_and_acknowledges():
    channel = Mock()
    method = Mock(delivery_tag="dummy-tag")
    properties = Mock()
    body = b'{"type": "example", "payload": {"data": "hello"}}'

    process_task(channel, method, properties, body)

    channel.basic_publish.assert_called_once_with(
        exchange="",
        routing_key="results",
        body=json.dumps(
            {
                "status": "done",
                "data": {
                    "type": "example",
                    "payload": {"data": "hello"},
                },
            }
        ),
    )
    channel.basic_ack.assert_called_once_with(delivery_tag="dummy-tag")
