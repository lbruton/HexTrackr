-- Migration 013: Fix Truncated Markdown Templates (HEX-286)
-- Created: 2025-10-17
-- Purpose: Restore full markdown templates that were truncated during migration 008
-- Bug: Templates cut off at "Tracking: [TRACKIN" instead of full content
-- Root Cause: Migration 008 used SELECT...FROM which propagated truncated data

-- Fix markdown_upgrade template
UPDATE ticket_templates
SET
    template_content = '# Hexagon Work Request

**Ticket Information:**
- Hexagon Ticket #: [HEXAGON_TICKET]
- ServiceNow Ticket #: [SERVICENOW_TICKET]
- XT Number: [XT_NUMBER]
- Site: [SITE_NAME]
- Location: [LOCATION]
- Status: [STATUS]
- Job Type: [JOB_TYPE]

**Overview:**
There are critical security patches that must be applied within 30 days at the [SITE_NAME] site.

**Affected Systems:**
The following [DEVICE_COUNT] device(s) require security patches and will need to be rebooted:

[DEVICE_LIST]

**Software Versions:**

[SOFTWARE_VERSIONS]

**Action Required:**
- Schedule a maintenance window of at least 4 hours
- Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_TICKET]
- Coordinate with NetOps for patch application

**Timeline:**
- Date Submitted: [DATE_SUBMITTED]
- Required Completion Date: [DATE_DUE]
- Maintenance Window: To be scheduled

**Personnel:**
- Supervisor: [SUPERVISOR]
- Technician: [TECHNICIAN]

**Additional Notes:**
[NOTES]

---
Generated: [GENERATED_TIME]',
    default_content = '# Hexagon Work Request

**Ticket Information:**
- Hexagon Ticket #: [HEXAGON_TICKET]
- ServiceNow Ticket #: [SERVICENOW_TICKET]
- XT Number: [XT_NUMBER]
- Site: [SITE_NAME]
- Location: [LOCATION]
- Status: [STATUS]
- Job Type: [JOB_TYPE]

**Overview:**
There are critical security patches that must be applied within 30 days at the [SITE_NAME] site.

**Affected Systems:**
The following [DEVICE_COUNT] device(s) require security patches and will need to be rebooted:

[DEVICE_LIST]

**Software Versions:**

[SOFTWARE_VERSIONS]

**Action Required:**
- Schedule a maintenance window of at least 4 hours
- Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_TICKET]
- Coordinate with NetOps for patch application

**Timeline:**
- Date Submitted: [DATE_SUBMITTED]
- Required Completion Date: [DATE_DUE]
- Maintenance Window: To be scheduled

**Personnel:**
- Supervisor: [SUPERVISOR]
- Technician: [TECHNICIAN]

**Additional Notes:**
[NOTES]

---
Generated: [GENERATED_TIME]',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'markdown_upgrade';

-- Fix markdown_replacement template (HEX-286 - THIS WAS TRUNCATED)
UPDATE ticket_templates
SET
    template_content = '# Hexagon Work Request

**Ticket Information:**
- Hexagon Ticket #: [HEXAGON_TICKET]
- ServiceNow Ticket #: [SERVICENOW_TICKET]
- XT Number: [XT_NUMBER]
- Site: [SITE_NAME]
- Location: [LOCATION]
- Status: [STATUS]
- Job Type: [JOB_TYPE]

**Overview:**
Replacement equipment is being shipped for installation at the [SITE_NAME] site.

**Shipping Address:**
[SITE_ADDRESS]
- Tracking: [TRACKING_NUMBER]

**Return Address:**
[RETURN_ADDRESS]
- Return Tracking: [RETURN_TRACKING]

**Equipment to be Replaced:**
The following [DEVICE_COUNT] device(s) will be replaced:

[DEVICE_LIST]

**Action Required:**
- Schedule a maintenance window of at least 4 hours for equipment swap
- Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_TICKET]
- Coordinate with NetOps for equipment shipment and installation
- Old equipment will be decommissioned after successful swap

**Timeline:**
- Date Submitted: [DATE_SUBMITTED]
- Required Completion Date: [DATE_DUE]
- Maintenance Window: To be scheduled

**Personnel:**
- Supervisor: [SUPERVISOR]
- Technician: [TECHNICIAN]

**Additional Notes:**
[NOTES]

---
Generated: [GENERATED_TIME]',
    default_content = '# Hexagon Work Request

**Ticket Information:**
- Hexagon Ticket #: [HEXAGON_TICKET]
- ServiceNow Ticket #: [SERVICENOW_TICKET]
- XT Number: [XT_NUMBER]
- Site: [SITE_NAME]
- Location: [LOCATION]
- Status: [STATUS]
- Job Type: [JOB_TYPE]

**Overview:**
Replacement equipment is being shipped for installation at the [SITE_NAME] site.

**Shipping Address:**
[SITE_ADDRESS]
- Tracking: [TRACKING_NUMBER]

**Return Address:**
[RETURN_ADDRESS]
- Return Tracking: [RETURN_TRACKING]

**Equipment to be Replaced:**
The following [DEVICE_COUNT] device(s) will be replaced:

[DEVICE_LIST]

**Action Required:**
- Schedule a maintenance window of at least 4 hours for equipment swap
- Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_TICKET]
- Coordinate with NetOps for equipment shipment and installation
- Old equipment will be decommissioned after successful swap

**Timeline:**
- Date Submitted: [DATE_SUBMITTED]
- Required Completion Date: [DATE_DUE]
- Maintenance Window: To be scheduled

**Personnel:**
- Supervisor: [SUPERVISOR]
- Technician: [TECHNICIAN]

**Additional Notes:**
[NOTES]

---
Generated: [GENERATED_TIME]',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'markdown_replacement';

-- Fix markdown_mitigate template
UPDATE ticket_templates
SET
    template_content = '# Hexagon Work Request

**Ticket Information:**
- Hexagon Ticket #: [HEXAGON_TICKET]
- ServiceNow Ticket #: [SERVICENOW_TICKET]
- XT Number: [XT_NUMBER]
- Site: [SITE_NAME]
- Location: [LOCATION]
- Status: [STATUS]
- Job Type: [JOB_TYPE]

**Overview:**
**⚠️ EMERGENCY:** Critical vulnerabilities have been identified at the [SITE_NAME] site that require immediate mitigation.

Emergency mitigation has been applied to address these actively exploited vulnerabilities.

**Affected Systems:**
The following [DEVICE_COUNT] device(s) require security patches and will need to be rebooted:

[DEVICE_LIST]

**Mitigation Applied:**

[MITIGATION_DETAILS]

No scheduled maintenance required - emergency mitigation has been completed.

**Timeline:**
- Date Submitted: [DATE_SUBMITTED]
- Required Completion Date: [DATE_DUE]

**Personnel:**
- Supervisor: [SUPERVISOR]
- Technician: [TECHNICIAN]

**Additional Notes:**
[NOTES]

---
Generated: [GENERATED_TIME]',
    default_content = '# Hexagon Work Request

**Ticket Information:**
- Hexagon Ticket #: [HEXAGON_TICKET]
- ServiceNow Ticket #: [SERVICENOW_TICKET]
- XT Number: [XT_NUMBER]
- Site: [SITE_NAME]
- Location: [LOCATION]
- Status: [STATUS]
- Job Type: [JOB_TYPE]

**Overview:**
**⚠️ EMERGENCY:** Critical vulnerabilities have been identified at the [SITE_NAME] site that require immediate mitigation.

Emergency mitigation has been applied to address these actively exploited vulnerabilities.

**Affected Systems:**
The following [DEVICE_COUNT] device(s) require security patches and will need to be rebooted:

[DEVICE_LIST]

**Mitigation Applied:**

[MITIGATION_DETAILS]

No scheduled maintenance required - emergency mitigation has been completed.

**Timeline:**
- Date Submitted: [DATE_SUBMITTED]
- Required Completion Date: [DATE_DUE]

**Personnel:**
- Supervisor: [SUPERVISOR]
- Technician: [TECHNICIAN]

**Additional Notes:**
[NOTES]

---
Generated: [GENERATED_TIME]',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'markdown_mitigate';

-- Verification
SELECT
    name,
    LENGTH(template_content) as template_len,
    LENGTH(default_content) as default_len,
    SUBSTR(template_content, 200, 50) as content_sample
FROM ticket_templates
WHERE name LIKE 'markdown_%'
ORDER BY name;
