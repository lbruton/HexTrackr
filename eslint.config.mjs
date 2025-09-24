import stylistic from '@stylistic/eslint-plugin';

// ESLint Configuration for HexTrackr
//
// DEPENDENCY NOTES:
// - Vulnerability management modules (vulnerability-*.js) use ES6 import/export syntax
// - These files are configured as sourceType: "module" to support import/export
// - Files are loaded as ES6 modules but reference globals via window object for compatibility
// - ModernVulnManager export class is preserved for proper module functionality

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
      
      // Documentation build outputs
      "docs-html/**/*.html",
      "docs-html/**/*.css",
      "docs-html/**/*.js",

      // Documentation library files (third-party, don't lint)
      "app/dev-docs-html/prettify/**/*.js",
      "**/prettify.js",

      // Project documentation files (focus on app code only)
      "AGENTS.md",
      "CLAUDE.md",
      "CONSTITUTION.md",
      "*.md",
      "dev-docs/**",
      "memento/**",
      "opencode-migration-guide.md",
      
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
      "app/public/scripts/utils/*.js",
      "scripts/pages/*.js",
      "scripts/shared/*.js",
      "scripts/utils/*.js"
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
        Blob: "readonly",
        URL: "readonly",
        getComputedStyle: "readonly",
        performance: "readonly",
        requestIdleCallback: "readonly",
        cancelIdleCallback: "readonly",
        // Third-party library globals
        bootstrap: "readonly",
        agGrid: "readonly",
        DOMPurify: "readonly",
        ApexCharts: "readonly",
        Papa: "readonly",
        Sortable: "readonly",
        // Project-specific globals
        createVulnerabilityGridOptions: "readonly",
        PaginationController: "readonly",
        VulnerabilityDataManager: "readonly",
        VulnerabilityCardsManager: "readonly",
        ModernVulnManager: "readonly"
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
    // Configuration for controller files with relaxed unused-vars rules
    files: [
      "app/controllers/*.js",
      "**/controllers/*.js"
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
      // Relaxed unused-vars for controllers (imports used dynamically)
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "no-console": "off",
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "no-undef": "error"
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
  },
  {
    // Configuration for ES6 module files - vulnerability management system (MUST BE LAST for proper precedence)
    files: [
      "**/vulnerabilities.js",
      "**/vulnerability-*.js",
      "**/normalization.js",
      "**/theme-contrast-tester.js",
      "**/wcag-contrast-validator.js",
      "**/accessibility-announcer.js"
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module", // ES6 modules with import/export
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
        Event: "readonly",
        EventTarget: "readonly",
        FormData: "readonly",
        DOMParser: "readonly",
        atob: "readonly",
        btoa: "readonly",
        Intl: "readonly",
        Blob: "readonly",
        URL: "readonly",
        getComputedStyle: "readonly",
        performance: "readonly",
        // Third-party library globals
        bootstrap: "readonly",
        agGrid: "readonly",
        DOMPurify: "readonly",
        ApexCharts: "readonly",
        Papa: "readonly",
        Sortable: "readonly",
        // Project-specific globals
        createVulnerabilityGridOptions: "readonly",
        PaginationController: "readonly",
        // Dual module system support
        module: "readonly",
        exports: "readonly"
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
    // Configuration for class definition files that export to global scope (MUST BE ABSOLUTE LAST)
    files: [
      "app/public/scripts/shared/vulnerability-cards.js",
      "app/public/scripts/shared/vulnerability-data.js"
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
        Event: "readonly",
        EventTarget: "readonly",
        FormData: "readonly",
        DOMParser: "readonly",
        atob: "readonly",
        btoa: "readonly",
        Intl: "readonly",
        Blob: "readonly",
        URL: "readonly",
        getComputedStyle: "readonly",
        performance: "readonly",
        requestIdleCallback: "readonly",
        cancelIdleCallback: "readonly",
        // Third-party library globals
        bootstrap: "readonly",
        agGrid: "readonly",
        DOMPurify: "readonly",
        ApexCharts: "readonly",
        Papa: "readonly",
        Sortable: "readonly",
        // Project-specific globals
        createVulnerabilityGridOptions: "readonly",
        PaginationController: "readonly",
        VulnerabilityDataManager: "readonly",
        VulnerabilityCardsManager: "readonly",
        ModernVulnManager: "readonly"
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
      // Allow class definitions that are exported to global scope
      "no-unused-vars": "off",
      "no-console": "off",
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "no-undef": "error"
    }
  }
];
