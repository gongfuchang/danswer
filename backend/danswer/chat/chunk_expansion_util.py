from typing import List

from danswer.configs.model_configs import DOC_EMBEDDING_CONTEXT_SIZE
from danswer.document_index.interfaces import DocumentIndex
from danswer.indexing.models import InferenceChunk
from danswer.llm.utils import check_number_of_tokens
from danswer.search.access_filters import build_access_filters_for_user
from danswer.search.models import IndexFilters
from danswer.utils.timing import log_function_time


def _extend_chunk(chunk: InferenceChunk, siblings: List[InferenceChunk], max_token: int,
                  max_length: int) -> List[InferenceChunk]:
    if not siblings:
        return [chunk]
    # concat content of chunk and siblings: begin from the current chunk, then left, and then right
    # step1: find the position of the current chunk in the siblings
    current_chunk_pos = -1
    for ind, sibling in enumerate(siblings):
        if sibling.chunk_id == chunk.chunk_id:
            current_chunk_pos = ind
            break

    if current_chunk_pos == -1:
        return [chunk]

    # step2: concatenate the content of the current chunk and the siblings
    left_siblings = siblings[:current_chunk_pos]
    right_siblings = siblings[current_chunk_pos + 1:]
    extended_chunks = [chunk]
    for sibling in left_siblings:
        # if the length of the concatenated content is bigger than max_length, then stop
        if len(extended_chunks) >= max_length \
                or check_number_of_tokens(''.join([ck.content for ck in extended_chunks])) >= max_token:
            break
        extended_chunks.insert(0, sibling)

    for sibling in right_siblings:
        if len(extended_chunks) >= max_length \
                or check_number_of_tokens(''.join([ck.content for ck in extended_chunks])) >= max_token:
            break
        extended_chunks.append(sibling)

    return extended_chunks


@log_function_time(print_only=True)
def extend_chunks(chunks: List[InferenceChunk], max_token: int = DOC_EMBEDDING_CONTEXT_SIZE, max_length: int = 3,
                  document_index: DocumentIndex = None) -> List[InferenceChunk]:
    """
    Extends the chunks from index server: fetch sibling chunks in the same document, then check its length.
    """
    if document_index is None:
        return chunks

    chunk_siblings = []
    for chunk in chunks:
        document_id = chunk.document_id
        # pass chunk_ind=None to fetch all chunks in the document
        inference_chunks = document_index.id_based_retrieval(
            document_id=document_id,
            chunk_ind=None,
            filters=None,
        )
        chunk_siblings.append(inference_chunks)

    result = []
    previous_chunk_ids = []
    for ind, siblings in enumerate(chunk_siblings):
        # if the current chunk has been extended, then skip totally
        chunk = chunks[ind]
        if chunk.chunk_id in previous_chunk_ids:
            continue

        # filter the extended_chunks, if the following chunks contains same chunk_id, then skip
        extended_chunks = _extend_chunk(chunks[ind], siblings, max_token, max_length)
        extended_chunks = [ck for ck in extended_chunks if ck.unique_id not in previous_chunk_ids]
        if len(extended_chunks) == 0:
            continue;

        previous_chunk_ids.extend([ck.unique_id for ck in extended_chunks])

        # concatenate the content of the current chunk and the siblings
        chunk.content = '\n'.join([ck.content for ck in extended_chunks])

        result.append(chunk)

    return result
