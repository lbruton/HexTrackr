# Getting Started with HexTrackr

This guide provides everything you need to get HexTrackr up and running, whether for a production-like environment using Docker or for local development.

---

## Recommended Setup: Docker & Docker Compose

The most reliable and consistent way to run HexTrackr is by using Docker. This method encapsulates the application and its dependencies, avoiding potential conflicts with your local environment.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application

1. **Clone the Repository**

    ```bash
    git clone https://github.com/Lonnie-Bruton/HexTrackr.git
    cd HexTrackr
    ```

1. **Start the Services**

    Use Docker Compose to build the image and run the application in detached mode.

    ```bash
    docker-compose up -d --build
    ```

1. **Access HexTrackr**

    The application will be available at `http://localhost:8989`.

    - **Tickets Management**: `http://localhost:8989/tickets.html`
    - **Vulnerabilities Management**: `http://localhost:8989/vulnerabilities.html`
    - **Documentation Portal**: `http://localhost:8989/docs-html/`

1. **Stopping the Application**

    ```bash
    docker-compose down
    ```

---

## Local Development Setup (Without Docker)

For developers who want to work on the HexTrackr source code directly.

### Prerequisites (2)

- **Node.js**: v18.x or later
- **npm**: v8.x or later (typically comes with Node.js)

### Setup Instructions

1. **Clone the Repository** (if you haven't already)

    ```bash
    git clone https://github.com/Lonnie-Bruton/HexTrackr.git
    cd HexTrackr
    ```

1. **Install Dependencies**

    Install the required Node.js packages.

    ```bash
    npm install
    ```

1. **Initialize the Database**

    This script creates the `hextrackr.db` SQLite file in the `data/` directory and sets up the necessary tables.

    ```bash
    node scripts/init-database.js
    ```

1. **Start the Development Server**

    ```bash
    node server.js
    ```

    The server will start, and you can access the application at `http://localhost:8080`.

### Development Scripts

The project includes several scripts in the `package.json` to aid development:

- `npm start`: Starts the production server.
- `npm run dev`: Starts the server with `nodemon` for automatic restarts on file changes.
- `npm run init-db`: Initializes or re-initializes the database.
- `npm run lint:all`: Runs all code quality checks (ESLint for JS, Stylelint for CSS, Markdownlint for docs).
- `npm run fix:all`: Attempts to automatically fix all code quality issues.
- `npm run docs:generate`: **Regenerates the complete HTML documentation portal with spec-kit integration**.
- `npm run docs:sync-specs`: Syncs specification tasks to the roadmap (part of docs:generate).
- `npm run docs:sync-all`: Comprehensive documentation synchronization across all sources.
