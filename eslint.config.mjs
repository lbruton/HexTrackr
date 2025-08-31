import stylistic from '@stylistic/eslint-plugin';

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
      "docs-html/html-content-updater.js", 
  "scripts/docs-mapping-analyzer.js",
  "scripts/docs-repair-generator.js", 
      "scripts/fix-markdown.js",
      "scripts/generate-roadmap-portal.js",
      "scripts/init-database.js",
      "scripts/memory-local.js",
      "scripts/memory-wrapper-manager.js",
      "scripts/memento-launcher.js",
      "scripts/claude-integration.js",
      "scripts/claude-opus-scribe.js",
      "scripts/ollama-detector.js",
      "scripts/test-memento-claude.js",
      "scripts/test-ollama-embedding.js",
      "scripts/memory-importer.js",
      "scripts/claude-integration.js",
      "scripts/temp-scaffold-docs.js",
      "scripts/validation-utils.js", 
      "scripts/version-manager.js",
  ".rMemory/core/ollama-embedding-proxy.js",
  ".rMemory/tools/*.js"
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
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "curly": ["error", "all"],
      "no-lone-blocks": "error",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "no-console": "off",
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error"
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
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "curly": ["error", "all"],
      "no-lone-blocks": "error",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "no-console": "off",
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "no-undef": "error"
    }
  },
  {
    // Configuration for documentation browser files
    files: ["docs-html/js/*.js"],
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
        Prism: "readonly",
        marked: "readonly"
      }
    },
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "curly": ["error", "all"],
      "no-lone-blocks": "error",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "no-console": "off",
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error"
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
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "curly": ["error", "all"],
      "no-lone-blocks": "error",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "no-console": "off",
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error"
    }
  }
];
