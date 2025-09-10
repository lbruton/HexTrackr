/**
 * @fileoverview Performance Benchmarking for Multi-CVE Data Loads
 * Tests HexTrackr's performance with realistic multi-CVE scenarios
 * 
 * @version 1.0.0
 * @date 2025-09-10
 * @spec 004-cve-link-system-fix
 * @task T044 - Performance benchmarking with realistic multi-CVE data loads
 * @author Curly (with creative performance testing!)
 */

/* global console, performance, document, window, CVEUtilities */

(function(global) {
    "use strict";

    /**
     * Performance Benchmark Suite for CVE Handling
     */
    class CVEPerformanceBenchmark {
        constructor() {
            this.results = [];
            this.testData = null;
            this.metrics = {
                parseTime: [],
                renderTime: [],
                eventAttachTime: [],
                lookupTime: [],
                gridRenderTime: [],
                memoryUsage: []
            };
        }

        /**
         * Generate test data with multiple CVEs
         * @param {number} recordCount - Number of records to generate
         * @param {number} cvesPerRecord - Number of CVEs per record
         * @returns {Array} Test data array
         */
        generateTestData(recordCount = 100, cvesPerRecord = 10) {
            const testData = [];
            const severities = ["Critical", "High", "Medium", "Low"];
            const vendors = ["Microsoft", "Adobe", "Oracle", "Apache", "Linux"];
            
            console.log(`Generating ${recordCount} records with ${cvesPerRecord} CVEs each...`);
            
            for (let i = 0; i < recordCount; i++) {
                const cves = [];
                for (let j = 0; j < cvesPerRecord; j++) {
                    const year = 2020 + Math.floor(Math.random() * 5);
                    const id = Math.floor(Math.random() * 99999);
                    cves.push(`CVE-${year}-${String(id).padStart(5, "0")}`);
                }
                
                testData.push({
                    id: i + 1,
                    hostname: `device-${i + 1}.test.local`,
                    vulnerability: `Test Vulnerability ${i + 1}`,
                    cve: cves.join(", "),
                    severity: severities[Math.floor(Math.random() * severities.length)],
                    cvss: (Math.random() * 10).toFixed(1),
                    vendor: vendors[Math.floor(Math.random() * vendors.length)],
                    pluginId: 100000 + i,
                    published: new Date(Date.now() - Math.random() * 31536000000).toISOString()
                });
            }
            
            this.testData = testData;
            return testData;
        }

        /**
         * Benchmark CVE string parsing
         * @param {number} iterations - Number of test iterations
         */
        async benchmarkCVEParsing(iterations = 100) {
            console.log(`\n📊 Benchmarking CVE Parsing (${iterations} iterations)...`);
            
            const times = [];
            
            for (let i = 0; i < iterations; i++) {
                const record = this.testData[Math.floor(Math.random() * this.testData.length)];
                
                const start = performance.now();
                const parsed = CVEUtilities.parseCVEString(record.cve);
                const end = performance.now();
                
                times.push(end - start);
            }
            
            this.metrics.parseTime = times;
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            const max = Math.max(...times);
            const min = Math.min(...times);
            
            console.log(`✅ Parse Time - Avg: ${avg.toFixed(3)}ms, Min: ${min.toFixed(3)}ms, Max: ${max.toFixed(3)}ms`);
            
            return { avg, min, max, times };
        }

        /**
         * Benchmark CVE link rendering
         * @param {number} recordCount - Number of records to render
         */
        async benchmarkCVELinkRendering(recordCount = 100) {
            console.log(`\n📊 Benchmarking CVE Link Rendering (${recordCount} records)...`);
            
            const container = document.createElement("div");
            container.id = "benchmark-container";
            container.style.display = "none";
            document.body.appendChild(container);
            
            const times = [];
            
            for (let i = 0; i < Math.min(recordCount, this.testData.length); i++) {
                const record = this.testData[i];
                
                const start = performance.now();
                const links = CVEUtilities.createMultipleCVELinks(record.cve);
                const element = document.createElement("div");
                element.innerHTML = links;
                container.appendChild(element);
                const end = performance.now();
                
                times.push(end - start);
            }
            
            this.metrics.renderTime = times;
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            const max = Math.max(...times);
            const min = Math.min(...times);
            
            console.log(`✅ Render Time - Avg: ${avg.toFixed(3)}ms, Min: ${min.toFixed(3)}ms, Max: ${max.toFixed(3)}ms`);
            
            // Cleanup
            document.body.removeChild(container);
            
            return { avg, min, max, times };
        }

        /**
         * Benchmark event handler attachment
         * @param {number} elementCount - Number of elements with events
         */
        async benchmarkEventAttachment(elementCount = 1000) {
            console.log(`\n📊 Benchmarking Event Handler Attachment (${elementCount} elements)...`);
            
            const container = document.createElement("div");
            container.id = "benchmark-events";
            container.style.display = "none";
            
            // Create elements with CVE links
            for (let i = 0; i < elementCount; i++) {
                const cveId = `CVE-2024-${String(i).padStart(5, "0")}`;
                const link = document.createElement("a");
                link.href = "#";
                link.className = "vulnerability-cve";
                link.setAttribute("data-cve", cveId);
                link.textContent = cveId;
                container.appendChild(link);
            }
            
            document.body.appendChild(container);
            
            // Measure event attachment time
            const start = performance.now();
            CVEUtilities.attachCVEEventHandlers(container, (cveId) => {
                // Mock handler
                console.debug(`CVE clicked: ${cveId}`);
            });
            const end = performance.now();
            
            const attachTime = end - start;
            this.metrics.eventAttachTime.push(attachTime);
            
            console.log(`✅ Event Attachment Time: ${attachTime.toFixed(3)}ms for ${elementCount} elements`);
            console.log(`   Average per element: ${(attachTime / elementCount).toFixed(4)}ms`);
            
            // Cleanup
            CVEUtilities.removeCVEEventHandlers(container);
            document.body.removeChild(container);
            
            return { totalTime: attachTime, perElement: attachTime / elementCount };
        }

        /**
         * Benchmark grid rendering with multi-CVE data
         * @param {number} rowCount - Number of rows to render
         */
        async benchmarkGridRendering(rowCount = 100) {
            console.log(`\n📊 Benchmarking Grid Rendering (${rowCount} rows with multi-CVE)...`);
            
            // Check if AG-Grid is available
            if (!window.agGrid) {
                console.warn("⚠️ AG-Grid not available, skipping grid benchmark");
                return null;
            }
            
            const container = document.createElement("div");
            container.id = "benchmark-grid";
            container.style.width = "100%";
            container.style.height = "600px";
            container.style.display = "none";
            document.body.appendChild(container);
            
            // Prepare grid data
            const gridData = this.testData.slice(0, rowCount).map(record => ({
                ...record,
                cveLinks: CVEUtilities.createMultipleCVELinks(record.cve)
            }));
            
            // Grid options with CVE column
            const gridOptions = {
                columnDefs: [
                    { field: "hostname", headerName: "Device", width: 150 },
                    { field: "vulnerability", headerName: "Vulnerability", width: 200 },
                    { 
                        field: "cveLinks", 
                        headerName: "CVE IDs", 
                        width: 300,
                        cellRenderer: (params) => params.value,
                        autoHeight: true,
                        wrapText: true
                    },
                    { field: "severity", headerName: "Severity", width: 100 },
                    { field: "cvss", headerName: "CVSS", width: 80 }
                ],
                rowData: gridData,
                animateRows: false,
                suppressColumnVirtualisation: true,
                suppressRowVirtualisation: false
            };
            
            // Measure grid rendering
            const start = performance.now();
            const gridApi = agGrid.createGrid(container, gridOptions);
            const end = performance.now();
            
            const renderTime = end - start;
            this.metrics.gridRenderTime.push(renderTime);
            
            console.log(`✅ Grid Render Time: ${renderTime.toFixed(3)}ms for ${rowCount} rows`);
            console.log(`   Average per row: ${(renderTime / rowCount).toFixed(4)}ms`);
            
            // Cleanup
            if (gridApi && gridApi.destroy) {
                gridApi.destroy();
            }
            document.body.removeChild(container);
            
            return { totalTime: renderTime, perRow: renderTime / rowCount };
        }

        /**
         * Benchmark memory usage
         */
        async benchmarkMemoryUsage() {
            console.log("\n📊 Benchmarking Memory Usage...");
            
            if (!performance.memory) {
                console.warn("⚠️ Memory API not available in this browser");
                return null;
            }
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
            
            const initialMemory = performance.memory.usedJSHeapSize;
            
            // Create large dataset
            const largeData = this.generateTestData(1000, 50);
            
            // Process all CVEs
            const allLinks = [];
            for (const record of largeData) {
                allLinks.push(CVEUtilities.createMultipleCVELinks(record.cve));
            }
            
            const afterProcessing = performance.memory.usedJSHeapSize;
            const memoryUsed = (afterProcessing - initialMemory) / 1024 / 1024;
            
            this.metrics.memoryUsage.push(memoryUsed);
            
            console.log(`✅ Memory Usage: ${memoryUsed.toFixed(2)} MB for 1000 records with 50 CVEs each`);
            console.log(`   Initial: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   After: ${(afterProcessing / 1024 / 1024).toFixed(2)} MB`);
            
            return { memoryUsed, initial: initialMemory, after: afterProcessing };
        }

        /**
         * Run stress test with extreme data
         */
        async runStressTest() {
            console.log("\n🔥 Running Stress Test (Extreme Scenario)...");
            
            // Generate extreme dataset
            const extremeData = this.generateTestData(500, 100); // 500 records, 100 CVEs each
            
            console.log(`Testing with ${extremeData.length} records, ${100} CVEs per record`);
            console.log(`Total CVEs to process: ${extremeData.length * 100}`);
            
            const start = performance.now();
            
            // Process all records
            const results = [];
            for (const record of extremeData) {
                const parsed = CVEUtilities.parseCVEString(record.cve);
                const links = CVEUtilities.createMultipleCVELinks(record.cve);
                const summary = CVEUtilities.createCVESummary(record.cve);
                results.push({ parsed: parsed.length, links: links.length, summary: summary.length });
            }
            
            const end = performance.now();
            const totalTime = end - start;
            
            console.log(`✅ Stress Test Complete: ${totalTime.toFixed(2)}ms total`);
            console.log(`   Average per record: ${(totalTime / extremeData.length).toFixed(3)}ms`);
            console.log(`   Processing rate: ${((extremeData.length * 100) / (totalTime / 1000)).toFixed(0)} CVEs/second`);
            
            return { totalTime, recordCount: extremeData.length, cvesPerRecord: 100 };
        }

        /**
         * Generate performance report
         */
        generateReport() {
            console.log("\n" + "=".repeat(60));
            console.log("📈 PERFORMANCE BENCHMARK REPORT");
            console.log("=".repeat(60));
            
            const report = {
                timestamp: new Date().toISOString(),
                environment: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    cores: navigator.hardwareConcurrency || "unknown"
                },
                metrics: {}
            };
            
            // Calculate statistics for each metric
            for (const [metric, times] of Object.entries(this.metrics)) {
                if (times.length > 0) {
                    const avg = times.reduce((a, b) => a + b, 0) / times.length;
                    const sorted = [...times].sort((a, b) => a - b);
                    const median = sorted[Math.floor(sorted.length / 2)];
                    const p95 = sorted[Math.floor(sorted.length * 0.95)];
                    const p99 = sorted[Math.floor(sorted.length * 0.99)];
                    
                    report.metrics[metric] = {
                        samples: times.length,
                        average: avg,
                        median: median,
                        min: Math.min(...times),
                        max: Math.max(...times),
                        p95: p95,
                        p99: p99
                    };
                    
                    console.log(`\n${metric}:`);
                    console.log(`  Samples: ${times.length}`);
                    console.log(`  Average: ${avg.toFixed(3)}ms`);
                    console.log(`  Median: ${median.toFixed(3)}ms`);
                    console.log(`  P95: ${p95.toFixed(3)}ms`);
                    console.log(`  P99: ${p99.toFixed(3)}ms`);
                }
            }
            
            // Performance thresholds check
            console.log("\n" + "=".repeat(60));
            console.log("✅ PERFORMANCE REQUIREMENTS CHECK");
            console.log("=".repeat(60));
            
            const parseAvg = report.metrics.parseTime?.average || 0;
            const renderAvg = report.metrics.renderTime?.average || 0;
            const gridAvg = report.metrics.gridRenderTime?.average || 0;
            
            console.log("\n📋 Target: <500ms for table loads");
            console.log(`   Grid Render: ${gridAvg.toFixed(2)}ms ${gridAvg < 500 ? "✅ PASS" : "❌ FAIL"}`);
            
            console.log("\n📋 Target: <200ms for CVE operations");
            console.log(`   Parse + Render: ${(parseAvg + renderAvg).toFixed(2)}ms ${(parseAvg + renderAvg) < 200 ? "✅ PASS" : "❌ FAIL"}`);
            
            console.log("\n" + "=".repeat(60));
            
            this.results.push(report);
            return report;
        }

        /**
         * Run complete benchmark suite
         */
        async runCompleteBenchmark() {
            console.log("🚀 Starting HexTrackr CVE Performance Benchmark Suite");
            console.log("=" .repeat(60));
            
            try {
                // Generate test data
                this.generateTestData(100, 10);
                
                // Run benchmarks
                await this.benchmarkCVEParsing(100);
                await this.benchmarkCVELinkRendering(100);
                await this.benchmarkEventAttachment(1000);
                await this.benchmarkGridRendering(100);
                await this.benchmarkMemoryUsage();
                await this.runStressTest();
                
                // Generate report
                const report = this.generateReport();
                
                console.log("\n✨ Benchmark Complete! Nyuk-nyuk-nyuk!");
                
                return report;
                
            } catch (error) {
                console.error("❌ Benchmark failed:", error);
                throw error;
            }
        }
    }

    // Export for different environments
    if (typeof module !== "undefined" && module.exports) {
        module.exports = CVEPerformanceBenchmark;
    } else if (typeof define === "function" && define.amd) {
        define([], function() {
            return CVEPerformanceBenchmark;
        });
    } else {
        global.CVEPerformanceBenchmark = CVEPerformanceBenchmark;
    }

})(typeof window !== "undefined" ? window : global);