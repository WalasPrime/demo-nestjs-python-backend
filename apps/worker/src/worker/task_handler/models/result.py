from __future__ import annotations

from typing import Any, Annotated, Literal, Union

from pydantic import BaseModel, Field, TypeAdapter


class DoneResultMessage(BaseModel):
    status: Literal["done"]
    id: str
    data: Any


ResultMessage = Annotated[Union[DoneResultMessage], Field(discriminator="status")]
ResultMessageAdapter = TypeAdapter(ResultMessage)


__all__ = [
    "DoneResultMessage",
    "ResultMessage",
    "ResultMessageAdapter",
]
