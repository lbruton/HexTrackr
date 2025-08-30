# StackTrackr Encryption Status

## Current Status: Temporarily Disabled

The encryption feature has been temporarily disabled while we improve the core inventory system. This decision was made to focus development resources on the features that users request most.

## What This Means

- **Your data is still secure** - StackTrackr stores data locally on your computer only
- **No feature loss** - All inventory, spot price, and API features work normally  
- **Cleaner interface** - Removed confusing encryption options from the API modal
- **Better stability** - Eliminated source of technical issues and user confusion

## If You Were Using Encryption

If you previously set up encryption and are seeing issues:

1. **Run the cleanup script** to remove old encryption keys:
   - Copy the contents of `cleanup-encryption.js`
   - Paste into your browser console while on the StackTrackr page
   - Press Enter to run the cleanup

1. **Alternative security workflow:**
   - Use the Export feature to save your data as CSV
   - Encrypt the CSV file using your preferred encryption tool
   - Store the encrypted file securely
   - Import the CSV when needed

## Timeline

This is part of a gradual simplification plan:

- **Phase 1 (Complete):** Hidden encryption UI and provided cleanup tools
- **Phase 2 (Next month):** Remove backend encryption code during feature development  
- **Phase 3 (Month 3):** Complete cleanup during UI improvements

## Questions?

The encryption system proved more complex than valuable for most users. We're focusing development time on inventory management, reporting, and mobile access instead.

If you have specific security needs, the CSV export → encrypt → import workflow provides the same protection with more flexibility and compatibility.
