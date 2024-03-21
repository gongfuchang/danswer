export interface EmbeddingModelResponse {
  model_name: string | null;
}

export interface FullEmbeddingModelResponse {
  current_model_name: string;
  secondary_model_name: string | null;
}

export interface EmbeddingModelDescriptor {
  model_name: string;
  model_dim: number;
  normalize: boolean;
  query_prefix?: string;
  passage_prefix?: string;
}

export interface FullEmbeddingModelDescriptor extends EmbeddingModelDescriptor {
  description: string;
  isDefault?: boolean;
  link?: string;
}

export const AVAILABLE_MODELS: FullEmbeddingModelDescriptor[] = [
  {
    model_name: "BAAI/bge-large-zh-v1.5",
    model_dim: 1024,
    normalize: true,
    description:
      ("Default_Model_Description"),
    isDefault: true,
    link: "https://huggingface.co/BAAI/bge-large-zh-v1.5",
    query_prefix: "为这个句子生成表示以用于检索相关文章：",
    passage_prefix: "",
  },  
  {
    model_name: "intfloat/e5-base-v2",
    model_dim: 768,
    normalize: true,
    description:
      ("E5_Base_Description"),
    isDefault: true,
    link: "https://huggingface.co/intfloat/e5-base-v2",
    query_prefix: "query: ",
    passage_prefix: "passage: ",
  },
  {
    model_name: "intfloat/e5-small-v2",
    model_dim: 384,
    normalize: true,
    description:
      ("Small_Model_Description"),
    link: "https://huggingface.co/intfloat/e5-small-v2",
    query_prefix: "query: ",
    passage_prefix: "passage: ",
  },
  {
    model_name: "intfloat/multilingual-e5-base",
    model_dim: 768,
    normalize: true,
    description: ("Multilingual_Model_Description"),
    link: "https://huggingface.co/intfloat/multilingual-e5-base",
    query_prefix: "query: ",
    passage_prefix: "passage: ",
  },
  {
    model_name: "intfloat/multilingual-e5-small",
    model_dim: 384,
    normalize: true,
    description:
      "Multilingual_Small_Model_Description",
    link: "https://huggingface.co/intfloat/multilingual-e5-base",
    query_prefix: "query: ",
    passage_prefix: "passage: ",
  },
];

export const INVALID_OLD_MODEL = "thenlper/gte-small";

export function checkModelNameIsValid(modelName: string | undefined | null) {
  if (!modelName) {
    return false;
  }
  if (modelName === INVALID_OLD_MODEL) {
    return false;
  }
  return true;
}
