# Middleware

This section contains API documentation for Middleware.

## Source: app/middleware/**/*.js

## Classes

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#PathValidator">PathValidator</a></td>
    <td><p>PathValidator - Security utility for path validation
Prevents path traversal attacks and ensures safe file operations</p>
</td>
    </tr>
</tbody>
</table>

## Constants

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#crypto">crypto</a></td>
    <td><p>Logging Middleware for HexTrackr</p>
<p>Provides structured logging with request tracking, performance monitoring,
and environment-appropriate log levels.</p>
</td>
    </tr>
<tr>
    <td><a href="#cors">cors</a></td>
    <td><p>HexTrackr Security Middleware
Centralized security middleware for the monolithic Express.js server</p>
<p>This module extracts all security-related middleware from server.js including:</p>
<ul>
<li>CORS configuration and setup</li>
<li>Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)</li>
<li>Rate limiting configuration for DoS protection</li>
<li>PathValidator class for secure file operations</li>
<li>Request sanitization and validation middleware</li>
</ul>
</td>
    </tr>
<tr>
    <td><a href="#multer">multer</a></td>
    <td><p>HexTrackr Validation Middleware
Extracted from server.js for better modularity and reusability
Provides validation middleware functions for request parameters, bodies, and files</p>
</td>
    </tr>
<tr>
    <td><a href="#csvUpload">csvUpload</a></td>
    <td><p>Multer configuration for CSV file uploads
Limits file size and validates file types</p>
</td>
    </tr>
<tr>
    <td><a href="#jsonUpload">jsonUpload</a></td>
    <td><p>JSON file upload configuration for data restoration</p>
</td>
    </tr>
<tr>
    <td><a href="#validateTicketInput">validateTicketInput</a></td>
    <td><p>Ticket input validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateVulnerabilityInput">validateVulnerabilityInput</a></td>
    <td><p>Vulnerability input validation middleware</p>
</td>
    </tr>
</tbody>
</table>

## Functions

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#globalErrorHandler">globalErrorHandler(err, req, res, next)</a></td>
    <td><p>Global error handler middleware (4 parameters required for Express error handler)</p>
</td>
    </tr>
<tr>
    <td><a href="#notFoundHandler">notFoundHandler(req, res)</a></td>
    <td><p>404 Not Found handler for unmatched routes</p>
</td>
    </tr>
<tr>
    <td><a href="#formatDatabaseError">formatDatabaseError(err)</a> ⇒ <code>string</code></td>
    <td><p>Database error formatter</p>
</td>
    </tr>
<tr>
    <td><a href="#formatValidationError">formatValidationError(err)</a> ⇒ <code>Object</code> | <code>string</code></td>
    <td><p>Validation error formatter</p>
</td>
    </tr>
<tr>
    <td><a href="#asyncErrorHandler">asyncErrorHandler(fn)</a> ⇒ <code>function</code></td>
    <td><p>Async wrapper to catch async route handler errors</p>
</td>
    </tr>
<tr>
    <td><a href="#handleDatabaseError">handleDatabaseError(err, res, operation, additionalContext)</a></td>
    <td><p>Database operation error handler
Provides consistent error handling for database operations</p>
</td>
    </tr>
<tr>
    <td><a href="#handleFileError">handleFileError(err, res, operation)</a></td>
    <td><p>File operation error handler
Provides consistent error handling for file operations</p>
</td>
    </tr>
<tr>
    <td><a href="#handleCSVError">handleCSVError(err, res)</a></td>
    <td><p>CSV parsing error handler</p>
</td>
    </tr>
<tr>
    <td><a href="#handleValidationError">handleValidationError(message, res, details)</a></td>
    <td><p>Request validation error handler</p>
</td>
    </tr>
<tr>
    <td><a href="#requestLoggingMiddleware">requestLoggingMiddleware()</a></td>
    <td><p>Request logging middleware
Logs incoming requests with unique ID and response times</p>
</td>
    </tr>
<tr>
    <td><a href="#errorLoggingMiddleware">errorLoggingMiddleware()</a></td>
    <td><p>Error logging middleware
Logs uncaught errors with request context</p>
</td>
    </tr>
<tr>
    <td><a href="#logApiResponse">logApiResponse()</a></td>
    <td><p>API response logging wrapper
Standardizes API response logging</p>
</td>
    </tr>
<tr>
    <td><a href="#logServerStartup">logServerStartup()</a></td>
    <td><p>Server startup logging</p>
</td>
    </tr>
<tr>
    <td><a href="#logServerReady">logServerReady()</a></td>
    <td><p>Server ready logging</p>
</td>
    </tr>
<tr>
    <td><a href="#createCorsMiddleware">createCorsMiddleware()</a> ⇒ <code>function</code></td>
    <td><p>CORS Middleware Configuration
Configures Cross-Origin Resource Sharing to allow frontend access</p>
</td>
    </tr>
<tr>
    <td><a href="#createRateLimitMiddleware">createRateLimitMiddleware()</a> ⇒ <code>function</code></td>
    <td><p>Rate Limiting Middleware
DoS protection by limiting requests per IP address within a time window</p>
</td>
    </tr>
<tr>
    <td><a href="#securityHeadersMiddleware">securityHeadersMiddleware(req, res, next)</a></td>
    <td><p>Security Headers Middleware
Adds essential security headers to all responses</p>
</td>
    </tr>
<tr>
    <td><a href="#requestSanitizationMiddleware">requestSanitizationMiddleware(req, res, next)</a></td>
    <td><p>Request Sanitization Middleware
Basic sanitization and validation for incoming requests</p>
</td>
    </tr>
<tr>
    <td><a href="#apiSecurityMiddleware">apiSecurityMiddleware(req, res, next)</a></td>
    <td><p>API Security Middleware
Additional security measures specifically for API endpoints</p>
</td>
    </tr>
<tr>
    <td><a href="#securityErrorHandler">securityErrorHandler(err, req, res, next)</a></td>
    <td><p>Error Handling Middleware for Security
Handles security-related errors without exposing sensitive information</p>
</td>
    </tr>
<tr>
    <td><a href="#inputValidationMiddleware">inputValidationMiddleware(req, res, next)</a></td>
    <td><p>Input Validation Middleware
Validates common input parameters to prevent injection attacks</p>
</td>
    </tr>
<tr>
    <td><a href="#createValidationMiddleware">createValidationMiddleware(validatorFn, sourceProperty)</a> ⇒ <code>function</code></td>
    <td><p>Generic validation middleware factory</p>
</td>
    </tr>
<tr>
    <td><a href="#validateFileUpload">validateFileUpload()</a></td>
    <td><p>File upload validation middleware
Checks if file was uploaded and validates basic properties</p>
</td>
    </tr>
<tr>
    <td><a href="#validateCSVImportData">validateCSVImportData()</a></td>
    <td><p>CSV import data validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validatePaginationParams">validatePaginationParams()</a></td>
    <td><p>Pagination parameters validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateDateRangeParams">validateDateRangeParams()</a></td>
    <td><p>Date range parameters validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateNumericId">validateNumericId()</a></td>
    <td><p>Numeric ID parameter validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateImportType">validateImportType()</a></td>
    <td><p>Import type validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateVendorParam">validateVendorParam()</a></td>
    <td><p>Vendor parameter validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateSearchQuery">validateSearchQuery()</a></td>
    <td><p>Search query validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateFilterParams">validateFilterParams()</a></td>
    <td><p>Filter parameters validation middleware</p>
</td>
    </tr>
</tbody>
</table>

<a name="PathValidator"></a>

## PathValidator

PathValidator - Security utility for path validation
Prevents path traversal attacks and ensures safe file operations

**Kind**: global class  

* [PathValidator](#PathValidator)
  * [.validatePath(filePath)](#PathValidator.validatePath) ⇒ <code>string</code>
  * [.safeReadFileSync(filePath, options)](#PathValidator.safeReadFileSync) ⇒ <code>string</code> \| <code>Buffer</code>
  * [.safeWriteFileSync(filePath, data, options)](#PathValidator.safeWriteFileSync)
  * [.safeReaddirSync(dirPath, options)](#PathValidator.safeReaddirSync) ⇒ <code>Array</code>
  * [.safeStatSync(filePath)](#PathValidator.safeStatSync) ⇒ <code>fs.Stats</code>
  * [.safeExistsSync(filePath)](#PathValidator.safeExistsSync) ⇒ <code>boolean</code>
  * [.safeUnlinkSync(filePath)](#PathValidator.safeUnlinkSync)

* * *

<a name="PathValidator.validatePath"></a>

### PathValidator.validatePath(filePath) ⇒ <code>string</code>

Validates and normalizes file paths to prevent path traversal

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  
**Returns**: <code>string</code> - - The validated and normalized path  
**Throws**:

* <code>Error</code> - If path is invalid or contains traversal attempts

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | The file path to validate |

* * *

<a name="PathValidator.safeReadFileSync"></a>

### PathValidator.safeReadFileSync(filePath, options) ⇒ <code>string</code> \| <code>Buffer</code>

Safely reads a file with path validation

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  
**Returns**: <code>string</code> \| <code>Buffer</code> - - File contents  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| filePath | <code>string</code> |  | The file path to read |
| options | <code>string</code> \| <code>object</code> | <code>&quot;utf8&quot;</code> | Encoding or options object |

* * *

<a name="PathValidator.safeWriteFileSync"></a>

### PathValidator.safeWriteFileSync(filePath, data, options)

Safely writes a file with path validation

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| filePath | <code>string</code> |  | The file path to write |
| data | <code>string</code> \| <code>Buffer</code> |  | Data to write |
| options | <code>string</code> \| <code>object</code> | <code>&quot;utf8&quot;</code> | Encoding or options object |

* * *

<a name="PathValidator.safeReaddirSync"></a>

### PathValidator.safeReaddirSync(dirPath, options) ⇒ <code>Array</code>

Safely reads a directory with path validation

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  
**Returns**: <code>Array</code> - - Directory contents  

| Param | Type | Description |
| --- | --- | --- |
| dirPath | <code>string</code> | The directory path to read |
| options | <code>object</code> | Options object |

* * *

<a name="PathValidator.safeStatSync"></a>

### PathValidator.safeStatSync(filePath) ⇒ <code>fs.Stats</code>

Safely gets file stats with path validation

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  
**Returns**: <code>fs.Stats</code> - - File statistics  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | The file path to stat |

* * *

<a name="PathValidator.safeExistsSync"></a>

### PathValidator.safeExistsSync(filePath) ⇒ <code>boolean</code>

Safely checks if file exists with path validation

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  
**Returns**: <code>boolean</code> - - True if file exists, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | The file path to check |

* * *

<a name="PathValidator.safeUnlinkSync"></a>

### PathValidator.safeUnlinkSync(filePath)

Safely deletes a file with path validation

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | The file path to delete |

* * *

<a name="crypto"></a>

## crypto

Logging Middleware for HexTrackr

Provides structured logging with request tracking, performance monitoring,
and environment-appropriate log levels.

**Kind**: global constant  

* * *

<a name="cors"></a>

## cors

HexTrackr Security Middleware
Centralized security middleware for the monolithic Express.js server

This module extracts all security-related middleware from server.js including:

* CORS configuration and setup
* Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
* Rate limiting configuration for DoS protection
* PathValidator class for secure file operations
* Request sanitization and validation middleware

**Kind**: global constant  
**Version**: 1.0.0  
**Author**: HexTrackr Development Team  

* * *

<a name="multer"></a>

## multer

HexTrackr Validation Middleware
Extracted from server.js for better modularity and reusability
Provides validation middleware functions for request parameters, bodies, and files

**Kind**: global constant  

* * *

<a name="csvUpload"></a>

## csvUpload

Multer configuration for CSV file uploads
Limits file size and validates file types

**Kind**: global constant  

* * *

<a name="jsonUpload"></a>

## jsonUpload

JSON file upload configuration for data restoration

**Kind**: global constant  

* * *

<a name="validateTicketInput"></a>

## validateTicketInput

Ticket input validation middleware

**Kind**: global constant  

* * *

<a name="validateVulnerabilityInput"></a>

## validateVulnerabilityInput

Vulnerability input validation middleware

**Kind**: global constant  

* * *

<a name="globalErrorHandler"></a>

## globalErrorHandler(err, req, res, next)

Global error handler middleware (4 parameters required for Express error handler)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | The error object |
| req | <code>Object</code> | Express request object |
| res | <code>Object</code> | Express response object |
| next | <code>function</code> | Express next middleware function |

* * *

<a name="notFoundHandler"></a>

## notFoundHandler(req, res)

404 Not Found handler for unmatched routes

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Express request object |
| res | <code>Object</code> | Express response object |

* * *

<a name="formatDatabaseError"></a>

## formatDatabaseError(err) ⇒ <code>string</code>

Database error formatter

**Kind**: global function  
**Returns**: <code>string</code> - Formatted error message  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | Database error object |

* * *

<a name="formatValidationError"></a>

## formatValidationError(err) ⇒ <code>Object</code> \| <code>string</code>

Validation error formatter

**Kind**: global function  
**Returns**: <code>Object</code> \| <code>string</code> - Formatted validation errors  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | Validation error object |

* * *

<a name="asyncErrorHandler"></a>

## asyncErrorHandler(fn) ⇒ <code>function</code>

Async wrapper to catch async route handler errors

**Kind**: global function  
**Returns**: <code>function</code> - Wrapped function that catches async errors  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Async route handler function |

* * *

<a name="handleDatabaseError"></a>

## handleDatabaseError(err, res, operation, additionalContext)

Database operation error handler
Provides consistent error handling for database operations

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| err | <code>Error</code> |  | Database error |
| res | <code>Object</code> |  | Express response object |
| operation | <code>string</code> | <code>&quot;Database operation&quot;</code> | Description of the failed operation |
| additionalContext | <code>Object</code> |  | Additional context for logging |

* * *

<a name="handleFileError"></a>

## handleFileError(err, res, operation)

File operation error handler
Provides consistent error handling for file operations

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| err | <code>Error</code> |  | File operation error |
| res | <code>Object</code> |  | Express response object |
| operation | <code>string</code> | <code>&quot;File operation&quot;</code> | Description of the failed operation |

* * *

<a name="handleCSVError"></a>

## handleCSVError(err, res)

CSV parsing error handler

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | CSV parsing error |
| res | <code>Object</code> | Express response object |

* * *

<a name="handleValidationError"></a>

## handleValidationError(message, res, details)

Request validation error handler

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | Validation error message |
| res | <code>Object</code> |  | Express response object |
| details | <code>Object</code> | <code></code> | Additional validation details |

* * *

<a name="requestLoggingMiddleware"></a>

## requestLoggingMiddleware()

Request logging middleware
Logs incoming requests with unique ID and response times

**Kind**: global function  

* * *

<a name="errorLoggingMiddleware"></a>

## errorLoggingMiddleware()

Error logging middleware
Logs uncaught errors with request context

**Kind**: global function  

* * *

<a name="logApiResponse"></a>

## logApiResponse()

API response logging wrapper
Standardizes API response logging

**Kind**: global function  

* * *

<a name="logServerStartup"></a>

## logServerStartup()

Server startup logging

**Kind**: global function  

* * *

<a name="logServerReady"></a>

## logServerReady()

Server ready logging

**Kind**: global function  

* * *

<a name="createCorsMiddleware"></a>

## createCorsMiddleware() ⇒ <code>function</code>

CORS Middleware Configuration
Configures Cross-Origin Resource Sharing to allow frontend access

**Kind**: global function  
**Returns**: <code>function</code> - - CORS middleware function  

* * *

<a name="createRateLimitMiddleware"></a>

## createRateLimitMiddleware() ⇒ <code>function</code>

Rate Limiting Middleware
DoS protection by limiting requests per IP address within a time window

**Kind**: global function  
**Returns**: <code>function</code> - - Rate limiting middleware function  

* * *

<a name="securityHeadersMiddleware"></a>

## securityHeadersMiddleware(req, res, next)

Security Headers Middleware
Adds essential security headers to all responses

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | Express request object |
| res | <code>object</code> | Express response object |
| next | <code>function</code> | Express next function |

* * *

<a name="requestSanitizationMiddleware"></a>

## requestSanitizationMiddleware(req, res, next)

Request Sanitization Middleware
Basic sanitization and validation for incoming requests

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | Express request object |
| res | <code>object</code> | Express response object |
| next | <code>function</code> | Express next function |

* * *

<a name="apiSecurityMiddleware"></a>

## apiSecurityMiddleware(req, res, next)

API Security Middleware
Additional security measures specifically for API endpoints

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | Express request object |
| res | <code>object</code> | Express response object |
| next | <code>function</code> | Express next function |

* * *

<a name="securityErrorHandler"></a>

## securityErrorHandler(err, req, res, next)

Error Handling Middleware for Security
Handles security-related errors without exposing sensitive information

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | Error object |
| req | <code>object</code> | Express request object |
| res | <code>object</code> | Express response object |
| next | <code>function</code> | Express next function |

* * *

<a name="inputValidationMiddleware"></a>

## inputValidationMiddleware(req, res, next)

Input Validation Middleware
Validates common input parameters to prevent injection attacks

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | Express request object |
| res | <code>object</code> | Express response object |
| next | <code>function</code> | Express next function |

* * *

<a name="createValidationMiddleware"></a>

## createValidationMiddleware(validatorFn, sourceProperty) ⇒ <code>function</code>

Generic validation middleware factory

**Kind**: global function  
**Returns**: <code>function</code> - Express middleware function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| validatorFn | <code>function</code> |  | Validation function that returns {success, errors, warnings} |
| sourceProperty | <code>string</code> | <code>&quot;body&quot;</code> | Request property to validate ("body", "query", "params") |

* * *

<a name="validateFileUpload"></a>

## validateFileUpload()

File upload validation middleware
Checks if file was uploaded and validates basic properties

**Kind**: global function  

* * *

<a name="validateCSVImportData"></a>

## validateCSVImportData()

CSV import data validation middleware

**Kind**: global function  

* * *

<a name="validatePaginationParams"></a>

## validatePaginationParams()

Pagination parameters validation middleware

**Kind**: global function  

* * *

<a name="validateDateRangeParams"></a>

## validateDateRangeParams()

Date range parameters validation middleware

**Kind**: global function  

* * *

<a name="validateNumericId"></a>

## validateNumericId()

Numeric ID parameter validation middleware

**Kind**: global function  

* * *

<a name="validateImportType"></a>

## validateImportType()

Import type validation middleware

**Kind**: global function  

* * *

<a name="validateVendorParam"></a>

## validateVendorParam()

Vendor parameter validation middleware

**Kind**: global function  

* * *

<a name="validateSearchQuery"></a>

## validateSearchQuery()

Search query validation middleware

**Kind**: global function  

* * *

<a name="validateFilterParams"></a>

## validateFilterParams()

Filter parameters validation middleware

**Kind**: global function  

* * *

---
