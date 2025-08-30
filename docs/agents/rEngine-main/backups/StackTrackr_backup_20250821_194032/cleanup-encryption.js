/**
 * StackTrackr Encryption Cleanup Script
 * Phase 1 of gradual encryption removal
 * 
 * This script safely removes orphaned encryption keys from localStorage
 * Run this in the browser console if you're experiencing issues with
 * encryption state or see confusing "encrypted" status messages.
 * 
 * To use: Copy and paste this entire script into your browser console
 * while on the StackTrackr page, then press Enter.
 */

(function() {
    console.log("🧹 StackTrackr Encryption Cleanup Starting...");
    
    const keysToRemove = [
        "stackrtrackr_master_salt",
        "stackrtrackr_encrypted_verification",
        "stackrtrackr_encrypted_stackrtrackr.inventory",
        "stackrtrackr_encrypted_stackrtrackr.spotPrices",
        "stackrtrackr_encrypted_stackrtrackr.settings",
        "stackrtrackr_encrypted_catalog_api_config"
    ];
    
    let removedCount = 0;
    const existingKeys = [];
    
    // Check what exists first
    console.log("🔍 Checking for encryption keys...");
    keysToRemove.forEach(key => {
        if (localStorage.getItem(key) !== null) {
            existingKeys.push(key);
        }
    });
    
    if (existingKeys.length === 0) {
        console.log("✅ No encryption keys found - your storage is already clean!");
        return;
    }
    
    console.log(`📋 Found ${existingKeys.length} encryption keys to remove:`);
    existingKeys.forEach(key => console.log(`   - ${key}`));
    
    // Remove the keys
    console.log("🗑️  Removing encryption keys...");
    keysToRemove.forEach(key => {
        if (localStorage.getItem(key) !== null) {
            localStorage.removeItem(key);
            removedCount++;
            console.log(`   ✓ Removed: ${key}`);
        }
    });
    
    console.log(`✅ Cleanup complete! Removed ${removedCount} encryption keys.`);
    console.log("🔄 Please refresh the page to see the changes.");
    
    // Optional: Verify cleanup
    const remainingEncryptionKeys = Object.keys(localStorage)
        .filter(key => key.includes("stackrtrackr") && key.includes("encrypt"));
    
    if (remainingEncryptionKeys.length > 0) {
        console.warn("⚠️  Some encryption-related keys may still exist:", remainingEncryptionKeys);
    } else {
        console.log("🎉 All encryption keys successfully removed!");
    }
})();
