#!/usr/bin/env python3
"""
Helper to save conversation and curated memories into the Persistent AI Memory store.

This writes directly via the library so any agent using the same
AI_MEMORY_DATA_DIR will see the entries (useful for cross‑agent tests).

Usage examples:

  Store a conversation message:
    PYTHONPATH=/Volumes/DATA/GitHub/persistent-ai-memory \
    AI_MEMORY_DATA_DIR=/Users/lbruton/.ai-memory/data \
    python scripts/save_persistent_memory.py \
      --store-conversation \
      --role assistant \
      --content "Hello from Codex CLI" \
      --session-id "hextrackr-shared-test"

  Create a curated memory:
    PYTHONPATH=/Volumes/DATA/GitHub/persistent-ai-memory \
    AI_MEMORY_DATA_DIR=/Users/lbruton/.ai-memory/data \
    python scripts/save_persistent_memory.py \
      --create-memory \
      --content "Test: shared memory across agents" \
      --memory-type "test" \
      --importance 7 \
      --tags codex,mcp,shared
"""

import os
import sys
import argparse
import asyncio
from typing import List


def ensure_import_path() -> None:
    base = os.environ.get("PYTHONPATH")
    if base and base not in sys.path:
        sys.path.insert(0, base)


def get_data_dir() -> str:
    return os.environ.get("AI_MEMORY_DATA_DIR", os.path.expanduser("~/.ai-memory/data"))


async def main() -> int:
    ensure_import_path()
    try:
        from ai_memory_core import PersistentAIMemorySystem  # type: ignore
    except Exception as e:
        print(f"Error: could not import PersistentAIMemorySystem. Set PYTHONPATH to the persistent-ai-memory repo. Details: {e}")
        return 2

    parser = argparse.ArgumentParser(description="Save to Persistent AI Memory")
    parser.add_argument("--store-conversation", action="store_true", help="Store a conversation message")
    parser.add_argument("--create-memory", action="store_true", help="Create a curated memory entry")
    parser.add_argument("--content", required=True, help="Content text")
    parser.add_argument("--role", default="assistant", choices=["user", "assistant"], help="Role for conversation entry")
    parser.add_argument("--session-id", default=None, help="Optional session id")
    parser.add_argument("--memory-type", default=None, help="Type for curated memory")
    parser.add_argument("--importance", type=int, default=5, help="Importance 1-10 for curated memory")
    parser.add_argument("--tags", default=None, help="Comma-separated tags for curated memory")
    args = parser.parse_args()

    if not (args.store_conversation or args.create_memory):
        print("Nothing to do: choose --store-conversation and/or --create-memory")
        return 1

    data_dir = get_data_dir()
    mem = PersistentAIMemorySystem(data_dir=data_dir, enable_file_monitoring=False)

    if args.store_conversation:
        res = await mem.store_conversation(
            content=args.content,
            role=args.role,
            session_id=args.session_id,
        )
        print(f"Stored conversation: conversation_id={res.get('conversation_id')} message_id={res.get('message_id')} session_id={res.get('session_id')}")

    if args.create_memory:
        tag_list: List[str] = []
        if args.tags:
            tag_list = [t.strip() for t in args.tags.split(',') if t.strip()]
        res = await mem.create_memory(
            content=args.content,
            memory_type=args.memory_type,
            importance_level=args.importance,
            tags=tag_list,
        )
        print(f"Created curated memory: memory_id={res.get('memory_id')}")

    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))

