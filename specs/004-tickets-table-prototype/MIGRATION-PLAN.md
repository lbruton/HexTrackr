# Tickets2 to Production Migration Plan

## Overview
Simple file swap strategy for replacing tickets.html with tickets2.html prototype once testing is complete.

## Current State
- **Production**: `tickets.html` + `styles/pages/tickets.css`
- **Prototype**: `tickets2.html` + `styles/pages/tickets2.css`

## Migration Steps

### Option 1: File Rename (Recommended)
```bash
# Step 1: Backup current production files
mv app/public/tickets.html app/public/tickets-old.html
mv app/public/styles/pages/tickets.css app/public/styles/pages/tickets-old.css

# Step 2: Rename prototype files to production names
mv app/public/tickets2.html app/public/tickets.html
mv app/public/styles/pages/tickets2.css app/public/styles/pages/tickets.css
```

### Option 2: Content Swap
```bash
# Step 1: Backup current production files
cp app/public/tickets.html app/public/tickets-backup.html
cp app/public/styles/pages/tickets.css app/public/styles/pages/tickets-backup.css

# Step 2: Copy prototype content over production files
cp app/public/tickets2.html app/public/tickets.html
cp app/public/styles/pages/tickets2.css app/public/styles/pages/tickets.css
```

## Advantages of This Approach
1. **Simple**: Just rename or swap files
2. **Reversible**: Easy to rollback if issues arise
3. **Clean**: No complex CSS consolidation needed
4. **Organized**: Follows existing HexTrackr CSS structure (pages/ folder)

## Pre-Migration Checklist
- [ ] Complete testing of tickets2.html prototype
- [ ] Verify all AG-Grid features working
- [ ] Test dark/light theme switching
- [ ] Confirm responsive design on mobile
- [ ] Run accessibility tests
- [ ] Get stakeholder approval

## Post-Migration Cleanup
After successful migration and verification period:
- Remove backup files (tickets-old.html, tickets-old.css)
- Update any documentation referencing tickets2.html
- Remove prototype-specific comments from code