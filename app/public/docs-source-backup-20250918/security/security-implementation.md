# Security Implementation

This document provides a detailed overview of the security features implemented in HexTrackr.

---

## PathValidator Class

The `PathValidator` class is a critical security component that prevents directory traversal attacks. It ensures that file paths are validated and normalized before being used by the application.

### Usage

```javascript
const validator = new PathValidator('/path/to/base/directory');
const safePath = validator.validate(userInput);
```

---

## Rate Limiting

Rate limiting is applied to all API endpoints to prevent abuse and ensure service availability.

- **Default Limit**: 100 requests per 15 minutes
- **Configuration**: The rate limit is configurable via environment variables.

---

## CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured to restrict access to the API from unauthorized domains.

- **Allowed Origins**: The list of allowed origins is configurable via environment variables.
- **Default**: By default, all origins are allowed.

---

## Input Validation

All user input is validated and sanitized to prevent common web application vulnerabilities.

- **Server-side**: The server validates all incoming data for correct type, format, and length.
- **Client-side**: The client-side application uses DOMPurify to sanitize user input and prevent XSS attacks.

---

## File Upload Security

File uploads are secured with the following measures:

- **Size Limit**: A 100MB size limit is enforced on all file uploads.
- **Type Validation**: Only specific file types (e.g., CSV, ZIP) are allowed.
- **Path Restrictions**: Uploaded files are stored in a secure, non-executable directory.

---

## XSS Protection

HexTrackr uses DOMPurify on the client-side to sanitize HTML and prevent Cross-Site Scripting (XSS) attacks.

---

## SQL Injection Prevention

All database queries are executed using parameterized statements to prevent SQL injection attacks.
