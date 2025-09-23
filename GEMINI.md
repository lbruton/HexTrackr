# Gemini Code Assistant Context

## Project Overview

**HexTrackr** is a unified vulnerability and ticket management platform designed for network administrators. It consolidates workflows from multiple systems like ServiceNow, Hexagon, and Tenable into a single platform.

**Key Features:**

- Generates tickets for ServiceNow and Hexagon.
- Imports and deduplicates vulnerability data.
- Tracks Vulnerability Priority Rating (VPR) trends.
- Provides one-click bundle downloads with supporting documentation.

**Architecture:**

- **Backend:** Node.js with Express.js
- **Database:** SQLite
- **Frontend:** Vanilla JavaScript (ES6+), Tabler.io CSS Framework, AG-Grid, and ApexCharts.
- **Real-time Updates:** WebSockets (socket.io)
- **DevOps:** Docker, GitHub Actions, ESLint, Codacy, and Playwright.

## Building and Running

### Installation

```bash
npm install
```

### Running the Application

**Development Mode (with hot-reloading):**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

The application will be available at `http://localhost:8989`.

### Running Tests

**Run all tests:**

```bash
npm test
```

**Run tests in watch mode:**

```bash
npm run test:watch
```

**Run tests with coverage:**

```bash
npm run test:coverage
```

**Run unit tests:**

```bash
npm run test:unit
```

**Run integration tests:**

```bash
npm run test:integration
```

### Linting

**Run all linters (Markdown, ESLint, Stylelint):**

```bash
npm run lint:all
```

**Fix all linting issues automatically:**

```bash
npm run fix:all
```

### Documentation

**Generate JSDoc documentation (development):**

```bash
npm run docs:dev
```

**Generate HTML documentation from Markdown:**

```bash
npm run docs:generate
```

**Generate all documentation:**

```bash.
npm run docs:all
```

## Development Conventions

- **Code Style:** Enforced by ESLint and Stylelint. Use `npm run lint:all` to check and `npm run fix:all` to fix.
- **Testing:** The project uses Jest for testing. Unit and integration tests are separated into `tests/unit` and `tests/integration` directories.
- **Documentation:**
  - JSDoc is used for API documentation.
  - Markdown is used for general documentation, which is then converted to HTML.
- **Git Hooks:** The project uses Git hooks to enforce standards before committing. Install them with `npm run hooks:install`.
- **Dependencies:** Use `npm install --save` for runtime dependencies and `npm install --save-dev` for development dependencies.
