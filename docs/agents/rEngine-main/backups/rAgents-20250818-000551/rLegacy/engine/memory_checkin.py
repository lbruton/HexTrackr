#!/usr/bin/env python3
"""
StackTrackr Memory Vault - Check-in/Check-out System
Implements atomic writes, leases, and provenance tracking for multi-agent memory management.
Based on feedback for race condition prevention and conflict resolution.
"""

import json
import hashlib
import os
import sys
import time
import tempfile
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, Optional, List

# Configuration
ROOT = Path(__file__).parent.parent
MEMORY_DIR = ROOT / "memory"
SNAP = MEMORY_DIR / "snapshot.json"
LEASE = MEMORY_DIR / "locks" / "memory.lease"
EVENTS_DIR = MEMORY_DIR / "eventlog"
CHECKOUTS_DIR = MEMORY_DIR / "checkouts"
SCHEMAS_DIR = ROOT / "schemas"
CONFIG_FILE = ROOT / "config" / "env.json"

def ensure_dirs():
    """Ensure all required directories exist."""
    for d in [MEMORY_DIR, EVENTS_DIR, CHECKOUTS_DIR, MEMORY_DIR / "locks", SCHEMAS_DIR, ROOT / "config"]:
        d.mkdir(parents=True, exist_ok=True)

def sha256(obj: Any) -> str:
    """Compute SHA256 hash of JSON object with consistent ordering."""
    return hashlib.sha256(json.dumps(obj, sort_keys=True).encode()).hexdigest()

def read_json(path: Path) -> Dict[str, Any]:
    """Read JSON file safely."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError as e:
        print(f"JSON decode error in {path}: {e}", file=sys.stderr)
        sys.exit(4)

def write_atomic(path: Path, obj: Dict[str, Any]):
    """Write JSON atomically using temp file + rename."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(dir=path.parent, suffix='.tmp')
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, path)
    except Exception:
        try:
            os.unlink(tmp_path)
        except:
            pass
        raise

def now_iso() -> str:
    """Current timestamp in ISO format."""
    return datetime.utcnow().isoformat() + "Z"

def is_lease_expired(lease: Dict[str, Any]) -> bool:
    """Check if lease has expired."""
    try:
        expires = datetime.fromisoformat(lease["expires_at"].rstrip("Z"))
        return expires < datetime.utcnow()
    except (KeyError, ValueError):
        return True

def initialize_snapshot():
    """Initialize snapshot from existing memory files if it doesn't exist."""
    if SNAP.exists():
        return
    
    print("Initializing memory vault snapshot from existing files...")
    
    # Consolidate existing memory files into snapshot
    snapshot = {
        "metadata": {
            "version": "1.0",
            "created": now_iso(),
            "last_updated": now_iso(),
            "schema_version": "1.0",
            "initialized_from": "legacy_json_files"
        },
        "entities": {},
        "decisions": {},
        "tasks": {},
        "bugs": {},
        "roadmap": {},
        "patterns": {},
        "agents": {}
    }
    
    # Import from existing files
    legacy_files = {
        "decisions": ROOT / "decisions.json",
        "tasks": ROOT / "tasks.json", 
        "bugs": ROOT / "bugs.json",
        "roadmap": ROOT / "roadmap.json",
        "patterns": ROOT / "patterns.json"
    }
    
    for key, file_path in legacy_files.items():
        if file_path.exists():
            try:
                data = read_json(file_path)
                snapshot[key] = data
                print(f"  ✓ Imported {key} from {file_path.name}")
            except Exception as e:
                print(f"  ✗ Failed to import {key}: {e}")
    
    # Import agent memories
    agent_files = list(ROOT.glob("*_memories.json"))
    for agent_file in agent_files:
        agent_name = agent_file.stem.replace("_memories", "")
        try:
            data = read_json(agent_file)
            snapshot["agents"][agent_name] = data
            print(f"  ✓ Imported agent memory: {agent_name}")
        except Exception as e:
            print(f"  ✗ Failed to import {agent_name}: {e}")
    
    write_atomic(SNAP, snapshot)
    print(f"✅ Memory vault initialized: {SNAP}")

def acquire_lease(agent_id: str, ttl_sec: int = 300) -> int:
    """Acquire a lease for memory access."""
    ensure_dirs()
    initialize_snapshot()
    
    # Check for existing lease
    if LEASE.exists():
        try:
            current_lease = read_json(LEASE)
            if not is_lease_expired(current_lease):
                if current_lease.get("agent_id") == agent_id:
                    # Same agent, renew lease
                    print("Renewing existing lease", file=sys.stderr)
                else:
                    print(f"Lease busy by {current_lease.get('agent_id')}", file=sys.stderr)
                    return 2
        except Exception:
            # Corrupted lease, remove it
            LEASE.unlink(missing_ok=True)
    
    # Create new lease
    snapshot = read_json(SNAP)
    base_hash = sha256(snapshot)
    
    lease_obj = {
        "lease_id": f"{now_iso()}_{agent_id}",
        "agent_id": agent_id,
        "base_hash": base_hash,
        "acquired_at": now_iso(),
        "expires_at": (datetime.utcnow() + timedelta(seconds=ttl_sec)).isoformat() + "Z",
        "ttl_sec": ttl_sec
    }
    
    try:
        write_atomic(LEASE, lease_obj)
        
        # Create checkout base
        checkout_base = CHECKOUTS_DIR / f"{agent_id}.base.json"
        write_atomic(checkout_base, snapshot)
        
        print(json.dumps(lease_obj))
        return 0
    except Exception as e:
        print(f"Failed to acquire lease: {e}", file=sys.stderr)
        return 1

def release_lease(agent_id: str) -> int:
    """Release a lease."""
    if not LEASE.exists():
        print("No active lease", file=sys.stderr)
        return 1
    
    try:
        current_lease = read_json(LEASE)
        if current_lease.get("agent_id") != agent_id:
            print(f"Lease owned by {current_lease.get('agent_id')}, not {agent_id}", file=sys.stderr)
            return 2
        
        LEASE.unlink()
        
        # Clean up checkout
        checkout_base = CHECKOUTS_DIR / f"{agent_id}.base.json"
        checkout_base.unlink(missing_ok=True)
        
        print("Lease released")
        return 0
    except Exception as e:
        print(f"Failed to release lease: {e}", file=sys.stderr)
        return 1

def compute_simple_patch(base: Dict, proposed: Dict) -> List[Dict]:
    """Compute a simple patch (placeholder for full JSON Patch implementation)."""
    # This is a simplified version - in production, use jsonpatch library
    patches = []
    
    def find_changes(base_obj, new_obj, path=""):
        if isinstance(new_obj, dict) and isinstance(base_obj, dict):
            for key, value in new_obj.items():
                new_path = f"{path}/{key}" if path else key
                if key not in base_obj:
                    patches.append({"op": "add", "path": f"/{new_path}", "value": value})
                elif base_obj[key] != value:
                    if isinstance(value, dict) and isinstance(base_obj[key], dict):
                        find_changes(base_obj[key], value, new_path)
                    else:
                        patches.append({"op": "replace", "path": f"/{new_path}", "value": value})
            
            for key in base_obj:
                if key not in new_obj:
                    new_path = f"{path}/{key}" if path else key
                    patches.append({"op": "remove", "path": f"/{new_path}"})
        elif base_obj != new_obj:
            patches.append({"op": "replace", "path": f"/{path}", "value": new_obj})
    
    find_changes(base, proposed)
    return patches

def checkin(agent_id: str, proposed_path: str, source: str, confidence: float = 0.75, justification: str = "") -> int:
    """Check in changes to memory vault."""
    if not LEASE.exists():
        print("No active lease - acquire lease first", file=sys.stderr)
        return 1
    
    try:
        current_lease = read_json(LEASE)
        if current_lease.get("agent_id") != agent_id:
            print(f"Lease owned by {current_lease.get('agent_id')}, not {agent_id}", file=sys.stderr)
            return 2
        
        if is_lease_expired(current_lease):
            print("Lease expired", file=sys.stderr)
            return 3
    except Exception as e:
        print(f"Lease validation failed: {e}", file=sys.stderr)
        return 1
    
    # Load data
    base_path = CHECKOUTS_DIR / f"{agent_id}.base.json"
    if not base_path.exists():
        print("No checkout base found", file=sys.stderr)
        return 1
    
    base = read_json(base_path)
    current_head = read_json(SNAP)
    proposed = read_json(Path(proposed_path))
    
    base_hash = current_lease["base_hash"]
    current_hash = sha256(current_head)
    
    # Check for conflicts
    if current_hash != base_hash:
        print("Head has diverged - 3-way merge required", file=sys.stderr)
        # TODO: Implement proper 3-way merge
        print("Conflict resolution not yet implemented", file=sys.stderr)
        return 4
    
    # Compute patch
    patch = compute_simple_patch(base, proposed)
    
    # Create event
    event = {
        "event_id": f"{int(time.time() * 1000)}_{agent_id}",
        "type": "memory_update",
        "agent_id": agent_id,
        "timestamp": now_iso(),
        "base_hash": base_hash,
        "head_hash_before": current_hash,
        "head_hash_after": sha256(proposed),
        "patch": patch,
        "patch_size": len(patch),
        "provenance": {
            "source": source,
            "confidence": confidence,
            "justification": justification,
            "method": "checkin"
        },
        "risk": "low" if len(patch) < 10 else "medium",
        "requires_review": len(patch) > 20 or any(p.get("op") == "remove" for p in patch)
    }
    
    # Write event log
    month = datetime.utcnow().strftime("%Y-%m")
    event_dir = EVENTS_DIR / month
    event_dir.mkdir(exist_ok=True)
    event_path = event_dir / f"{event['event_id']}.json"
    write_atomic(event_path, event)
    
    # Update metadata in proposed
    if "metadata" not in proposed:
        proposed["metadata"] = {}
    proposed["metadata"]["last_updated"] = now_iso()
    proposed["metadata"]["last_agent"] = agent_id
    proposed["metadata"]["last_event"] = event["event_id"]
    
    # Apply changes atomically
    write_atomic(SNAP, proposed)
    
    # Release lease
    LEASE.unlink()
    base_path.unlink(missing_ok=True)
    
    print(f"✅ Changes checked in - Event: {event['event_id']}")
    if event["requires_review"]:
        print("⚠️  Changes require review due to size/risk")
    
    return 0

def status() -> int:
    """Show memory vault status."""
    print(f"Memory Vault Status:")
    print(f"  Snapshot: {'✓' if SNAP.exists() else '✗'}")
    print(f"  Active lease: {'✓' if LEASE.exists() else '✗'}")
    
    if LEASE.exists():
        try:
            lease = read_json(LEASE)
            expired = is_lease_expired(lease)
            print(f"    Agent: {lease.get('agent_id')}")
            print(f"    Status: {'EXPIRED' if expired else 'ACTIVE'}")
            print(f"    Expires: {lease.get('expires_at')}")
        except Exception:
            print("    Status: CORRUPTED")
    
    if SNAP.exists():
        snap = read_json(SNAP)
        print(f"  Snapshot hash: {sha256(snap)[:12]}...")
        print(f"  Last updated: {snap.get('metadata', {}).get('last_updated', 'unknown')}")
    
    # Event log stats
    event_count = sum(len(list(d.glob("*.json"))) for d in EVENTS_DIR.iterdir() if d.is_dir())
    print(f"  Event log entries: {event_count}")
    
    return 0

def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: memory_checkin.py <command> [args...]", file=sys.stderr)
        print("Commands:", file=sys.stderr)
        print("  checkout <agent_id> [ttl_sec]", file=sys.stderr)
        print("  checkin <agent_id> <proposed.json> <source> [confidence] [justification]", file=sys.stderr)
        print("  release <agent_id>", file=sys.stderr)
        print("  status", file=sys.stderr)
        return 1
    
    cmd = sys.argv[1]
    
    try:
        if cmd == "checkout":
            agent_id = sys.argv[2]
            ttl_sec = int(sys.argv[3]) if len(sys.argv) > 3 else 300
            return acquire_lease(agent_id, ttl_sec)
        
        elif cmd == "checkin":
            agent_id = sys.argv[2]
            proposed_path = sys.argv[3]
            source = sys.argv[4]
            confidence = float(sys.argv[5]) if len(sys.argv) > 5 else 0.75
            justification = sys.argv[6] if len(sys.argv) > 6 else "batch update"
            return checkin(agent_id, proposed_path, source, confidence, justification)
        
        elif cmd == "release":
            agent_id = sys.argv[2]
            return release_lease(agent_id)
        
        elif cmd == "status":
            return status()
        
        else:
            print(f"Unknown command: {cmd}", file=sys.stderr)
            return 1
    
    except IndexError:
        print(f"Insufficient arguments for {cmd}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
