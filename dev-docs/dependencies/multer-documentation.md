# Multer Documentation

*Version: 2.0.2 - As used in HexTrackr*

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Basic Configuration](#basic-configuration)
3. [Upload Methods](#upload-methods)
4. [Storage Engines](#storage-engines)
5. [File Filtering](#file-filtering)
6. [Limits & Security](#limits--security)
7. [Error Handling](#error-handling)
8. [File Object Properties](#file-object-properties)
9. [Custom Storage Engines](#custom-storage-engines)
10. [Best Practices](#best-practices)

## Installation & Setup

### Installation
```bash
npm install multer
```

### Basic Setup with Express
```javascript
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
```

## Basic Configuration

### Configuration Options
```javascript
const multer = require('multer');

const upload = multer({
  dest: 'uploads/',           // Destination for uploads
  storage: storageEngine,     // Custom storage engine
  fileFilter: filterFunction, // File validation function
  limits: {                   // Upload limits
    fileSize: 10 * 1024 * 1024  // 10MB
  },
  preservePath: false         // Preserve full path
});
```

## Upload Methods

### Single File Upload
```javascript
// Handle single file with field name 'avatar'
app.post('/profile', upload.single('avatar'), (req, res) => {
  console.log(req.file);  // File information
  console.log(req.body);  // Text fields

  res.json({
    success: true,
    filename: req.file.filename
  });
});
```

### Multiple Files - Same Field
```javascript
// Handle up to 12 files with field name 'photos'
app.post('/photos/upload', upload.array('photos', 12), (req, res) => {
  console.log(req.files);  // Array of files
  console.log(req.body);   // Text fields

  res.json({
    success: true,
    count: req.files.length
  });
});
```

### Multiple Files - Different Fields
```javascript
// Handle different fields with different file counts
const uploadFields = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 8 },
  { name: 'documents', maxCount: 5 }
]);

app.post('/cool-profile', uploadFields, (req, res) => {
  // req.files is an object with arrays
  console.log(req.files['avatar'][0]);  // Single avatar file
  console.log(req.files['gallery']);    // Array of gallery files
  console.log(req.files['documents']);  // Array of document files
  console.log(req.body);                 // Text fields
});
```

### Any Files Upload
```javascript
// Accept all files (use cautiously)
app.post('/upload-any', upload.any(), (req, res) => {
  console.log(req.files);  // Array of all files
  console.log(req.body);   // Text fields

  // Validate files after upload
  for (const file of req.files) {
    console.log(`Field: ${file.fieldname}, File: ${file.originalname}`);
  }
});
```

### Text Fields Only
```javascript
// Accept only text fields, no files
app.post('/profile-text', upload.none(), (req, res) => {
  console.log(req.body);  // Only text fields
  // req.files will be undefined

  res.json({
    success: true,
    data: req.body
  });
});
```

## Storage Engines

### Disk Storage
```javascript
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination dynamically
    const dest = file.mimetype.startsWith('image/')
      ? 'uploads/images'
      : 'uploads/documents';
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
```

### Memory Storage
```javascript
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  // File is available as Buffer in req.file.buffer
  console.log(req.file.buffer);

  // Process buffer (e.g., upload to cloud storage)
  processBuffer(req.file.buffer);
});
```

### Advanced Disk Storage Example
```javascript
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    // Create directory if doesn't exist
    const uploadPath = `uploads/${req.user.id}`;

    try {
      await fs.promises.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    // Sanitize filename and preserve extension
    const sanitized = file.originalname.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const name = `${Date.now()}-${sanitized}`;
    cb(null, name);
  }
});
```

## File Filtering

### Basic File Filter
```javascript
function fileFilter(req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
}

const upload = multer({
  fileFilter: fileFilter,
  dest: 'uploads/'
});
```

### Advanced File Filter
```javascript
const fileFilter = (req, file, cb) => {
  // Allowed mime types
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/csv'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    // Accept file
    cb(null, true);
  } else {
    // Reject file
    cb(new Error(`Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024  // 10MB
  }
});
```

### CSV-Specific Filter
```javascript
const csvFileFilter = (req, file, cb) => {
  // Check file extension and MIME type
  const filetypes = /csv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed!'));
  }
};
```

## Limits & Security

### Setting Upload Limits
```javascript
const upload = multer({
  limits: {
    fieldNameSize: 100,          // Max field name size (bytes)
    fieldSize: 1024 * 1024,      // Max field value size (bytes)
    fields: 50,                  // Max number of non-file fields
    fileSize: 10 * 1024 * 1024,  // Max file size (bytes) - 10MB
    files: 5,                    // Max number of files
    parts: 100,                  // Max number of parts (fields + files)
    headerPairs: 2000            // Max number of header key-value pairs
  }
});
```

### Security Best Practices
```javascript
const path = require('path');
const crypto = require('crypto');

const secureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use a secure directory outside web root
    cb(null, '/secure/uploads');
  },
  filename: function (req, file, cb) {
    // Generate random filename to prevent directory traversal
    crypto.randomBytes(16, (err, buf) => {
      if (err) return cb(err);

      const filename = buf.toString('hex') + path.extname(file.originalname);
      cb(null, filename);
    });
  }
});

const secureUpload = multer({
  storage: secureStorage,
  fileFilter: (req, file, cb) => {
    // Whitelist safe extensions
    const safeExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (safeExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB limit
  }
});
```

## Error Handling

### Basic Error Handling
```javascript
const upload = multer().single('avatar');

app.post('/profile', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({ error: err.message });
    }

    // Everything went fine
    res.json({ success: true, file: req.file });
  });
});
```

### Error Codes
```javascript
// Multer error codes
const errorMessages = {
  'LIMIT_PART_COUNT': 'Too many parts',
  'LIMIT_FILE_SIZE': 'File too large',
  'LIMIT_FILE_COUNT': 'Too many files',
  'LIMIT_FIELD_KEY': 'Field name too long',
  'LIMIT_FIELD_VALUE': 'Field value too long',
  'LIMIT_FIELD_COUNT': 'Too many fields',
  'LIMIT_UNEXPECTED_FILE': 'Unexpected file field'
};

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = errorMessages[err.code] || err.message;
    return res.status(400).json({ error: message });
  }
  next(err);
});
```

### Advanced Error Handling
```javascript
class UploadError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              return next(new UploadError('File exceeds size limit', 413));
            case 'LIMIT_FILE_COUNT':
              return next(new UploadError('Too many files', 400));
            case 'LIMIT_UNEXPECTED_FILE':
              return next(new UploadError('Unexpected file field', 400));
            default:
              return next(new UploadError(err.message, 400));
          }
        }
        return next(new UploadError(err.message, 500));
      }
      next();
    });
  };
};

app.post('/upload',
  handleUpload(upload.single('file')),
  (req, res) => {
    res.json({ success: true });
  }
);
```

## File Object Properties

### Available File Properties
```javascript
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;

  console.log({
    fieldname: file.fieldname,        // Field name from form
    originalname: file.originalname,  // Original file name
    encoding: file.encoding,          // File encoding
    mimetype: file.mimetype,          // MIME type
    destination: file.destination,    // Upload destination
    filename: file.filename,          // Saved filename
    path: file.path,                  // Full path to file
    size: file.size,                  // File size in bytes
    buffer: file.buffer               // File buffer (memory storage only)
  });
});
```

## Custom Storage Engines

### Creating a Custom Storage Engine
```javascript
const fs = require('fs');
const path = require('path');

class CustomStorage {
  constructor(opts) {
    this.destination = opts.destination || '/tmp';
  }

  _handleFile(req, file, cb) {
    const fileName = Date.now() + '-' + file.originalname;
    const filePath = path.join(this.destination, fileName);

    const outStream = fs.createWriteStream(filePath);

    file.stream.pipe(outStream);

    outStream.on('error', cb);
    outStream.on('finish', () => {
      cb(null, {
        path: filePath,
        size: outStream.bytesWritten,
        filename: fileName
      });
    });
  }

  _removeFile(req, file, cb) {
    fs.unlink(file.path, cb);
  }
}

// Usage
const storage = new CustomStorage({
  destination: './uploads'
});

const upload = multer({ storage: storage });
```

### Cloud Storage Engine Example
```javascript
class S3Storage {
  constructor(opts) {
    this.s3 = opts.s3;
    this.bucket = opts.bucket;
  }

  _handleFile(req, file, cb) {
    const key = `uploads/${Date.now()}-${file.originalname}`;

    const uploadParams = {
      Bucket: this.bucket,
      Key: key,
      Body: file.stream,
      ContentType: file.mimetype
    };

    this.s3.upload(uploadParams, (err, data) => {
      if (err) return cb(err);

      cb(null, {
        location: data.Location,
        key: data.Key,
        bucket: data.Bucket,
        etag: data.ETag
      });
    });
  }

  _removeFile(req, file, cb) {
    this.s3.deleteObject({
      Bucket: this.bucket,
      Key: file.key
    }, cb);
  }
}
```

## Best Practices

### 1. File Validation
```javascript
const validateFile = (file) => {
  const errors = [];

  // Check file size
  if (file.size > 10 * 1024 * 1024) {
    errors.push('File size exceeds 10MB');
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'text/csv'];
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Invalid file type');
  }

  // Check filename
  if (file.originalname.length > 255) {
    errors.push('Filename too long');
  }

  return errors;
};

app.post('/upload', upload.single('file'), (req, res) => {
  const errors = validateFile(req.file);

  if (errors.length > 0) {
    // Remove uploaded file
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ errors });
  }

  res.json({ success: true });
});
```

### 2. Progress Tracking
```javascript
const uploadWithProgress = (req, res, next) => {
  let progress = 0;
  let fileSize = parseInt(req.headers['content-length']);

  req.on('data', (chunk) => {
    progress += chunk.length;
    const percentage = (progress / fileSize) * 100;

    // Emit progress via WebSocket or SSE
    req.io.emit('upload-progress', {
      percentage: percentage.toFixed(2),
      loaded: progress,
      total: fileSize
    });
  });

  upload.single('file')(req, res, next);
};
```

### 3. Cleanup Strategy
```javascript
const cleanupOldFiles = () => {
  const uploadDir = './uploads';
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  fs.readdir(uploadDir, (err, files) => {
    if (err) return console.error(err);

    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        const age = Date.now() - stats.mtime;
        if (age > maxAge) {
          fs.unlink(filePath, (err) => {
            if (!err) console.log(`Deleted old file: ${file}`);
          });
        }
      });
    });
  });
};

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);
```

### 4. File Processing Pipeline
```javascript
const processUpload = async (req, res) => {
  try {
    // 1. Upload file
    const file = req.file;

    // 2. Validate file
    await validateFile(file);

    // 3. Scan for viruses (if applicable)
    await scanFile(file.path);

    // 4. Process file (resize, convert, etc.)
    const processed = await processFile(file);

    // 5. Move to permanent storage
    const finalPath = await moveToStorage(processed);

    // 6. Save to database
    const record = await saveToDatabase({
      originalName: file.originalname,
      path: finalPath,
      size: file.size,
      uploadedBy: req.user.id
    });

    // 7. Clean up temp file
    fs.unlinkSync(file.path);

    res.json({ success: true, file: record });
  } catch (error) {
    // Clean up on error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};
```

## HexTrackr-Specific Patterns

### CSV Import Handler
```javascript
const csvStorage = multer.diskStorage({
  destination: './uploads/csv',
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-z0-9.]/gi, '_');
    cb(null, `import_${timestamp}_${sanitized}`);
  }
});

const csvUpload = multer({
  storage: csvStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' ||
        path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024  // 50MB for large vulnerability lists
  }
});

app.post('/api/vulnerabilities/import', csvUpload.single('file'), async (req, res) => {
  try {
    // Process CSV file
    const results = await processCSV(req.file.path);

    // Send progress updates via WebSocket
    io.emit('import-progress', {
      status: 'processing',
      total: results.length
    });

    res.json({
      success: true,
      message: `Imported ${results.length} vulnerabilities`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Secure File Operations with PathValidator
```javascript
const PathValidator = require('./utils/PathValidator');

const secureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = PathValidator.validatePath('./uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal
    const safeName = PathValidator.sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}_${safeName}`);
  }
});
```

---

*This documentation covers the essential Multer patterns and features used in HexTrackr's file upload functionality.*