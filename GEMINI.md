# HexTrackr Project Overview

This document provides a comprehensive overview of the HexTrackr project, its architecture, and development conventions.

## Project Overview

HexTrackr is a web-based vulnerability management application designed for tracking and analyzing security vulnerabilities. It features a modular Node.js/Express backend, a SQLite database for data persistence, and a dynamic frontend built with modern web technologies.

### Key Technologies

*   **Backend:** Node.js, Express.js
*   **Database:** SQLite
*   **Frontend:** HTML, CSS, JavaScript, Tabler.io, AG Grid, ApexCharts
*   **Containerization:** Docker
*   **Web Server:** Nginx
*   **Documentation:** JSDoc

### Architecture

The application follows a modular architecture with a clear separation of concerns:

*   **`app/controllers`:** Handle incoming requests, validate inputs, and orchestrate responses by calling services.
*   **`app/services`:** Contain the core business logic of the application, interacting with the database and performing data processing.
*   **`app/routes`:** Define the API endpoints and map them to the appropriate controller methods.
*   **`app/public`:** Contains the frontend assets, including HTML, CSS, and JavaScript files.
*   **`app/config`:** Centralized configuration for the database, middleware, and server.

## Building and Running

### Prerequisites

*   Node.js
*   npm
*   Docker (optional)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/HexTrackr.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

*   **Development Mode:**
    ```bash
    npm run dev
    ```
    This will start the server with `nodemon`, which automatically restarts the application on file changes.

*   **Production Mode:**
    ```bash
    npm start
    ```

*   **Docker:**
    ```bash
    docker-compose up
    ```

### Database Initialization

To initialize the database with the required schema, run:

```bash
npm run init-db
```

## Development Conventions

### Linting and Formatting

The project uses ESLint for JavaScript and Stylelint for CSS to enforce a consistent coding style.

*   **Lint all files:**
    ```bash
    npm run lint:all
    ```
*   **Fix all linting errors:**
    ```bash
    npm run fix:all
    ```

### Documentation

The project uses JSDoc to generate technical documentation from the source code.

*   **Generate documentation:**
    ```bash
    npm run docs:all
    ```
    The generated documentation will be available in the `app/dev-docs-html` directory.

### Code Quality and Security

Codacy is used for automated code quality and security analysis. The configuration can be found in `.codacy/codacy.yaml`.
