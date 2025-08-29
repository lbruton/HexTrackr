# Development Setup

Follow these instructions to set up a local development environment for HexTrackr.

## Environment

- **Runtime**: Node.js
- **Database**: SQLite
- **Deployment**: Docker

## Local Setup (without Docker)

While Docker is recommended, you can run the application locally for development:

1. **Install Dependencies:**

    ```bash
    npm install
    ```

1. **Initialize the Database:**

    Create the SQLite database and schema.

    ```bash
    node scripts/init-database.js
    ```

1. **Run the Server:**

    ```bash
    node server.js
    ```

    The server will start on `http://localhost:8080`.
