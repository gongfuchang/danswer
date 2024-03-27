from collections.abc import Iterator

from langchain.schema.language_model import LanguageModelInput

from danswer.configs.model_configs import GEN_AI_MAX_OUTPUT_TOKENS
from danswer.llm.interfaces import LLM
from danswer.utils.logger import setup_logger
from zhipuai import ZhipuAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, AIMessageChunk

logger = setup_logger()


class Glm4ChatModel(LLM):

    @property
    def requires_api_key(self) -> bool:
        return False

    def __init__(
        self,
        api_key: str,
        max_output_tokens: int = GEN_AI_MAX_OUTPUT_TOKENS,
        model_version: str = "glm-4",
    ):
        self._llm = ZhipuAI(api_key=api_key)
        self.max_output_tokens = max_output_tokens
        # TODO configured from persona
        self.model_version = model_version
        self.temperature = 0.1

    def log_model_configs(self) -> None:
        pass

    def _convert_to_messages(self, prompt: list) -> list:
        if isinstance(prompt, str):
            return [{"role": "user", "content": prompt}]
        messages = []
        prompt = isinstance(prompt, list) and prompt or [prompt]
        for item in prompt:
            if isinstance(item, HumanMessage):
                messages.append({"role": "user", "content": item.content})
            elif isinstance(item, SystemMessage):
                messages.append({"role": "system", "content": item.content})
            elif isinstance(item, AIMessage):
                messages.append({"role": "assistant", "content": item.content})
        return messages

    def invoke(self, prompt: LanguageModelInput) -> str:
        messages = self._convert_to_messages(prompt)
        response = self._llm.chat.completions.create(
            model=self.model_version,
            messages=messages,
            temperature=self.temperature,
            max_tokens=self.max_output_tokens,
            stream=False)

        return response.choices[0].message.content

    def stream(self, prompt: LanguageModelInput) -> Iterator[str]:
        messages = self._convert_to_messages(prompt)
        response = self._llm.chat.completions.create(
            model=self.model_version,
            messages=messages,
            temperature=self.temperature,
            max_tokens=self.max_output_tokens,
            stream=True)


        # streamfy the response
        for chunk in response:
            if chunk.choices:
                yield AIMessageChunk(chunk.choices[0].delta.content or "")
