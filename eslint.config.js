export default [
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      globals: {
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        console: "readonly",
        setTimeout: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "semi": ["error", "always"],
      "quotes": ["warn", "single", { "allowTemplateLiterals": true }]
    }
  },
  {
    files: ["**/scripts/shared/*.js", "**/scripts/pages/*.js", "**/scripts/ag-grid-*.js", "**/scripts/validation-utils.js"],
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      globals: {
        bootstrap: "readonly",
        Papa: "readonly",
        JSZip: "readonly",
        Tabler: "readonly",
        fetch: "readonly",
        document: "readonly",
        window: "readonly",
        console: "readonly",
        localStorage: "readonly",
        URL: "readonly",
        FormData: "readonly",
        module: "readonly",
        FileReader: "readonly",
        Blob: "readonly",
        navigator: "readonly",
        XLSX: "readonly",
        showNotification: "readonly",
        setTimeout: "readonly",
        alert: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "semi": ["error", "always"],
      "quotes": ["warn", "single", { "allowTemplateLiterals": true }]
    }
  },
  {
    ignores: [
      "node_modules/**",
      "docs-prototype/js/docs-tabler.js",
      "scripts/chart.min.js",
      "scripts/ag-grid-responsive-config.js",
      "uploads/**"
    ]
  }
];
