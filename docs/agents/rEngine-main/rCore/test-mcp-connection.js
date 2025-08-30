// Test MCP Memory Connection
import { dualWrite } from './dual-memory-writer.js';

console.log('🧪 Testing MCP connection after Smart Scribe startup...');

try {
    await dualWrite(
        'MCP Connection Test - Post Startup', 
        'Testing if MCP server is responding properly after Smart Scribe startup. This should work now that the server is running.',
        'mcp_connection_test'
    );
    console.log('✅ MCP memory sync working! Server is responding properly.');
} catch (error) {
    console.log('❌ MCP sync still failing:', error.message);
    console.log('📊 Error details:', error);
}
