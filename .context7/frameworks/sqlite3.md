# SQLite3 Documentation Cache

**Source**: Context7 Library ID `/tryghost/node-sqlite3`  
**Trust Score**: 8.7/10  
**Code Snippets**: 15  
**Last Updated**: September 5, 2025

## Overview

SQLite3 is a powerful, server-less, self-contained SQL database engine written in C. The Node.js sqlite3 module provides asynchronous, non-blocking SQLite3 bindings for Node.js.

## Key Topics

- Database connections and operations
- Prepared statements and binding
- Callback-based query execution
- Error handling patterns
- Database initialization

## Installation and Setup

```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');
```

## Code Examples

### Basic Database Operations

```javascript
const sqlite3 = require('sqlite3').verbose();

// Open database
const db = new sqlite3.Database('test.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Create table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE
)`);

// Insert data
const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
stmt.run("John Doe", "john@example.com");
stmt.run("Jane Smith", "jane@example.com");
stmt.finalize();

// Query data
db.all("SELECT * FROM users", (err, rows) => {
  if (err) {
    console.error(err.message);
  }
  rows.forEach((row) => {
    console.log(row.id + ": " + row.name + " - " + row.email);
  });
});

// Close database
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});
```

### Prepared Statements with Binding

```javascript
const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");

// Bind parameters by position
stmt.run("Alice Johnson", "alice@example.com");

// Bind parameters by name
const stmt2 = db.prepare("INSERT INTO users (name, email) VALUES ($name, $email)");
stmt2.run({
  $name: "Bob Wilson",
  $email: "bob@example.com"
});

stmt.finalize();
stmt2.finalize();
```

### Transaction Management

```javascript
db.serialize(() => {
  db.run("BEGIN TRANSACTION");
  
  const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
  
  for (let i = 0; i < 10; i++) {
    stmt.run(`User ${i}`, `user${i}@example.com`);
  }
  
  stmt.finalize();
  
  db.run("COMMIT", (err) => {
    if (err) {
      console.error("Transaction failed:", err.message);
      db.run("ROLLBACK");
    } else {
      console.log("Transaction completed successfully");
    }
  });
});
```

### Error Handling Patterns

```javascript
// Using callbacks with error handling
db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
  if (err) {
    console.error("Query error:", err.message);
    return;
  }
  
  if (!row) {
    console.log("User not found");
    return;
  }
  
  console.log("User found:", row);
});

// Using try-catch with database operations
try {
  db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], function(err) {
    if (err) {
      console.error("Insert failed:", err.message);
    } else {
      console.log("User inserted with ID:", this.lastID);
    }
  });
} catch (error) {
  console.error("Database operation failed:", error.message);
}
```

### Database Schema Management

```javascript
// Check if table exists
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
  if (err) {
    console.error(err.message);
    return;
  }
  
  if (!row) {
    // Table doesn't exist, create it
    db.run(`CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Add column to existing table (migration)
db.run("ALTER TABLE users ADD COLUMN last_login DATETIME", (err) => {
  if (err) {
    // Column might already exist
    if (!err.message.includes("duplicate column name")) {
      console.error("Migration error:", err.message);
    }
  }
});
```

## Database Methods

### Query Methods

- **`db.run(sql, [params], callback)`** - Execute SQL statement (INSERT, UPDATE, DELETE)
- **`db.get(sql, [params], callback)`** - Get single row from query result
- **`db.all(sql, [params], callback)`** - Get all rows from query result
- **`db.each(sql, [params], callback, complete)`** - Iterate through each row

### Statement Methods

- **`db.prepare(sql)`** - Create prepared statement
- **`stmt.run([params], callback)`** - Execute prepared statement
- **`stmt.get([params], callback)`** - Get single row with prepared statement
- **`stmt.all([params], callback)`** - Get all rows with prepared statement
- **`stmt.finalize(callback)`** - Finalize prepared statement

### Connection Methods

- **`new sqlite3.Database(filename, [mode], [callback])`** - Open database
- **`db.close([callback])`** - Close database connection
- **`db.serialize([callback])`** - Serialize database operations
- **`db.parallelize([callback])`** - Parallelize database operations

## Common Patterns

### Connection Management

```javascript
class DatabaseManager {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection failed:', err.message);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }
  
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
```

### Promise Wrapper

```javascript
function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

function getQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}
```

## Best Practices

1. **Always use prepared statements** for dynamic queries to prevent SQL injection
2. **Handle errors gracefully** with proper callback error checking
3. **Use transactions** for multiple related operations
4. **Close connections** properly to prevent memory leaks
5. **Use serialize()** when order of operations matters
6. **Validate data** before database operations
7. **Use appropriate data types** in schema design

## Configuration Options

- **`mode`** - File mode (OPEN_READONLY, OPEN_READWRITE, OPEN_CREATE)
- **`verbose()`** - Enable verbose mode for debugging
- **Foreign Keys** - Enable with `PRAGMA foreign_keys = ON`
- **WAL Mode** - Enable with `PRAGMA journal_mode = WAL`

## HexTrackr Integration

In HexTrackr, SQLite3 is used for:

- Vulnerability data storage and rollover
- Ticket management system
- Configuration and settings
- Historical data snapshots
- User session management
