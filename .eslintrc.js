module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "script"
  },
  env: {
    es6: true,
    node: true
  },
  extends: [],
  rules: {
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "curly": ["error", "all"],
    "no-lone-blocks": "error",
    "no-unused-vars": ["error", { 
      "argsIgnorePattern": "^_", 
      "varsIgnorePattern": "^_", 
      "caughtErrorsIgnorePattern": "^_" 
    }],
    "no-console": "off",
    "eqeqeq": ["error", "always"],
    "no-var": "error",
    "prefer-const": "error",
    "no-undef": "error"
  },
  ignorePatterns: [
    "node_modules/**",
    "**/node_modules/**", 
    "dist/**",
    "build/**",
    "coverage/**",
    "scripts/chart.min.js",
    "scripts/utils/purify.min.js",
    "**/*.min.js",
    "**/temp/**",
    "**/tmp/**",
    "uploads/**",
    ".venv/**"
  ],
  overrides: [
    {
      // Node.js files
      files: [
        "server.js",
        "docs-html/html-content-updater.js", 
        "scripts/docs-mapping-analyzer.js",
        "scripts/docs-repair-generator.js", 
        "scripts/fix-markdown.js",
        "scripts/init-database.js",
        "scripts/validation-utils.js", 
        "scripts/version-manager.js",
        "import-cisco-csv.js",
        "generate-hextrackr-diagram.js",
        "filescope-tools-demo.js",
        "test-charts.js",
        "test-charts.spec.js"
      ],
      env: {
        node: true,
        browser: false
      },
      globals: {
        require: "readonly",
        module: "readonly", 
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setImmediate: "readonly",
        clearImmediate: "readonly"
      }
    },
    {
      // Browser files  
      files: [
        "scripts/ag-grid-responsive-config.js",
        "scripts/pages/*.js", 
        "scripts/shared/*.js",
        "scripts/utils/*.js"
      ],
      env: {
        browser: true,
        node: false
      },
      globals: {
        window: "readonly",
        document: "readonly", 
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        XMLHttpRequest: "readonly",
        fetch: "readonly",
        console: "readonly",
        alert: "readonly",
        confirm: "readonly",
        prompt: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        MutationObserver: "readonly",
        ResizeObserver: "readonly", 
        Event: "readonly",
        EventTarget: "readonly",
        FormData: "readonly",
        DOMParser: "readonly",
        atob: "readonly",
        btoa: "readonly",
        Intl: "readonly",
        bootstrap: "readonly",
        agGrid: "readonly",
        DOMPurify: "readonly"
      }
    },
    {
      // Documentation browser files
      files: ["docs-html/js/*.js"],
      env: {
        browser: true,
        node: false
      },
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        console: "readonly",
        bootstrap: "readonly"
      }
    }
  ]
};

