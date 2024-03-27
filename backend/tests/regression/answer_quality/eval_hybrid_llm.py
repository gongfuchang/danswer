import argparse
import builtins
from contextlib import contextmanager
from datetime import datetime
from typing import Any
from typing import TextIO

import yaml
from langchain_core.messages import HumanMessage
from sqlalchemy.orm import Session

from danswer.chat.models import LLMMetricsContainer
from danswer.configs.constants import MessageType
from danswer.db.engine import get_sqlalchemy_engine
from danswer.db.extended_models import LMInvokeEventType, LMInvocation
from danswer.db.models import User
from danswer.llm.hybrid_llm import HydridModelChat
from danswer.llm.lm_context import bind_mertrics_context
from danswer.one_shot_answer.answer_question import get_search_answer
from danswer.one_shot_answer.models import DirectQARequest
from danswer.one_shot_answer.models import ThreadMessage
from danswer.search.models import IndexFilters
from danswer.search.models import OptionalSearchSetting
from danswer.search.models import RerankMetricsContainer
from danswer.search.models import RetrievalDetails
from danswer.search.models import RetrievalMetricsContainer
from danswer.server.query_and_chat.models import CreateChatMessageRequest
from danswer.utils.callbacks import MetricsHander


engine = get_sqlalchemy_engine()



if __name__ == "__main__":
    with Session(engine, expire_on_commit=False) as db_session:
        user = db_session.query(User).first()
        print("user-id", user.id)
        query = "just say 'hello world'"
        bind_mertrics_context(hint=query, user=user, db_session=db_session, event_type=LMInvokeEventType.SEARCH, chat_session_id=123, parent_message_id=123)

        hydrid = HydridModelChat(specific_models=[
            # "moon-shot",
            # "glm3",
            # "minimax"
        ])
        print("invoke:")
        print(hydrid.invoke([HumanMessage(content=query)]))

        print("streaming:")
        for i in hydrid.stream([HumanMessage(content=query)]):
            print(i)

        history = db_session.query(LMInvocation)
        print(history.all())



