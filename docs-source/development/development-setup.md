# Development Setup

Follow these instructions to set up a local development environment for HexTrackr.

## Environment Requirements

- **Runtime**: Node.js (v16+ recommended)
- **Database**: SQLite (bundled with Node.js)
- **Container Platform**: Docker (optional but recommended)
- **Package Manager**: npm

## Docker Setup (Recommended)

The easiest way to get started is with Docker:

1. **Clone the repository**

   ```bash
   git clone https://github.com/Lonnie-Bruton/HexTrackr.git
   cd HexTrackr
   ```

1. **Start with Docker Compose**

   ```bash
   docker-compose up -d
   ```

1. **Access the application**
   - Main application: <http://localhost:8080>
   - Tickets management: <http://localhost:8080/tickets.html>
   - Vulnerability management: <http://localhost:8080/vulnerabilities.html>
   - Documentation portal: <http://localhost:8080/docs-html/>

1. **Stop the environment**

   ```bash
   docker-compose down
   ```

## Local Setup (without Docker)

For direct local development:

1. **Install Dependencies**

    ```bash
    npm install
    ```

1. **Initialize the Database**

    Create the SQLite database and schema:

    ```bash
    node scripts/init-database.js
    ```

1. **Start the Development Server**

    ```bash
    node server.js

    # OR use the convenience script

    ./scripts/start-dev-env.sh
    ```

1. **Access the Application**

    The server will start on `http://localhost:8080`

## Development Scripts

HexTrackr includes several utility scripts for development:

- **`./scripts/start-dev-env.sh`** - Start development server
- **`./scripts/stop-dev-env.sh`** - Stop development server
- **`node scripts/init-database.js`** - Initialize SQLite database
- **`node docs-html/html-content-updater.js`** - Regenerate documentation portal

## Code Quality

### Codacy Integration

HexTrackr uses Codacy for code quality analysis. After any file edits:

```bash

# Run Codacy analysis (requires Codacy MCP)

codacy_cli_analyze --file=path/to/edited/file
```

### ESLint

The project uses ESLint for code linting:

```bash
npm run lint
```

## Development Workflow

1. **Make changes** to source files
2. **Run Codacy analysis** for edited files
3. **Test changes** in browser
4. **Update documentation** if needed
5. **Regenerate docs portal** if docs changed

## Project Structure

```
HexTrackr/
├── server.js              # Main Express server
├── data/                  # SQLite database
├── scripts/               # Utility scripts
├── styles/                # CSS stylesheets
├── docs-source/           # Markdown documentation
├── docs-html/             # Generated HTML docs
├── uploads/               # File upload storage
└── .prompts/              # AI assistant prompts
```

## Memory System Integration

HexTrackr includes Persistent AI Memory integration for development continuity. See the [Memory System documentation](memory-system.md) for details on using memory tools during development.
