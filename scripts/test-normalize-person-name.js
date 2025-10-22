/**
 * Browser Console Test Script for normalizePersonName()
 *
 * INSTRUCTIONS:
 * 1. Open https://dev.hextrackr.com/tickets.html in browser
 * 2. Open Developer Tools (F12) → Console tab
 * 3. Copy and paste this entire file into the console
 * 4. Press Enter to run all tests
 *
 * Expected: All 7 tests should pass with "✓" marks
 */

console.log("=== Testing normalizePersonName() ===\n");

// Access the HexagonTicketsManager instance
const manager = window.hexagonTicketsManager;

if (!manager) {
    console.error("❌ ERROR: HexagonTicketsManager not found. Make sure you're on the tickets page.");
} else {
    let passed = 0;
    let failed = 0;

    // Test helper function
    function test(testName, input, expected) {
        const actual = manager.normalizePersonName(input);
        const success = actual === expected;

        if (success) {
            console.log(`✓ ${testName}`);
            console.log(`  Input:    "${input}"`);
            console.log(`  Output:   "${actual}"\n`);
            passed++;
        } else {
            console.error(`✗ ${testName}`);
            console.error(`  Input:    "${input}"`);
            console.error(`  Expected: "${expected}"`);
            console.error(`  Got:      "${actual}"\n`);
            failed++;
        }
    }

    // Test 1: LAST,FIRST format (Hexagon EAM export)
    test(
        "Test 1: LAST,FIRST format",
        "SMITH,JOHN",
        "John Smith"
    );

    // Test 2: Multiple people with semicolons
    test(
        "Test 2: Multiple people",
        "SMITH,JOHN; DOE,JANE",
        "John Smith; Jane Doe"
    );

    // Test 3: Already normalized (pass-through)
    test(
        "Test 3: Already normalized",
        "John Smith",
        "John Smith"
    );

    // Test 4: Lowercase input (capitalize)
    test(
        "Test 4: Lowercase input",
        "john smith",
        "John Smith"
    );

    // Test 5: Edge case - empty string
    test(
        "Test 5: Empty string",
        "",
        ""
    );

    // Test 6: Edge case - N/A (pass-through)
    test(
        "Test 6: N/A pass-through",
        "N/A",
        "N/A"
    );

    // Test 7: Edge case - special characters
    test(
        "Test 7: Special characters",
        "O'BRIEN,MARY-JANE",
        "Mary-Jane O'Brien"
    );

    // Summary
    console.log("=== Test Summary ===");
    console.log(`✓ Passed: ${passed}`);
    if (failed > 0) {
        console.error(`✗ Failed: ${failed}`);
    } else {
        console.log("🎉 All tests passed!");
    }
}
