# Security Overview

<!-- markdownlint-disable-next-line MD013 -->
HexTrackr is designed with security in mind. This document provides an overview of the security measures in place.

## Data Security

- **Database**: The SQLite database is stored locally on the server. Access is restricted to the backend application.
- **File Uploads**: Uploaded CSV files are stored temporarily and processed securely. They are deleted after processing.
- **Input Validation**: All user input is validated on the backend to prevent common vulnerabilities such as Cross-Site Scripting (XSS) and SQL Injection.

## Secure Development

- **Dependencies**: We use `npm audit` to regularly check for vulnerabilities in our dependencies.
- **Docker**: The application is containerized using Docker, which provides process isolation and a controlled environment.
- **Code Analysis**: We use static analysis tools like ESLint and Codacy to identify potential security issues in the codebase.
