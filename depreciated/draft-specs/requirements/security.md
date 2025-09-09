# Security Requirements Specification

## Purpose

Define comprehensive security standards for HexTrackr to protect sensitive vulnerability data and ensure safe operation in enterprise network environments while maintaining compliance with security best practices.

## Success Criteria

- **Authentication**: Multi-factor authentication support for admin accounts
- **Data Protection**: All vulnerability data encrypted at rest and in transit
- **Access Control**: Role-based permissions with audit logging
- **Input Validation**: 100% SQL injection and XSS prevention
- **Compliance**: SOC2 Type II and OWASP Top 10 adherence

## User Story

"As a network security administrator, I need HexTrackr to protect sensitive vulnerability information with enterprise-grade security so that our data remains confidential and compliant with organizational security policies."

## Security Requirements

### 1. Authentication and Authorization

#### JWT-Based Authentication
- **Target**: Secure token-based authentication with configurable expiration
- **Requirements**:
  - JWT tokens with RS256 signing algorithm
  - Configurable token expiration (default: 8 hours)
  - Automatic token refresh mechanism
  - Secure logout with token invalidation

```javascript
// JWT Configuration
const jwtConfig = {
  algorithm: 'RS256',
  expiresIn: '8h',
  issuer: 'hextrackr-system',
  audience: 'hextrackr-users',
  refreshThreshold: '30m', // Refresh tokens 30 minutes before expiry
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_PUBLIC_KEY, jwtConfig, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
```

#### Role-Based Access Control (RBAC)
- **Roles**: Admin, Analyst, Viewer, Team Lead
- **Permissions**: Create, Read, Update, Delete, Export, Import
- **Scope**: Per-site or global access control

```javascript
const roles = {
  admin: ['*'], // Full access
  analyst: ['vuln:read', 'vuln:update', 'ticket:create', 'ticket:update'],
  viewer: ['vuln:read', 'ticket:read'],
  teamlead: ['vuln:read', 'ticket:*', 'export:site']
};

const authorizeAction = (requiredPermission) => {
  return (req, res, next) => {
    const userPermissions = roles[req.user.role] || [];
    
    if (userPermissions.includes('*') || userPermissions.includes(requiredPermission)) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};
```

### 2. Data Protection

#### Encryption at Rest
- **Database**: SQLite database encryption using SQLCipher
- **Files**: AES-256 encryption for uploaded CSV files
- **Backups**: Encrypted backups with separate key management

```javascript
// Database Encryption Setup
const Database = require('better-sqlite3');
const path = require('path');

function initializeSecureDatabase(dbPath, encryptionKey) {
  const db = new Database(dbPath);
  
  // Enable SQLCipher encryption
  db.pragma(`key = '${encryptionKey}'`);
  db.pragma('cipher_page_size = 4096');
  db.pragma('kdf_iter = 256000'); // PBKDF2 iterations
  db.pragma('cipher_hmac_algorithm = HMAC_SHA512');
  
  return db;
}

// File Encryption for CSV uploads
const crypto = require('crypto');

class FileEncryption {
  constructor(key) {
    this.algorithm = 'aes-256-gcm';
    this.key = Buffer.from(key, 'hex');
  }
  
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encryptedData, iv, authTag) {
    const decipher = crypto.createDecipher(
      this.algorithm, 
      this.key, 
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

#### Encryption in Transit
- **HTTPS Only**: TLS 1.3 with strong cipher suites
- **Certificate Management**: Automatic certificate renewal
- **HSTS Headers**: Force secure connections

```javascript
// HTTPS Configuration
const https = require('https');
const fs = require('fs');

const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_PRIVATE_KEY),
  cert: fs.readFileSync(process.env.SSL_CERTIFICATE),
  ca: fs.readFileSync(process.env.SSL_CA_BUNDLE),
  
  // Security options
  secureProtocol: 'TLSv1_3_method',
  ciphers: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256'
  ].join(':'),
  honorCipherOrder: true
};

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

### 3. Input Validation and Sanitization

#### SQL Injection Prevention
- **Parameterized Queries**: All database queries use prepared statements
- **Input Validation**: Strict validation for all user inputs
- **Query Monitoring**: Log and monitor suspicious query patterns

```javascript
class SecureDatabase {
  constructor(db) {
    this.db = db;
    this.validator = new InputValidator();
  }
  
  // Safe vulnerability insertion
  insertVulnerability(data) {
    // Validate all inputs
    const validationResult = this.validator.validateVulnerability(data);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors);
    }
    
    // Use parameterized query
    const stmt = this.db.prepare(`
      INSERT INTO vulnerabilities_current (
        hostname, cve, description, severity, plugin_id, 
        normalizedHostname, dedupKey, rawData
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      data.hostname,
      data.cve,
      data.description,
      data.severity,
      data.plugin_id,
      data.normalizedHostname,
      data.dedupKey,
      JSON.stringify(data.rawData)
    );
  }
  
  // Safe search with parameterized queries
  searchVulnerabilities(searchTerm) {
    // Validate search term
    const cleanSearchTerm = this.validator.sanitizeSearchTerm(searchTerm);
    
    const stmt = this.db.prepare(`
      SELECT * FROM vulnerabilities_current 
      WHERE hostname LIKE ? OR cve LIKE ? OR description LIKE ?
      ORDER BY severity DESC, lastSeen DESC
      LIMIT 1000
    `);
    
    const searchPattern = `%${cleanSearchTerm}%`;
    return stmt.all(searchPattern, searchPattern, searchPattern);
  }
}
```

#### XSS Prevention
- **Content Security Policy**: Strict CSP headers
- **Input Sanitization**: HTML sanitization for all user inputs
- **Output Encoding**: Context-aware output encoding

```javascript
const createDOMPurify = require('isomorphic-dompurify');
const DOMPurify = createDOMPurify();

class XSSProtection {
  // Sanitize HTML content
  sanitizeHTML(input) {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'pre'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }
  
  // Sanitize for JavaScript context
  sanitizeJS(input) {
    return input
      .replace(/[<>'"&]/g, (char) => ({
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      })[char]);
  }
  
  // Content Security Policy
  getCSPHeader() {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }
}

// Apply CSP middleware
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', xssProtection.getCSPHeader());
  next();
});
```

### 4. Rate Limiting and DDoS Protection

#### API Rate Limiting
- **Per-IP Limits**: 1000 requests per hour per IP
- **Per-User Limits**: 5000 requests per hour per authenticated user
- **Endpoint-Specific Limits**: Stricter limits on sensitive operations

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

// General API rate limiting
const generalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:general:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limits for sensitive operations
const sensitiveLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:sensitive:'
  }),
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many sensitive operations from this IP'
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/vulnerabilities/import', sensitiveLimiter);
app.use('/api/tickets', sensitiveLimiter);
```

### 5. Audit Logging and Monitoring

#### Security Event Logging
- **Authentication Events**: Login attempts, failures, lockouts
- **Data Access**: Vulnerability queries, exports, modifications
- **Administrative Actions**: User management, configuration changes
- **Security Incidents**: Failed validations, suspicious activity

```javascript
const winston = require('winston');

// Security audit logger
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.errors({ stack: true })
  ),
  defaultMeta: { service: 'hextrackr-security' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/security-audit.log',
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 10
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class SecurityAuditLogger {
  logAuthentication(event, userId, ip, userAgent) {
    securityLogger.info('Authentication Event', {
      event,
      userId,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      category: 'authentication'
    });
  }
  
  logDataAccess(action, resource, userId, ip) {
    securityLogger.info('Data Access', {
      action,
      resource,
      userId,
      ip,
      timestamp: new Date().toISOString(),
      category: 'data-access'
    });
  }
  
  logSecurityIncident(incident, severity, details) {
    securityLogger.warn('Security Incident', {
      incident,
      severity,
      details,
      timestamp: new Date().toISOString(),
      category: 'security-incident'
    });
  }
}
```

### 6. Vulnerability Scanning and Security Testing

#### Regular Security Assessments
- **OWASP ZAP Integration**: Automated vulnerability scanning
- **Dependencies Scanning**: npm audit and Snyk integration
- **Code Quality**: Static analysis with security rules

```javascript
// Security testing configuration
const securityTests = {
  // OWASP ZAP API scan
  zapScan: {
    target: 'https://localhost:8080',
    scanType: 'active', // or 'passive'
    contextFile: 'security/zap-context.json',
    reportFormat: 'json'
  },
  
  // Dependency vulnerability scan
  dependencyScan: {
    auditLevel: 'moderate', // low, moderate, high, critical
    production: true,
    registry: 'https://registry.npmjs.org/'
  },
  
  // Static analysis rules
  staticAnalysis: {
    rules: [
      'no-eval',
      'no-implied-eval', 
      'no-new-func',
      'no-script-url',
      'security/detect-buffer-noassert',
      'security/detect-child-process',
      'security/detect-disable-mustache-escape',
      'security/detect-eval-with-expression',
      'security/detect-no-csrf-before-method-override',
      'security/detect-non-literal-fs-filename',
      'security/detect-non-literal-regexp',
      'security/detect-non-literal-require',
      'security/detect-possible-timing-attacks',
      'security/detect-pseudoRandomBytes',
      'security/detect-unsafe-regex'
    ]
  }
};

// Automated security test runner
class SecurityTestRunner {
  async runAllTests() {
    const results = {
      zapScan: await this.runZapScan(),
      dependencyScan: await this.runDependencyScan(),
      staticAnalysis: await this.runStaticAnalysis()
    };
    
    return this.generateSecurityReport(results);
  }
  
  async runZapScan() {
    // Integration with OWASP ZAP for automated security testing
    // Returns vulnerability findings and risk ratings
  }
  
  generateSecurityReport(results) {
    const totalIssues = this.countIssues(results);
    const riskLevel = this.calculateRiskLevel(results);
    
    return {
      timestamp: new Date().toISOString(),
      totalIssues,
      riskLevel,
      results,
      recommendations: this.generateRecommendations(results)
    };
  }
}
```

## Compliance Requirements

### SOC2 Type II Compliance
- **Access Controls**: Multi-factor authentication and role-based permissions
- **Data Encryption**: End-to-end encryption for sensitive data
- **Monitoring**: Continuous security monitoring and incident response
- **Change Management**: Documented change control processes

### OWASP Top 10 Mitigation
1. **Injection**: Parameterized queries and input validation
2. **Broken Authentication**: Strong authentication and session management
3. **Sensitive Data Exposure**: Encryption at rest and in transit
4. **XML External Entities**: XML parsing restrictions
5. **Broken Access Control**: RBAC implementation
6. **Security Misconfiguration**: Hardened default configurations
7. **Cross-Site Scripting**: Input sanitization and CSP
8. **Insecure Deserialization**: Safe deserialization practices
9. **Components with Known Vulnerabilities**: Regular dependency updates
10. **Insufficient Logging & Monitoring**: Comprehensive audit logging

## Security Testing Framework

### Automated Security Tests
```javascript
describe('Security Tests', () => {
  describe('Authentication', () => {
    test('should reject requests without valid JWT', async () => {
      const response = await request(app)
        .get('/api/vulnerabilities')
        .expect(401);
      
      expect(response.body.error).toBe('Access token required');
    });
    
    test('should reject expired tokens', async () => {
      const expiredToken = jwt.sign({ userId: 'test' }, 'secret', { expiresIn: '-1h' });
      
      const response = await request(app)
        .get('/api/vulnerabilities')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);
      
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });
  
  describe('Input Validation', () => {
    test('should prevent SQL injection attempts', async () => {
      const maliciousInput = "'; DROP TABLE vulnerabilities_current; --";
      
      const response = await request(app)
        .post('/api/vulnerabilities/search')
        .send({ query: maliciousInput })
        .expect(400);
      
      expect(response.body.error).toContain('Invalid input');
    });
    
    test('should sanitize XSS attempts', async () => {
      const xssInput = '<script>alert("xss")</script>';
      const sanitized = xssProtection.sanitizeHTML(xssInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });
  });
  
  describe('Rate Limiting', () => {
    test('should enforce API rate limits', async () => {
      // Make requests up to the limit
      for (let i = 0; i < 1000; i++) {
        await request(app).get('/api/vulnerabilities');
      }
      
      // Next request should be rate limited
      const response = await request(app)
        .get('/api/vulnerabilities')
        .expect(429);
      
      expect(response.body.error).toContain('Too many requests');
    });
  });
});
```

## Security Incident Response

### Incident Response Plan
1. **Detection**: Automated monitoring and alerting
2. **Assessment**: Rapid incident classification and impact analysis
3. **Containment**: Immediate threat isolation and system lockdown
4. **Eradication**: Root cause analysis and vulnerability patching
5. **Recovery**: System restoration and monitoring
6. **Lessons Learned**: Post-incident review and process improvement

### Emergency Response Procedures
```javascript
class SecurityIncidentResponse {
  async handleSecurityIncident(incident) {
    // Immediate containment
    await this.lockdownSystems();
    await this.notifyAdministrators(incident);
    
    // Log incident details
    securityLogger.error('Security Incident Detected', {
      incident: incident.type,
      severity: incident.severity,
      timestamp: new Date().toISOString(),
      details: incident.details
    });
    
    // Begin response workflow
    return this.executeResponsePlan(incident);
  }
  
  async lockdownSystems() {
    // Disable non-essential services
    // Revoke suspicious user sessions
    // Enable enhanced monitoring
  }
  
  async notifyAdministrators(incident) {
    // Send immediate alerts to security team
    // Create incident ticket in tracking system
    // Notify stakeholders based on severity
  }
}
```

These security requirements ensure HexTrackr maintains enterprise-grade protection for sensitive vulnerability data while supporting the operational needs of network security teams.