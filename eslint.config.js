export default [
  {
    // Global configuration for all JavaScript files
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Module globals (for Node.js files)
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        console: "readonly",
        // Browser globals (for client-side files)
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        XMLHttpRequest: "readonly",
        fetch: "readonly",
        bootstrap: "readonly",
        // Additional globals for docs and utilities
        Prism: "readonly",
        define: "readonly",
        self: "readonly",
        clearTimeout: "readonly",
        setTimeout: "readonly",
        Intl: "readonly"
      }
    },
    rules: {
      // Enforce consistent quote style
      "quotes": ["error", "double"],
      // Enforce semicolons
      "semi": ["error", "always"]
    }
  },
  {
    // Configuration for Node.js scripts
    files: ["docs-prototype/generate-docs.js", "docs-prototype/gemini-docs-generator.js", "docs-prototype/enhanced-gemini-docs-generator.js", "docs-prototype/html-content-updater.js", "docs-source/generate-docs.js", "scripts/**/*.js"],
    languageOptions: {
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
        console: "readonly"
      }
    }
  },
  {
    // Configuration for browser documentation files
    files: ["docs-prototype/js/*.js"],
    languageOptions: {
      globals: {
        // Browser environment globals for docs
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        console: "readonly",
        bootstrap: "readonly",
        Prism: "readonly"
      }
    }
  },
  {
    // Configuration for shared JavaScript files (enhanced browser globals)
    files: ["scripts/shared/*.js"],
    languageOptions: {
      globals: {
        // Additional browser-specific globals for shared components
        alert: "readonly",
        confirm: "readonly",
        prompt: "readonly"
      }
    }
  },
  {
    // Configuration for page-specific JavaScript files
    files: ["scripts/pages/*.js"],
    languageOptions: {
      globals: {
        // Page-specific globals can be added here if needed
      }
    }
  },
  {
    // Files to ignore
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.min.js",
      "scripts/chart.min.js"
    ]
  }
];
