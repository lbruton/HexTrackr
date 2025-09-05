# Security Overview

HexTrackr is designed with security in mind. This document provides an overview of the security measures in place.

## Data Security

- **Database**: The SQLite database is stored locally on the server. Access is restricted to the backend application.
- **File Uploads**: Uploaded CSV files are stored temporarily and processed securely. They are deleted after processing.
- **Input Validation**: All user input is validated on the backend to prevent common vulnerabilities such as Cross-Site Scripting (XSS) and SQL Injection.
- **Path Validation**: The `PathValidator` class is used to prevent path traversal attacks when accessing the file system.

## Secure Development

- **Dependencies**: We use `npm audit` to regularly check for vulnerabilities in our dependencies.
- **Docker**: The application is containerized using Docker, which provides process isolation and a controlled environment.
- **Code Analysis**: We use static analysis tools like ESLint and Codacy to identify potential security issues in the codebase.
- **Security Headers**: The application sets security-related HTTP headers such as `X-Content-Type-Options`, `X-Frame-Options`, and `X-XSS-Protection`.
