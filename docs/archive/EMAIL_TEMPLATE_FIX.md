# HexTrackr Email Template Database Fix

**Issue**: [HEX-306](https://linear.app/hextrackr/issue/HEX-306/bug-email-template-missing-middle-portion) - Email Template Missing Middle Portion

## Problem Summary

The email templates in the Docker database are truncated/corrupted. When users view tickets and click the "Email Template" tab, they see incomplete emails that cut off mid-section.

**Symptoms**:
- Email shows `**MAINTENANCE` (missing "DETAILS:**" and everything after)
- Content jumps directly from incomplete MAINTENANCE line to `**VULNERABILITY SUMMARY:**`
- Missing sections: AFFECTED SYSTEMS, SOFTWARE VERSIONS, ACTION REQUIRED, TIMELINE

## Root Cause

The `email_templates` table in `/app/data/hextrackr.db` (inside Docker container) has truncated content:
- `email_upgrade`: 399 characters (should be 1081)
- `email_replacement`: 390 characters (should be 1244)
- `default_email`: 412 characters (obsolete, should be deleted)

This happened during a previous migration or manual edit. The templates literally cut off mid-word.

## Fix Instructions for RHEL Server

Execute these SQL commands **inside the Docker container's database**:

### Step 1: Fix email_upgrade Template

```bash
docker exec hextrackr-app sqlite3 /app/data/hextrackr.db "UPDATE email_templates SET template_content = 'Subject: Hexagon Work Order - [SITE_NAME] - [HEXAGON_NUM]

Hello [GREETING],

We have submitted a Hexagon work order ([HEXAGON_NUM]) for the [SITE_NAME] site.

There are critical security patches that must be applied within 30 days.

Please see the attached notes for more information. If you have any questions or concerns please feel free to reach out to NetOps at netops@oneok.com.

**MAINTENANCE DETAILS:**

• Site: [SITE_NAME]
• Location: [LOCATION]
• Hexagon Ticket: [HEXAGON_NUM]
• ServiceNow Reference: [SERVICENOW_NUM]
• Required Completion: [DATE_DUE]

**AFFECTED SYSTEMS:**

[DEVICE_COUNT] device(s) require security patches and will need to be rebooted:

[DEVICE_LIST]

**SOFTWARE VERSIONS:**

[SOFTWARE_VERSIONS]

**ACTION REQUIRED:**

• Schedule a maintenance window of at least 4 hours
• Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]
• Coordinate with NetOps for patch application

**TIMELINE:**

• Request Submitted: [DATE_SUBMITTED]
• Required Completion: [DATE_DUE]
• Maintenance Window: To be scheduled

[VULNERABILITY_SUMMARY]

Thank you,', default_content = template_content WHERE name = 'email_upgrade';"
```

### Step 2: Fix email_replacement Template

```bash
docker exec hextrackr-app sqlite3 /app/data/hextrackr.db "UPDATE email_templates SET template_content = 'Subject: Hexagon Work Order - [SITE_NAME] - [HEXAGON_NUM]

Hello [GREETING],

We have submitted a Hexagon work order ([HEXAGON_NUM]) for the [SITE_NAME] site.

We are shipping replacement equipment that needs to be installed.

**SHIPPING ADDRESS:**
[SITE_ADDRESS]
• Tracking Number: [TRACKING_NUMBER]

**RETURN ADDRESS:**
[RETURN_ADDRESS]
• Return Tracking: [RETURN_TRACKING]

Please see the attached notes for more information. If you have any questions or concerns please feel free to reach out to NetOps at netops@oneok.com.

**MAINTENANCE DETAILS:**

• Site: [SITE_NAME]
• Location: [LOCATION]
• Hexagon Ticket: [HEXAGON_NUM]
• ServiceNow Reference: [SERVICENOW_NUM]
• Required Completion: [DATE_DUE]

**EQUIPMENT TO BE REPLACED:**

[DEVICE_COUNT] device(s) will be replaced:

[DEVICE_LIST]

**ACTION REQUIRED:**

• Schedule a maintenance window of at least 4 hours for equipment swap
• Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]
• NetOps will coordinate equipment shipment and installation
• Old equipment will be decommissioned after successful swap

**TIMELINE:**

• Request Submitted: [DATE_SUBMITTED]
• Required Completion: [DATE_DUE]
• Maintenance Window: To be scheduled

[VULNERABILITY_SUMMARY]

Thank you,', default_content = template_content WHERE name = 'email_replacement';"
```

### Step 3: Remove Obsolete default_email Template

```bash
docker exec hextrackr-app sqlite3 /app/data/hextrackr.db "DELETE FROM email_templates WHERE name='default_email';"
```

### Step 4: Verify the Fix

```bash
docker exec hextrackr-app sqlite3 /app/data/hextrackr.db "SELECT name, LENGTH(template_content) as content, LENGTH(default_content) as def FROM email_templates ORDER BY name;"
```

**Expected Output**:
```
email_mitigate|1041|1041
email_replacement|1244|1244
email_upgrade|1081|1081
```

All three templates should have matching `content` and `def` (default_content) lengths.

## Verification Steps

1. Open HexTrackr in browser (https://192.168.1.80 or https://hextrackr.com)
2. Navigate to Tickets page
3. Click "View" on any ticket
4. Click "Email Template" tab
5. Verify the email now shows ALL sections:
   - ✅ Subject line
   - ✅ Hello [GREETING]
   - ✅ Work order details
   - ✅ **MAINTENANCE DETAILS:** (complete with all bullet points)
   - ✅ **AFFECTED SYSTEMS:**
   - ✅ **SOFTWARE VERSIONS:**
   - ✅ **ACTION REQUIRED:**
   - ✅ **TIMELINE:**
   - ✅ **VULNERABILITY SUMMARY:**

## Technical Notes

- **email_mitigate** template was already correct (1041 chars) - no fix needed
- The `default_content` field is updated alongside `template_content` to ensure the "Reset to Default" function works correctly
- These are the templates stored in `/app/data/hextrackr.db` **inside the Docker container**, not the host filesystem
- The fix updates both `template_content` (active template) and `default_content` (reset fallback) to prevent future issues

## What Was Fixed on Dev Server

On the development server (macOS), the following templates were fixed:
1. ✅ `email_upgrade`: 399 → 1081 characters
2. ✅ `email_replacement`: 390 → 1244 characters
3. ✅ Deleted obsolete `default_email` template
4. ✅ Updated all `default_content` fields

Since the RHEL test server database was copied from this database last night, it will have the same truncation issue and needs the same fix applied.

## Prevention

If this happens again in the future:
1. Users can click "Reset to Default" in the Template Editor (Settings → Templates)
2. The `default_content` field now contains the correct full template
3. Consider adding template validation to detect truncation (length < 1000 chars = warning)

## Related Issues

- Linear Issue: [HEX-306](https://linear.app/hextrackr/issue/HEX-306/bug-email-template-missing-middle-portion)
- Similar issue fixed previously: Migration 013 (`fix-truncated-markdown-templates.sql`) for ticket templates
- Root cause: Previous migration or manual edit corrupted the template data
