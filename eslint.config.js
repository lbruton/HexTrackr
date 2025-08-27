import { Linter } from "eslint";

/** @type {Linter.FlatConfig} */
const config = [
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      globals: {
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
        fetch: "readonly",
        console: "readonly",
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        alert: "readonly",
        setTimeout: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn"
    }
  }
];

export default config;
