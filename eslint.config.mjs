import stylistic from '@stylistic/eslint-plugin';

export default [
  {
    // Comprehensive ignore patterns  
    ignores: [
      // Dependencies and build outputs
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      
      // Version control and OS files
      ".git/**",
      ".DS_Store",
      
      // Claude Code AI configuration
      ".claude/**",
      "stooges/**",
      
      // Legacy ESLint configuration (avoid conflicts)
      ".eslintrc.js",
      ".eslintrc.json",
      
      // Python virtual environments (all possible patterns)
      ".venv/**/*",
      "**/.venv/**/*",
      ".venv/**/*.js",
      "**/.venv/**/*.js", 
      "venv/**",
      "**/venv/**",
      "**/.env/**",
      "**/site-packages/**",
      "**/lib/python*/**",
      "**/lib/python*/site-packages/**",
      ".venv/lib/python3.13/site-packages/**",
      ".venv/lib/python*/site-packages/**",
      
      // Temporary and test directories 
      "temp/**/*",
      "**/temp/**/*",
      "temp/**/*.js", 
      "**/temp/**/*.js",
      "tmp/**",
      "**/tmp/**",
      
      // Generated and external files
      "**/*.min.js",
      "**/*.min.css", 
      "**/bundle.js",
      "**/webpack.config.js",
      
      // FilScope MCP files (external tool)
      "filescope-tools-demo.js",
      "FileScopeMCP-*.js",
      "FileScopeMCP-*.json", 
      "FileScopeMCP-*.html",
      "FileScopeMCP-*.png",
      "**/filescope/**",
      
      // Test files (moved to temp)
      "test-*.js",
      "**/test-*.js",
      "test-*.spec.js",
      "**/test-*.spec.js",
      
      // Jest test directories
      "__tests__/**",
      "**/__tests__/**",
      
      // Documentation build outputs
      "docs-html/**/*.html",
      "docs-html/**/*.css",
      "docs-html/**/*.js",
      
      // Database and data files
      "data/**/*.db",
      "data/**/*.sqlite",
      
      // Logs and uploads
      "logs/**",
      "uploads/**",
      
      // Docker and deployment
      "docker/**",
      "Dockerfile*",
      "docker-compose*.yml",
      
      // IDE and editor files
      ".vscode/**",
      ".idea/**",
      "*.swp",
      "*.swo", 
      "*~",
      
      // Configuration that shouldn't be linted
      "*.config.js",
      "*.config.mjs",
      "nginx.conf", 
      "ruleset.xml"
    ]
  },
  {
    // Configuration for ESLint config files
    files: [".eslintrc.js", "eslint.config.*"],
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
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "no-console": "off",
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "no-undef": "error"
    }
  },
  {
    // Configuration for Node.js scripts - specific patterns first
    files: [
      "app/public/server.js",
      "app/public/docs-html/html-content-updater.js",
      "app/public/scripts/docs-mapping-analyzer.js",
      "app/public/scripts/docs-repair-generator.js",
      "app/public/scripts/fix-markdown.js",
      "app/public/scripts/generate-roadmap-portal.js",
      "app/public/scripts/init-database.js",
      "app/public/scripts/fix-truncated-cves.js",
      "app/public/scripts/memory-local.js",
      "app/public/scripts/memory-wrapper-manager.js",
      "app/public/scripts/memento-launcher.js",
      "app/public/scripts/claude-integration.js",
      "app/public/scripts/claude-opus-scribe.js",
      "app/public/scripts/ollama-detector.js",
      "app/public/scripts/test-memento-claude.js",
      "app/public/scripts/test-ollama-embedding.js",
      "app/public/scripts/memory-importer.js",
      "app/public/scripts/claude-integration.js",
      "app/public/scripts/temp-scaffold-docs.js",
      "app/public/scripts/validation-utils.js",
      "app/public/scripts/version-manager.js",
      ".rMemory/core/ollama-embedding-proxy.js",
      ".rMemory/tools/*.js",
      "filescope-tools-demo.js",
      "generate-hextrackr-diagram.js",
      "import-cisco-csv.js",
      "test-charts.js",
      "test-charts.spec.js"
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
      "prefer-const": "error",
      "no-undef": "error"
    }
  },
  {
    // Configuration for browser scripts - specific patterns
    files: [
      "app/public/scripts/pages/*.js",
      "app/public/scripts/shared/*.js",
      "app/public/scripts/utils/*.js"
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
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
        CustomEvent: "readonly",
        EventTarget: "readonly",
        FormData: "readonly",
        DOMParser: "readonly",
        atob: "readonly",
        btoa: "readonly",
        Intl: "readonly",
        Blob: "readonly",
        URL: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        // Third-party library globals
        bootstrap: "readonly",
        agGrid: "readonly",
        DOMPurify: "readonly",
        ApexCharts: "readonly",
        Papa: "readonly",
        Sortable: "readonly",
        io: "readonly", // Socket.io client library
        // Project-specific globals
        createVulnerabilityGridOptions: "readonly",
        PaginationController: "readonly", 
        VulnerabilityDataManager: "readonly",
        VulnerabilityStatisticsManager: "readonly",
        VulnerabilityChartManager: "readonly",
        VulnerabilityDetailsModal: "readonly",
        DeviceSecurityModal: "readonly",
        ModernVulnManager: "readonly",
        WebSocketClient: "readonly",
        ProgressModal: "readonly"
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
    files: ["app/public/docs-html/js/*.js"],
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
    // Configuration for test files with ES modules
    files: ["tests/**/*.js", "**/*.spec.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Node.js test environment globals
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        global: "readonly",
        // Playwright test globals
        test: "readonly",
        expect: "readonly",
        describe: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly"
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
