from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, Field, TypeAdapter


class ExampleJobPayload(BaseModel):
    data: str


class ExampleJobMessage(BaseModel):
    type: Literal["example"]
    id: str
    replyTo: str
    payload: ExampleJobPayload


JobMessage = Annotated[ExampleJobMessage, Field(discriminator="type")]
JobMessageAdapter = TypeAdapter(JobMessage)


__all__ = [
    "ExampleJobMessage",
    "ExampleJobPayload",
    "JobMessage",
    "JobMessageAdapter",
]
