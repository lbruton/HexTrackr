// Test script for hostname normalization with IP address handling
// Run with: node test-hostname-normalization-ip.js

// Simulate the updated normalizeHostname function
function normalizeHostname(hostname) {
    if (!hostname) {
        return "";
    }
    
    const cleanHostname = hostname.trim();
    
    // Check if hostname is a valid IP address (x.x.x.x pattern with valid octets)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(cleanHostname)) {
        // Validate that all octets are between 0-255
        const octets = cleanHostname.split(".").map(Number);
        const isValidIP = octets.every(octet => octet >= 0 && octet <= 255);
        
        if (isValidIP) {
            // For valid IP addresses, return the full IP - don't split on periods
            return cleanHostname.toLowerCase();
        }
    }
    
    // For domain names or invalid IPs, remove everything after first period to handle domain variations
    // Examples: nwan10.mmplp.net -> nwan10, nswan10 -> nswan10, 300.300.300.300 -> 300
    return cleanHostname.split(".")[0].toLowerCase();
}

// Test cases for hostname normalization
const testCases = [
    // Domain name variations
    { input: "nwan10.mmplp.net", expected: "nwan10", description: "Domain name with .mmplp.net" },
    { input: "nswan10", expected: "nswan10", description: "Hostname without domain" },
    { input: "NWAN10.MMPLP.NET", expected: "nwan10", description: "Uppercase domain name" },
    { input: "server.example.com", expected: "server", description: "Different domain" },
    
    // IP address cases - should NOT be split on periods
    { input: "10.95.6.210", expected: "10.95.6.210", description: "IP address as hostname" },
    { input: "192.168.1.100", expected: "192.168.1.100", description: "Private IP address" },
    { input: "172.16.0.50", expected: "172.16.0.50", description: "Another private IP" },
    { input: "203.0.113.42", expected: "203.0.113.42", description: "Public IP address" },
    
    // Edge cases
    { input: "", expected: "", description: "Empty string" },
    { input: null, expected: "", description: "Null value" },
    { input: undefined, expected: "", description: "Undefined value" },
    { input: "   trimtest.com   ", expected: "trimtest", description: "String with whitespace" },
    { input: "single", expected: "single", description: "Single word hostname" },
    
    // Malformed IP cases (should be treated as hostnames)
    { input: "10.95.6", expected: "10", description: "Incomplete IP (treated as hostname)" },
    { input: "300.300.300.300", expected: "300", description: "Invalid IP values (treated as hostname)" },
    { input: "10.95.6.210.5", expected: "10", description: "Too many octets (treated as hostname)" }
];

console.log("🧪 Testing Hostname Normalization with IP Address Handling...\n");

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
    try {
        const result = normalizeHostname(test.input);
        if (result === test.expected) {
            console.log(`✅ Test ${index + 1}: ${test.description}`);
            console.log(`   Input: "${test.input}" → Output: "${result}"`);
            passed++;
        } else {
            console.log(`❌ Test ${index + 1}: ${test.description}`);
            console.log(`   Input: "${test.input}"`);
            console.log(`   Expected: "${test.expected}"`);
            console.log(`   Got: "${result}"`);
            failed++;
        }
    } catch (error) {
        console.log(`💥 Test ${index + 1}: ${test.description} - ERROR: ${error.message}`);
        failed++;
    }
    console.log("");
});

console.log(`📊 Results: ${passed} passed, ${failed} failed`);
console.log(failed === 0 ? "🎉 All tests passed!" : "⚠️  Some tests failed!");

// Test with the actual problematic case we found
console.log("\n🔍 Testing Real-World Case:");
const realCase = "10.95.6.210";
const realResult = normalizeHostname(realCase);
console.log(`Input: "${realCase}" → Output: "${realResult}"`);
console.log(realResult === "10.95.6.210" ? "✅ IP address preserved correctly!" : "❌ IP address was incorrectly split!");
