const fs = require("fs");
const path = require("path");

const DEFAULT_CONFIG = {
    familyVendorPatterns: [
        { pattern: "cisco", vendor: "CISCO", flags: "i" },
        { pattern: "palo\\s*alto", vendor: "Palo Alto", flags: "i" }
    ],
    hostnameVendorPatterns: [
        { pattern: "nfpan", vendor: "Palo Alto", flags: "i" },
        { pattern: "n[rs]wan", vendor: "CISCO", flags: "i" }
    ]
};

let cachedConfig = null;
let cachedPath = null;

function resolveConfigPath() {
    if (process.env.IMPORT_CONFIG_PATH) {
        return path.resolve(process.cwd(), process.env.IMPORT_CONFIG_PATH);
    }

    return path.resolve(__dirname, "../../config/import.config.json");
}

function preparePatterns(patterns = []) {
    return patterns
        .filter(entry => entry && entry.pattern && entry.vendor)
        .map(entry => {
            try {
                const flags = entry.flags || "i";
                return {
                    vendor: entry.vendor,
                    regex: new RegExp(entry.pattern, flags)
                };
            } catch (error) {
                console.warn(`⚠️  Invalid vendor pattern '${entry.pattern}': ${error.message}`);
                return null;
            }
        })
        .filter(Boolean);
}

function loadConfigFromDisk(configPath) {
    try {
        const fileContents = fs.readFileSync(configPath, "utf8");
        const parsed = JSON.parse(fileContents);

        return {
            familyVendorPatterns: preparePatterns(parsed.familyVendorPatterns ?? DEFAULT_CONFIG.familyVendorPatterns),
            hostnameVendorPatterns: preparePatterns(parsed.hostnameVendorPatterns ?? DEFAULT_CONFIG.hostnameVendorPatterns)
        };
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.warn(`⚠️  Unable to load import config from ${configPath}: ${error.message}`);
        }

        return {
            familyVendorPatterns: preparePatterns(DEFAULT_CONFIG.familyVendorPatterns),
            hostnameVendorPatterns: preparePatterns(DEFAULT_CONFIG.hostnameVendorPatterns)
        };
    }
}

function getImportConfig() {
    const configPath = resolveConfigPath();

    if (!cachedConfig || cachedPath !== configPath) {
        cachedConfig = loadConfigFromDisk(configPath);
        cachedPath = configPath;
    }

    return cachedConfig;
}

function refreshImportConfig() {
    cachedConfig = null;
    cachedPath = null;
    return getImportConfig();
}

module.exports = {
    getImportConfig,
    refreshImportConfig
};
