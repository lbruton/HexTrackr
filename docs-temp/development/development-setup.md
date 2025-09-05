# Development Setup

This guide explains how to set up a local development environment for HexTrackr.

## Prerequisites

- **Node.js**: Version 18 or higher.
- **npm**: Version 8 or higher.
- **Docker**: For running the application in a containerized environment.

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/hextrackr.git
    cd hextrackr
    ```

1. **Install dependencies**:

    ```bash
    npm install
    ```

## Running the Application

## This project must be run in a Docker container

1. **Start the server in a Docker container**:

    ```bash
    docker-compose up -d
    ```

    The application will be available at `http://localhost:8080`.

1. **Start the server in development mode (with automatic reloading)**:

    ```bash
    npm run dev
    ```

1. **Start the server in production mode**:

    ```bash
    npm start
    ```

## Database Initialization

To initialize the database, run the following command:

```bash
npm run init-db
```

This will create the `hextrackr.db` file in the `data` directory and create the necessary tables.

## Linting

This project uses ESLint for JavaScript, Stylelint for CSS, and Markdownlint for Markdown. To run the linters, use the following commands:

- `npm run eslint`: Lint JavaScript files.
- `npm run stylelint`: Lint CSS files.
- `npm run lint:md`: Lint Markdown files.
- `npm run lint:all`: Run all linters.

To automatically fix linting errors, use the following commands:

- `npm run eslint:fix`: Fix JavaScript files.
- `npm run stylelint:fix`: Fix CSS files.
- `npm run lint:md:fix`: Fix Markdown files.
- `npm run fix:all`: Fix all files.

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

## Development Source Files

We recommend moving development-related files to a `dev-source` directory to keep the project root clean. See the list of recommended files to move in the main project documentation.
