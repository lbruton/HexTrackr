/* eslint-env node */
/* global module */

module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        commonjs: true
    },
    extends: [
        "eslint:recommended"
    ],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    },
    ignorePatterns: [
        "node_modules/**",
        ".venv/**/*",
        "temp/**/*",
        "uploads/**/*",
        "logs/**/*",
        "data/**/*",
        "docs-html/**/*",
        "filescope-tools-demo.js",
        "scripts/chart.min.js",
        "test-charts.js",
        "test-charts.spec.js"
    ],
    overrides: [
        {
            files: ["scripts/utils/security.js"],
            env: {
                browser: true,
                es2021: true
            },
            globals: {
                document: "readonly",
                window: "readonly",
                console: "readonly"
            }
        },
        {
            files: ["scripts/utils/*.js", "scripts/pages/*.js"],
            env: {
                browser: true,
                es2021: true
            },
            globals: {
                // Common browser globals
                document: "readonly",
                window: "readonly",
                console: "readonly",
                alert: "readonly",
                fetch: "readonly",
                FormData: "readonly",
                File: "readonly",
                FileReader: "readonly",
                Blob: "readonly",
                URL: "readonly",
                XMLHttpRequest: "readonly",
                // Chart.js
                Chart: "readonly",
                // AG-Grid
                agGrid: "readonly",
                // jsPDF
                jsPDF: "readonly",
                // html2canvas
                html2canvas: "readonly"
            }
        },
        {
            files: ["server.js", "scripts/init-database.js", "scripts/docs-*.js", "scripts/fix-*.js", "scripts/generate-*.js", "scripts/version-manager.js"],
            env: {
                node: true,
                es2021: true
            }
        },
        {
            files: [".eslintrc.js", "*.config.js", "*.config.mjs"],
            env: {
                node: true,
                es2021: true
            }
        }
    ]
};
