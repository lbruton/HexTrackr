// Test script for hostname normalization
// Run with: node test-hostname-normalization.js

// Simulate the normalizeHostname function
function normalizeHostname(hostname) {
    if (!hostname) {
        return "";
    }
    // Remove everything after first period to handle domain variations
    // Examples: nwan10.mmplp.net -> nwan10, nswan10 -> nswan10
    return hostname.split(".")[0].toLowerCase().trim();
}

// Test cases
const testCases = [
    { input: "nwan10.mmplp.net", expected: "nwan10" },
    { input: "nswan10", expected: "nswan10" },
    { input: "NWAN10.MMPLP.NET", expected: "nwan10" },
    { input: "server01.company.local", expected: "server01" },
    { input: "hostname.domain.tld", expected: "hostname" },
    { input: "", expected: "" },
    { input: null, expected: "" },
    { input: undefined, expected: "" },
    { input: "  trimmed.domain.com  ", expected: "trimmed" },
    { input: "single", expected: "single" }
];

console.log("🧪 Testing Hostname Normalization Function");
console.log("==========================================");

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
    const result = normalizeHostname(testCase.input);
    const passed = result === testCase.expected;
    
    console.log(`Test ${index + 1}: ${passed ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`  Input:    "${testCase.input}"`);
    console.log(`  Expected: "${testCase.expected}"`);
    console.log(`  Got:      "${result}"`);
    
    if (passed) {
        passedTests++;
    }
    console.log("");
});

console.log(`Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Hostname normalization is working correctly.");
} else {
    console.log("❌ Some tests failed. Check implementation.");
}

// Test unique key generation with normalized hostnames
console.log("\n🔑 Testing Unique Key Generation with Normalized Hostnames");
console.log("=========================================================");

function generateUniqueKey(mapped) {
    const normalizedHostname = normalizeHostname(mapped.hostname);
    
    if (mapped.cve && mapped.cve.trim()) {
        return `${normalizedHostname}|${mapped.cve.trim()}`;
    }
    
    if (mapped.pluginId && mapped.pluginId.trim()) {
        return `${normalizedHostname}|${mapped.pluginId.trim()}|${(mapped.description || "").trim().substring(0, 100)}`;
    }
    
    const keyParts = [
        normalizedHostname,
        (mapped.description || "").trim(),
        (mapped.vprScore || 0).toString()
    ];
    return keyParts.join("|");
}

const uniqueKeyTests = [
    {
        name: "Same hostname with different domains should generate same key",
        input1: { hostname: "nwan10.mmplp.net", cve: "CVE-2023-1234" },
        input2: { hostname: "nwan10", cve: "CVE-2023-1234" },
        shouldMatch: true
    },
    {
        name: "Different hostnames should generate different keys",
        input1: { hostname: "nwan10.mmplp.net", cve: "CVE-2023-1234" },
        input2: { hostname: "nwan11.mmplp.net", cve: "CVE-2023-1234" },
        shouldMatch: false
    },
    {
        name: "Fallback to plugin_id when no CVE",
        input1: { hostname: "server01.domain.com", pluginId: "12345", description: "Test vulnerability" },
        input2: { hostname: "server01", pluginId: "12345", description: "Test vulnerability" },
        shouldMatch: true
    }
];

uniqueKeyTests.forEach((test, index) => {
    const key1 = generateUniqueKey(test.input1);
    const key2 = generateUniqueKey(test.input2);
    const keysMatch = key1 === key2;
    const testPassed = keysMatch === test.shouldMatch;
    
    console.log(`Test ${index + 1}: ${testPassed ? "✅ PASS" : "❌ FAIL"} - ${test.name}`);
    console.log(`  Key 1: "${key1}"`);
    console.log(`  Key 2: "${key2}"`);
    console.log(`  Match: ${keysMatch}, Expected: ${test.shouldMatch}`);
    console.log("");
});
