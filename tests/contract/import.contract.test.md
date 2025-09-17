# Import/Export Contract Tests - T009 Summary

## Overview

Successfully created comprehensive contract tests for HexTrackr's import/export endpoints following TDD principles. All tests are designed to **FAIL initially** until the actual API implementation is completed.

## Test File Location

- **File**: `/Volumes/DATA/GitHub/HexTrackr/tests/contract/import.contract.test.js`
- **Test Count**: 28 tests (27 failing, 1 passing)
- **Test Categories**: 6 major test suites

## Endpoints Under Test

### 1. CSV Import Validation (`POST /api/import/validate`)

- ✅ File upload format validation
- ✅ Invalid CSV rejection
- ✅ Large file streaming validation
- ✅ Non-CSV file rejection
- ✅ File size limit enforcement
- ✅ Required header validation

### 2. Import Progress Tracking (`GET /api/import/progress/:importId`)

- ✅ REST API progress retrieval
- ✅ WebSocket real-time progress updates
- ✅ Non-existent import ID handling
- ✅ Failed import error details

### 3. Export Generation (`POST /api/export/generate`)

- ✅ Basic filter export generation
- ✅ Multiple format support (CSV, JSON, XLSX)
- ✅ Request parameter validation
- ✅ Complex filtering scenarios
- ✅ WebSocket progress tracking

### 4. Export Download (`GET /api/export/download/:exportId`)

- ✅ Completed export file download
- ✅ Multiple format downloads
- ✅ Non-existent export handling
- ✅ Incomplete export conflict handling
- ✅ Expired export management
- ✅ Range request support for large files

## Integration & Edge Cases

### Integration Scenarios

- ✅ Full import-to-export workflow
- ✅ Concurrent operations handling
- ✅ Rate limiting enforcement

### Error Handling

- ✅ Malformed CSV graceful degradation
- ✅ Server error handling
- ✅ File size constraint validation
- ✅ Invalid UUID format handling

## Test Infrastructure

### Utilities Used

- **DatabaseTestUtils**: Test database management
- **ExpressTestUtils**: Express app testing
- **SocketTestUtils**: WebSocket testing
- **MockFactories**: Test data generation
- **AssertionHelpers**: Contract validation

### Mock Data

- Valid CSV content with proper headers
- Invalid CSV with malformed data
- Large CSV (1000 rows) for performance testing
- Various file formats for validation testing

## Contract Specifications

### CSV Import Validation Contract

```javascript
// Expected response structure
{
  valid: boolean,
  rowCount: number,
  headers: string[],
  preview: object[],
  issues: object[],
  estimatedProcessingTime?: number
}
```

### Import Progress Contract

```javascript
// REST API response
{
  importId: string,
  status: "pending" | "processing" | "completed" | "failed",
  progress: number, // 0-100
  totalRows: number,
  processedRows: number,
  errors: object[],
  startTime: string,
  estimatedCompletion: string
}

// WebSocket update
{
  importId: string,
  status: string,
  progress: number,
  processedRows: number,
  currentRow: number,
  timestamp: string
}
```

### Export Generation Contract

```javascript
// Request format
{
  format: "csv" | "json" | "xlsx",
  filters: {
    severity?: string[],
    dateRange?: { start: string, end: string },
    cvssRange?: { min: number, max: number },
    hostnames?: string[],
    hasTicket?: boolean,
    vendor?: string
  },
  columns: string[],
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  limit?: number
}

// Response format
{
  exportId: string,
  status: "pending" | "processing" | "completed" | "failed",
  estimatedRows: number,
  estimatedSize: number,
  estimatedCompletion: string,
  downloadUrl: string,
  format: string,
  appliedFilters: object
}
```

### Export Download Contract

```javascript
// Headers
Content-Type: text/csv | application/json | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="export-{exportId}.{format}"
Content-Length: number
Accept-Ranges: bytes
Content-Range?: string (for range requests)
```

## Current Test Status

### Failing Tests (Expected)

- **27 tests failing** with `501 Not Implemented` status
- This is **correct behavior** for TDD approach
- Tests will pass once actual implementation is added

### Passing Tests

- **1 test passing**: File size limit enforcement (handled by multer middleware)

## Next Steps for Implementation

1. **Implement CSV validation endpoint** with PapaParse
2. **Add import progress tracking** with database persistence
3. **Create export generation logic** with filtering
4. **Implement export download** with file streaming
5. **Add WebSocket integration** for real-time progress
6. **Implement rate limiting** and error handling

## Running the Tests

```bash
# Run all contract tests
npm run test:contract

# Run just import/export tests
npm test -- tests/contract/import.contract.test.js

# Run with verbose output
npm test -- tests/contract/import.contract.test.js --verbose
```

## Key Features Tested

- ✅ **File Upload**: Multer configuration and validation
- ✅ **CSV Processing**: Header validation and content parsing
- ✅ **Progress Tracking**: REST and WebSocket implementations
- ✅ **Export Filtering**: Complex filter combinations
- ✅ **Format Support**: CSV, JSON, XLSX downloads
- ✅ **Error Handling**: Comprehensive edge case coverage
- ✅ **Performance**: Large file handling and concurrent operations
- ✅ **Security**: File type validation and size limits

The contract tests provide a complete specification for the import/export API, ensuring that when implementation is added, it will meet all the required interface contracts and handle all specified edge cases.
