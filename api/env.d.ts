declare namespace NodeJS {
  interface ProcessEnv {
    // LLM provider selection
    LLM_PROVIDER?: 'openai' | 'huggingface';

    // OpenAI configuration
    OPENAI_API_KEY?: string;
    OPENAI_MODEL?: string;

    // Hugging Face configuration
    HUGGINGFACE_API_KEY?: string;
    HUGGINGFACE_MODEL?: string;
  }
}
