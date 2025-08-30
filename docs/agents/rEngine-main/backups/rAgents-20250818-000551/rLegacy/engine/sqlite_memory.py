"""
SQLite Memory Database Manager
Hybrid SQLite + JSON Export Architecture for StackTrackr Memory System

This module provides the database layer for the memory vault system, offering:
- ACID transactions for concurrent multi-agent operations
- Atomic checkout/checkin operations with lease management
- JSON export compatibility for reviews and LLM collaboration
- Performance optimization through proper indexing and connection pooling
"""

import sqlite3
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union
from pathlib import Path
import hashlib
import logging
from contextlib import contextmanager
import threading
import time

logger = logging.getLogger(__name__)

class SQLiteMemoryManager:
    """
    Production-grade SQLite manager for StackTrackr memory system.
    
    Features:
    - Atomic transactions with proper rollback
    - Connection pooling for concurrent access
    - Lease management for checkout/checkin operations
    - JSON export generation for collaboration
    - Comprehensive error handling and logging
    """
    
    def __init__(self, db_path: str = "agents/memory/memory_vault.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Connection pooling for concurrent access
        self._connection_pool = []
        self._pool_lock = threading.Lock()
        self._max_connections = 10
        
        # Initialize database
        self._initialize_database()
        
        logger.info(f"SQLiteMemoryManager initialized with database: {self.db_path}")
    
    def _initialize_database(self):
        """Initialize database with schema if it doesn't exist."""
        try:
            with self._get_connection() as conn:
                # Check if database is already initialized
                cursor = conn.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='memory_entries'"
                )
                if cursor.fetchone() is None:
                    # Database needs initialization
                    schema_path = Path(__file__).parent.parent / "schemas" / "database_schema.sql"
                    if schema_path.exists():
                        with open(schema_path, 'r') as f:
                            schema_sql = f.read()
                        conn.executescript(schema_sql)
                        logger.info("Database schema initialized successfully")
                    else:
                        raise FileNotFoundError(f"Schema file not found: {schema_path}")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    @contextmanager
    def _get_connection(self):
        """Get database connection from pool or create new one."""
        conn = None
        try:
            with self._pool_lock:
                if self._connection_pool:
                    conn = self._connection_pool.pop()
                else:
                    conn = sqlite3.connect(
                        str(self.db_path),
                        check_same_thread=False,
                        timeout=30.0
                    )
                    conn.row_factory = sqlite3.Row
                    conn.execute("PRAGMA busy_timeout = 30000")
            
            yield conn
            
        except Exception as e:
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                with self._pool_lock:
                    if len(self._connection_pool) < self._max_connections:
                        self._connection_pool.append(conn)
                    else:
                        conn.close()
    
    def checkout_memory(self, memory_id: str, agent_name: str, 
                       operation: str = "write", lease_duration_minutes: int = 15) -> str:
        """
        Checkout memory item for exclusive access.
        
        Args:
            memory_id: ID of memory item to checkout
            agent_name: Name of agent requesting checkout
            operation: 'read' or 'write' operation
            lease_duration_minutes: How long to hold the lease
            
        Returns:
            lease_id: Unique identifier for this lease
            
        Raises:
            ValueError: If memory item is already checked out
            RuntimeError: If database operation fails
        """
        lease_id = str(uuid.uuid4())
        expires_at = datetime.now() + timedelta(minutes=lease_duration_minutes)
        
        try:
            with self._get_connection() as conn:
                # Check for existing active leases
                cursor = conn.execute("""
                    SELECT lease_id, agent_name, operation 
                    FROM memory_leases 
                    WHERE memory_id = ? AND status = 'active' AND expires_at > CURRENT_TIMESTAMP
                """, (memory_id,))
                
                existing_lease = cursor.fetchone()
                if existing_lease:
                    # Allow multiple read leases, but block write operations
                    if operation == 'write' or existing_lease['operation'] == 'write':
                        raise ValueError(
                            f"Memory {memory_id} is already checked out by {existing_lease['agent_name']} "
                            f"for {existing_lease['operation']} operation (lease: {existing_lease['lease_id']})"
                        )
                
                # Create new lease
                conn.execute("""
                    INSERT INTO memory_leases 
                    (lease_id, memory_id, agent_name, operation, expires_at, status, metadata)
                    VALUES (?, ?, ?, ?, ?, 'active', ?)
                """, (
                    lease_id, memory_id, agent_name, operation, 
                    expires_at.isoformat(), json.dumps({"checkout_time": datetime.now().isoformat()})
                ))
                
                # Log the checkout
                self._log_activity(conn, memory_id, agent_name, "checkout", {
                    "lease_id": lease_id,
                    "operation": operation,
                    "expires_at": expires_at.isoformat()
                })
                
                conn.commit()
                logger.info(f"Memory {memory_id} checked out by {agent_name} (lease: {lease_id})")
                return lease_id
                
        except Exception as e:
            logger.error(f"Failed to checkout memory {memory_id}: {e}")
            raise RuntimeError(f"Checkout failed: {e}")
    
    def checkin_memory(self, lease_id: str, memory_data: Optional[Dict] = None) -> bool:
        """
        Checkin memory item, releasing the lease and optionally updating data.
        
        Args:
            lease_id: Lease identifier from checkout
            memory_data: Optional updated memory data to save
            
        Returns:
            bool: True if checkin successful
            
        Raises:
            ValueError: If lease is invalid or expired
            RuntimeError: If database operation fails
        """
        try:
            with self._get_connection() as conn:
                # Validate lease
                cursor = conn.execute("""
                    SELECT memory_id, agent_name, operation, expires_at
                    FROM memory_leases 
                    WHERE lease_id = ? AND status = 'active'
                """, (lease_id,))
                
                lease = cursor.fetchone()
                if not lease:
                    raise ValueError(f"Invalid or expired lease: {lease_id}")
                
                memory_id = lease['memory_id']
                agent_name = lease['agent_name']
                
                # Update memory data if provided
                if memory_data and lease['operation'] == 'write':
                    self._update_memory_item(conn, memory_id, memory_data, agent_name)
                
                # Release the lease
                conn.execute("""
                    UPDATE memory_leases 
                    SET status = 'released', metadata = json_set(metadata, '$.released_at', ?)
                    WHERE lease_id = ?
                """, (datetime.now().isoformat(), lease_id))
                
                # Log the checkin
                self._log_activity(conn, memory_id, agent_name, "checkin", {
                    "lease_id": lease_id,
                    "data_updated": memory_data is not None
                })
                
                conn.commit()
                logger.info(f"Memory {memory_id} checked in by {agent_name} (lease: {lease_id})")
                return True
                
        except Exception as e:
            logger.error(f"Failed to checkin lease {lease_id}: {e}")
            raise RuntimeError(f"Checkin failed: {e}")
    
    def create_memory_item(self, memory_type: str, title: str, content: Dict, 
                          created_by: str, **kwargs) -> str:
        """
        Create new memory item in database.
        
        Args:
            memory_type: Type of memory (decisions, tasks, bugs, etc.)
            title: Human-readable title
            content: Memory content as dictionary
            created_by: Agent creating the memory
            **kwargs: Additional fields specific to memory type
            
        Returns:
            str: Memory ID of created item
        """
        memory_id = str(uuid.uuid4())
        
        try:
            with self._get_connection() as conn:
                # Insert into main memory_entries table
                conn.execute("""
                    INSERT INTO memory_entries 
                    (memory_id, memory_type, title, content, created_by, updated_by, 
                     status, priority, metadata, tags)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    memory_id, memory_type, title, json.dumps(content),
                    created_by, created_by,
                    kwargs.get('status', 'active'),
                    kwargs.get('priority', 'medium'),
                    json.dumps(kwargs.get('metadata', {})),
                    json.dumps(kwargs.get('tags', []))
                ))
                
                # Insert into type-specific table if applicable
                self._create_type_specific_entry(conn, memory_type, memory_id, kwargs)
                
                # Log the creation
                self._log_activity(conn, memory_id, created_by, "create", {
                    "memory_type": memory_type,
                    "title": title
                })
                
                conn.commit()
                logger.info(f"Created {memory_type} memory: {memory_id} by {created_by}")
                return memory_id
                
        except Exception as e:
            logger.error(f"Failed to create memory item: {e}")
            raise RuntimeError(f"Memory creation failed: {e}")
    
    def get_memory_item(self, memory_id: str) -> Optional[Dict]:
        """
        Retrieve memory item by ID.
        
        Args:
            memory_id: ID of memory item to retrieve
            
        Returns:
            Dict with memory data or None if not found
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.execute("""
                    SELECT * FROM memory_entries WHERE memory_id = ?
                """, (memory_id,))
                
                row = cursor.fetchone()
                if not row:
                    return None
                
                # Convert to dict and parse JSON fields
                memory_data = dict(row)
                memory_data['content'] = json.loads(memory_data['content'])
                memory_data['metadata'] = json.loads(memory_data['metadata'])
                memory_data['tags'] = json.loads(memory_data['tags'])
                
                # Get type-specific data
                type_data = self._get_type_specific_data(conn, memory_data['memory_type'], memory_id)
                if type_data:
                    memory_data.update(type_data)
                
                return memory_data
                
        except Exception as e:
            logger.error(f"Failed to get memory item {memory_id}: {e}")
            return None
    
    def search_memory(self, memory_type: Optional[str] = None, 
                     status: Optional[str] = None,
                     created_by: Optional[str] = None,
                     limit: int = 100) -> List[Dict]:
        """
        Search memory items with filters.
        
        Args:
            memory_type: Filter by memory type
            status: Filter by status
            created_by: Filter by creator
            limit: Maximum results to return
            
        Returns:
            List of memory items matching criteria
        """
        try:
            conditions = []
            params = []
            
            if memory_type:
                conditions.append("memory_type = ?")
                params.append(memory_type)
            
            if status:
                conditions.append("status = ?")
                params.append(status)
            
            if created_by:
                conditions.append("created_by = ?")
                params.append(created_by)
            
            where_clause = " AND ".join(conditions) if conditions else "1=1"
            
            with self._get_connection() as conn:
                cursor = conn.execute(f"""
                    SELECT memory_id, memory_type, title, status, priority, 
                           created_by, updated_by, created_at, updated_at
                    FROM memory_entries 
                    WHERE {where_clause}
                    ORDER BY updated_at DESC
                    LIMIT ?
                """, params + [limit])
                
                results = []
                for row in cursor.fetchall():
                    results.append(dict(row))
                
                return results
                
        except Exception as e:
            logger.error(f"Failed to search memory: {e}")
            return []
    
    def export_memory_bundle(self, export_type: str = "full", 
                           agent_requestor: str = "system") -> Dict:
        """
        Export memory data as JSON bundle for LLM collaboration.
        
        Args:
            export_type: Type of export (full, delta, memory, code, markdown)
            agent_requestor: Agent requesting the export
            
        Returns:
            Dict containing exported memory bundle
        """
        export_id = str(uuid.uuid4())
        
        try:
            with self._get_connection() as conn:
                # Get all active memory items
                cursor = conn.execute("""
                    SELECT * FROM memory_entries WHERE status = 'active'
                    ORDER BY memory_type, updated_at DESC
                """)
                
                memory_bundle = {
                    "export_metadata": {
                        "export_id": export_id,
                        "export_type": export_type,
                        "generated_at": datetime.now().isoformat(),
                        "generated_by": agent_requestor,
                        "total_items": 0
                    },
                    "decisions": [],
                    "tasks": [],
                    "bugs": [],
                    "roadmap": [],
                    "patterns": [],
                    "other": []
                }
                
                item_count = 0
                for row in cursor.fetchall():
                    memory_item = dict(row)
                    memory_item['content'] = json.loads(memory_item['content'])
                    memory_item['metadata'] = json.loads(memory_item['metadata'])
                    memory_item['tags'] = json.loads(memory_item['tags'])
                    
                    # Get type-specific data
                    type_data = self._get_type_specific_data(
                        conn, memory_item['memory_type'], memory_item['memory_id']
                    )
                    if type_data:
                        memory_item.update(type_data)
                    
                    # Add to appropriate section
                    memory_type = memory_item['memory_type']
                    if memory_type in memory_bundle:
                        memory_bundle[memory_type].append(memory_item)
                    else:
                        memory_bundle['other'].append(memory_item)
                    
                    item_count += 1
                
                memory_bundle["export_metadata"]["total_items"] = item_count
                
                # Record export in history
                bundle_json = json.dumps(memory_bundle, indent=2)
                bundle_size = len(bundle_json.encode('utf-8'))
                checksum = hashlib.sha256(bundle_json.encode('utf-8')).hexdigest()
                
                conn.execute("""
                    INSERT INTO export_history 
                    (export_id, export_type, agent_requestor, export_path, 
                     bundle_size, item_count, export_metadata, checksum)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    export_id, export_type, agent_requestor, f"export_{export_id}.json",
                    bundle_size, item_count, json.dumps({"export_type": export_type}),
                    checksum
                ))
                
                conn.commit()
                logger.info(f"Generated {export_type} memory bundle: {item_count} items, {bundle_size} bytes")
                return memory_bundle
                
        except Exception as e:
            logger.error(f"Failed to export memory bundle: {e}")
            raise RuntimeError(f"Export failed: {e}")
    
    # Private helper methods
    
    def _update_memory_item(self, conn: sqlite3.Connection, memory_id: str, 
                           memory_data: Dict, updated_by: str):
        """Update memory item data in transaction."""
        conn.execute("""
            UPDATE memory_entries 
            SET content = ?, updated_by = ?, version = version + 1
            WHERE memory_id = ?
        """, (json.dumps(memory_data.get('content', {})), updated_by, memory_id))
    
    def _create_type_specific_entry(self, conn: sqlite3.Connection, 
                                   memory_type: str, memory_id: str, kwargs: Dict):
        """Create entry in type-specific table."""
        if memory_type == "decisions":
            conn.execute("""
                INSERT INTO decisions 
                (memory_id, decision_type, alternatives, rationale, impact_assessment)
                VALUES (?, ?, ?, ?, ?)
            """, (
                memory_id,
                kwargs.get('decision_type', 'general'),
                json.dumps(kwargs.get('alternatives', [])),
                kwargs.get('rationale', ''),
                kwargs.get('impact_assessment', '')
            ))
        elif memory_type == "tasks":
            conn.execute("""
                INSERT INTO tasks 
                (memory_id, task_type, estimated_time, assigned_to, dependencies, blocks)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                memory_id,
                kwargs.get('task_type', 'general'),
                kwargs.get('estimated_time', ''),
                kwargs.get('assigned_to', ''),
                json.dumps(kwargs.get('dependencies', [])),
                json.dumps(kwargs.get('blocks', []))
            ))
        # Add other types as needed
    
    def _get_type_specific_data(self, conn: sqlite3.Connection, 
                               memory_type: str, memory_id: str) -> Optional[Dict]:
        """Get type-specific data for memory item."""
        try:
            if memory_type == "decisions":
                cursor = conn.execute("""
                    SELECT * FROM decisions WHERE memory_id = ?
                """, (memory_id,))
            elif memory_type == "tasks":
                cursor = conn.execute("""
                    SELECT * FROM tasks WHERE memory_id = ?
                """, (memory_id,))
            elif memory_type == "bugs":
                cursor = conn.execute("""
                    SELECT * FROM bugs WHERE memory_id = ?
                """, (memory_id,))
            # Add other types as needed
            else:
                return None
            
            row = cursor.fetchone()
            if row:
                data = dict(row)
                # Parse JSON fields
                for key, value in data.items():
                    if key.endswith('_json') or key in ['alternatives', 'dependencies', 'blocks', 'prerequisites', 'deliverables']:
                        try:
                            data[key] = json.loads(value) if value else []
                        except:
                            pass
                return data
            return None
            
        except Exception as e:
            logger.error(f"Failed to get type-specific data: {e}")
            return None
    
    def _log_activity(self, conn: sqlite3.Connection, memory_id: Optional[str], 
                     agent_name: str, operation: str, details: Dict):
        """Log activity in transaction."""
        conn.execute("""
            INSERT INTO activity_log 
            (memory_id, agent_name, operation, operation_details, success)
            VALUES (?, ?, ?, ?, ?)
        """, (memory_id, agent_name, operation, json.dumps(details), True))
    
    def cleanup_expired_leases(self):
        """Clean up expired leases (run periodically)."""
        try:
            with self._get_connection() as conn:
                cursor = conn.execute("""
                    UPDATE memory_leases 
                    SET status = 'expired' 
                    WHERE status = 'active' AND expires_at < CURRENT_TIMESTAMP
                """)
                
                expired_count = cursor.rowcount
                if expired_count > 0:
                    conn.commit()
                    logger.info(f"Cleaned up {expired_count} expired leases")
                    
        except Exception as e:
            logger.error(f"Failed to cleanup expired leases: {e}")
    
    def get_database_stats(self) -> Dict:
        """Get database statistics for monitoring."""
        try:
            with self._get_connection() as conn:
                stats = {}
                
                # Memory items by type
                cursor = conn.execute("""
                    SELECT memory_type, COUNT(*) as count
                    FROM memory_entries 
                    WHERE status = 'active'
                    GROUP BY memory_type
                """)
                stats['memory_by_type'] = dict(cursor.fetchall())
                
                # Active leases
                cursor = conn.execute("""
                    SELECT COUNT(*) as count FROM memory_leases 
                    WHERE status = 'active' AND expires_at > CURRENT_TIMESTAMP
                """)
                stats['active_leases'] = cursor.fetchone()['count']
                
                # Recent activity
                cursor = conn.execute("""
                    SELECT COUNT(*) as count FROM activity_log 
                    WHERE timestamp > datetime('now', '-1 hour')
                """)
                stats['recent_activity'] = cursor.fetchone()['count']
                
                return stats
                
        except Exception as e:
            logger.error(f"Failed to get database stats: {e}")
            return {}
