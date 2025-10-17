/**
 * Template Seeder Utilities
 * Seeds email, ticket, and vulnerability template tables with job type variants.
 * Part of v1.0.57 Job Type Feature (HEX-203).
 *
 * @module SeedTemplates
 * @version 1.0.57
 */

/**
 * Email Template Variants (Upgrade, Replacement, Mitigate)
 */
const emailUpgradeTemplate = `Subject: Hexagon Work Order - [SITE_NAME] - [HEXAGON_NUM]

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

Thank you,`;

const emailReplacementTemplate = `Subject: Hexagon Work Order - [SITE_NAME] - [HEXAGON_NUM]

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

Thank you,`;

const emailMitigateTemplate = `Subject: Hexagon Work Order - [SITE_NAME] - [HEXAGON_NUM]

Hello [GREETING],

We have submitted a Hexagon work order ([HEXAGON_NUM]) for the [SITE_NAME] site.

Critical vulnerabilities have been identified that require immediate mitigation.

**URGENCY:** Emergency mitigation has been applied to address these vulnerabilities.

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

**ACTION REQUIRED:**

**MITIGATION APPLIED:**

[MITIGATION_DETAILS]

No scheduled maintenance window required - mitigation has been applied.

**TIMELINE:**

• Request Submitted: [DATE_SUBMITTED]
• Required Completion: [DATE_DUE]

[VULNERABILITY_SUMMARY]

Thank you,`;

/**
 * Ticket Markdown Template Variants (Upgrade, Replacement, Mitigate)
 */
const markdownUpgradeTemplate = `# Hexagon Work Request

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
Generated: [GENERATED_TIME]`;

const markdownReplacementTemplate = `# Hexagon Work Request

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
Generated: [GENERATED_TIME]`;

const markdownMitigateTemplate = `# Hexagon Work Request

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
Generated: [GENERATED_TIME]`;

/**
 * Vulnerability Template (shared across all job types)
 */
const defaultVulnerabilityTemplate = `# Vulnerability Report for [LOCATION]

**XT#:** [XT_NUMBER]
**Hexagon#:** [HEXAGON_TICKET]
**ServiceNow#:** [SERVICENOW_TICKET]

Generated: [GENERATED_TIME]

## Summary

**Total Vulnerabilities:** [TOTAL_VULNERABILITIES]
- **Critical:** [CRITICAL_COUNT]
- **High:** [HIGH_COUNT]
- **Medium:** [MEDIUM_COUNT]
- **Low:** [LOW_COUNT]

**Devices Affected:** [DEVICE_COUNT]

## Vulnerability Details

[VULNERABILITY_DETAILS]

---

**Report End**

*This report was generated automatically from vulnerability scan data. Please review all findings and coordinate with the security team for remediation planning.*`;

const emailTemplateVariables = [
    { name: "[GREETING]", description: "Supervisor first name or 'Team'", required: false, fallback: "[Supervisor First Name]" },
    { name: "[SITE_NAME]", description: "Site name from ticket", required: true, fallback: "[Site Name]" },
    { name: "[LOCATION]", description: "Location from ticket", required: true, fallback: "[Location]" },
    { name: "[HEXAGON_NUM]", description: "Hexagon ticket number", required: false, fallback: "[Hexagon #]" },
    { name: "[SERVICENOW_NUM]", description: "ServiceNow ticket number", required: false, fallback: "[ServiceNow #]" },
    { name: "[XT_NUMBER]", description: "Internal XT number", required: true, fallback: "XT#[ID]" },
    { name: "[DEVICE_COUNT]", description: "Number of devices", required: true, fallback: "0" },
    { name: "[DEVICE_LIST]", description: "Enumerated device list", required: true, fallback: "Device list to be confirmed" },
    { name: "[DATE_DUE]", description: "Due date formatted", required: true, fallback: "[Due Date]" },
    { name: "[DATE_SUBMITTED]", description: "Submission date formatted", required: true, fallback: "[Submitted Date]" },
    { name: "[VULNERABILITY_SUMMARY]", description: "Runtime vulnerability summary", required: false, fallback: "" },
    { name: "[SITE_ADDRESS]", description: "Physical shipping address", required: false, fallback: "[SITE ADDRESS - TBD]" },
    { name: "[RETURN_ADDRESS]", description: "Return shipping address", required: false, fallback: "[RETURN ADDRESS - TBD]" },
    { name: "[TRACKING_NUMBER]", description: "Shipping tracking number", required: false, fallback: "[TRACKING NUMBER - TBD]" },
    { name: "[SOFTWARE_VERSIONS]", description: "Software versions for upgrade", required: false, fallback: "N/A" },
    { name: "[MITIGATION_DETAILS]", description: "Mitigation details", required: false, fallback: "[MITIGATION DETAILS - TBD]" }
];

const ticketTemplateVariables = [
    { name: "[HEXAGON_TICKET]", description: "Hexagon ticket number", required: false, fallback: "[Hexagon Ticket]" },
    { name: "[SERVICENOW_TICKET]", description: "ServiceNow ticket number", required: false, fallback: "[ServiceNow Ticket]" },
    { name: "[XT_NUMBER]", description: "Internal XT number", required: true, fallback: "XT#[ID]" },
    { name: "[SITE_NAME]", description: "Site name", required: true, fallback: "[Site]" },
    { name: "[LOCATION]", description: "Location name", required: true, fallback: "[Location]" },
    { name: "[STATUS]", description: "Ticket status", required: true, fallback: "[Status]" },
    { name: "[JOB_TYPE]", description: "Job type", required: false, fallback: "Upgrade" },
    { name: "[DATE_SUBMITTED]", description: "Submission date", required: true, fallback: "[Date Submitted]" },
    { name: "[DATE_DUE]", description: "Due date", required: true, fallback: "[Due Date]" },
    { name: "[DEVICE_LIST]", description: "Formatted device list", required: true, fallback: "Device list to be confirmed" },
    { name: "[DEVICE_COUNT]", description: "Device count", required: true, fallback: "0" },
    { name: "[SUPERVISOR]", description: "Supervisor name", required: false, fallback: "[Supervisor]" },
    { name: "[TECHNICIAN]", description: "Technician name", required: false, fallback: "[Technician]" },
    { name: "[NOTES]", description: "Additional notes", required: false, fallback: "N/A" },
    { name: "[GENERATED_TIME]", description: "Generation timestamp", required: false, fallback: "[Generated Timestamp]" },
    { name: "[GREETING]", description: "Supervisor greeting", required: false, fallback: "Team" },
    { name: "[VULNERABILITY_SUMMARY]", description: "Vulnerability summary section", required: false, fallback: "" },
    { name: "[SITE_ADDRESS]", description: "Physical shipping address", required: false, fallback: "[SITE ADDRESS - TBD]" },
    { name: "[RETURN_ADDRESS]", description: "Return shipping address", required: false, fallback: "[RETURN ADDRESS - TBD]" },
    { name: "[TRACKING_NUMBER]", description: "Shipping tracking number", required: false, fallback: "[TRACKING NUMBER - TBD]" },
    { name: "[SOFTWARE_VERSIONS]", description: "Software versions for upgrade", required: false, fallback: "N/A" },
    { name: "[MITIGATION_DETAILS]", description: "Mitigation details", required: false, fallback: "[MITIGATION DETAILS - TBD]" }
];

const vulnerabilityTemplateVariables = [
    { name: "[LOCATION]", description: "Location or site name", required: true, fallback: "[Location]" },
    { name: "[XT_NUMBER]", description: "Internal XT number", required: true, fallback: "XT#[ID]" },
    { name: "[HEXAGON_TICKET]", description: "Hexagon ticket number", required: false, fallback: "[Hexagon Ticket]" },
    { name: "[SERVICENOW_TICKET]", description: "ServiceNow ticket number", required: false, fallback: "[ServiceNow Ticket]" },
    { name: "[GENERATED_TIME]", description: "Report timestamp", required: false, fallback: "[Generated Timestamp]" },
    { name: "[VULNERABILITY_DETAILS]", description: "Per-device vulnerability details", required: true, fallback: "No vulnerability data available." },
    { name: "[TOTAL_VULNERABILITIES]", description: "Total vulnerability count", required: false, fallback: "0" },
    { name: "[CRITICAL_COUNT]", description: "Critical vulnerability count", required: false, fallback: "0" },
    { name: "[HIGH_COUNT]", description: "High vulnerability count", required: false, fallback: "0" },
    { name: "[MEDIUM_COUNT]", description: "Medium vulnerability count", required: false, fallback: "0" },
    { name: "[LOW_COUNT]", description: "Low vulnerability count", required: false, fallback: "0" },
    { name: "[DEVICE_COUNT]", description: "Devices with vulnerabilities", required: false, fallback: "0" }
];

/**
 * Template signature detection for content validation
 */
const templateSignatures = {
    email: ["Subject: Hexagon Work Order", "[DEVICE_LIST]"],
    ticket: ["# Hexagon Work Request", "Generated:"],
    vulnerability: ["# Vulnerability Report", "[VULNERABILITY_DETAILS]", "[TOTAL_VULNERABILITIES]"]
};

function contentLooksMismatched(content, category) {
    if (!content) {
        return true;
    }

    const normalizedCategory = (category || "").toLowerCase();
    const expectedTokens = templateSignatures[normalizedCategory] || [];
    const foreignTokens = Object.entries(templateSignatures)
        .filter(([key]) => key !== normalizedCategory)
        .flatMap(([, tokens]) => tokens);

    const containsExpected = expectedTokens.some(token => content.includes(token));
    const containsForeign = foreignTokens.some(token => content.includes(token));

    if (containsForeign) {
        return true;
    }

    if (!containsExpected) {
        return content.trim().length === 0;
    }

    return false;
}

async function seedTemplate(db, { table, name, description, defaultContent, variables, category }) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT id, template_content, default_content, category FROM ${table} WHERE name = ?`,
            [name],
            (err, row) => {
                if (err) {
                    return reject(new Error(`Failed to check existing ${table} templates: ${err.message}`));
                }

                if (row) {
                    console.log(` Template '${name}' already exists in ${table}`);
                    return resolve();
                }

                const insertSql = `
                    INSERT INTO ${table} (
                        name,
                        description,
                        template_content,
                        default_content,
                        variables,
                        category,
                        is_active
                    ) VALUES (?, ?, ?, ?, ?, ?, 1)
                `;

                db.run(
                    insertSql,
                    [
                        name,
                        description,
                        defaultContent,
                        defaultContent,
                        JSON.stringify(variables),
                        category
                    ],
                    function(insertErr) {
                        if (insertErr) {
                            return reject(new Error(`Failed to insert template '${name}': ${insertErr.message}`));
                        }

                        console.log(` Seeded template '${name}' (ID: ${this.lastID}) in ${table}`);
                        resolve();
                    }
                );
            }
        );
    });
}

async function seedEmailTemplates(db) {
    await seedTemplate(db, {
        table: "email_templates",
        name: "email_upgrade",
        description: "Email template for Upgrade job type (patch-only maintenance)",
        defaultContent: emailUpgradeTemplate,
        variables: emailTemplateVariables,
        category: "email"
    });

    await seedTemplate(db, {
        table: "email_templates",
        name: "email_replacement",
        description: "Email template for Replace/Refresh job types (equipment swap)",
        defaultContent: emailReplacementTemplate,
        variables: emailTemplateVariables,
        category: "email"
    });

    await seedTemplate(db, {
        table: "email_templates",
        name: "email_mitigate",
        description: "Email template for Mitigate job type (KEV emergency patching)",
        defaultContent: emailMitigateTemplate,
        variables: emailTemplateVariables,
        category: "email"
    });
}

async function seedTicketTemplates(db) {
    await seedTemplate(db, {
        table: "ticket_templates",
        name: "markdown_upgrade",
        description: "Markdown template for Upgrade job type (patch-only maintenance)",
        defaultContent: markdownUpgradeTemplate,
        variables: ticketTemplateVariables,
        category: "ticket"
    });

    await seedTemplate(db, {
        table: "ticket_templates",
        name: "markdown_replacement",
        description: "Markdown template for Replace/Refresh job types (equipment swap)",
        defaultContent: markdownReplacementTemplate,
        variables: ticketTemplateVariables,
        category: "ticket"
    });

    await seedTemplate(db, {
        table: "ticket_templates",
        name: "markdown_mitigate",
        description: "Markdown template for Mitigate job type (KEV emergency patching)",
        defaultContent: markdownMitigateTemplate,
        variables: ticketTemplateVariables,
        category: "ticket"
    });
}

async function seedVulnerabilityTemplates(db) {
    await seedTemplate(db, {
        table: "vulnerability_templates",
        name: "default_vulnerability",
        description: "Default vulnerability report template",
        defaultContent: defaultVulnerabilityTemplate,
        variables: vulnerabilityTemplateVariables,
        category: "vulnerability"
    });
}

async function seedAllTemplates(db) {
    await seedEmailTemplates(db);
    await seedTicketTemplates(db);
    await seedVulnerabilityTemplates(db);
}

/**
 * Reset template to default
 * @param {sqlite3.Database} db - Database connection
 * @param {string} table - Table name (email_templates, ticket_templates, vulnerability_templates)
 * @param {string} templateName - Template name to reset
 * @returns {Promise<void>}
 */
async function resetTemplateToDefault(db, table, templateName) {
    return new Promise((resolve, reject) => {
        const updateSql = `
            UPDATE ${table}
            SET template_content = default_content,
                updated_at = CURRENT_TIMESTAMP
            WHERE name = ?
        `;

        db.run(updateSql, [templateName], function(err) {
            if (err) {
                return reject(new Error("Failed to reset template: " + err.message));
            }

            if (this.changes === 0) {
                console.log("No template found to reset");
            } else {
                console.log(` Template '${templateName}' reset to default`);
            }

            resolve();
        });
    });
}

module.exports = {
    seedEmailTemplates,
    seedTicketTemplates,
    seedVulnerabilityTemplates,
    seedAllTemplates,
    resetTemplateToDefault,
    emailUpgradeTemplate,
    emailReplacementTemplate,
    emailMitigateTemplate,
    markdownUpgradeTemplate,
    markdownReplacementTemplate,
    markdownMitigateTemplate,
    defaultVulnerabilityTemplate,
    emailTemplateVariables,
    ticketTemplateVariables,
    vulnerabilityTemplateVariables,
    contentLooksMismatched
};
