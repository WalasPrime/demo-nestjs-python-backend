from __future__ import annotations

from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field, TypeAdapter


class ExampleJobPayload(BaseModel):
    data: str


class ExampleJobMessage(BaseModel):
    type: Literal["example"]
    payload: ExampleJobPayload


JobMessage = Annotated[Union[ExampleJobMessage], Field(discriminator="type")]
JobMessageAdapter = TypeAdapter(JobMessage)


class JobEnvelope(BaseModel):
    pattern: str
    data: JobMessage


JobEnvelopeAdapter = TypeAdapter(JobEnvelope)


__all__ = [
    "ExampleJobMessage",
    "ExampleJobPayload",
    "JobEnvelope",
    "JobEnvelopeAdapter",
    "JobMessage",
    "JobMessageAdapter",
]
