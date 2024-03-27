import threading
from enum import Enum

from sqlalchemy.orm import Session

from danswer.db.extended_models import LMInvokeEventType
from danswer.db.models import User
import uuid

from danswer.server.query_and_chat.models import CreateChatMessageRequest


def bind_mertrics_context(user: User, db_session: Session,
                          hint: str = None,
                          event_type: LMInvokeEventType = LMInvokeEventType.SYSTEM,
                          chat_session_id: str = None, parent_message_id: str = None):
    context = LMInvokeContext(
        user_id=user.id,
        db_session=db_session,
        event_type=event_type,
        hint=hint,
        threading_id=uuid.uuid4(),
        chat_session_id=chat_session_id,
        parent_message_id=parent_message_id
    )

    # put context into thread local storage
    threading.current_thread().__dict__.update({'lm_invoke_context': context})


def get_mertrics_context():
    context = threading.current_thread().__dict__.get('lm_invoke_context', None)
    if isinstance(context, LMInvokeContext):
        return context
    return None


class LMInvokeContext:
    """
    This class is used to pass the context, including db_session, user_id, chat_session_id, event_type, etc..
    """

    def __init__(self, user_id: str, db_session: Session,
                 event_type: LMInvokeEventType = LMInvokeEventType.SYSTEM,
                 hint: str = None, threading_id: str = None,
                 chat_session_id: str = None, parent_message_id: str = None):
        self.user_id = user_id
        self.db_session = db_session
        self.event_type = event_type
        # strip 20 characters from the hint if it's too long
        self.hint = hint[:100] if hint else None
        self.threading_id = threading_id,
        self.chat_session_id = chat_session_id
        self.parent_message_id = parent_message_id
