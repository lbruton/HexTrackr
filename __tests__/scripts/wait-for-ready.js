#!/usr/bin/env node

/**
 * HexTrackr Docker Health Check Script (Node.js version)
 * Cross-platform alternative to the bash script
 * Waits for HexTrackr to be ready on port 8989 before running tests
 * 
 * Usage: node wait-for-ready.js [timeout_seconds]
 * Default timeout: 30 seconds
 */

const http = require('http');
const net = require('net');

// Configuration
const HOST = 'localhost';
const PORT = 8989;
const TIMEOUT = (process.argv[2] || 30) * 1000; // Convert to milliseconds
const RETRY_INTERVAL = 2000; // 2 seconds

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

console.log(`${colors.yellow}🔍 Checking HexTrackr availability on ${HOST}:${PORT}...${colors.reset}`);
console.log(`${colors.yellow}⏱  Timeout: ${TIMEOUT / 1000} seconds${colors.reset}`);

const startTime = Date.now();

/**
 * Check if port is open
 * @returns {Promise<boolean>}
 */
function checkPort() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(PORT, HOST);
  });
}

/**
 * Check HTTP health
 * @returns {Promise<boolean>}
 */
function checkHttp() {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      // Accept 200, 301, 302 as valid responses
      resolve([200, 301, 302].includes(res.statusCode));
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Check specific endpoint
 * @param {string} path - Endpoint path to check
 * @returns {Promise<boolean>}
 */
function checkEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Main health check loop
 */
async function waitForReady() {
  while (true) {
    const elapsed = Date.now() - startTime;
    
    if (elapsed >= TIMEOUT) {
      console.error(`${colors.red}❌ Timeout reached after ${TIMEOUT / 1000} seconds${colors.reset}`);
      console.error(`${colors.red}   HexTrackr is not responding on ${HOST}:${PORT}${colors.reset}`);
      console.error('');
      console.error('Troubleshooting steps:');
      console.error('1. Check if Docker is running: docker ps');
      console.error('2. Check HexTrackr logs: docker-compose logs hextrackr');
      console.error('3. Verify port 8989 is not in use: lsof -i :8989');
      console.error('4. Restart Docker: docker-compose restart');
      process.exit(1);
    }
    
    const portOpen = await checkPort();
    if (portOpen) {
      const httpReady = await checkHttp();
      if (httpReady) {
        console.log(`${colors.green}✅ HexTrackr is ready on ${HOST}:${PORT}${colors.reset}`);
        console.log(`${colors.green}   Time taken: ${Math.round(elapsed / 1000)} seconds${colors.reset}`);
        
        // Additional endpoint checks
        console.log(`${colors.yellow}🔍 Verifying critical endpoints...${colors.reset}`);
        
        const mainPageReady = await checkEndpoint('/');
        if (mainPageReady) {
          console.log(`${colors.green}   ✓ Main page accessible${colors.reset}`);
        } else {
          console.log(`${colors.yellow}   ⚠ Main page not accessible (may be normal)${colors.reset}`);
        }
        
        const vulnPageReady = await checkEndpoint('/vulnerabilities.html');
        if (vulnPageReady) {
          console.log(`${colors.green}   ✓ Vulnerabilities page accessible${colors.reset}`);
        } else {
          console.log(`${colors.yellow}   ⚠ Vulnerabilities page not accessible${colors.reset}`);
        }
        
        console.log(`${colors.green}🚀 Ready to run tests!${colors.reset}`);
        process.exit(0);
      }
    }
    
    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
  }
}

// Start the health check
waitForReady().catch(err => {
  console.error(`${colors.red}Unexpected error: ${err.message}${colors.reset}`);
  process.exit(1);
});