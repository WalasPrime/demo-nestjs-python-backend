from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, Field, TypeAdapter


class DoneResultMessage(BaseModel):
    status: Literal["done"]
    id: str
    data: Any


ResultMessage = Annotated[DoneResultMessage, Field(discriminator="status")]
ResultMessageAdapter = TypeAdapter(ResultMessage)


__all__ = [
    "DoneResultMessage",
    "ResultMessage",
    "ResultMessageAdapter",
]
