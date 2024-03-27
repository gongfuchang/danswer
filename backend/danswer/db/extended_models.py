import datetime
from enum import Enum as PyEnum


from sqlalchemy import ForeignKey, Boolean, Text, Integer, UUID, DateTime, func, Enum, Float
from sqlalchemy.orm import mapped_column, Mapped, relationship

from danswer.db.models import Base


class LMInvokeEventType(str, PyEnum):
    """
    event_type IN ('chat', 'search', 'system', 'test')
    """
    CHAT = "chat"
    SEARCH = "search"
    SYSTEM = "system"
    TEST = "test"


class LMInvokeType(str, PyEnum):
    """
    invoke_type IN ('stream', 'invoke')
    """
    STREAM = "stream"
    INVOKE = "invoke"
class LMInvocation(Base):
    __tablename__ = "lm_invocation"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"), nullable=False)
    hint: Mapped[str | None] = mapped_column(Text, nullable=True)
    threading_id: Mapped[UUID] = mapped_column(Text, default=0)
    chat_session_id: Mapped[int] = mapped_column(Integer, default=0)
    parent_message_id: Mapped[int] = mapped_column(Integer, default=0)

    event_type: Mapped[LMInvokeEventType | None] = mapped_column(
        Enum(LMInvokeEventType)
    )
    invoke_type: Mapped[LMInvokeType| None] = mapped_column(
        Enum(LMInvokeType)
    )
    invoke_at: Mapped[float] = mapped_column(Float, default=0)
    invoke_elapse: Mapped[float] = mapped_column(Float, default=0)
    model_name: Mapped[str | None] = mapped_column(Text, default=None)
    token_input_count: Mapped[int] = mapped_column(Integer, default=0)
    token_output_count: Mapped[int] = mapped_column(Integer, default=0)


class LMPrice(Base):
    __tablename__ = 'lm_price'

    id = mapped_column(Integer, primary_key=True, autoincrement=True)
    model_provider = mapped_column(Text, nullable=False)
    model_provider_zh = mapped_column(Text, nullable=False)
    model_name = mapped_column(Text, nullable=False)
    price = mapped_column(Float, nullable=False)
    add_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    update_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
