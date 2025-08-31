
# Memory MCP – Classification

## Taxonomy

- **Entities**: FILE, CLASS, FUNCTION, METHOD, VAR, TICKET, COMMIT, API, ENV, DOC, NOTE, EVIDENCE, TODO, PLAN, PROTOCOL
- **Intent**: DECISION, ACTION, QUESTION, STATUS, CONTEXT
- **Signal Strength**: float [0–1]
- **Confidentiality**: public | internal | secret

## Deterministic Classifier

- Regex for "decision:", "todo:", "question?" etc.
- AST cues from code context (function defs, class defs).
- File extensions → FILE entity type.

## LLM Backstop

When rules are insufficient, call LLM with strict JSON schema:

```json
{
  "topic_key": "project:subarea",
  "entities": [{"type":"FUNCTION","name":"renderTickets","file":"src/tickets.js","line_start":42}],
  "intent": "ACTION",
  "signal_strength": 0.74,
  "confidentiality": "internal",
  "tags": ["tickets.html","grid","ui"]
}
```
