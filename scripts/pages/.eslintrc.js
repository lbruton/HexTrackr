/* eslint-env node */
/* global module */
module.exports = {
  env: {
    browser: true,
    es6: true,
    node: false
  },
  globals: {
    // Browser globals
    window: "readonly",
    document: "readonly",
    localStorage: "readonly",
    fetch: "readonly",
    FormData: "readonly",
    alert: "readonly",
    confirm: "readonly",
    console: "readonly",
    setTimeout: "readonly",
    clearTimeout: "readonly",
    setInterval: "readonly",
    clearInterval: "readonly",
    URL: "readonly",
    Blob: "readonly",
    btoa: "readonly",

    // Project-specific globals
    bootstrap: "readonly",
    agGrid: "readonly",
    ApexCharts: "readonly",
    Papa: "readonly",
    Sortable: "readonly",
    createVulnerabilityGridOptions: "readonly",
    PaginationController: "readonly",
    VulnerabilityDataManager: "readonly",
    ModernVulnManager: "writable"
  },
  rules: {
    "no-undef": "off"
  }
};
