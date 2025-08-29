export default [
  {
    // Files to ignore - placed first for priority
    ignores: [
      "node_modules/**",
      "**/node_modules/**", 
      "dist/**",
      "build/**",
      "coverage/**",
      "scripts/chart.min.js",  // Third-party minified chart library
      "**/*.min.js",           // All minified files
      "**/temp/**",
      "**/tmp/**"
    ]
  },
  {
    // Configuration for Node.js scripts - specific patterns first
    files: [
      "server.js",
      "docs-prototype/html-content-updater.js", 
      "scripts/docs-mapping-analyzer.js",
      "scripts/docs-repair-generator.js", 
      "scripts/fix-markdown.js",
      "scripts/generate-roadmap-portal.js",
      "scripts/init-database.js",
      "scripts/temp-scaffold-docs.js",
      "scripts/validation-utils.js", 
      "scripts/version-manager.js"
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        // Node.js environment globals
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
    rules: {
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "curly": ["error", "all"]
    }
  },
  {
    // Configuration for browser scripts - specific patterns
    files: [
      "scripts/ag-grid-responsive-config.js",
      "scripts/pages/*.js", 
      "scripts/shared/*.js"
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        // Browser environment globals
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
        // Browser API globals
        MutationObserver: "readonly",
        ResizeObserver: "readonly", 
        OffscreenCanvas: "readonly",
        Path2D: "readonly",
        Event: "readonly",
        EventTarget: "readonly",
        FormData: "readonly",
        DOMParser: "readonly",
        atob: "readonly",
        btoa: "readonly",
        Intl: "readonly",
        // Third-party library globals
        bootstrap: "readonly",
        agGrid: "readonly"
      }
    },
    rules: {
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "curly": ["error", "all"]
    }
  },
  {
    // Configuration for documentation browser files
    files: ["docs-prototype/js/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        // Browser environment globals for docs
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        console: "readonly",
        bootstrap: "readonly",
        Prism: "readonly"
      }
    },
    rules: {
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "curly": ["error", "all"]
    }
  },
  {
    // Fallback configuration for any remaining JavaScript files
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        // Common globals that should be available everywhere
        console: "readonly"
      }
    },
    rules: {
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "curly": ["error", "all"]
    }
  }
];
