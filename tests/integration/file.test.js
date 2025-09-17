/**
 * File Service Integration Tests with PathValidator
 * T013: Integration test for file service with PathValidator
 *
 * These tests are designed to FAIL initially (TDD approach)
 * Future FileService will use PathValidator for secure file operations
 */

const { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } = require("@jest/globals");
const path = require("path");
const fs = require("fs").promises;
const os = require("os");
const crypto = require("crypto");

const {
  DatabaseTestUtils,
  ExpressTestUtils,
  MockFactories,
  AssertionHelpers,
  GeneralTestUtils
} = require("../test-utils");

// These imports will fail initially - part of TDD approach
let FileService, PathValidator;
try {
  FileService = require("../../src/services/FileService");
  PathValidator = require("../../src/validators/PathValidator");
} catch (error) {
  // Expected to fail initially in TDD
  console.warn("FileService and PathValidator not yet implemented - tests will fail as expected in TDD");
}

describe("File Service Integration Tests with PathValidator", () => {
  let fileService;
  let pathValidator;
  let tempDir;
  let testDataDir;
  let backupDir;
  let dbUtils;

  beforeAll(async () => {
    // Create temporary directories for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "hextrackr-file-test-"));
    testDataDir = path.join(tempDir, "data");
    backupDir = path.join(tempDir, "backups");

    await fs.mkdir(testDataDir, { recursive: true });
    await fs.mkdir(backupDir, { recursive: true });

    // Initialize database utilities
    dbUtils = new DatabaseTestUtils();
    await dbUtils.createTestDatabase("file-service");
    await dbUtils.initializeSchema();
  });

  afterAll(async () => {
    // Cleanup
    await dbUtils.cleanup();
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn("Failed to cleanup temp directory:", error.message);
    }
  });

  beforeEach(async () => {
    // This will fail initially - FileService not implemented
    try {
      pathValidator = new PathValidator({
        allowedDirectories: [testDataDir, backupDir],
        allowedExtensions: [".csv", ".json", ".txt", ".log"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        enableTraversalProtection: true,
        enableSymlinkProtection: true
      });

      fileService = new FileService({
        pathValidator,
        baseDirectory: testDataDir,
        backupDirectory: backupDir,
        tempDirectory: path.join(tempDir, "temp"),
        database: dbUtils.db
      });
    } catch (error) {
      // Expected in TDD - will fail until implemented
    }
  });

  afterEach(async () => {
    // Clean up test files between tests
    try {
      const files = await fs.readdir(testDataDir);
      for (const file of files) {
        await fs.unlink(path.join(testDataDir, file));
      }

      const backupFiles = await fs.readdir(backupDir);
      for (const file of backupFiles) {
        await fs.unlink(path.join(backupDir, file));
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe("PathValidator Security Tests", () => {
    test("should prevent directory traversal attacks", async () => {
      // These tests will fail initially - PathValidator not implemented
      expect(PathValidator).toBeDefined();
      expect(pathValidator).toBeDefined();

      const maliciousPaths = [
        "../../../etc/passwd",
        "..\\..\\..\\windows\\system32\\config\\sam",
        "/etc/shadow",
        "C:\\Windows\\System32\\config\\SAM",
        "../../package.json",
        "data/../../../secret.txt",
        "./data/../../etc/hosts"
      ];

      for (const maliciousPath of maliciousPaths) {
        await expect(pathValidator.validatePath(maliciousPath))
          .rejects
          .toThrow(/directory traversal|invalid path|security violation/i);
      }
    });

    test("should validate allowed file extensions", async () => {
      expect(pathValidator).toBeDefined();

      const validPaths = [
        "test-data.csv",
        "backup.json",
        "log-file.txt",
        "application.log"
      ];

      const invalidPaths = [
        "malicious.exe",
        "script.js",
        "config.php",
        "data.sql",
        "readme.md"
      ];

      for (const validPath of validPaths) {
        const fullPath = path.join(testDataDir, validPath);
        await expect(pathValidator.validatePath(fullPath))
          .resolves
          .toBe(fullPath);
      }

      for (const invalidPath of invalidPaths) {
        const fullPath = path.join(testDataDir, invalidPath);
        await expect(pathValidator.validatePath(fullPath))
          .rejects
          .toThrow(/invalid file extension|not allowed/i);
      }
    });

    test("should enforce directory restrictions", async () => {
      expect(pathValidator).toBeDefined();

      const allowedPaths = [
        path.join(testDataDir, "allowed.csv"),
        path.join(backupDir, "backup.json")
      ];

      const restrictedPaths = [
        "/tmp/restricted.csv",
        "/home/user/private.txt",
        "C:\\Users\\Public\\test.csv",
        path.join(os.tmpdir(), "outside.csv")
      ];

      for (const allowedPath of allowedPaths) {
        await expect(pathValidator.validatePath(allowedPath))
          .resolves
          .toBe(allowedPath);
      }

      for (const restrictedPath of restrictedPaths) {
        await expect(pathValidator.validatePath(restrictedPath))
          .rejects
          .toThrow(/outside allowed directories|access denied/i);
      }
    });

    test("should validate file size limits", async () => {
      expect(pathValidator).toBeDefined();

      // Create a test file that exceeds size limit
      const largePath = path.join(testDataDir, "large-file.csv");
      const largeContent = "x".repeat(15 * 1024 * 1024); // 15MB

      await fs.writeFile(largePath, largeContent);

      await expect(pathValidator.validateFileSize(largePath))
        .rejects
        .toThrow(/file size exceeds limit|too large/i);

      // Test valid file size
      const normalPath = path.join(testDataDir, "normal-file.csv");
      const normalContent = "test,data,values\n1,2,3\n";

      await fs.writeFile(normalPath, normalContent);

      await expect(pathValidator.validateFileSize(normalPath))
        .resolves
        .toBe(true);
    });

    test("should protect against symlink attacks", async () => {
      expect(pathValidator).toBeDefined();

      // Create a symlink pointing outside allowed directory
      const targetPath = path.join(os.tmpdir(), "target.txt");
      const symlinkPath = path.join(testDataDir, "symlink.csv");

      await fs.writeFile(targetPath, "sensitive data");

      try {
        await fs.symlink(targetPath, symlinkPath);

        await expect(pathValidator.validatePath(symlinkPath))
          .rejects
          .toThrow(/symlink not allowed|security violation/i);
      } catch (error) {
        // Skip on systems that don't support symlinks
        if (error.code !== "EPERM" && error.code !== "ENOENT") {
          throw error;
        }
      }
    });
  });

  describe("File Operations with Security Validation", () => {
    test("should securely read CSV files", async () => {
      expect(FileService).toBeDefined();
      expect(fileService).toBeDefined();

      const csvPath = path.join(testDataDir, "test-data.csv");
      const csvContent = "hostname,ip_address,cve,severity\ntest-host,192.168.1.100,CVE-2023-0001,High\n";

      await fs.writeFile(csvPath, csvContent);

      const result = await fileService.readCsvFile("test-data.csv");

      expect(result).toBeDefined();
      expect(result.headers).toEqual(["hostname", "ip_address", "cve", "severity"]);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        hostname: "test-host",
        ip_address: "192.168.1.100",
        cve: "CVE-2023-0001",
        severity: "High"
      });
    });

    test("should securely write files with validation", async () => {
      expect(fileService).toBeDefined();

      const testData = {
        headers: ["id", "name", "status"],
        rows: [
          ["1", "Test Item 1", "Active"],
          ["2", "Test Item 2", "Inactive"]
        ]
      };

      await fileService.writeCsvFile("output.csv", testData);

      const filePath = path.join(testDataDir, "output.csv");
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      const content = await fs.readFile(filePath, "utf8");
      expect(content).toContain("id,name,status");
      expect(content).toContain("1,Test Item 1,Active");
      expect(content).toContain("2,Test Item 2,Inactive");
    });

    test("should create secure backups before file operations", async () => {
      expect(fileService).toBeDefined();

      // Create original file
      const originalPath = path.join(testDataDir, "original.csv");
      const originalContent = "original,data\n1,test\n";
      await fs.writeFile(originalPath, originalContent);

      // Modify file (should create backup)
      const newData = {
        headers: ["updated", "data"],
        rows: [["2", "modified"]]
      };

      await fileService.updateCsvFile("original.csv", newData);

      // Check backup was created
      const backupFiles = await fs.readdir(backupDir);
      const backupFile = backupFiles.find(f => f.startsWith("original.csv.backup."));
      expect(backupFile).toBeDefined();

      const backupContent = await fs.readFile(path.join(backupDir, backupFile), "utf8");
      expect(backupContent).toBe(originalContent);
    });

    test("should handle temporary file operations securely", async () => {
      expect(fileService).toBeDefined();

      const tempData = "temporary,test,data\n1,2,3\n";

      const tempFile = await fileService.createTempFile("temp-test.csv", tempData);

      expect(tempFile.path).toMatch(/temp-test.*\.csv$/);
      expect(tempFile.cleanup).toBeInstanceOf(Function);

      const tempContent = await fs.readFile(tempFile.path, "utf8");
      expect(tempContent).toBe(tempData);

      // Test cleanup
      await tempFile.cleanup();
      const fileExists = await fs.access(tempFile.path).then(() => true).catch(() => false);
      expect(fileExists).toBe(false);
    });

    test("should validate file integrity before operations", async () => {
      expect(fileService).toBeDefined();

      // Create corrupted CSV file
      const corruptedPath = path.join(testDataDir, "corrupted.csv");
      const corruptedContent = "header1,header2\nincomplete line,\n\"unclosed quote\n";
      await fs.writeFile(corruptedPath, corruptedContent);

      await expect(fileService.validateCsvFile("corrupted.csv"))
        .rejects
        .toThrow(/invalid csv|malformed|integrity check failed/i);

      // Test valid CSV
      const validPath = path.join(testDataDir, "valid.csv");
      const validContent = "name,value\n\"test name\",\"test value\"\n";
      await fs.writeFile(validPath, validContent);

      await expect(fileService.validateCsvFile("valid.csv"))
        .resolves
        .toBe(true);
    });
  });

  describe("Error Handling for Invalid Paths", () => {
    test("should reject operations on non-existent files", async () => {
      expect(fileService).toBeDefined();

      await expect(fileService.readCsvFile("non-existent.csv"))
        .rejects
        .toThrow(/file not found|does not exist/i);

      await expect(fileService.validateCsvFile("missing.csv"))
        .rejects
        .toThrow(/file not found|does not exist/i);
    });

    test("should handle permission errors gracefully", async () => {
      expect(fileService).toBeDefined();

      // Try to access system files (should be blocked by PathValidator)
      await expect(fileService.readCsvFile("/etc/passwd"))
        .rejects
        .toThrow(/access denied|permission denied|outside allowed directories/i);

      await expect(fileService.writeCsvFile("/etc/malicious.csv", { headers: [], rows: [] }))
        .rejects
        .toThrow(/access denied|permission denied|outside allowed directories/i);
    });

    test("should validate input parameters", async () => {
      expect(fileService).toBeDefined();

      // Test null/undefined inputs
      await expect(fileService.readCsvFile(null))
        .rejects
        .toThrow(/invalid filename|filename required/i);

      await expect(fileService.readCsvFile(""))
        .rejects
        .toThrow(/invalid filename|filename required/i);

      await expect(fileService.writeCsvFile("test.csv", null))
        .rejects
        .toThrow(/invalid data|data required/i);

      // Test invalid data format
      await expect(fileService.writeCsvFile("test.csv", { invalid: "format" }))
        .rejects
        .toThrow(/invalid data format|headers and rows required/i);
    });

    test("should handle concurrent file operations safely", async () => {
      expect(fileService).toBeDefined();

      const testPath = path.join(testDataDir, "concurrent.csv");
      const initialContent = "test,data\n1,value1\n";
      await fs.writeFile(testPath, initialContent);

      // Simulate concurrent read operations
      const readPromises = Array.from({ length: 5 }, () =>
        fileService.readCsvFile("concurrent.csv")
      );

      const results = await Promise.all(readPromises);

      results.forEach(result => {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({ test: "1", data: "value1" });
      });

      // Test concurrent write operations (should be serialized)
      const writePromises = Array.from({ length: 3 }, (_, i) =>
        fileService.writeCsvFile(`concurrent-write-${i}.csv`, {
          headers: ["id", "value"],
          rows: [[i.toString(), `value${i}`]]
        })
      );

      await Promise.all(writePromises);

      // Verify all files were created correctly
      for (let i = 0; i < 3; i++) {
        const content = await fs.readFile(
          path.join(testDataDir, `concurrent-write-${i}.csv`),
          "utf8"
        );
        expect(content).toContain(`${i},value${i}`);
      }
    });
  });

  describe("CSV File Handling Specifics", () => {
    test("should parse various CSV formats correctly", async () => {
      expect(fileService).toBeDefined();

      const csvFormats = [
        {
          name: "standard.csv",
          content: "name,age,city\nJohn,25,NYC\nJane,30,LA\n",
          expectedRows: 2
        },
        {
          name: "quoted.csv",
          content: "\"Full Name\",\"Age\",\"City\"\n\"John Doe\",25,\"New York\"\n\"Jane Smith\",30,\"Los Angeles\"\n",
          expectedRows: 2
        },
        {
          name: "escaped.csv",
          content: "name,description\n\"Product A\",\"Has \"\"special\"\" features\"\n",
          expectedRows: 1
        },
        {
          name: "unicode.csv",
          content: "name,emoji\n\"Test\",🚀\n\"Unicode\",\"café\"\n",
          expectedRows: 2
        }
      ];

      for (const format of csvFormats) {
        const filePath = path.join(testDataDir, format.name);
        await fs.writeFile(filePath, format.content, "utf8");

        const result = await fileService.readCsvFile(format.name);
        expect(result.data).toHaveLength(format.expectedRows);
      }
    });

    test("should handle large CSV files efficiently", async () => {
      expect(fileService).toBeDefined();

      // Generate large CSV file
      const rowCount = 10000;
      let csvContent = "id,hostname,ip_address,cve,severity\n";

      for (let i = 1; i <= rowCount; i++) {
        csvContent += `${i},host-${i},192.168.1.${(i % 254) + 1},CVE-2023-${i.toString().padStart(4, "0")},${["Low", "Medium", "High", "Critical"][i % 4]}\n`;
      }

      const largePath = path.join(testDataDir, "large-file.csv");
      await fs.writeFile(largePath, csvContent);

      const startTime = Date.now();
      const result = await fileService.readCsvFile("large-file.csv", {
        streaming: true,
        batchSize: 1000
      });
      const duration = Date.now() - startTime;

      expect(result.data).toHaveLength(rowCount);
      expect(duration).toBeLessThan(5000); // Should process within 5 seconds
    });

    test("should maintain data integrity during CSV operations", async () => {
      expect(fileService).toBeDefined();

      const originalData = {
        headers: ["id", "name", "special_chars", "numbers"],
        rows: [
          ["1", "Test Name", "Special: @#$%^&*()", "123.456"],
          ["2", "Unicode: café 🚀", "Quotes: \"test\"", "-789.123"],
          ["3", "Line\nBreak", "Comma, separated", "0"]
        ]
      };

      await fileService.writeCsvFile("integrity-test.csv", originalData);
      const readData = await fileService.readCsvFile("integrity-test.csv");

      expect(readData.headers).toEqual(originalData.headers);
      expect(readData.data).toHaveLength(originalData.rows.length);

      // Verify data integrity
      readData.data.forEach((row, index) => {
        expect(row.id).toBe(originalData.rows[index][0]);
        expect(row.name).toBe(originalData.rows[index][1]);
        expect(row.special_chars).toBe(originalData.rows[index][2]);
        expect(row.numbers).toBe(originalData.rows[index][3]);
      });
    });
  });

  describe("Integration with Database Operations", () => {
    test("should import CSV data to database securely", async () => {
      expect(fileService).toBeDefined();

      const csvPath = path.join(testDataDir, "import-test.csv");
      const csvContent = "hostname,ip_address,cve,severity\ntest-host-1,192.168.1.100,CVE-2023-0001,High\ntest-host-2,192.168.1.101,CVE-2023-0002,Medium\n";
      await fs.writeFile(csvPath, csvContent);

      const importResult = await fileService.importCsvToDatabase(
        "import-test.csv",
        "vulnerabilities",
        {
          importId: 1,
          validateData: true,
          createBackup: true
        }
      );

      expect(importResult.recordsImported).toBe(2);
      expect(importResult.backupCreated).toBe(true);

      // Verify data in database
      await AssertionHelpers.assertDatabaseRecord(
        dbUtils.db,
        "vulnerabilities",
        { hostname: "test-host-1" },
        { cve: "CVE-2023-0001", severity: "High" }
      );
    });

    test("should export database data to CSV securely", async () => {
      expect(fileService).toBeDefined();

      // Seed database with test data
      await dbUtils.seedDatabase({
        vulnerabilityImports: [{ id: 1, filename: "test.csv", import_date: new Date().toISOString(), row_count: 2 }],
        vulnerabilities: [
          { import_id: 1, hostname: "export-host-1", cve: "CVE-2023-0001", severity: "Critical" },
          { import_id: 1, hostname: "export-host-2", cve: "CVE-2023-0002", severity: "High" }
        ]
      });

      const exportResult = await fileService.exportDatabaseToCsv(
        "vulnerabilities",
        "export-test.csv",
        {
          where: { import_id: 1 },
          columns: ["hostname", "cve", "severity"]
        }
      );

      expect(exportResult.recordsExported).toBe(2);
      expect(exportResult.filename).toBe("export-test.csv");

      const exportedContent = await fs.readFile(
        path.join(testDataDir, "export-test.csv"),
        "utf8"
      );

      expect(exportedContent).toContain("hostname,cve,severity");
      expect(exportedContent).toContain("export-host-1,CVE-2023-0001,Critical");
      expect(exportedContent).toContain("export-host-2,CVE-2023-0002,High");
    });

    test("should handle rollback on failed imports", async () => {
      expect(fileService).toBeDefined();

      // Create CSV with invalid data
      const invalidCsvPath = path.join(testDataDir, "invalid-import.csv");
      const invalidContent = "hostname,ip_address,cve,severity\nvalid-host,192.168.1.100,CVE-2023-0001,High\ninvalid-host,not-an-ip,INVALID-CVE,InvalidSeverity\n";
      await fs.writeFile(invalidCsvPath, invalidContent);

      await expect(fileService.importCsvToDatabase(
        "invalid-import.csv",
        "vulnerabilities",
        {
          importId: 2,
          validateData: true,
          rollbackOnError: true
        }
      )).rejects.toThrow(/validation failed|invalid data/i);

      // Verify no partial data was imported
      const count = await new Promise((resolve, reject) => {
        dbUtils.db.get(
          "SELECT COUNT(*) as count FROM vulnerabilities WHERE import_id = 2",
          (err, row) => {
            if (err) {reject(err);}
            else {resolve(row.count);}
          }
        );
      });

      expect(count).toBe(0);
    });
  });

  describe("Performance and Resource Management", () => {
    test("should cleanup temporary resources automatically", async () => {
      expect(fileService).toBeDefined();

      const tempFiles = [];

      // Create multiple temporary files
      for (let i = 0; i < 5; i++) {
        const tempFile = await fileService.createTempFile(
          `temp-${i}.csv`,
          `test,data\n${i},value${i}\n`
        );
        tempFiles.push(tempFile);
      }

      // Files should exist
      for (const tempFile of tempFiles) {
        const exists = await fs.access(tempFile.path).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      }

      // Trigger cleanup
      await fileService.cleanupTempFiles();

      // Files should be cleaned up
      for (const tempFile of tempFiles) {
        const exists = await fs.access(tempFile.path).then(() => true).catch(() => false);
        expect(exists).toBe(false);
      }
    });

    test("should monitor file operation performance", async () => {
      expect(fileService).toBeDefined();

      const performanceData = await GeneralTestUtils.measurePerformance(async () => {
        // Create moderately sized CSV
        const csvContent = Array.from({ length: 1000 }, (_, i) =>
          `${i},host-${i},192.168.1.${(i % 254) + 1},CVE-2023-${i.toString().padStart(4, "0")},Medium`
        ).join("\n");

        const csvPath = path.join(testDataDir, "performance-test.csv");
        await fs.writeFile(csvPath, `id,hostname,ip_address,cve,severity\n${csvContent}`);

        return await fileService.readCsvFile("performance-test.csv");
      });

      expect(performanceData.result.data).toHaveLength(1000);
      expect(performanceData.duration).toBeLessThan(2000); // Should complete within 2 seconds
    });

    test("should handle memory-efficient streaming operations", async () => {
      expect(fileService).toBeDefined();

      // Create large file that would consume significant memory if loaded entirely
      const largeFilePath = path.join(testDataDir, "streaming-test.csv");
      const writeStream = require("fs").createWriteStream(largeFilePath);

      writeStream.write("id,data,timestamp\n");
      for (let i = 0; i < 50000; i++) {
        writeStream.write(`${i},data-${i},${new Date().toISOString()}\n`);
      }
      writeStream.end();

      await new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

      const processedRows = [];
      await fileService.processCsvStream("streaming-test.csv", (row, index) => {
        processedRows.push({ ...row, index });
        return true; // Continue processing
      }, { batchSize: 1000 });

      expect(processedRows.length).toBe(50000);
      expect(processedRows[0]).toHaveProperty("id", "0");
      expect(processedRows[49999]).toHaveProperty("id", "49999");
    });
  });
});