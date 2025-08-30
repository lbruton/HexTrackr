# Smart Scribe LLM Rationale

**Date**: August 17, 2025
**Status**: Active

## 1. Model Choice: `llama3:8b`

The "Smart Scribe" component of the Brain Share Memory System runs on a local LLM provided by Ollama. After careful consideration, **`llama3:8b`** has been selected as the optimal model for this task.

## 2. The Task: Semantic Analysis and Summarization

The primary role of the Smart Scribe is not code generation, but **reasoning about code**. It runs on every file save, performing two key functions:

1. **Analyze Code Changes**: It reads the content of a modified file to understand what has changed.
2. **Generate Semantic Summaries**: It produces a concise, human-readable summary of the change's *intent* and meaning, which is then logged into the system's long-term memory (`extendedcontext.json`).

## 3. Rationale for `llama3:8b`

While a specialized "Coder" model like `Qwen Coder` is excellent at code-specific tasks, `llama3:8b` was chosen for several strategic reasons that align with the project's long-term vision:

* **Superior General Reasoning**: The core task is natural language generation *about* code. `llama3:8b` excels at this, providing more nuanced and context-aware summaries than more specialized models.
* **State-of-the-Art Embedding Quality**: This is the most critical factor. A future goal of this project is to implement a vector-based search system for ultra-fast and intelligent memory retrieval. The quality of this search is entirely dependent on the quality of the vector embeddings. `llama3` models are industry leaders for producing high-quality embeddings, meaning that by using it now, we are building a superior search index for the future.
* **Optimal Performance**: The 8B model is highly optimized and runs with excellent performance on the target M4 Mac Mini hardware, offering a significant intelligence upgrade over smaller models with a negligible performance cost.
* **Future-Proofing**: Using `llama3:8b` today ensures that the foundational memory logs are of the highest possible quality, paving the way for more advanced future capabilities without needing to re-process historical data.

## 4. Conclusion

The selection of `llama3:8b` prioritizes the long-term intelligence and searchability of the Brain Share Memory System. It provides a robust foundation for both current summarization tasks and future retrieval-augmented generation (RAG) capabilities. This decision is documented in the machine-readable `rEngine/system-config.json` file, which now serves as the single source of truth for system configuration.
