import json
import os
from collections.abc import Iterator

from langchain.schema.language_model import LanguageModelInput

from danswer.configs.model_configs import GEN_AI_MAX_OUTPUT_TOKENS
from danswer.llm.interfaces import LLM
from danswer.llm.utils import message_generator_to_string_generator
from danswer.utils.logger import setup_logger
from danswer.llm.glm_llm import Glm4ChatModel
from langchain_core.messages import HumanMessage

import time
from collections import deque
from typing import List

logger = setup_logger()

LLM_POLL_MODELS = (os.getenv("LLM_POLL_MODELS") or "glm4,baichuan").split(",")

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

    def record_invocation(self, response_time):
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


class RoundRobinLoadBalancer:
    def __init__(self, models: List[ModelMeter]):
        self.models = models
        self.current_index = 0

    def get_next_model(self):
        self.current_index = (self.current_index + 1) % len(self.models)
        robin_count = 0
        while robin_count < len(self.models):
            robin_count += 1
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
                logger.info(f"Skipping model {model_meter.model} due to high load")
                self.current_index += 1
            else:
                break

        return model_meter

LLM_POLL: RoundRobinLoadBalancer | None = None

class HydridModelChat(LLM):
    @property
    def requires_api_key(self) -> bool:
        return False

    def _init_llm_poll(self) -> RoundRobinLoadBalancer:
        models = []
        for model_name_union in LLM_POLL_MODELS:
            model = None
            parts = model_name_union.split(":")
            model_name = parts[0]
            api_key = parts[1] if len(parts) > 1 else None
            if model_name == "glm4":
                model = Glm4ChatModel(api_key=(api_key or os.getenv('ZHIPU_API_KEY')))
            elif model_name == "glm3":
                from langchain_community.chat_models import ChatZhipuAI
                model = ChatZhipuAI(
                        temperature=0,
                        api_key=(api_key or os.getenv('ZHIPU_API_KEY')),
                        model="chatglm_turbo",
                )
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

            elif model_name == "minmax":
                if not os.getenv("MINIMAX_API_KEY"):
                    if not api_key:
                        raise ValueError("MINIMAX_API_KEY is not set")
                    os.environ["MINIMAX_GROUP_ID"] = os.getenv("MINIMAX_GROUP_ID")
                    os.environ["MINIMAX_API_KEY"] = api_key
                from langchain_community.chat_models import MiniMaxChat
                model = MiniMaxChat()

            models.append(model)

        logger.info(f"LLM Poll Models: {models}")
        # every model align with a counter, to simulate the round-robin polling
        return RoundRobinLoadBalancer([ModelMeter(model) for model in models])

    def __init__(
        self,
        max_output_tokens: int = GEN_AI_MAX_OUTPUT_TOKENS,
        re_build: bool = False,
    ):
        self._max_output_tokens = max_output_tokens

        global LLM_POLL
        if re_build or not LLM_POLL:
            LLM_POLL = self._init_llm_poll()
        self.llm_poll = LLM_POLL

    def log_model_configs(self) -> None:
        pass

    def invoke(self, prompt: LanguageModelInput) -> str:
        model_meter = self.llm_poll.get_next_model()
        model = model_meter.model
        start = time.time()

        try:
            response = model.invoke(prompt)
            model_meter.record_invocation(time.time() - start)
            return response
        except Exception as e:
            logger.error(f"Error invoking model {model}: {e}")
            model_meter.record_invocation_failure()
            raise e

    def stream(self, prompt: LanguageModelInput) -> Iterator[str]:
        model_meter = self.llm_poll.get_next_model()
        model = model_meter.model
        start = time.time()
        output_tokens = []

        try:
            response = model.stream(prompt)
            for token in message_generator_to_string_generator(response):
                output_tokens.append(token)
                yield token

            model_meter.record_invocation(time.time() - start)
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
