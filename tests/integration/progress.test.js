/**
 * Progress Tracking Service Integration Tests (T014)
 *
 * TDD Implementation - These tests MUST FAIL initially
 * Tests the future ProgressService for:
 * - CSV import progress tracking
 * - WebSocket progress updates
 * - Multi-stage operation tracking
 * - Progress persistence in database
 * - Concurrent operation handling
 */

const { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } = require("@jest/globals");
const path = require("path");
const fs = require("fs");
const {
  DatabaseTestUtils,
  SocketTestUtils,
  MockFactories,
  AssertionHelpers,
  GeneralTestUtils
} = require("../test-utils");

// Mock the ProgressService that doesn't exist yet
// This will be replaced when the actual service is implemented
const ProgressService = require("../../services/ProgressService"); // WILL FAIL - Service doesn't exist
const WebSocketManager = require("../../services/WebSocketManager"); // WILL FAIL - Service doesn't exist

describe("Progress Tracking Service Integration Tests", () => {
  let dbUtils;
  let socketUtils;
  let progressService;
  let webSocketManager;
  let testDb;
  let testPort;

  beforeAll(async () => {
    // Setup test database
    dbUtils = new DatabaseTestUtils();
    testDb = await dbUtils.createTestDatabase("progress-integration");
    await dbUtils.initializeSchema();

    // Add progress tracking tables schema
    await initializeProgressTrackingSchema(testDb);

    // Setup Socket.io test server
    socketUtils = new SocketTestUtils();
    testPort = await socketUtils.createSocketServer();

    // Initialize services that don't exist yet - WILL FAIL
    webSocketManager = new WebSocketManager(socketUtils.io);
    progressService = new ProgressService(testDb, webSocketManager);
  });

  afterAll(async () => {
    await dbUtils.cleanup();
    await socketUtils.cleanup();
  });

  beforeEach(async () => {
    await dbUtils.beginTransaction();
  });

  afterEach(async () => {
    await dbUtils.rollbackTransaction();
  });

  describe("Progress Persistence and Recovery", () => {
    test("should persist progress state to database", async () => {
      // WILL FAIL - ProgressService doesn't exist
      const operationId = "test-csv-import-001";
      const progressData = {
        operation_type: "csv_import",
        filename: "test-vulnerabilities.csv",
        total_stages: 3,
        current_stage: 1,
        stage_name: "parsing",
        progress_percent: 25,
        rows_processed: 250,
        total_rows: 1000,
        status: "in_progress",
        metadata: {
          file_size: 2048576,
          vendor: "tenable",
          import_started_at: new Date().toISOString()
        }
      };

      await progressService.createProgress(operationId, progressData);

      // Verify persistence in database
      await AssertionHelpers.assertDatabaseRecord(
        testDb,
        "operation_progress",
        { operation_id: operationId },
        {
          operation_type: "csv_import",
          status: "in_progress",
          progress_percent: 25,
          current_stage: 1
        }
      );
    });

    test("should recover progress state after service restart", async () => {
      // WILL FAIL - ProgressService doesn't exist
      const operationId = "test-recovery-001";

      // Create initial progress
      await progressService.createProgress(operationId, {
        operation_type: "multi_stage_import",
        total_stages: 5,
        current_stage: 3,
        progress_percent: 60,
        status: "in_progress"
      });

      // Simulate service restart by creating new instance
      const recoveredService = new ProgressService(testDb, webSocketManager);

      const recoveredProgress = await recoveredService.getProgress(operationId);

      expect(recoveredProgress).toBeDefined();
      expect(recoveredProgress.current_stage).toBe(3);
      expect(recoveredProgress.progress_percent).toBe(60);
      expect(recoveredProgress.status).toBe("in_progress");
    });

    test("should handle progress state corruption gracefully", async () => {
      // WILL FAIL - ProgressService doesn't exist
      const operationId = "test-corruption-001";

      // Create progress with invalid data
      await new Promise((resolve, reject) => {
        testDb.run(
          `INSERT INTO operation_progress
           (operation_id, operation_type, status, progress_percent, metadata)
           VALUES (?, ?, ?, ?, ?)`,
          [operationId, "csv_import", "in_progress", 150, "invalid-json{"],
          (err) => err ? reject(err) : resolve()
        );
      });

      const progress = await progressService.getProgress(operationId);

      expect(progress.status).toBe("error");
      expect(progress.error_message).toContain("corrupted");
    });
  });

  describe("WebSocket Event Emissions", () => {
    test("should emit progress events via WebSocket", async () => {
      // WILL FAIL - Services don't exist
      const client = await socketUtils.createClient();
      const operationId = "test-websocket-001";

      // Listen for progress events
      const progressEvents = [];
      client.on("progress:update", (data) => {
        progressEvents.push(data);
      });

      // Create and update progress
      await progressService.createProgress(operationId, {
        operation_type: "csv_import",
        filename: "test.csv",
        total_stages: 3,
        current_stage: 1,
        progress_percent: 0
      });

      await progressService.updateProgress(operationId, {
        current_stage: 2,
        progress_percent: 50,
        rows_processed: 500,
        total_rows: 1000
      });

      // Wait for WebSocket events
      await GeneralTestUtils.sleep(100);

      expect(progressEvents).toHaveLength(2);
      expect(progressEvents[0]).toMatchObject({
        operation_id: operationId,
        operation_type: "csv_import",
        progress_percent: 0
      });
      expect(progressEvents[1]).toMatchObject({
        operation_id: operationId,
        progress_percent: 50,
        current_stage: 2
      });
    });

    test("should emit stage completion events", async () => {
      // WILL FAIL - Services don't exist
      const client = await socketUtils.createClient();
      const operationId = "test-stage-completion-001";

      const stageEvents = [];
      client.on("progress:stage_complete", (data) => {
        stageEvents.push(data);
      });

      await progressService.createProgress(operationId, {
        operation_type: "vulnerability_analysis",
        total_stages: 4,
        current_stage: 1
      });

      // Complete stage 1
      await progressService.completeStage(operationId, 1, {
        stage_name: "data_parsing",
        duration_ms: 1500,
        records_processed: 250
      });

      await GeneralTestUtils.sleep(100);

      expect(stageEvents).toHaveLength(1);
      expect(stageEvents[0]).toMatchObject({
        operation_id: operationId,
        stage_completed: 1,
        stage_name: "data_parsing",
        duration_ms: expect.any(Number)
      });
    });

    test("should emit error events for failed operations", async () => {
      // WILL FAIL - Services don't exist
      const client = await socketUtils.createClient();
      const operationId = "test-error-001";

      const errorEvents = [];
      client.on("progress:error", (data) => {
        errorEvents.push(data);
      });

      await progressService.createProgress(operationId, {
        operation_type: "csv_import",
        filename: "corrupted.csv"
      });

      // Simulate error
      await progressService.setError(operationId, {
        error_type: "file_corruption",
        error_message: "CSV file contains invalid data",
        error_details: {
          line_number: 42,
          invalid_column: "severity"
        }
      });

      await GeneralTestUtils.sleep(100);

      expect(errorEvents).toHaveLength(1);
      expect(errorEvents[0]).toMatchObject({
        operation_id: operationId,
        error_type: "file_corruption",
        error_message: "CSV file contains invalid data"
      });
    });

    test("should emit completion events with summary", async () => {
      // WILL FAIL - Services don't exist
      const client = await socketUtils.createClient();
      const operationId = "test-completion-001";

      const completionEvents = [];
      client.on("progress:complete", (data) => {
        completionEvents.push(data);
      });

      await progressService.createProgress(operationId, {
        operation_type: "csv_import",
        total_stages: 2,
        total_rows: 1000
      });

      await progressService.completeOperation(operationId, {
        total_duration_ms: 45000,
        rows_processed: 1000,
        rows_imported: 950,
        rows_skipped: 50,
        summary: {
          vulnerabilities_added: 850,
          duplicates_found: 100,
          validation_errors: 50
        }
      });

      await GeneralTestUtils.sleep(100);

      expect(completionEvents).toHaveLength(1);
      expect(completionEvents[0]).toMatchObject({
        operation_id: operationId,
        status: "completed",
        total_duration_ms: 45000,
        summary: expect.objectContaining({
          vulnerabilities_added: 850
        })
      });
    });
  });

  describe("Multi-Stage Operation Tracking", () => {
    test("should track multi-stage CSV import process", async () => {
      // WILL FAIL - ProgressService doesn't exist
      const operationId = "test-multistage-001";
      const stages = [
        { name: "file_validation", description: "Validating CSV file format" },
        { name: "data_parsing", description: "Parsing CSV data" },
        { name: "data_validation", description: "Validating vulnerability data" },
        { name: "database_import", description: "Importing to database" },
        { name: "index_rebuild", description: "Rebuilding search indexes" }
      ];

      // Initialize multi-stage operation
      await progressService.createProgress(operationId, {
        operation_type: "csv_import",
        filename: "large-scan.csv",
        total_stages: stages.length,
        stages: stages,
        current_stage: 0,
        progress_percent: 0
      });

      // Progress through each stage
      for (let i = 0; i < stages.length; i++) {
        await progressService.startStage(operationId, i + 1, stages[i].name);

        // Simulate stage progress
        for (let progress = 25; progress <= 100; progress += 25) {
          await progressService.updateStageProgress(operationId, i + 1, progress);
          await GeneralTestUtils.sleep(10);
        }

        await progressService.completeStage(operationId, i + 1, {
          records_processed: 200 * (i + 1)
        });
      }

      const finalProgress = await progressService.getProgress(operationId);

      expect(finalProgress.status).toBe("completed");
      expect(finalProgress.current_stage).toBe(stages.length);
      expect(finalProgress.progress_percent).toBe(100);
    });

    test("should handle stage failures and recovery", async () => {
      // WILL FAIL - ProgressService doesn't exist
      const operationId = "test-stage-failure-001";

      await progressService.createProgress(operationId, {
        operation_type: "vulnerability_analysis",
        total_stages: 3,
        current_stage: 0
      });

      // Stage 1 succeeds
      await progressService.startStage(operationId, 1, "data_collection");
      await progressService.completeStage(operationId, 1);

      // Stage 2 fails
      await progressService.startStage(operationId, 2, "data_processing");
      await progressService.setStageError(operationId, 2, {
        error_message: "Memory exhausted during processing",
        retry_possible: true
      });

      // Retry stage 2
      await progressService.retryStage(operationId, 2);
      await progressService.completeStage(operationId, 2);

      // Stage 3 succeeds
      await progressService.startStage(operationId, 3, "data_export");
      await progressService.completeStage(operationId, 3);

      const progress = await progressService.getProgress(operationId);

      expect(progress.status).toBe("completed");
      expect(progress.retry_count).toBe(1);
      expect(progress.failed_stages).toContain(2);
    });

    test("should calculate accurate progress across stages", async () => {
      // WILL FAIL - ProgressService doesn't exist
      const operationId = "test-progress-calc-001";

      await progressService.createProgress(operationId, {
        operation_type: "csv_import",
        total_stages: 4,
        stage_weights: [10, 30, 40, 20] // Different weights per stage
      });

      // Complete stage 1 (10% of total)
      await progressService.startStage(operationId, 1, "validation");
      await progressService.completeStage(operationId, 1);

      let progress = await progressService.getProgress(operationId);
      expect(progress.progress_percent).toBe(10);

      // 50% through stage 2 (10% + 15% = 25% total)
      await progressService.startStage(operationId, 2, "parsing");
      await progressService.updateStageProgress(operationId, 2, 50);

      progress = await progressService.getProgress(operationId);
      expect(progress.progress_percent).toBe(25);

      // Complete stage 2 (10% + 30% = 40% total)
      await progressService.completeStage(operationId, 2);

      progress = await progressService.getProgress(operationId);
      expect(progress.progress_percent).toBe(40);
    });
  });

  describe("Concurrent Operation Handling", () => {
    test("should handle multiple concurrent import operations", async () => {
      // WILL FAIL - ProgressService doesn't exist
      const operationIds = [
        "concurrent-001",
        "concurrent-002",
        "concurrent-003"
      ];

      // Start multiple operations concurrently
      const createPromises = operationIds.map(id =>
        progressService.createProgress(id, {
          operation_type: "csv_import",
          filename: `file-${id}.csv`,
          total_stages: 2
        })
      );

      await Promise.all(createPromises);

      // Update all operations simultaneously
      const updatePromises = operationIds.map((id, index) =>
        progressService.updateProgress(id, {
          current_stage: 1,
          progress_percent: (index + 1) * 20,
          rows_processed: (index + 1) * 100
        })
      );

      await Promise.all(updatePromises);

      // Verify all operations updated correctly
      for (let i = 0; i < operationIds.length; i++) {
        const progress = await progressService.getProgress(operationIds[i]);
        expect(progress.progress_percent).toBe((i + 1) * 20);
        expect(progress.rows_processed).toBe((i + 1) * 100);
      }
    });

    test("should prevent operation ID conflicts", async () => {
      // WILL FAIL - ProgressService doesn't exist
      const operationId = "conflict-test-001";

      await progressService.createProgress(operationId, {
        operation_type: "csv_import",
        filename: "first.csv"
      });

      // Attempt to create another operation with same ID
      await expect(progressService.createProgress(operationId, {
        operation_type: "csv_import",
        filename: "second.csv"
      })).rejects.toThrow("Operation ID already exists");
    });

    test("should limit concurrent operations per user", async () => {
      // WILL FAIL - ProgressService doesn't exist
      const userId = "test-user-001";
      const maxConcurrent = 3;

      // Set user concurrency limit
      await progressService.setUserConcurrencyLimit(userId, maxConcurrent);

      // Create maximum allowed operations
      for (let i = 0; i < maxConcurrent; i++) {
        await progressService.createProgress(`user-op-${i}`, {
          operation_type: "csv_import",
          user_id: userId,
          filename: `file-${i}.csv`
        });
      }

      // Attempt to exceed limit
      await expect(progressService.createProgress("user-op-exceeded", {
        operation_type: "csv_import",
        user_id: userId,
        filename: "excess-file.csv"
      })).rejects.toThrow("User concurrency limit exceeded");
    });

    test("should handle operation cleanup after completion", async () => {
      // WILL FAIL - ProgressService doesn't exist
      const operationId = "cleanup-test-001";

      await progressService.createProgress(operationId, {
        operation_type: "csv_import",
        filename: "cleanup-test.csv",
        auto_cleanup_hours: 1
      });

      await progressService.completeOperation(operationId, {
        total_duration_ms: 30000
      });

      // Verify operation is marked for cleanup
      const progress = await progressService.getProgress(operationId);
      expect(progress.status).toBe("completed");
      expect(progress.cleanup_scheduled).toBeDefined();

      // Manually trigger cleanup
      await progressService.cleanupCompletedOperations();

      // Operation should be archived, not deleted
      const archivedProgress = await progressService.getArchivedProgress(operationId);
      expect(archivedProgress).toBeDefined();
      expect(archivedProgress.archived_at).toBeDefined();
    });
  });

  describe("CSV Import Progress Integration", () => {
    test("should track real CSV file processing", async () => {
      // WILL FAIL - Services don't exist
      const testCsvPath = path.join(__dirname, "../fixtures/test-vulnerabilities.csv");
      await createTestCsvFile(testCsvPath);

      const operationId = "csv-real-001";
      const client = await socketUtils.createClient();

      const progressUpdates = [];
      client.on("progress:update", (data) => {
        progressUpdates.push(data);
      });

      // Start CSV import with progress tracking
      const importResult = await progressService.importCsvWithProgress(
        operationId,
        testCsvPath,
        {
          vendor: "tenable",
          chunk_size: 100,
          validate_data: true
        }
      );

      await GeneralTestUtils.sleep(200);

      expect(importResult.status).toBe("completed");
      expect(progressUpdates.length).toBeGreaterThan(0);

      // Verify final progress state
      const finalProgress = progressUpdates[progressUpdates.length - 1];
      expect(finalProgress.progress_percent).toBe(100);
      expect(finalProgress.status).toBe("completed");

      // Cleanup test file
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    });

    test("should handle CSV parsing errors gracefully", async () => {
      // WILL FAIL - Services don't exist
      const corruptedCsvPath = path.join(__dirname, "../fixtures/corrupted.csv");
      await createCorruptedCsvFile(corruptedCsvPath);

      const operationId = "csv-error-001";
      const client = await socketUtils.createClient();

      const errorEvents = [];
      client.on("progress:error", (data) => {
        errorEvents.push(data);
      });

      await progressService.importCsvWithProgress(operationId, corruptedCsvPath);

      await GeneralTestUtils.sleep(100);

      expect(errorEvents).toHaveLength(1);
      expect(errorEvents[0].error_type).toContain("parsing");

      const progress = await progressService.getProgress(operationId);
      expect(progress.status).toBe("error");

      // Cleanup test file
      if (fs.existsSync(corruptedCsvPath)) {
        fs.unlinkSync(corruptedCsvPath);
      }
    });
  });

  describe("Performance and Stress Testing", () => {
    test("should handle high-frequency progress updates", async () => {
      // WILL FAIL - ProgressService doesn't exist
      const operationId = "performance-001";
      const updateCount = 1000;

      await progressService.createProgress(operationId, {
        operation_type: "stress_test",
        total_rows: updateCount
      });

      const startTime = performance.now();

      // Send rapid progress updates
      for (let i = 0; i < updateCount; i++) {
        await progressService.updateProgress(operationId, {
          rows_processed: i + 1,
          progress_percent: Math.floor((i + 1) / updateCount * 100)
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle 1000 updates in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);

      const finalProgress = await progressService.getProgress(operationId);
      expect(finalProgress.rows_processed).toBe(updateCount);
      expect(finalProgress.progress_percent).toBe(100);
    });

    test("should maintain WebSocket connection under load", async () => {
      // WILL FAIL - Services don't exist
      const clients = [];
      const operationId = "websocket-load-001";

      // Create multiple clients
      for (let i = 0; i < 10; i++) {
        const client = await socketUtils.createClient();
        clients.push(client);
      }

      let totalEventsReceived = 0;
      clients.forEach(client => {
        client.on("progress:update", () => {
          totalEventsReceived++;
        });
      });

      await progressService.createProgress(operationId, {
        operation_type: "load_test"
      });

      // Send 50 updates
      for (let i = 0; i < 50; i++) {
        await progressService.updateProgress(operationId, {
          progress_percent: i * 2
        });
        await GeneralTestUtils.sleep(10);
      }

      await GeneralTestUtils.sleep(200);

      // Each client should receive all 50 updates
      expect(totalEventsReceived).toBe(10 * 50);

      // Cleanup clients
      clients.forEach(client => client.disconnect());
    });
  });
});

// Helper functions for test setup

/**
 * Initialize progress tracking database schema
 * @param {sqlite3.Database} db - Database instance
 */
async function initializeProgressTrackingSchema(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Operation progress table
      db.run(`CREATE TABLE IF NOT EXISTS operation_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation_id TEXT UNIQUE NOT NULL,
        operation_type TEXT NOT NULL,
        filename TEXT,
        user_id TEXT,
        status TEXT DEFAULT 'pending',
        total_stages INTEGER DEFAULT 1,
        current_stage INTEGER DEFAULT 0,
        stage_name TEXT,
        progress_percent INTEGER DEFAULT 0,
        rows_processed INTEGER DEFAULT 0,
        total_rows INTEGER,
        error_message TEXT,
        error_details TEXT,
        retry_count INTEGER DEFAULT 0,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        cleanup_scheduled DATETIME
      )`);

      // Stage progress table for detailed tracking
      db.run(`CREATE TABLE IF NOT EXISTS stage_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation_id TEXT NOT NULL,
        stage_number INTEGER NOT NULL,
        stage_name TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        progress_percent INTEGER DEFAULT 0,
        records_processed INTEGER DEFAULT 0,
        started_at DATETIME,
        completed_at DATETIME,
        duration_ms INTEGER,
        error_message TEXT,
        FOREIGN KEY (operation_id) REFERENCES operation_progress (operation_id)
      )`);

      // Archived operations for cleanup
      db.run(`CREATE TABLE IF NOT EXISTS archived_operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation_id TEXT NOT NULL,
        original_data TEXT NOT NULL,
        archived_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {reject(err);}
        else {resolve();}
      });

      // Create indexes
      db.run("CREATE INDEX IF NOT EXISTS idx_operation_progress_id ON operation_progress (operation_id)");
      db.run("CREATE INDEX IF NOT EXISTS idx_operation_progress_status ON operation_progress (status)");
      db.run("CREATE INDEX IF NOT EXISTS idx_operation_progress_user ON operation_progress (user_id)");
      db.run("CREATE INDEX IF NOT EXISTS idx_stage_progress_operation ON stage_progress (operation_id)");
    });
  });
}

/**
 * Create test CSV file for integration testing
 * @param {string} filePath - Path to create file
 */
async function createTestCsvFile(filePath) {
  const csvContent = `Hostname,IP Address,CVE,Severity,CVSS Score,Plugin ID,Plugin Name
test-host-001,192.168.1.100,CVE-2023-0001,High,7.5,12345,Test Plugin 1
test-host-002,192.168.1.101,CVE-2023-0002,Medium,5.2,12346,Test Plugin 2
test-host-003,192.168.1.102,CVE-2023-0003,Critical,9.1,12347,Test Plugin 3
test-host-004,192.168.1.103,CVE-2023-0004,Low,3.1,12348,Test Plugin 4
test-host-005,192.168.1.104,CVE-2023-0005,High,8.2,12349,Test Plugin 5`;

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, csvContent, (err) => {
      if (err) {reject(err);}
      else {resolve();}
    });
  });
}

/**
 * Create corrupted CSV file for error testing
 * @param {string} filePath - Path to create file
 */
async function createCorruptedCsvFile(filePath) {
  const corruptedContent = `Hostname,IP Address,CVE,Severity,CVSS Score
test-host-001,192.168.1.100,CVE-2023-0001,High,7.5
test-host-002,192.168.1.101,"CVE-2023-0002",Medium,invalid-score
test-host-003,192.168.1.102,CVE-2023-0003,Unknown-Severity,9.1
corrupted line without proper structure
test-host-005,,CVE-2023-0005,High,`;

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, corruptedContent, (err) => {
      if (err) {reject(err);}
      else {resolve();}
    });
  });
}