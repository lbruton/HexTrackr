// Quick Cisco API Test
// Test the provided credentials: na6st3rkeyddn7u3t8guavtj / FScXCaVYjRJ6nxdSfpTd7Gu6

async function testCiscoCredentials() {
    const clientId = 'na6st3rkeyddn7u3t8guavtj';
    const clientSecret = 'FScXCaVYjRJ6nxdSfpTd7Gu6';
    
    console.log('🔧 Testing Cisco API credentials...');
    
    try {
        // Step 1: Get OAuth token
        const tokenResponse = await fetch('https://cloudsso.cisco.com/as/token.oauth2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: `client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&grant_type=client_credentials`
        });
        
        console.log('📡 Token request status:', tokenResponse.status);
        
        if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            console.log('✅ Token obtained successfully!');
            console.log('🔑 Token type:', tokenData.token_type);
            console.log('⏰ Expires in:', tokenData.expires_in, 'seconds');
            
            // Step 2: Test API call with token
            const advisoryResponse = await fetch('https://api.cisco.com/security/advisories/v2/all', {
                method: 'GET',
                headers: {
                    'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
                    'Accept': 'application/json'
                }
            });
            
            console.log('📊 Advisory API status:', advisoryResponse.status);
            
            if (advisoryResponse.ok) {
                const advisoryData = await advisoryResponse.json();
                console.log('✅ Successfully retrieved', advisoryData.advisories?.length || 0, 'advisories');
                console.log('📋 Sample advisory:', advisoryData.advisories?.[0]?.advisoryId);
                return { success: true, tokenData, advisoryData };
            } else {
                const errorText = await advisoryResponse.text();
                console.error('❌ Advisory API failed:', errorText);
                return { success: false, error: 'Advisory API failed', details: errorText };
            }
        } else {
            const errorText = await tokenResponse.text();
            console.error('❌ Token request failed:', errorText);
            return { success: false, error: 'Token request failed', details: errorText };
        }
    } catch (error) {
        console.error('❌ Test failed with error:', error);
        return { success: false, error: error.message };
    }
}

// Run the test
testCiscoCredentials().then(result => {
    if (result.success) {
        console.log('🎉 Cisco API test completed successfully!');
    } else {
        console.log('❌ Cisco API test failed:', result.error);
    }
});
