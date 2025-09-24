/**
 * HexTrackr Helper Functions
 * Standalone utility functions extracted from server.js for better modularity
 */

const crypto = require("crypto");
const PathValidator = require("./PathValidator");
const path = require("path");

// =============================================================================
// DATA NORMALIZATION HELPERS
// =============================================================================

/**
 * Normalize hostname for consistent deduplication
 * Handles IP addresses vs domain names appropriately
 * @param {string} hostname - Raw hostname from CSV
 * @returns {string} Normalized hostname
 */
function normalizeHostname(hostname) {
    if (!hostname) {
        return "";
    }

    const cleanHostname = hostname.trim();

    // Check if hostname is a valid IP address (x.x.x.x pattern with valid octets)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(cleanHostname)) {
        // Validate that all octets are between 0-255
        const octets = cleanHostname.split(".").map(Number);
        const isValidIP = octets.every(octet => octet >= 0 && octet <= 255);

        if (isValidIP) {
            // For valid IP addresses, return the full IP - don't split on periods
            return cleanHostname.toLowerCase();
        }
    }

    // For domain names or invalid IPs, remove everything after first period to handle domain variations
    // Examples: nwan10.mmplp.net -> nwan10, nswan10 -> nswan10, 300.300.300.300 -> 300
    return cleanHostname.split(".")[0].toLowerCase();
}

/**
 * Normalize vendor names for consistent categorization
 * @param {string} vendor - Raw vendor name
 * @returns {string} Normalized vendor name
 */
function normalizeVendor(vendor) {
    if (!vendor) {
        return "Other";
    }

    const cleanVendor = vendor.trim().toLowerCase();

    if (cleanVendor.includes("cisco")) {
        return "CISCO";
    } else if (cleanVendor.includes("palo alto")) {
        return "Palo Alto";
    } else {
        return "Other";
    }
}

/**
 * Normalize IP address, handling multiple IPs and validation
 * @param {string} ipAddress - Raw IP address string (may contain multiple IPs)
 * @returns {string|null} First valid IP address or null
 */
function normalizeIPAddress(ipAddress) {
    if (!ipAddress) {return null;}

    // Handle multiple IPs (take first valid one)
    const ips = ipAddress.split(",").map(ip => ip.trim());
    for (const ip of ips) {
        if (isValidIPAddress(ip)) {
            return ip.toLowerCase();
        }
    }
    return null;
}

/**
 * Validate if a string is a valid IP address
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if valid IP address
 */
function isValidIPAddress(ip) {
    if (!ip) {return false;}

    // Check if IP address is valid (x.x.x.x pattern with valid octets)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {return false;}

    // Validate that all octets are between 0-255
    const octets = ip.split(".").map(Number);
    return octets.every(octet => octet >= 0 && octet <= 255);
}

// =============================================================================
// STRING AND HASHING HELPERS
// =============================================================================

/**
 * Create a stable hash from description text for deduplication
 * @param {string} description - Description text to hash
 * @returns {string} Short hash string
 */
function createDescriptionHash(description) {
    if (!description) {return "empty";}

    // Create stable hash from description (first 50 chars, normalized)
    const normalized = description.trim().toLowerCase()
        .replace(/\s+/g, " ")
        .substring(0, 50);

    // Simple hash function using crypto if available
    try {
        return crypto.createHash("md5").update(normalized).digest("hex").substring(0, 8);
    } catch (_e) {
        // Fallback hash function if crypto not available
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            const char = normalized.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
}

/**
 * Extract scan date from filename using various patterns
 * @param {string} filename - The CSV filename
 * @returns {string|null} Date in YYYY-MM-DD format or null if no pattern matches
 */
function extractScanDateFromFilename(filename) {
    if (!filename) {return null;}

    const currentYear = new Date().getFullYear();

    // Pattern 1: Month abbreviations (aug28, sept01, etc.)
    const monthAbbrMatch = filename.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)(\d{1,2})/i);
    if (monthAbbrMatch) {
        const monthMap = {
            "jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06",
            "jul": "07", "aug": "08", "sep": "09", "sept": "09", "oct": "10", "nov": "11", "dec": "12"
        };
        const month = monthMap[monthAbbrMatch[1].toLowerCase()];
        const day = monthAbbrMatch[2].padStart(2, "0");
        return `${currentYear}-${month}-${day}`;
    }

    // Pattern 2: MM_DD_YYYY or MM-DD-YYYY format
    const numericDateMatch = filename.match(/(\d{1,2})[_-](\d{1,2})[_-](\d{4})/);
    if (numericDateMatch) {
        const month = numericDateMatch[1].padStart(2, "0");
        const day = numericDateMatch[2].padStart(2, "0");
        const year = numericDateMatch[3];
        return `${year}-${month}-${day}`;
    }

    // Pattern 3: YYYY-MM-DD format
    const isoDateMatch = filename.match(/(\d{4})[_-](\d{1,2})[_-](\d{1,2})/);
    if (isoDateMatch) {
        const year = isoDateMatch[1];
        const month = isoDateMatch[2].padStart(2, "0");
        const day = isoDateMatch[3].padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    // Pattern 4: Just day number (assume current month/year)
    const dayOnlyMatch = filename.match(/(\d{1,2})[^\d]/);
    if (dayOnlyMatch) {
        const day = dayOnlyMatch[1].padStart(2, "0");
        const month = String(new Date().getMonth() + 1).padStart(2, "0");
        return `${currentYear}-${month}-${day}`;
    }

    return null; // No date pattern found
}

// =============================================================================
// DEDUPLICATION HELPERS
// =============================================================================

/**
 * Calculate confidence level for deduplication based on unique key type
 * @param {string} uniqueKey - The unique key to analyze
 * @returns {number} Confidence percentage (0-100)
 */
function calculateDeduplicationConfidence(uniqueKey) {
    if (uniqueKey.startsWith("asset:")) {return 95;} // Highest confidence
    if (uniqueKey.startsWith("cve:")) {return 85;}   // High confidence
    if (uniqueKey.startsWith("plugin:")) {return 70;} // Medium confidence
    if (uniqueKey.startsWith("desc:")) {return 50;}   // Low confidence
    return 25; // Very low confidence
}

/**
 * Get deduplication tier (1-5) based on unique key reliability
 * @param {string} uniqueKey - The unique key to analyze
 * @returns {number} Tier number (1 = most stable, 5 = least stable)
 */
function getDeduplicationTier(uniqueKey) {
    if (uniqueKey.startsWith("asset:")) {return 1;} // Most stable
    if (uniqueKey.startsWith("cve:")) {return 2;}   // High reliability
    if (uniqueKey.startsWith("plugin:")) {return 3;} // Medium reliability
    if (uniqueKey.startsWith("desc:")) {return 4;}   // Least reliable
    return 5; // Unknown/legacy
}

/**
 * Generate enhanced multi-tier unique key for vulnerability deduplication
 * @param {object} mapped - Mapped vulnerability data object
 * @returns {string} Enhanced unique key with tier prefix
 */
function generateEnhancedUniqueKey(mapped) {
    const normalizedHostname = normalizeHostname(mapped.hostname);
    const normalizedIP = normalizeIPAddress(mapped.ipAddress);

    // Tier 1: Asset ID + Plugin ID (most stable)
    if (mapped.assetId && mapped.pluginId) {
        return `asset:${mapped.assetId}|plugin:${mapped.pluginId}`;
    }

    // Tier 2: CVE + Hostname/IP (CVE-based when available)
    if (mapped.cve && mapped.cve.trim()) {
        const hostIdentifier = normalizedIP || normalizedHostname;
        return `cve:${mapped.cve.trim()}|host:${hostIdentifier}`;
    }

    // Tier 3: Plugin ID + Hostname/IP + Vendor (USER'S REQUESTED APPROACH)
    if (mapped.pluginId && mapped.pluginId.trim()) {
        const hostIdentifier = normalizedIP || normalizedHostname;
        const vendor = mapped.vendor || "unknown";
        return `plugin:${mapped.pluginId.trim()}|host:${hostIdentifier}|vendor:${vendor}`;
    }

    // Tier 4: Description hash + Hostname/IP (fallback)
    const descriptionHash = createDescriptionHash(mapped.description);
    const hostIdentifier = normalizedIP || normalizedHostname;
    return `desc:${descriptionHash}|host:${hostIdentifier}`;
}

/**
 * Legacy function maintained for backward compatibility during transition
 * @param {object} mapped - Mapped vulnerability data object
 * @returns {string} Legacy unique key format
 */
function generateUniqueKey(mapped) {
    // Create unique key with normalized hostname to handle domain variations
    const normalizedHostname = normalizeHostname(mapped.hostname);

    // Prefer CVE when available for better deduplication
    if (mapped.cve && mapped.cve.trim()) {
        return `${normalizedHostname}|${mapped.cve.trim()}`;
    }

    // Fallback to plugin_id + description for vulnerabilities without CVE
    if (mapped.pluginId && mapped.pluginId.trim()) {
        return `${normalizedHostname}|${mapped.pluginId.trim()}|${(mapped.description || "").trim().substring(0, 100)}`;
    }

    // Final fallback using hostname + description hash
    const descriptionHash = createDescriptionHash(mapped.description);
    return `${normalizedHostname}|${descriptionHash}`;
}

// =============================================================================
// CSV DATA MAPPING HELPERS
// =============================================================================

/**
 * Map a raw CSV row to one or more normalized vulnerability objects.
 *
 * The mapper performs the following normalization so downstream import services can
 * operate without reaching back into the raw CSV payload:
 * - Normalizes hostnames/IPs and preserves vendor / plugin metadata.
 * - Parses VPR/CVSS values once and emits them as `vprScore`/`cvssScore` (with a
 *   legacy `vpr` alias for older call sites).
 * - Splits rows that contain multiple CVEs into one record per CVE while keeping
 *   the descriptive context aligned with each CVE.
 *
 * @param {Object} row Raw CSV row data (Tenable export format).
 * @returns {Object[]} Array of mapped vulnerability objects (1..n per source row).
 */
function mapVulnerabilityRow(row) {
    // CVE extraction logic - try direct field first, then extract from name
    let cve = row["definition.cve"] || row["cve"] || row["CVE"] || "";
    if (!cve && row["definition.name"]) {
        const cveMatch = row["definition.name"].match(/(CVE-\d{4}-\d+)/);
        cve = cveMatch ? cveMatch[1] : "";

        // Also try extracting Cisco vulnerability IDs from parentheses
        if (!cve) {
            const ciscoMatch = row["definition.name"].match(/\(([^)]+)\)$/);
            cve = ciscoMatch ? ciscoMatch[1] : "";
        }
    }

    // Enhanced hostname processing with normalization
    let hostname = row["asset.name"] || row["hostname"] || row["Host"] || "";
    hostname = normalizeHostname(hostname);

    // Enhanced IP address handling for multiple formats
    let ipAddress = row["asset.display_ipv4_address"] || row["asset.ipv4_addresses"] || row["ip_address"] || row["IP Address"] || "";
    if (ipAddress && ipAddress.includes(",")) {
        const ips = ipAddress.split(",").map(ip => ip.trim());
        ipAddress = ips[0];
    }

    // Prefer Tenable description, fallback to plugin name/description fields
    const description = row["definition.description"] || row["definition.name"] || row["plugin_name"] || row["description"] || row["Description"] || "";
    const pluginName = row["definition.name"] || row["plugin_name"] || row["description"] || row["Description"] || "";

    const vprValue = row["definition.vpr.score"] || row["definition.vpr_v2.score"] || row["vpr_score"] || row["VPR Score"] || row["vpr"] || row["VPR"];
    const parsedVpr = vprValue !== undefined && vprValue !== null && vprValue !== "" ? parseFloat(vprValue) : null;
    const vprScore = Number.isFinite(parsedVpr) ? parsedVpr : null;

    const cvssValue = row["cvss_score"] || row["CVSS Score"] || row["cvss"];
    const parsedCvss = cvssValue !== undefined && cvssValue !== null && cvssValue !== "" ? parseFloat(cvssValue) : null;
    const cvssScore = Number.isFinite(parsedCvss) ? parsedCvss : null;

    const state = row["state"] || row["State"] || "ACTIVE";
    const vendor = normalizeVendor(row["definition.family"] || row["vendor"] || row["Vendor"] || "");
    const pluginId = row["definition.id"] || row["plugin_id"] || row["Plugin ID"] || "";
    const pluginPublished = row["definition.plugin_published"] || row["definition.plugin_updated"] || row["definition.vulnerability_published"] || row["vulnerability_date"] || row["plugin_published"] || "";
    const firstSeen = row["first_seen"] || row["First Seen"] || "";
    const lastSeen = row["last_seen"] || row["Last Seen"] || "";
    const solution = row["solution"] || row["Solution"] || "";

    const baseRecord = {
        assetId: row["asset.id"] || row["asset_id"] || row["Asset ID"] || "",
        hostname,
        ipAddress,
        severity: row["severity"] || row["Severity"] || "",
        vprScore,
        vpr: vprScore,
        cvssScore,
        vendor,
        pluginName,
        description,
        solution,
        state,
        firstSeen,
        lastSeen,
        pluginId,
        pluginPublished
    };

    // Parse multiple CVEs and create separate records for each
    const cvePattern = /CVE-\d{4}-\d{4,}/gi;
    const ciscoPattern = /cisco-sa-[\w-]+/gi;
    const cveMatches = (cve || "").match(cvePattern) || [];
    const ciscoMatches = (cve || "").match(ciscoPattern) || [];
    const allCVEs = [...cveMatches, ...ciscoMatches];

    if (allCVEs.length === 0) {
        return [{
            ...baseRecord,
            cve: ""
        }];
    }

    return allCVEs.map(individualCVE => {
        let augmentedDescription = description;
        if (description && !description.includes(individualCVE)) {
            augmentedDescription = `${description} (${individualCVE})`;
        }

        return {
            ...baseRecord,
            description: augmentedDescription,
            cve: individualCVE
        };
    });
}

/**
 * Map CSV row data to ticket object structure
 * @param {object} row - Raw CSV row data
 * @param {number} index - Row index for generating fallback IDs
 * @returns {object} Mapped ticket object
 */
function mapTicketRow(row, index) {
    const now = new Date().toISOString();
    const rawXtNumber = row.xt_number || row["XT Number"] || row.xtNumber;
    const xtNumber = normalizeXtNumber(rawXtNumber) || String(index + 1).padStart(4, "0");
    const ticketId = row.id || `ticket_${Date.now()}_${index}`;

    return {
        id: ticketId,
        xtNumber,
        dateSubmitted: row.date_submitted || row["Date Submitted"] || "",
        dateDue: row.date_due || row["Date Due"] || "",
        hexagonTicket: row.hexagon_ticket || row["Hexagon Ticket"] || "",
        serviceNowTicket: row.service_now_ticket || row["ServiceNow Ticket"] || "",
        location: row.location || row["Location"] || "",
        devices: row.devices || row["Devices"] || "",
        supervisor: row.supervisor || row["Supervisor"] || "",
        tech: row.tech || row["Tech"] || "",
        status: row.status || row["Status"] || "Open",
        notes: row.notes || row["Notes"] || "",
        createdAt: row.created_at || now,
        updatedAt: now
    };
}

/**
 * Normalize XT number values to four-digit strings without prefixes.
 * @param {string|number|undefined} value - Raw XT identifier value
 * @returns {string|undefined} Normalized four digit string or undefined when unavailable
 */
function normalizeXtNumber(value) {
    if (value === undefined || value === null) {
        return undefined;
    }

    const match = String(value).match(/\d+/);
    if (!match) {return undefined;}

    return match[0].padStart(4, "0");
}

// =============================================================================
// DOCUMENTATION HELPERS
// =============================================================================

/**
 * Find a documentation section path for a given filename by scanning the content folder
 * @param {string} filename - The filename to search for
 * @returns {string|null} Relative section path or null if not found
 */
function findDocsSectionForFilename(filename) {
    try {
        const contentRoot = path.join(__dirname, "..", "public", "docs-html", "content");
        const stack = [""]; // use relative subpaths
        while (stack.length) {
            const relDir = stack.pop();
            const dirPath = path.join(contentRoot, relDir);
            const entries = PathValidator.safeReaddirSync(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    stack.push(path.join(relDir, entry.name));
                } else if (entry.isFile() && entry.name.toLowerCase() === filename.toLowerCase()) {
                    const relFile = path.join(relDir, entry.name);
                    // Convert to section path without .html and using forward slashes
                    return relFile.replace(/\\/g, "/").replace(/\.html$/i, "");
                }
            }
        }
    } catch (_e) {
        // ignore scan errors and fall back to original behavior
    }
    return null;
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    // Data normalization helpers
    normalizeHostname,
    normalizeVendor,
    normalizeIPAddress,
    isValidIPAddress,

    // String and hashing helpers
    createDescriptionHash,
    extractScanDateFromFilename,

    // Deduplication helpers
    calculateDeduplicationConfidence,
    getDeduplicationTier,
    generateEnhancedUniqueKey,
    generateUniqueKey,

    // CSV data mapping helpers
    mapVulnerabilityRow,
    mapTicketRow,
    normalizeXtNumber,

    // Documentation helpers
    findDocsSectionForFilename
};
