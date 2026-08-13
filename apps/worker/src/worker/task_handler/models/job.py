from __future__ import annotations

from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field, TypeAdapter


class ExampleJobPayload(BaseModel):
    data: str


class ExampleJobMessage(BaseModel):
    type: Literal["example"]
    id: str
    payload: ExampleJobPayload


JobMessage = Annotated[Union[ExampleJobMessage], Field(discriminator="type")]
JobMessageAdapter = TypeAdapter(JobMessage)


__all__ = [
    "ExampleJobMessage",
    "ExampleJobPayload",
    "JobMessage",
    "JobMessageAdapter",
]
