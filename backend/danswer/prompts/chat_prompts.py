from danswer.prompts.constants import GENERAL_SEP_PAT
from danswer.prompts.constants import QUESTION_PAT

REQUIRE_CITATION_STATEMENT = """
Cite relevant statements INLINE using the format [1], [2], [3], etc to reference the document number, \
DO NOT provide a reference section at the end and DO NOT provide any links following the citations.
""".rstrip()

NO_CITATION_STATEMENT = """
Do not provide any citations even if there are examples in the chat history.
""".rstrip()

CITATION_REMINDER = """
Remember to provide inline citations in the format [1], [2], [3], etc.
"""

ADDITIONAL_INFO = "\n\nAdditional Information:\n\t- {datetime_info}."


CHAT_USER_PROMPT = f"""
Refer to the following context documents when responding to me.{{optional_ignore_statement}}
CONTEXT:
{GENERAL_SEP_PAT}
{{context_docs_str}}
{GENERAL_SEP_PAT}

{{task_prompt}}

{QUESTION_PAT.upper()}
{{user_query}}
""".strip()


CHAT_USER_CONTEXT_FREE_PROMPT = f"""
{{task_prompt}}

{QUESTION_PAT.upper()}
{{user_query}}
""".strip()


# Design considerations for the below:
# - In case of uncertainty, favor yes search so place the "yes" sections near the start of the
#   prompt and after the no section as well to deemphasize the no section
# - Conversation history can be a lot of tokens, make sure the bulk of the prompt is at the start
#   or end so the middle history section is relatively less paid attention to than the main task
# - Works worse with just a simple yes/no, seems asking it to produce "search" helps a bit, can
#   consider doing COT for this and keep it brief, but likely only small gains.
SKIP_SEARCH = "Skip Search"
YES_SEARCH = "Yes Search"
NOT_RELATED = "Not Related"
# TODO should read from persona about not related phrase
RELATED_REASON = "The query is nothing related with Apache Doris or database or computer system, like 'how are you/what is your cat name' etc.."
AGGRESSIVE_SEARCH_TEMPLATE = f"""
Given the conversation history and a follow up query, determine if the system should call \
an external search tool to better answer the latest user input.

Respond "{NOT_RELATED}" if: {RELATED_REASON}

Respond "{SKIP_SEARCH}" if either:
- There is sufficient information in chat history to FULLY and ACCURATELY answer the query AND \
additional information or details would provide little or no value.
- The query is some form of request that does not require additional information to handle.

Conversation History:
{GENERAL_SEP_PAT}
{{chat_history}}
{GENERAL_SEP_PAT}

If you are unsure, respond with {YES_SEARCH}.
Respond with EXACTLY and ONLY "{YES_SEARCH}" or "{SKIP_SEARCH} or {NOT_RELATED}"

Follow Up Input:
{{final_query}}
""".strip()

REQUIRE_SEARCH_SINGLE_MSG = f"""
Given the conversation history and a follow up query, determine if the system should call \
an external search tool to better answer the latest user input.

Respond "{YES_SEARCH}" if:
- Specific details or additional knowledge could lead to a better answer.
- There are new or unknown terms, or there is uncertainty what the user is referring to.
- If reading a document cited or mentioned previously may be useful.

Respond "{SKIP_SEARCH}" if:
- There is sufficient information in chat history to FULLY and ACCURATELY answer the query
and additional information or details would provide little or no value.
- The query is some task that does not require additional information to handle.

{GENERAL_SEP_PAT}
Conversation History:
{{chat_history}}
{GENERAL_SEP_PAT}

Even if the topic has been addressed, if more specific details could be useful, \
respond with "{YES_SEARCH}".
If you are unsure, respond with "{YES_SEARCH}".

Respond with EXACTLY and ONLY "{YES_SEARCH}" or "{SKIP_SEARCH}"

Follow Up Input:
{{final_query}}
""".strip()


HISTORY_QUERY_REPHRASE = f"""
给定以下对话和后续输入，将后续内容改写跟 Apache Doris 相关的独立的搜索短语。

重要提示：将查询编辑得尽可能简洁，删除与检索任务无关的任何信息，尽量使用关键字而不是完整的句子。

重要提示：不要将查询或短语翻译成另一种语言，保持原始语言，例如初始问题是中文，输出就用中文。
重要提示：请勿丢弃缩写词、形容词或副词，例如初始问题是“外表物化视图在FE中到底应该怎么用？”，输出就是“外表物化视图的用法 FE”。


如果主题有明显变化，请忽略之前的历史消息。
如果后续消息是错误或代码片段，请保持原先的初始问题。

{GENERAL_SEP_PAT}
对话历史消息:
{{chat_history}}
{GENERAL_SEP_PAT}

初始问题: {{question}}
独立的搜索短语 (不要做任何解释，不超过80个字符):
""".strip()


# The below prompts are retired
NO_SEARCH = "No Search"
REQUIRE_SEARCH_SYSTEM_MSG = f"""
You are a large language model whose only job is to determine if the system should call an \
external search tool to be able to answer the user's last message.

Respond with "{NO_SEARCH}" if:
- there is sufficient information in chat history to fully answer the user query
- there is enough knowledge in the LLM to fully answer the user query
- the user query does not rely on any specific knowledge

Respond with "{YES_SEARCH}" if:
- additional knowledge about entities, processes, problems, or anything else could lead to a better answer.
- there is some uncertainty what the user is referring to

Respond with EXACTLY and ONLY "{YES_SEARCH}" or "{NO_SEARCH}"
"""


REQUIRE_SEARCH_HINT = f"""
Hint: respond with EXACTLY {YES_SEARCH} or {NO_SEARCH}"
""".strip()


QUERY_REPHRASE_SYSTEM_MSG = """
Given a conversation (between Human and Assistant) and a final message from Human, \
rewrite the last message to be a concise standalone query which captures required/relevant \
context from previous messages. This question must be useful for a semantic (natural language) \
search engine.
""".strip()

QUERY_REPHRASE_USER_MSG = """
Help me rewrite this final message into a standalone query that takes into consideration the \
past messages of the conversation IF relevant. This query is used with a semantic search engine to \
retrieve documents. You must ONLY return the rewritten query and NOTHING ELSE. \
IMPORTANT, the search engine does not have access to the conversation history!

Query:
{final_query}
""".strip()


CHAT_NAMING = f"""
Given the following conversation, provide a SHORT name for the conversation.
IMPORTANT: TRY NOT TO USE MORE THAN 5 WORDS, MAKE IT AS CONCISE AS POSSIBLE.
Focus the name on the important keywords to convey the topic of the conversation.

IMPORTANT: You SHOULD use Chinese to output the name if the history messages contain ANY chinese character.

Chat History:
{{chat_history}}
{GENERAL_SEP_PAT}

Based on the above, what is a short name to convey the topic of the conversation?
""".strip()
