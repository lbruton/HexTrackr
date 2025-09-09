# Data Model: Security Hardening Foundation

**Date**: 2025-09-09  
**Status**: Complete  
**Prerequisites**: research.md complete, security audit findings

## Entity Definitions

### SecurityPolicy Entity

**Purpose**: Defines security rules and validation requirements

```javascript
interface SecurityPolicy {
  id: string;                    // Policy identifier
  name: string;                  // Human-readable policy name
  type: SecurityPolicyType;      // INPUT_VALIDATION | AUTH | HEADERS | ENCRYPTION
  rules: SecurityRule[];         // Collection of security rules
  isActive: boolean;             // Policy enforcement status
  createdAt: Date;              // Policy creation timestamp
  updatedAt: Date;              // Last modification timestamp
}

enum SecurityPolicyType {
  INPUT_VALIDATION = 'input_validation',
  AUTHENTICATION = 'authentication', 
  SECURITY_HEADERS = 'security_headers',
  DATA_ENCRYPTION = 'data_encryption'
}
```

### SecurityRule Entity

**Purpose**: Individual security validation or enforcement rule

```javascript
interface SecurityRule {
  id: string;                    // Rule identifier
  policyId: string;              // Parent policy reference
  endpoint?: string;             // Target endpoint (null = global)
  validator: string;             // Validation function name
  parameters: Record<string, any>; // Rule configuration
  errorMessage: string;          // User-facing error message
  severity: SecuritySeverity;    // Rule importance level
}

enum SecuritySeverity {
  CRITICAL = 'critical',         // Blocks request immediately
  HIGH = 'high',                 // Logs and blocks request
  MEDIUM = 'medium',             // Logs warning, allows request
  LOW = 'low'                    // Logs info only
}
```

### SecurityEvent Entity

**Purpose**: Audit trail for security-related events and violations

```javascript
interface SecurityEvent {
  id: string;                    // Event identifier
  type: SecurityEventType;       // Event classification
  severity: SecuritySeverity;    // Event severity level
  source: string;                // Source IP address
  userId?: string;               // User identifier (if authenticated)
  endpoint: string;              // Target endpoint
  details: Record<string, any>;  // Event-specific details
  blocked: boolean;              // Whether request was blocked
  timestamp: Date;               // Event occurrence time
}

enum SecurityEventType {
  INPUT_VALIDATION_FAILURE = 'input_validation_failure',
  AUTHENTICATION_FAILURE = 'authentication_failure',
  AUTHORIZATION_FAILURE = 'authorization_failure',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded'
}
```

### EncryptionKey Entity

**Purpose**: Manages encryption keys for sensitive data protection

```javascript
interface EncryptionKey {
  id: string;                    // Key identifier
  purpose: string;               // Key usage purpose
  algorithm: string;             // Encryption algorithm (AES-256, etc.)
  keyData: Buffer;               // Encrypted key material
  created: Date;                 // Key creation date
  expires: Date;                 // Key expiration date
  isActive: boolean;             // Key active status
}
```

## Data Flow

### Security Validation Flow

1. Request received → SecurityPolicy lookup by endpoint
2. SecurityRules applied in severity order (CRITICAL → LOW)
3. Validation failure → SecurityEvent created, request blocked/logged
4. Validation success → Request processed normally
5. Response → Security headers applied via SecurityPolicy

### Encryption Flow  

1. Sensitive data identified → EncryptionKey lookup by purpose
2. Data encrypted using active key and specified algorithm
3. Encrypted data stored with key reference
4. Decryption request → Key validation and data decryption
5. Audit trail maintained via SecurityEvent logging

## Validation Rules

### SecurityPolicy Validation

- `name` must be unique within `type`
- `rules` collection cannot be empty for active policies
- `type` must match valid SecurityPolicyType enumeration
- Active policies require at least one CRITICAL or HIGH severity rule

### SecurityRule Validation

- `validator` must reference existing validation function
- `endpoint` pattern must be valid Express.js route format
- `parameters` must match validator function signature
- `errorMessage` must be user-friendly and non-technical

### SecurityEvent Validation

- `severity` must match triggering SecurityRule severity
- `source` must be valid IP address format
- `details` must contain relevant context for security analysis
- `timestamp` must be within reasonable time bounds (not future)

### EncryptionKey Validation

- `keyData` must be properly encrypted and not stored in plaintext
- `expires` must be future date for active keys
- `algorithm` must be approved encryption standard
- Key rotation required before expiration date

## Performance Considerations

### Database Indexes

```sql
-- Security event queries
CREATE INDEX idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_source ON security_events(source);

-- Policy lookup optimization  
CREATE INDEX idx_security_rules_endpoint ON security_rules(endpoint);
CREATE INDEX idx_security_policies_type ON security_policies(type);
```

### Caching Strategy

- SecurityPolicy: Cache active policies for 5 minutes
- SecurityRule: Cache validation rules per endpoint  
- EncryptionKey: Cache active keys with automatic refresh
- SecurityEvent: No caching (real-time logging required)

## Security Considerations

### Data Protection

- EncryptionKey.keyData: Always encrypted, never logged
- SecurityEvent.details: Sanitized to prevent information disclosure
- Password fields: Hashed using bcrypt with salt rounds ≥12
- Sensitive user data: Encrypted at rest using AES-256

### Access Control

- SecurityPolicy management: Admin role only
- SecurityEvent viewing: Security analyst role minimum
- EncryptionKey access: System service accounts only
- Audit log modification: Prevented at database level

## Error Handling

### Security Policy Errors

- Invalid validation rule: Log error, disable policy temporarily
- Missing validator function: Fallback to basic input sanitization
- Policy configuration error: Alert security team, use safe defaults

### Encryption Errors

- Key not found: Alert security team, prevent data access
- Decryption failure: Log security event, return access denied
- Key expired: Automatic key rotation trigger
- Hardware security module failure: Fallback to software encryption

---
**Data Model Quality**: CRITICAL - Security foundation architecture
**Compliance**: Aligned with OWASP security standards and NIST framework
