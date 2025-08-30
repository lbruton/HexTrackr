#!/usr/bin/env node

/**
 * rEngine Health Check API Server
 * Provides REST endpoints for health monitoring
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.HEALTH_PORT || 4039;
const BASE_DIR = process.cwd();

class HealthCheckAPI {
    constructor() {
        this.services = new Map();
        this.lastHealthCheck = null;
        this.isRunning = false;
        
        // Connection resilience settings
        this.retryCount = 3;
        this.timeoutMs = 10000;
        this.retryDelayMs = 2000;
    }

    // Enhanced connection utility with retry logic
    async resilientExec(command, options = {}) {
        const maxRetries = options.retries || this.retryCount;
        const timeout = options.timeout || this.timeoutMs;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.execPromise(command, { timeout });
                return result;
            } catch (error) {
                if (attempt === maxRetries) {
                    console.log(`❌ Command failed after ${maxRetries} attempts: ${command}`);
                    throw error;
                }
                
                console.log(`⚠️  Command attempt ${attempt}/${maxRetries} failed, retrying in ${this.retryDelayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelayMs));
            }
        }
    }

    execPromise(command, options = {}) {
        return new Promise((resolve, reject) => {
            const child = exec(command, options, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ stdout, stderr });
                }
            });
            
            if (options.timeout) {
                setTimeout(() => {
                    child.kill();
                    reject(new Error(`Command timeout after ${options.timeout}ms: ${command}`));
                }, options.timeout);
            }
        });
    }

    start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(PORT, () => {
            console.log(`🏥 rEngine Health Check API running on port ${PORT}`);
            console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
            console.log(`🔍 Health API: http://localhost:${PORT}/api/health`);
        });

        // Run initial health check
        this.runHealthCheck();
        
        // Schedule periodic health checks
        setInterval(() => {
            this.runHealthCheck();
        }, 30000); // Every 30 seconds
    }

    handleRequest(req, res) {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        if (url.pathname === '/dashboard') {
            this.serveDashboard(res);
        } else if (url.pathname === '/api/health') {
            this.serveHealthStatus(res);
        } else if (url.pathname === '/api/services') {
            this.serveServiceStatus(res);
        } else if (url.pathname === '/api/memory') {
            this.serveMemoryStatus(res);
        } else if (url.pathname === '/api/logs') {
            this.serveLogs(res);
        } else if (url.pathname === '/api/run-health-check') {
            this.runHealthCheckAPI(res);
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
    }

    serveDashboard(res) {
        const dashboardPath = path.join(BASE_DIR, 'health-dashboard.html');
        fs.readFile(dashboardPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading dashboard');
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }

    serveHealthStatus(res) {
        const healthData = {
            timestamp: new Date().toISOString(),
            status: this.getOverallStatus(),
            services: Array.from(this.services.entries()).map(([name, status]) => ({
                name,
                ...status
            })),
            memory: this.getMemoryStatus(),
            docker: this.getDockerStatus(),
            lastCheck: this.lastHealthCheck
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(healthData, null, 2));
    }

    serveServiceStatus(res) {
        this.checkDockerServices((services) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ services }, null, 2));
        });
    }

    serveMemoryStatus(res) {
        const memoryStatus = this.getMemoryStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(memoryStatus, null, 2));
    }

    serveLogs(res) {
        const logsDir = path.join(BASE_DIR, 'logs');
        
        // Get recent log files
        fs.readdir(logsDir, (err, files) => {
            if (err) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ logs: [], error: 'Logs directory not accessible' }));
                return;
            }

            const logFiles = files
                .filter(file => file.endsWith('.log'))
                .sort((a, b) => b.localeCompare(a))
                .slice(0, 5);

            const logs = [];
            let completed = 0;

            if (logFiles.length === 0) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ logs: [] }));
                return;
            }

            logFiles.forEach(file => {
                const filePath = path.join(logsDir, file);
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (!err) {
                        const lines = data.split('\n').slice(-20); // Last 20 lines
                        logs.push({ file, lines });
                    }
                    
                    completed++;
                    if (completed === logFiles.length) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ logs }, null, 2));
                    }
                });
            });
        });
    }

    runHealthCheckAPI(res) {
        exec('./health-check.sh', { cwd: BASE_DIR }, (error, stdout, stderr) => {
            const result = {
                timestamp: new Date().toISOString(),
                success: !error,
                output: stdout,
                error: stderr
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result, null, 2));
        });
    }

    runHealthCheck() {
        console.log('🔍 Running health check...');
        this.lastHealthCheck = new Date().toISOString();
        
        // Check Docker services
        this.checkDockerServices();
        
        // Check memory system
        this.checkMemorySystem();
    }

    checkDockerServices(callback) {
        exec('docker-compose -f docker-compose-enhanced.yml ps --format json', { cwd: BASE_DIR }, (error, stdout, stderr) => {
            if (error) {
                console.log('⚠️  Docker services check failed:', error.message);
                if (callback) callback([]);
                return;
            }

            try {
                const services = stdout.trim().split('\n')
                    .filter(line => line.trim())
                    .map(line => JSON.parse(line));
                
                services.forEach(service => {
                    this.services.set(service.Name, {
                        status: service.State === 'running' ? 'healthy' : 'unhealthy',
                        state: service.State,
                        ports: service.Ports || '',
                        lastCheck: new Date().toISOString()
                    });
                });

                if (callback) callback(services);
            } catch (e) {
                console.log('⚠️  Error parsing Docker services:', e.message);
                if (callback) callback([]);
            }
        });
    }

    checkMemorySystem() {
        const memoryFile = path.join(BASE_DIR, 'persistent-memory.json');
        
        fs.access(memoryFile, fs.constants.F_OK, (err) => {
            const memoryStatus = {
                persistentMemory: !err,
                lastCheck: new Date().toISOString()
            };

            if (!err) {
                fs.stat(memoryFile, (statErr, stats) => {
                    if (!statErr) {
                        memoryStatus.size = stats.size;
                        memoryStatus.modified = stats.mtime.toISOString();
                    }
                    this.services.set('memory-system', memoryStatus);
                });
            } else {
                this.services.set('memory-system', memoryStatus);
            }
        });
    }

    getMemoryStatus() {
        const memoryFile = path.join(BASE_DIR, 'persistent-memory.json');
        const status = {
            persistentMemoryExists: fs.existsSync(memoryFile),
            memoryDirectories: {
                rMemory: fs.existsSync(path.join(BASE_DIR, 'rMemory')),
                memoryBackups: fs.existsSync(path.join(BASE_DIR, 'memory-backups')),
                agentsMemory: fs.existsSync(path.join(BASE_DIR, 'rAgents', 'memory'))
            }
        };

        if (status.persistentMemoryExists) {
            try {
                const stats = fs.statSync(memoryFile);
                status.size = stats.size;
                status.lastModified = stats.mtime.toISOString();
                
                // Validate JSON
                const content = fs.readFileSync(memoryFile, 'utf8');
                JSON.parse(content);
                status.validJson = true;
            } catch (e) {
                status.validJson = false;
                status.error = e.message;
            }
        }

        return status;
    }

    getDockerStatus() {
        // This would be populated by the docker check
        return {
            daemonRunning: true, // Simplified for now
            composeAvailable: true
        };
    }

    getOverallStatus() {
        const serviceStatuses = Array.from(this.services.values());
        const healthyCount = serviceStatuses.filter(s => s.status === 'healthy').length;
        const totalCount = serviceStatuses.length;

        if (totalCount === 0) return 'unknown';
        if (healthyCount === totalCount) return 'healthy';
        if (healthyCount > 0) return 'partial';
        return 'unhealthy';
    }
}

// Start the health check API server
const healthAPI = new HealthCheckAPI();
healthAPI.start();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down health check API...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down health check API...');
    process.exit(0);
});
