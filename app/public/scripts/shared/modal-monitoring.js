/**
 * @fileoverview Production Modal Monitoring Instrumentation
 * T048: Error tracking and performance monitoring for modal operations
 *
 * @version 1.0.0
 * @date 2025-09-10
 * @spec 004-cve-link-system-fix
 * @task T048 - Error tracking and performance monitoring instrumentation
 * @author HexTrackr Team
 */

/* global generateSecureId */
/* exported ModalMonitor, ModalMonitorIntegration */

(function(global) {
    "use strict";

    /**
     * Modal Monitoring and Instrumentation System
     * Provides comprehensive monitoring for modal operations
     */
    class ModalMonitor {
        constructor(options = {}) {
            this.config = {
                enablePerformanceTracking: options.enablePerformanceTracking !== false,
                enableErrorTracking: options.enableErrorTracking !== false,
                enableMemoryMonitoring: options.enableMemoryMonitoring !== false,
                performanceThreshold: options.performanceThreshold || 500,
                memoryThreshold: options.memoryThreshold || 10 * 1024 * 1024, // 10MB
                reportInterval: options.reportInterval || 60000, // 1 minute
                maxLogEntries: options.maxLogEntries || 1000,
                enableDebugLogging: options.enableDebugLogging || false
            };

            // Performance metrics storage
            this.metrics = {
                modalOpenTimes: [],
                modalCloseTimes: [],
                memorySnapshots: [],
                errorLog: [],
                operationCounts: {
                    modalOpens: 0,
                    modalCloses: 0,
                    errors: 0,
                    memoryLeaks: 0
                },
                sessionStart: performance.now(),
                lastReport: performance.now()
            };

            // Active monitoring state
            this.monitoring = {
                activeOperations: new Map(),
                memoryBaseline: 0,
                isMonitoring: false
            };

            this.init();
        }

        /**
         * Initialize monitoring system
         */
        init() {
            if (this.config.enableMemoryMonitoring) {
                this.startMemoryMonitoring();
            }

            if (this.config.enablePerformanceTracking) {
                this.instrumentPerformanceAPIs();
            }

            if (this.config.enableErrorTracking) {
                this.setupErrorTracking();
            }

            // Start periodic reporting
            this.startPeriodicReporting();
            
            this.monitoring.isMonitoring = true;
            
            if (this.config.enableDebugLogging) {
                logger.debug("ui", "Modal Monitor initialized with configuration:", this.config);
            }
        }

        /**
         * Start memory monitoring
         */
        startMemoryMonitoring() {
            if (!performance.memory) {
                logger.warn("ui", "Performance.memory not available - memory monitoring disabled");
                return;
            }

            this.monitoring.memoryBaseline = performance.memory.usedJSHeapSize;
            
            // Monitor memory every 5 seconds
            setInterval(() => {
                this.recordMemorySnapshot();
            }, 5000);

            if (this.config.enableDebugLogging) {
                logger.debug("ui", "🧠 Memory monitoring started, baseline:", this.formatBytes(this.monitoring.memoryBaseline));
            }
        }

        /**
         * Record memory snapshot
         */
        recordMemorySnapshot() {
            if (!performance.memory) {return;}

            const snapshot = {
                timestamp: performance.now(),
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                growth: performance.memory.usedJSHeapSize - this.monitoring.memoryBaseline
            };

            this.metrics.memorySnapshots.push(snapshot);

            // Keep only recent snapshots
            if (this.metrics.memorySnapshots.length > 100) {
                this.metrics.memorySnapshots.shift();
            }

            // Check for memory leaks
            if (snapshot.growth > this.config.memoryThreshold) {
                this.reportMemoryLeak(snapshot);
            }
        }

        /**
         * Report memory leak detection
         */
        reportMemoryLeak(snapshot) {
            this.metrics.operationCounts.memoryLeaks++;
            
            const error = {
                type: "MEMORY_LEAK",
                timestamp: new Date().toISOString(),
                severity: "HIGH",
                details: {
                    memoryGrowth: snapshot.growth,
                    currentUsage: snapshot.used,
                    threshold: this.config.memoryThreshold,
                    duration: snapshot.timestamp - this.metrics.sessionStart
                }
            };

            this.logError(error);
            
            if (this.config.enableDebugLogging) {
                logger.warn("ui", "🚨 Memory leak detected:", error.details);
            }

            // Trigger memory leak event
            this.dispatchEvent("modalMemoryLeak", error);
        }

        /**
         * Instrument performance APIs for modal operations
         */
        instrumentPerformanceAPIs() {
            // Create performance mark wrapper
            this.createPerformanceMark = (name, data) => {
                if (performance.mark) {
                    performance.mark(name);
                }
                return {
                    name: name,
                    startTime: performance.now(),
                    data: data || {}
                };
            };

            // Create performance measure wrapper
            this.createPerformanceMeasure = (name, startMark) => {
                const endTime = performance.now();
                const duration = endTime - startMark.startTime;

                if (performance.measure && performance.mark) {
                    try {
                        performance.measure(name, startMark.name);
                    } catch (_e) {
                        // Ignore if marks don't exist
                    }
                }

                return {
                    name: name,
                    duration: duration,
                    startTime: startMark.startTime,
                    endTime: endTime,
                    data: startMark.data
                };
            };

            if (this.config.enableDebugLogging) {
                logger.debug("ui", "Performance instrumentation enabled");
            }
        }

        /**
         * Setup error tracking
         */
        setupErrorTracking() {
            // Global error handler
            const originalWindowError = window.onerror;
            window.onerror = (message, source, lineno, colno, error) => {
                if (source && (source.includes("modal") || source.includes("vulnerability"))) {
                    this.logError({
                        type: "JAVASCRIPT_ERROR",
                        timestamp: new Date().toISOString(),
                        severity: "HIGH",
                        message: message,
                        source: source,
                        line: lineno,
                        column: colno,
                        stack: error ? error.stack : null
                    });
                }

                if (originalWindowError) {
                    return originalWindowError.call(window, message, source, lineno, colno, error);
                }
                return false;
            };

            // Promise rejection handler
            const originalUnhandledRejection = window.onunhandledrejection;
            window.onunhandledrejection = (event) => {
                if (event.reason && event.reason.toString().includes("modal")) {
                    this.logError({
                        type: "PROMISE_REJECTION",
                        timestamp: new Date().toISOString(),
                        severity: "MEDIUM",
                        reason: event.reason.toString(),
                        stack: event.reason.stack || null
                    });
                }

                if (originalUnhandledRejection) {
                    return originalUnhandledRejection.call(window, event);
                }
            };

            if (this.config.enableDebugLogging) {
                logger.debug("ui", "Error tracking enabled");
            }
        }

        /**
         * Track modal operation start
         */
        trackModalOperationStart(operationId, operationType, data = {}) {
            const mark = this.createPerformanceMark(`modal-${operationType}-${operationId}`, {
                operationType: operationType,
                operationId: operationId,
                ...data
            });

            this.monitoring.activeOperations.set(operationId, {
                type: operationType,
                startTime: mark.startTime,
                startMark: mark,
                data: data
            });

            if (this.config.enableDebugLogging) {
                logger.debug("ui", ` Tracking ${operationType} operation: ${operationId}`);
            }

            return operationId;
        }

        /**
         * Track modal operation end
         */
        trackModalOperationEnd(operationId, success = true, errorInfo = null) {
            const operation = this.monitoring.activeOperations.get(operationId);
            if (!operation) {
                logger.warn("ui", "Trying to end unknown operation:", operationId);
                return null;
            }

            const measure = this.createPerformanceMeasure(
                `modal-${operation.type}-complete`,
                operation.startMark
            );

            const result = {
                operationId: operationId,
                type: operation.type,
                duration: measure.duration,
                success: success,
                timestamp: new Date().toISOString(),
                data: operation.data,
                error: errorInfo
            };

            // Store metrics based on operation type
            if (operation.type === "open") {
                this.metrics.modalOpenTimes.push(result);
                this.metrics.operationCounts.modalOpens++;
            } else if (operation.type === "close") {
                this.metrics.modalCloseTimes.push(result);
                this.metrics.operationCounts.modalCloses++;
            }

            // Check performance threshold
            if (measure.duration > this.config.performanceThreshold) {
                this.reportPerformanceIssue(result);
            }

            // Log error if operation failed
            if (!success && errorInfo) {
                this.logError({
                    type: "MODAL_OPERATION_ERROR",
                    timestamp: result.timestamp,
                    severity: "MEDIUM",
                    operationType: operation.type,
                    operationId: operationId,
                    duration: measure.duration,
                    error: errorInfo
                });
            }

            // Clean up active operation
            this.monitoring.activeOperations.delete(operationId);

            // Trim metrics arrays to prevent memory bloat
            this.trimMetricsArrays();

            if (this.config.enableDebugLogging) {
                logger.debug("ui", ` Operation ${operationId} completed in ${measure.duration.toFixed(2)}ms`);
            }

            return result;
        }

        /**
         * Report performance issue
         */
        reportPerformanceIssue(result) {
            const error = {
                type: "PERFORMANCE_ISSUE",
                timestamp: result.timestamp,
                severity: result.duration > this.config.performanceThreshold * 2 ? "HIGH" : "MEDIUM",
                details: {
                    operationType: result.type,
                    duration: result.duration,
                    threshold: this.config.performanceThreshold,
                    operationData: result.data
                }
            };

            this.logError(error);

            if (this.config.enableDebugLogging) {
                logger.warn("ui", "🐌 Performance issue detected:", error.details);
            }

            // Trigger performance issue event
            this.dispatchEvent("modalPerformanceIssue", error);
        }

        /**
         * Log error to error tracking system
         */
        logError(error) {
            this.metrics.errorLog.push(error);
            this.metrics.operationCounts.errors++;

            // Keep only recent errors
            if (this.metrics.errorLog.length > this.config.maxLogEntries) {
                this.metrics.errorLog.shift();
            }

            // Trigger error event
            this.dispatchEvent("modalError", error);
        }

        /**
         * Trim metrics arrays to prevent memory issues
         */
        trimMetricsArrays() {
            const maxEntries = 500;

            if (this.metrics.modalOpenTimes.length > maxEntries) {
                this.metrics.modalOpenTimes.splice(0, this.metrics.modalOpenTimes.length - maxEntries);
            }

            if (this.metrics.modalCloseTimes.length > maxEntries) {
                this.metrics.modalCloseTimes.splice(0, this.metrics.modalCloseTimes.length - maxEntries);
            }
        }

        /**
         * Start periodic reporting
         */
        startPeriodicReporting() {
            setInterval(() => {
                this.generatePerformanceReport();
            }, this.config.reportInterval);

            if (this.config.enableDebugLogging) {
                logger.debug("ui", ` Periodic reporting started (${this.config.reportInterval}ms interval)`);
            }
        }

        /**
         * Generate performance report
         */
        generatePerformanceReport() {
            const now = performance.now();
            const timeSinceLastReport = now - this.metrics.lastReport;

            const report = {
                timestamp: new Date().toISOString(),
                period: timeSinceLastReport,
                sessionDuration: now - this.metrics.sessionStart,
                operations: { ...this.metrics.operationCounts },
                performance: this.calculatePerformanceStats(),
                memory: this.calculateMemoryStats(),
                errors: this.getRecentErrors(),
                health: this.calculateHealthScore()
            };

            this.metrics.lastReport = now;

            // Trigger report event
            this.dispatchEvent("modalPerformanceReport", report);

            if (this.config.enableDebugLogging) {
                logger.debug("ui", "Performance report generated:", report);
            }

            return report;
        }

        /**
         * Calculate performance statistics
         */
        calculatePerformanceStats() {
            const recentOpenTimes = this.metrics.modalOpenTimes
                .filter(op => op.success)
                .map(op => op.duration);

            const recentCloseTimes = this.metrics.modalCloseTimes
                .filter(op => op.success)
                .map(op => op.duration);

            return {
                modalOpen: this.calculateStats(recentOpenTimes),
                modalClose: this.calculateStats(recentCloseTimes),
                threshold: this.config.performanceThreshold,
                violationCount: [...recentOpenTimes, ...recentCloseTimes]
                    .filter(time => time > this.config.performanceThreshold).length
            };
        }

        /**
         * Calculate memory statistics
         */
        calculateMemoryStats() {
            if (this.metrics.memorySnapshots.length === 0) {
                return { available: false };
            }

            const recent = this.metrics.memorySnapshots.slice(-20); // Last 20 snapshots
            const growth = recent.map(s => s.growth);
            const usage = recent.map(s => s.used);

            return {
                available: true,
                baseline: this.monitoring.memoryBaseline,
                current: recent[recent.length - 1]?.used || 0,
                growth: this.calculateStats(growth),
                usage: this.calculateStats(usage),
                threshold: this.config.memoryThreshold,
                leakCount: this.metrics.operationCounts.memoryLeaks
            };
        }

        /**
         * Calculate basic statistics for array
         */
        calculateStats(arr) {
            if (arr.length === 0) {
                return { count: 0, average: 0, min: 0, max: 0, p95: 0, p99: 0 };
            }

            const sorted = arr.slice().sort((a, b) => a - b);
            const sum = arr.reduce((a, b) => a + b, 0);

            return {
                count: arr.length,
                average: sum / arr.length,
                min: sorted[0],
                max: sorted[sorted.length - 1],
                p95: sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1],
                p99: sorted[Math.floor(sorted.length * 0.99)] || sorted[sorted.length - 1]
            };
        }

        /**
         * Get recent errors
         */
        getRecentErrors() {
            const recentThreshold = Date.now() - this.config.reportInterval;
            return this.metrics.errorLog.filter(error => {
                const errorTime = new Date(error.timestamp).getTime();
                return errorTime > recentThreshold;
            });
        }

        /**
         * Calculate overall health score (0-100)
         */
        calculateHealthScore() {
            let score = 100;

            // Performance score (40% weight)
            const performanceStats = this.calculatePerformanceStats();
            if (performanceStats.modalOpen.average > this.config.performanceThreshold) {
                score -= 20;
            }
            if (performanceStats.violationCount > 0) {
                score -= Math.min(20, performanceStats.violationCount * 2);
            }

            // Memory score (30% weight)
            const memoryStats = this.calculateMemoryStats();
            if (memoryStats.available && memoryStats.growth.average > this.config.memoryThreshold * 0.5) {
                score -= 15;
            }
            if (memoryStats.leakCount > 0) {
                score -= Math.min(15, memoryStats.leakCount * 5);
            }

            // Error score (30% weight)
            const recentErrors = this.getRecentErrors();
            if (recentErrors.length > 0) {
                score -= Math.min(30, recentErrors.length * 3);
            }

            return Math.max(0, Math.min(100, score));
        }

        /**
         * Get current monitoring status
         */
        getStatus() {
            return {
                isMonitoring: this.monitoring.isMonitoring,
                activeOperations: this.monitoring.activeOperations.size,
                totalOperations: this.metrics.operationCounts.modalOpens + this.metrics.operationCounts.modalCloses,
                totalErrors: this.metrics.operationCounts.errors,
                sessionDuration: performance.now() - this.metrics.sessionStart,
                memoryBaseline: this.monitoring.memoryBaseline,
                config: this.config
            };
        }

        /**
         * Get all metrics data
         */
        getMetrics() {
            return {
                ...this.metrics,
                currentReport: this.generatePerformanceReport()
            };
        }

        /**
         * Dispatch custom event
         */
        dispatchEvent(eventName, detail) {
            if (typeof CustomEvent !== "undefined") {
                const event = new CustomEvent(eventName, { detail });
                window.dispatchEvent(event);
            }
        }

        /**
         * Format bytes for human reading
         */
        formatBytes(bytes) {
            if (bytes === 0) {return "0 B";}
            const k = 1024;
            const sizes = ["B", "KB", "MB", "GB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
        }

        /**
         * Clean up monitoring
         */
        destroy() {
            this.monitoring.isMonitoring = false;
            this.monitoring.activeOperations.clear();
            
            if (this.config.enableDebugLogging) {
                logger.debug("ui", "Modal Monitor destroyed");
            }
        }
    }

    /**
     * Modal Monitor Integration Helper
     * Provides easy integration with existing modal system
     */
    class ModalMonitorIntegration {
        constructor(modalInstance, monitorOptions = {}) {
            this.modal = modalInstance;
            this.monitor = new ModalMonitor(monitorOptions);
            
            this.setupIntegration();
        }

        setupIntegration() {
            if (!this.modal) {
                logger.warn("ui", "No modal instance provided for monitoring integration");
                return;
            }

            // Wrap modal methods
            this.wrapModalMethod("showVulnerabilityDetailsByCVE", "open");
            this.wrapModalMethod("showModal", "open");
            this.wrapModalMethod("clearModalStateData", "cleanup");

            logger.debug("ui", "Modal monitoring integration setup complete");
        }

        wrapModalMethod(methodName, operationType) {
            const originalMethod = this.modal[methodName];
            if (!originalMethod) {
                logger.warn("ui", `Method ${methodName} not found on modal instance`);
                return;
            }

            this.modal[methodName] = (...args) => {
                // Generate secure operation ID using shared utility
                const operationId = generateSecureId(operationType, 1);

                // Track operation start
                this.monitor.trackModalOperationStart(operationId, operationType, {
                    method: methodName,
                    args: args.length
                });

                try {
                    const result = originalMethod.apply(this.modal, args);
                    
                    // Handle promise result
                    if (result && typeof result.then === "function") {
                        return result
                            .then(value => {
                                this.monitor.trackModalOperationEnd(operationId, true);
                                return value;
                            })
                            .catch(error => {
                                this.monitor.trackModalOperationEnd(operationId, false, error.message);
                                throw error;
                            });
                    } else {
                        // Synchronous operation
                        this.monitor.trackModalOperationEnd(operationId, true);
                        return result;
                    }
                } catch (error) {
                    this.monitor.trackModalOperationEnd(operationId, false, error.message);
                    throw error;
                }
            };
        }

        getMonitor() {
            return this.monitor;
        }
    }

    // Export to global scope
    global.ModalMonitor = ModalMonitor;
    global.ModalMonitorIntegration = ModalMonitorIntegration;

    // Auto-initialize if window.modalMonitorConfig exists
    if (global.modalMonitorConfig) {
        global.modalMonitor = new ModalMonitor(global.modalMonitorConfig);
        logger.debug("ui", "Modal Monitor auto-initialized from global config");
    }

    logger.debug("ui", "Modal Monitoring system loaded and ready!");

})(window);