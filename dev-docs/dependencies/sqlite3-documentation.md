# SQLite3 Node.js Documentation

*Version: 5.1.7 - As used in HexTrackr*

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Database Connection](#database-connection)
3. [Basic Operations](#basic-operations)
4. [Prepared Statements](#prepared-statements)
5. [Transactions](#transactions)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

## Installation & Setup

### Installation
```bash
npm install sqlite3
```

### Basic Import and Usage
```javascript
const sqlite3 = require('sqlite3').verbose();
```

The `.verbose()` method provides detailed stack traces for debugging.

## Database Connection

### In-Memory Database
```javascript
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to in-memory database');
  }
});
```

### File-Based Database
```javascript
const db = new sqlite3.Database('./data/hextrackr.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});
```

### Connection Modes
```javascript
// Read/Write mode (default)
const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE);

// Read-only mode
const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READONLY);

// Create if doesn't exist
const db = new sqlite3.Database('./database.db',
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
```

### Closing Database
```javascript
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Database connection closed');
});
```

## Basic Operations

### Creating Tables
```javascript
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Table created successfully');
  }
});
```

### Inserting Data

#### Single Insert
```javascript
db.run(
  `INSERT INTO users (name, email) VALUES (?, ?)`,
  ['John Doe', 'john@example.com'],
  function(err) {
    if (err) {
      console.error('Insert error:', err);
    } else {
      console.log(`Row inserted with ID: ${this.lastID}`);
      console.log(`Rows affected: ${this.changes}`);
    }
  }
);
```

#### Bulk Insert with Prepared Statement
```javascript
const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");

const users = [
  ['Alice', 'alice@example.com'],
  ['Bob', 'bob@example.com'],
  ['Charlie', 'charlie@example.com']
];

users.forEach(user => {
  stmt.run(user);
});

stmt.finalize();
```

### Querying Data

#### Get Single Row
```javascript
db.get(
  `SELECT * FROM users WHERE id = ?`,
  [1],
  (err, row) => {
    if (err) {
      console.error('Query error:', err);
    } else {
      console.log(row);
      // { id: 1, name: 'John Doe', email: 'john@example.com' }
    }
  }
);
```

#### Get All Rows
```javascript
db.all(
  `SELECT * FROM users WHERE name LIKE ?`,
  ['%John%'],
  (err, rows) => {
    if (err) {
      console.error('Query error:', err);
    } else {
      console.log(`Found ${rows.length} users`);
      rows.forEach(row => {
        console.log(row);
      });
    }
  }
);
```

#### Iterate Through Rows
```javascript
db.each(
  `SELECT id, name, email FROM users`,
  (err, row) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log(`${row.id}: ${row.name} - ${row.email}`);
    }
  },
  (err, count) => {
    // Completion callback
    console.log(`Processed ${count} rows`);
  }
);
```

### Updating Data
```javascript
db.run(
  `UPDATE users SET email = ? WHERE id = ?`,
  ['newemail@example.com', 1],
  function(err) {
    if (err) {
      console.error('Update error:', err);
    } else {
      console.log(`Rows updated: ${this.changes}`);
    }
  }
);
```

### Deleting Data
```javascript
db.run(
  `DELETE FROM users WHERE id = ?`,
  [1],
  function(err) {
    if (err) {
      console.error('Delete error:', err);
    } else {
      console.log(`Rows deleted: ${this.changes}`);
    }
  }
);
```

## Prepared Statements

### Basic Prepared Statement
```javascript
const stmt = db.prepare("INSERT INTO lorem VALUES (?)");

for (let i = 0; i < 10; i++) {
  stmt.run("Ipsum " + i);
}

stmt.finalize();
```

### Prepared Statement with Callback
```javascript
const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");

stmt.run(['John', 'john@example.com'], function(err) {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Inserted with ID:', this.lastID);
  }
});

stmt.finalize();
```

### Reusing Prepared Statements
```javascript
const insertStmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
const selectStmt = db.prepare("SELECT * FROM users WHERE email = ?");

// Insert
insertStmt.run(['Alice', 'alice@example.com']);

// Select
selectStmt.get(['alice@example.com'], (err, row) => {
  console.log(row);
});

// Clean up
insertStmt.finalize();
selectStmt.finalize();
```

## Transactions

### Manual Transaction Control
```javascript
db.serialize(() => {
  db.run("BEGIN TRANSACTION");

  try {
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", ['User1', 'user1@example.com']);
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", ['User2', 'user2@example.com']);

    db.run("COMMIT");
  } catch (err) {
    db.run("ROLLBACK");
    console.error('Transaction failed:', err);
  }
});
```

### Using serialize() for Sequential Operations
```javascript
db.serialize(() => {
  db.run("CREATE TABLE lorem (info TEXT)");

  const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for (let i = 0; i < 10; i++) {
    stmt.run("Ipsum " + i);
  }
  stmt.finalize();

  db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
    console.log(row.id + ": " + row.info);
  });
});
```

### Parallel vs Sequential Execution
```javascript
// Parallel execution (default)
db.run("UPDATE users SET status = 'active'");
db.run("UPDATE orders SET status = 'processed'");
// Both run simultaneously

// Sequential execution
db.serialize(() => {
  db.run("UPDATE users SET status = 'active'");
  db.run("UPDATE orders SET status = 'processed'");
  // Second runs after first completes
});
```

## Error Handling

### Comprehensive Error Handling
```javascript
class DatabaseError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          reject(new DatabaseError('Constraint violation', err.code));
        } else if (err.code === 'SQLITE_ERROR') {
          reject(new DatabaseError('SQL error', err.code));
        } else {
          reject(err);
        }
      } else {
        resolve(rows);
      }
    });
  });
}
```

### Common SQLite Error Codes
```javascript
// Common error codes to handle
const errorHandlers = {
  'SQLITE_CONSTRAINT': 'Constraint violation (unique, foreign key, etc.)',
  'SQLITE_ERROR': 'SQL syntax error or missing database',
  'SQLITE_BUSY': 'Database is locked',
  'SQLITE_LOCKED': 'Table is locked',
  'SQLITE_NOMEM': 'Out of memory',
  'SQLITE_READONLY': 'Attempt to write to readonly database',
  'SQLITE_IOERR': 'Disk I/O error',
  'SQLITE_CORRUPT': 'Database file is corrupted',
  'SQLITE_FULL': 'Database or disk is full'
};
```

## Best Practices

### 1. Connection Pool Pattern
```javascript
class DatabasePool {
  constructor(filename, poolSize = 5) {
    this.connections = [];
    this.filename = filename;

    for (let i = 0; i < poolSize; i++) {
      this.connections.push(this.createConnection());
    }
  }

  createConnection() {
    return new sqlite3.Database(this.filename);
  }

  getConnection() {
    return this.connections[Math.floor(Math.random() * this.connections.length)];
  }
}
```

### 2. Promisify Database Operations
```javascript
const util = require('util');

class Database {
  constructor(db) {
    this.db = db;
    this.run = util.promisify(db.run.bind(db));
    this.get = util.promisify(db.get.bind(db));
    this.all = util.promisify(db.all.bind(db));
  }

  async query(sql, params = []) {
    return await this.all(sql, params);
  }
}
```

### 3. Schema Migrations
```javascript
const migrations = [
  `CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`,

  `ALTER TABLE users ADD COLUMN email TEXT`
];

async function runMigrations(db) {
  for (const migration of migrations) {
    await db.run(migration);
  }
}
```

### 4. Batch Operations
```javascript
function batchInsert(tableName, records, batchSize = 1000) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      try {
        const stmt = db.prepare(`INSERT INTO ${tableName} VALUES (?)`);

        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          batch.forEach(record => {
            stmt.run(record);
          });
        }

        stmt.finalize();
        db.run("COMMIT", resolve);
      } catch (err) {
        db.run("ROLLBACK");
        reject(err);
      }
    });
  });
}
```

### 5. Performance Optimizations
```javascript
// Enable Write-Ahead Logging for better concurrency
db.run("PRAGMA journal_mode = WAL");

// Optimize for faster inserts
db.run("PRAGMA synchronous = NORMAL");

// Increase cache size (in pages, default is 2000)
db.run("PRAGMA cache_size = 10000");

// Run VACUUM periodically to defragment
db.run("VACUUM");

// Analyze tables for query optimization
db.run("ANALYZE");
```

## HexTrackr-Specific Patterns

### Database Initialization
```javascript
function initializeDatabase() {
  const db = new sqlite3.Database('./data/hextrackr.db');

  db.serialize(() => {
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON");

    // Create tables with proper constraints
    db.run(`CREATE TABLE IF NOT EXISTS vulnerabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cve_id TEXT,
      description TEXT,
      severity TEXT,
      vpr_score REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_severity (severity),
      INDEX idx_vpr_score (vpr_score)
    )`);
  });

  return db;
}
```

### Safe Query Execution
```javascript
function safeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Usage
try {
  const vulnerabilities = await safeQuery(
    'SELECT * FROM vulnerabilities WHERE severity = ?',
    ['Critical']
  );
} catch (error) {
  // Handle error
}
```

---

*This documentation covers the essential SQLite3 patterns and operations used in HexTrackr's database layer.*