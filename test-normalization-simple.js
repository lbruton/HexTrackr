/**
 * Simple test to verify normalization button functionality
 * Run with: node test-normalization-simple.js
 */

const http = require('http');

console.log('Testing Normalization Feature...\n');

// Test 1: Check if button exists in HTML
http.get('http://localhost:8989/vulnerabilities.html', (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const hasButton = data.includes('data-toggle="normalize-chart"');
        const hasButtonText = data.includes('Normalize Data');

        console.log(`✓ Button exists in HTML: ${hasButton ? '✅' : '❌'}`);
        console.log(`✓ Button has text "Normalize Data": ${hasButtonText ? '✅' : '❌'}`);

        // Test 2: Check if vulnerability-chart-manager.js is included
        const hasChartManager = data.includes('vulnerability-chart-manager.js');
        console.log(`✓ Chart manager script included: ${hasChartManager ? '✅' : '❌'}`);

        // Test 3: Check if button has proper styling
        const hasButtonStyles = data.includes('btn-outline-secondary');
        console.log(`✓ Button has proper styling: ${hasButtonStyles ? '✅' : '❌'}`);

        // Test 4: Check aria attributes
        const hasAriaPressed = data.includes('aria-pressed="false"');
        console.log(`✓ Button has aria-pressed attribute: ${hasAriaPressed ? '✅' : '❌'}`);

        console.log('\n📍 Visit http://localhost:8989/vulnerabilities.html to manually test:');
        console.log('   1. Click the "Normalize Data" button');
        console.log('   2. The button should turn blue when active');
        console.log('   3. Chart lines should all start at index 100');
        console.log('   4. Tooltips should show both Index and Actual values');
        console.log('   5. Refresh page - state should persist');
    });
}).on('error', (err) => {
    console.error('❌ Error connecting to server:', err.message);
    console.log('Make sure HexTrackr is running on port 8989');
});