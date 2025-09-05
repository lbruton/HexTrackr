# Project Overview

This project, HexTrackr, is a web-based application for tracking and managing security vulnerabilities and associated tickets. It is built with Node.js and Express.js on the backend, and uses a SQLite database for data storage. The frontend is built with HTML, CSS, and vanilla JavaScript, with Chart.js used for data visualization.

## Key Technologies

* **Backend:** Node.js, Express.js
* **Database:** SQLite
* **Frontend:** HTML, CSS, JavaScript, Chart.js, Bootstrap, Tabler, AG Grid, ApexCharts
* **Testing:** Playwright
* **Linting:** ESLint, Stylelint, Markdownlint

## Architecture

The application follows a monolithic architecture, with the Express.js server handling both API requests and serving frontend assets.

### Backend Architecture

The backend is a Node.js/Express monolithic server providing REST endpoints, data processing, and SQLite persistence. It also serves the static frontend assets and the documentation portal.

* **Monolithic Architecture**: A single `server.js` file (over 1,200 lines) handles all backend concerns, including routing, database interaction, and business logic.
* **Dual Purpose**: Acts as both an API server and a static file server for the UI.
* **Database**: A single SQLite database file (`data/hextrackr.db`) with a shared connection pool.
* **Security**: Includes a built-in `PathValidator` class for secure file system operations and sets standard security headers.

### Frontend Architecture

The frontend of HexTrackr is composed of two main pages, each with its own set of JavaScript modules and CSS styles. Shared components, such as the header, footer, and settings modal, are loaded dynamically on each page.

* **`tickets.html`**: Uses a combination of Bootstrap 5 and Tabler.io for its UI components.
* **`vulnerabilities.html`**: Uses the Tabler.io framework, with AG Grid for data tables and ApexCharts for visualizations.

### Database Architecture

HexTrackr uses a file-based SQLite 3 database as its primary data store.

* **Engine**: SQLite 3
* **Location**: `data/hextrackr.db`
* **Initialization**: The database is initialized by the `scripts/init-database.js` script.

#### Entity Relationship Diagram

```mermaid
erDiagram
    vulnerability_imports ||--o{ vulnerability_snapshots : contains
    tickets ||--o{ ticket_vulnerabilities : links
    vulnerabilities_current ||--o{ ticket_vulnerabilities : links

    vulnerability_imports {
        INTEGER id PK
        TEXT filename
        TEXT import_date
        INTEGER row_count
    }

    vulnerability_snapshots {
        INTEGER id PK
        INTEGER import_id FK
        TEXT scan_date
        TEXT hostname
        TEXT cve
        TEXT severity
        REAL vpr_score
        TEXT unique_key
    }

    vulnerabilities_current {
        INTEGER id PK
        TEXT unique_key UK
        TEXT hostname
        TEXT cve
        TEXT severity
        REAL vpr_score
        TEXT last_seen
    }

    tickets {
        TEXT id PK
        TEXT xt_number
        TEXT date_submitted
        TEXT status
    }

    ticket_vulnerabilities {
        INTEGER id PK
        TEXT ticket_id FK
        INTEGER vulnerability_id FK
    }
```

### Vulnerability Rollover Architecture

A key feature of the backend is the **rollover architecture** for managing vulnerability data. This system processes daily scans to maintain both a current snapshot and a historical trend of vulnerabilities.

# Building and Running

## Prerequisites

* Node.js
* npm
* Docker

## Installation

1. Clone the repository.
2. Install the dependencies:

    ```bash
    npm install
    ```

## Running the Application

## This project must be run in a Docker container

To start the server in a Docker container:

```bash
docker-compose up -d
```

The application will be available at `http://localhost:8080`.

To start the server in development mode (with automatic reloading):

```bash
npm run dev
```

To start the server in production mode:

```bash
npm start
```

## Database Initialization

To initialize the database, run the following command:

```bash
npm run init-db
```

This will create the `hextrackr.db` file in the `data` directory and create the necessary tables.

# Development Conventions

## Linting

This project uses ESLint for JavaScript, Stylelint for CSS, and Markdownlint for Markdown. To run the linters, use the following commands:

* `npm run eslint`: Lint JavaScript files.
* `npm run stylelint`: Lint CSS files.
* `npm run lint:md`: Lint Markdown files.
* `npm run lint:all`: Run all linters.

To automatically fix linting errors, use the following commands:

* `npm run eslint:fix`: Fix JavaScript files.
* `npm run stylelint:fix`: Fix CSS files.
* `npm run lint:md:fix`: Fix Markdown files.
* `npm run fix:all`: Fix all files.

## Testing

This project uses Playwright for end-to-end testing. Tests are located in the `.playwright-mcp` directory.

**Important:** Restart the Docker container before running Playwright tests:

```bash
docker-compose restart
```

## Documentation

The documentation for this project is located in the `docs-source` directory and is written in Markdown. The documentation is then converted to HTML and served from the `docs-html` directory. To generate the HTML documentation, run the following command:

```bash
npm run docs:generate
```
