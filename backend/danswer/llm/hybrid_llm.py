import json
import os
import threading
from collections.abc import Iterator

from langchain.schema.language_model import LanguageModelInput
from langchain_core.language_models import BaseChatModel

from danswer.configs.model_configs import GEN_AI_MAX_OUTPUT_TOKENS
from danswer.db.extended_models import LMInvocation, LMInvokeType
from danswer.llm.interfaces import LLM
from danswer.llm.utils import message_generator_to_string_generator, check_number_of_tokens, \
    convert_lm_input_to_basic_string
from danswer.utils.logger import setup_logger
from danswer.llm.glm_llm import Glm4ChatModel
from langchain_core.messages import HumanMessage, AIMessage

from danswer.llm.lm_context import LMInvokeContext, get_mertrics_context
import time
from collections import deque
from typing import List

logger = setup_logger()

LLM_POLL_MODELS = (os.getenv("LLM_POLL_MODELS") or "glm4").split(",")
ENABLE_MODELS = (os.getenv("ENABLE_MODELS") or "").split(",")
class ModelMeter:
    def __init__(self, model):
        self.model = model
        self.total_invoke_counter = 0
        self.invoke_counter_last_1_min = 0
        self.invoke_counter_last_10_min = 0
        self.response_times_last_10_min = deque(maxlen=10)
        self.last_call_time = 0
        self.failure_counter_in_5_min = 0

    @property
    def average_response_time(self):
        if self.response_times_last_10_min:
            return sum(self.response_times_last_10_min) / len(self.response_times_last_10_min)
        return 0

    @property
    def failure_counter(self):
        if time.time() - self.last_call_time > 300:
            self.failure_counter_in_5_min = 0

        return self.failure_counter_in_5_min

    def record_invocation_failure(self):
        self.failure_counter_in_5_min += 1
        self.last_call_time = time.time()

    def record_invocation(self, model_name: str, invoke_time: int, response_time: int,
                          invoke_type: LMInvokeType, input_tokens: int=0, output_tokens: int=0):
        self.total_invoke_counter += 1
        self.failure_counter_in_5_min = 0

        if time.time() - self.last_call_time > 60:
            self.invoke_counter_last_1_min = 1
        else:
            self.invoke_counter_last_1_min += 1

        # if last timestamp is older than 10 min, reset the counter
        if time.time() - self.last_call_time > 600:
            self.invoke_counter_last_10_min = 1
            self.response_times_last_10_min.clear()
        else:
            self.invoke_counter_last_10_min += 1
            self.response_times_last_10_min.append(response_time)

        self.last_call_time = time.time()

        # TODO should be put as message via message queue
        context = get_mertrics_context()
        if context:
            user_id = context.user_id
            db_session = context.db_session
            if not db_session or not user_id:
                logger.warning(f"Skip recording invocation: no db_session-{db_session} or user_id-{user_id} in the context")
                return

            db_session.add(LMInvocation(
                user_id=user_id,
                hint=context.hint,
                threading_id=context.threading_id,
                chat_session_id=context.chat_session_id,
                parent_message_id=context.parent_message_id,
                event_type=context.event_type,
                invoke_type=invoke_type,
                invoke_at=invoke_time,
                invoke_elapse=response_time,
                model_name=model_name,
                token_input_count=input_tokens,
                token_output_count=output_tokens,

            ))
            db_session.commit()


class RoundRobinLoadBalancer:
    def __init__(self, models: List[ModelMeter]):
        self.models = models
        self.current_index = 0

    @property
    def model(self) -> BaseChatModel | Glm4ChatModel:
        return self.models[self.current_index].model

    @property
    def next_model_meter(self) -> ModelMeter:
        if not self.models:
            logger.error("No model available in the load balancer")
            return None
        self.current_index = (self.current_index + 1) % len(self.models)
        robin_count = 0
        while robin_count < len(self.models):
            robin_count += 1
            if self.current_index >= len(self.models):
                self.current_index = 0
            model_meter = self.models[self.current_index]
            # skip if the meter is too hot:
            # 0. the model has failed 2 times in a row
            # 1 more than 10 calls in the last 10 min,
            # 2 or average response time is more than 20s
            # 3 or more than 3 calls in the last 1 min
            if model_meter.failure_counter >= 2 \
                    or model_meter.invoke_counter_last_1_min >= 3 \
                    or model_meter.invoke_counter_last_10_min >= 30 \
                    or model_meter.average_response_time >= 20:
                logger.info(f"Skipping model {model_meter.model} due to high load: failure_counter={model_meter.failure_counter}, "
                            f"invoke_counter_last_1_min={model_meter.invoke_counter_last_1_min}, "
                            f"invoke_counter_last_10_min={model_meter.invoke_counter_last_10_min}, "
                            f"average_response_time={model_meter.average_response_time}")
                self.current_index += 1
            else:
                break

        if self.current_index >= len(self.models):
            self.current_index = 0

        return model_meter

LLM_POLL: RoundRobinLoadBalancer | None = None

class HydridModelChat(LLM):
    @property
    def requires_api_key(self) -> bool:
        return False

    @property
    def model_name(self) -> str:
        model = self.llm_poll.model
        if isinstance(model, Glm4ChatModel):
            return model.model_version

        return model.model

    @property
    def max_token(self):
        model = self.llm_poll.model
        if isinstance(model, Glm4ChatModel):
            return 4096 # TODO: read from persona: glm4 max token is 8192

        return 2048

    def _init_llm_poll(self) -> RoundRobinLoadBalancer:
        models = []
        for model_name_union in LLM_POLL_MODELS:
            model = None
            parts = model_name_union.split(":")
            model_name = parts[0]
            if self.specific_models and model_name not in self.specific_models:
                continue
            api_key = parts[1] if len(parts) > 1 else None
            if model_name == "glm4":
                model = Glm4ChatModel(api_key=(api_key or os.getenv('ZHIPU_API_KEY')))
            elif model_name == "glm3":
                model = Glm4ChatModel(api_key=(api_key or os.getenv('ZHIPU_API_KEY')), model_version="chatglm_turbo")

                # TODO should be remove after lang-chain/zhupuai fix conflict issue:
                # from langchain_community.chat_models import ChatZhipuAI
                # model = ChatZhipuAI(
                #         temperature=0.1,
                #         api_key=(api_key or os.getenv('ZHIPU_API_KEY')),
                #         model="chatglm_turbo",
                # )
            elif model_name == "baichuan":
                from langchain_community.chat_models import ChatBaichuan
                model = ChatBaichuan(baichuan_api_key=(api_key or os.getenv("BAICHUAN_API_KEY")))
            elif model_name == "qwen":
                if not os.getenv("DASHSCOPE_API_KEY"):
                    if not api_key:
                        raise ValueError("DASHSCOPE_API_KEY is not set")
                    os.environ["DASHSCOPE_API_KEY"] = api_key
                from langchain_community.chat_models.tongyi import ChatTongyi
                model = ChatTongyi()

            elif model_name == "moon-shot":
                from langchain_community.chat_models import ChatLiteLLM
                model = ChatLiteLLM(
                    api_key=(api_key or os.getenv('MOONSHOT_API_KEY')),
                    base_url="https://api.moonshot.cn/v1",
                    custom_llm_provider="openai",
                    model="moonshot-v1-8k",
                )

            elif model_name == "minimax":
                if not os.getenv("MINIMAX_API_KEY"):
                    if not api_key:
                        raise ValueError("MINIMAX_API_KEY is not set")
                    os.environ["MINIMAX_GROUP_ID"] = os.getenv("MINIMAX_GROUP_ID")
                    os.environ["MINIMAX_API_KEY"] = api_key
                # from langchain_community.chat_models import MiniMaxChat
                # model = MiniMaxChat()
                # TODO should be remove after lang-chain fix minmax model issue:
                # https://github.com/langchain-ai/langchain/issues/14796
                from danswer.llm.minimax_llm import MiniMaxChatModel
                model = MiniMaxChatModel()

            models.append(model)

        logger.info(f"LLM Poll Models: {models}")
        # every model align with a counter, to simulate the round-robin polling
        return RoundRobinLoadBalancer([ModelMeter(model) for model in models])

    def __init__(
        self,
        max_output_tokens: int = GEN_AI_MAX_OUTPUT_TOKENS,
        re_build: bool = False,
        specific_models: List[str] = [],
    ):
        self._max_output_tokens = max_output_tokens
        self.specific_models = specific_models
        if not self.specific_models:
            self.specific_models = ENABLE_MODELS or []

        global LLM_POLL
        if re_build or not LLM_POLL:
            LLM_POLL = self._init_llm_poll()
        self.llm_poll = LLM_POLL

    def log_model_configs(self) -> None:
        pass

    def invoke(self, prompt: LanguageModelInput) -> str:
        model_meter = self.llm_poll.next_model_meter
        model = model_meter.model
        start = time.time()

        try:
            response = model.invoke(prompt)
            model_meter.record_invocation(
                model_name=self.model_name,
                invoke_type=LMInvokeType.INVOKE,
                invoke_time=start,
                response_time=time.time() - start,
                input_tokens=check_number_of_tokens(convert_lm_input_to_basic_string(prompt)),
                output_tokens=check_number_of_tokens(response.content if isinstance(response, AIMessage) else response)
            )
            return isinstance(response, AIMessage) and response.content or response
        except Exception as e:
            logger.error(f"Error invoking model {model}: {e}")
            model_meter.record_invocation_failure()
            raise e

    def stream(self, prompt: LanguageModelInput) -> Iterator[str]:
        model_meter = self.llm_poll.next_model_meter
        model = model_meter.model
        start = time.time()
        output_tokens = []

        try:
            response = model.stream(prompt)
            for token in message_generator_to_string_generator(response):
                output_tokens.append(token)
                yield token
            model_meter.record_invocation(
                model_name=self.model_name,
                invoke_type=LMInvokeType.STREAM,
                invoke_time=start,
                response_time=time.time() - start,
                input_tokens=check_number_of_tokens(convert_lm_input_to_basic_string(prompt)),
                output_tokens=check_number_of_tokens(''.join(output_tokens)),
            )
        except Exception as e:
            logger.error(f"Error streaming model {model}: {e}")
            model_meter.record_invocation_failure()
            raise e


if __name__ == '__main__':
    hydrid = HydridModelChat()
    # print("invoke:")
    # print(hydrid.invoke([HumanMessage(content="你好")]))

    print("streaming:")
    for i in hydrid.stream([HumanMessage(content="你好")]):
        print(i)
