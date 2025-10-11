-- Migration 008: Create Job Type Template Variants
-- Created: 2025-10-10
-- Purpose: Split default templates into job type variants (upgrade, replacement, mitigate)
-- Related: HEX-203 (Job Type Feature Completion)

-- ============================================================================
-- PART 1: EMAIL TEMPLATES
-- ============================================================================

-- Step 1: Rename default_email → email_upgrade (preserves user customizations)
UPDATE email_templates
SET name = 'email_upgrade',
    description = 'Email template for Upgrade job type (patch-only maintenance)',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'default_email';

-- Step 2: Create email_replacement template (for Replace + Refresh job types)
INSERT INTO email_templates (name, description, template_content, default_content, variables, category, is_active)
SELECT
    'email_replacement' as name,
    'Email template for Replace/Refresh job types (equipment swap)' as description,
    REPLACE(
        REPLACE(
            template_content,
            'There are critical security patches that must be applied within 30 days.',
            'We are shipping replacement equipment that needs to be installed.'
        ),
        '• Schedule a maintenance window of at least 4 hours
• Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]
• Coordinate with NetOps for patch application',
        '• Schedule a maintenance window of at least 4 hours for equipment swap
• Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]
• NetOps will coordinate equipment shipment and installation
• Old equipment will be decommissioned after successful swap'
    ) as template_content,
    REPLACE(
        REPLACE(
            default_content,
            'There are critical security patches that must be applied within 30 days.',
            'We are shipping replacement equipment that needs to be installed.'
        ),
        '• Schedule a maintenance window of at least 4 hours
• Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]
• Coordinate with NetOps for patch application',
        '• Schedule a maintenance window of at least 4 hours for equipment swap
• Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]
• NetOps will coordinate equipment shipment and installation
• Old equipment will be decommissioned after successful swap'
    ) as default_content,
    variables,
    category,
    is_active
FROM email_templates
WHERE name = 'email_upgrade';

-- Step 3: Create email_mitigate template (for Mitigate job type - KEV focus)
INSERT INTO email_templates (name, description, template_content, default_content, variables, category, is_active)
SELECT
    'email_mitigate' as name,
    'Email template for Mitigate job type (KEV emergency patching)' as description,
    REPLACE(
        REPLACE(
            REPLACE(
                template_content,
                'There are critical security patches that must be applied within 30 days.',
                'Critical vulnerabilities have been identified that require immediate mitigation.

**URGENCY:** These vulnerabilities may be actively exploited in the wild and require emergency patching.'
            ),
            '• Schedule a maintenance window of at least 4 hours',
            '• Schedule an EMERGENCY maintenance window of at least 4 hours'
        ),
        '• Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]',
        '• Contact ITCC IMMEDIATELY at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]'
    ) as template_content,
    REPLACE(
        REPLACE(
            REPLACE(
                default_content,
                'There are critical security patches that must be applied within 30 days.',
                'Critical vulnerabilities have been identified that require immediate mitigation.

**URGENCY:** These vulnerabilities may be actively exploited in the wild and require emergency patching.'
            ),
            '• Schedule a maintenance window of at least 4 hours',
            '• Schedule an EMERGENCY maintenance window of at least 4 hours'
        ),
        '• Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]',
        '• Contact ITCC IMMEDIATELY at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]'
    ) as default_content,
    variables,
    category,
    is_active
FROM email_templates
WHERE name = 'email_upgrade';

-- ============================================================================
-- PART 2: TICKET TEMPLATES (MARKDOWN)
-- ============================================================================

-- Step 1: Rename default_ticket → markdown_upgrade
UPDATE ticket_templates
SET name = 'markdown_upgrade',
    description = 'Markdown template for Upgrade job type (patch-only maintenance)',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'default_ticket';

-- Step 2: Create markdown_replacement template
INSERT INTO ticket_templates (name, description, template_content, default_content, variables, category, is_active)
SELECT
    'markdown_replacement' as name,
    'Markdown template for Replace/Refresh job types (equipment swap)' as description,
    REPLACE(
        REPLACE(
            template_content,
            '**Overview:**
There are critical security patches that must be applied within 30 days at the [SITE_NAME] site.',
            '**Overview:**
Replacement equipment is being shipped for installation at the [SITE_NAME] site.'
        ),
        '**Action Required:**
- Schedule a maintenance window of at least 4 hours
- Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_TICKET]
- Coordinate with NetOps for patch application',
        '**Action Required:**
- Schedule a maintenance window of at least 4 hours for equipment swap
- Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_TICKET]
- Coordinate with NetOps for equipment shipment and installation
- Old equipment will be decommissioned after successful swap'
    ) as template_content,
    REPLACE(
        REPLACE(
            default_content,
            '**Overview:**
There are critical security patches that must be applied within 30 days at the [SITE_NAME] site.',
            '**Overview:**
Replacement equipment is being shipped for installation at the [SITE_NAME] site.'
        ),
        '**Action Required:**
- Schedule a maintenance window of at least 4 hours
- Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_TICKET]
- Coordinate with NetOps for patch application',
        '**Action Required:**
- Schedule a maintenance window of at least 4 hours for equipment swap
- Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_TICKET]
- Coordinate with NetOps for equipment shipment and installation
- Old equipment will be decommissioned after successful swap'
    ) as default_content,
    variables,
    category,
    is_active
FROM ticket_templates
WHERE name = 'markdown_upgrade';

-- Step 3: Create markdown_mitigate template
INSERT INTO ticket_templates (name, description, template_content, default_content, variables, category, is_active)
SELECT
    'markdown_mitigate' as name,
    'Markdown template for Mitigate job type (KEV emergency patching)' as description,
    REPLACE(
        REPLACE(
            REPLACE(
                template_content,
                '**Overview:**
There are critical security patches that must be applied within 30 days at the [SITE_NAME] site.',
                '**Overview:**
**⚠️ EMERGENCY:** Critical vulnerabilities have been identified at the [SITE_NAME] site that require immediate mitigation.

These vulnerabilities may be actively exploited in the wild and require urgent security patching.'
            ),
            '- Schedule a maintenance window of at least 4 hours',
            '- Schedule an EMERGENCY maintenance window of at least 4 hours'
        ),
        '- Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_TICKET]',
        '- Contact ITCC IMMEDIATELY at 918-732-4822 with ServiceNow ticket [SERVICENOW_TICKET]'
    ) as template_content,
    REPLACE(
        REPLACE(
            REPLACE(
                default_content,
                '**Overview:**
There are critical security patches that must be applied within 30 days at the [SITE_NAME] site.',
                '**Overview:**
**⚠️ EMERGENCY:** Critical vulnerabilities have been identified at the [SITE_NAME] site that require immediate mitigation.

These vulnerabilities may be actively exploited in the wild and require urgent security patching.'
            ),
            '- Schedule a maintenance window of at least 4 hours',
            '- Schedule an EMERGENCY maintenance window of at least 4 hours'
        ),
        '- Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_TICKET]',
        '- Contact ITCC IMMEDIATELY at 918-732-4822 with ServiceNow ticket [SERVICENOW_TICKET]'
    ) as default_content,
    variables,
    category,
    is_active
FROM ticket_templates
WHERE name = 'markdown_upgrade';

-- ============================================================================
-- VERIFICATION QUERIES (comment out for production)
-- ============================================================================

-- Verify email templates
-- SELECT name, description, LENGTH(template_content) as len FROM email_templates ORDER BY name;

-- Verify ticket templates
-- SELECT name, description, LENGTH(template_content) as len FROM ticket_templates ORDER BY name;
