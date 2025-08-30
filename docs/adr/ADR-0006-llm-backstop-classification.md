# ADR-0006: LLM Backstop for Memory Classification

Date: 2025-08-30
Status: Accepted

## Context

Deterministic regex/heuristic rules classify Evidence into entity/intent types. Some spans fall below the 0.7 confidence threshold, causing weak or missing classifications and poor reconciliation to Canonical Notes.

## Decision

Introduce an LLM backstop using a local Ollama model (qwen2.5-coder:7b). When deterministic classification signalStrength < 0.7, call the LLM with a strict JSON schema and use that result. Keep deterministic first for speed and stability.

## Consequences

- Higher classification recall with minimal latency cost.
- Clear fallback contract; JSON-validated.
- Local-first; no external data egress when Ollama is available.

## Implementation

- Implemented in `.rMemory/tools/symbol-table-processor.js`:
  - Added `llmClassify()` using Ollama HTTP API.
  - Switched to LLM result if below threshold.
  - Added simhash duplicate guard to reduce noise.

## Related

- Protocols: guard-dup-summaries, plan-before-expensive
- Schema: Evidence → Notes → Todos pipeline
