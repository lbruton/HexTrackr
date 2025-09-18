#!/usr/bin/env node

/**
 * Post-processor for JSDoc HTML files
 * Injects theme synchronization script into all generated documentation
 */

const fs = require("fs");
const path = require("path");

const DEV_DOCS_DIR = path.join(__dirname, "../dev-docs-html");
const THEME_SCRIPT = `
<script>
// Theme synchronization for JSDoc developer documentation
(function() {
    // Check URL parameters first (for popup windows)
    const urlParams = new URLSearchParams(window.location.search);
    const urlTheme = urlParams.get('theme');

    // Try URL param first
    let theme = urlTheme;

    // If no URL param, check localStorage
    if (!theme) {
        const stored = localStorage.getItem('hextrackr-theme');
        if (stored) {
            try {
                // Try to parse as JSON (new format)
                const parsed = JSON.parse(stored);
                theme = parsed.theme;
            } catch (e) {
                // Fall back to plain string (old format)
                theme = stored;
            }
        }
    }

    // Default to dark if nothing found
    theme = theme || 'dark';

    if (theme === 'dark') {
        const darkStyles = document.createElement('style');
        darkStyles.id = 'jsdoc-dark-theme';
        darkStyles.textContent = \`
            /* Base colors using HexTrackr surface hierarchy */
            :root {
                --jsdoc-surface-base: #0f172a;
                --jsdoc-surface-1: #1a2332;
                --jsdoc-surface-2: #253241;
                --jsdoc-surface-3: #2f3f50;
                --jsdoc-surface-4: #526880;
                --jsdoc-text-primary: #e4e6eb;
                --jsdoc-text-secondary: #a8b3cf;
                --jsdoc-link: #539bf5;
                --jsdoc-link-hover: #6cb6ff;
            }

            /* Main layout */
            body {
                background-color: var(--jsdoc-surface-base) !important;
                color: var(--jsdoc-text-primary) !important;
                line-height: 1.6;
            }

            /* Navigation sidebar */
            nav {
                background-color: var(--jsdoc-surface-1) !important;
                border-right: 1px solid var(--jsdoc-surface-3) !important;
            }
            nav h2, nav h3 {
                color: var(--jsdoc-text-primary) !important;
                font-weight: 600;
            }
            nav ul a, nav ul a:visited {
                color: var(--jsdoc-text-primary) !important;
                opacity: 0.9;
                transition: all 0.2s ease;
            }
            nav ul a:hover, nav ul a:active {
                color: #ffffff !important;
                background-color: var(--jsdoc-surface-3) !important;
                opacity: 1;
            }

            /* Main content area */
            #main {
                background-color: var(--jsdoc-surface-base) !important;
            }

            /* Headings */
            h1, h2, h3, h4, h5, h6 {
                color: var(--jsdoc-text-primary) !important;
                font-weight: 600;
            }
            .page-title {
                border-bottom: 1px solid var(--jsdoc-surface-3) !important;
                padding-bottom: 0.5rem;
            }

            /* Code blocks and inline code */
            pre, code {
                background-color: var(--jsdoc-surface-1) !important;
                color: var(--jsdoc-text-primary) !important;
                border: 1px solid var(--jsdoc-surface-3) !important;
                font-family: 'Fira Code', 'Consolas', monospace;
            }
            pre.prettyprint {
                background-color: var(--jsdoc-surface-1) !important;
                border: 1px solid var(--jsdoc-surface-3) !important;
                padding: 1rem;
            }

            /* Syntax highlighting for code */
            .prettyprint .str { color: #a8e6a3 !important; }  /* strings - light green */
            .prettyprint .kwd { color: #ff79c6 !important; }  /* keywords - pink */
            .prettyprint .com { color: #6272a4 !important; }  /* comments - muted blue */
            .prettyprint .typ { color: #8be9fd !important; }  /* types - cyan */
            .prettyprint .lit { color: #f1fa8c !important; }  /* literals - yellow */
            .prettyprint .pun { color: #e4e6eb !important; }  /* punctuation */
            .prettyprint .pln { color: #e4e6eb !important; }  /* plain text */
            .prettyprint .tag { color: #ff79c6 !important; }  /* tags */
            .prettyprint .atn { color: #50fa7b !important; }  /* attribute names */
            .prettyprint .atv { color: #f1fa8c !important; }  /* attribute values */

            /* Tables */
            table {
                background-color: var(--jsdoc-surface-1) !important;
                border-collapse: collapse;
            }
            td, th {
                border-color: var(--jsdoc-surface-3) !important;
                color: var(--jsdoc-text-primary) !important;
                padding: 0.5rem;
            }
            thead {
                background-color: var(--jsdoc-surface-2) !important;
            }
            tbody tr:hover {
                background-color: var(--jsdoc-surface-2) !important;
            }

            /* Links */
            a, a:visited {
                color: var(--jsdoc-link) !important;
                text-decoration: none;
            }
            a:hover {
                color: var(--jsdoc-link-hover) !important;
                text-decoration: underline;
            }

            /* Method signatures and parameters */
            .signature {
                background-color: var(--jsdoc-surface-1) !important;
                border: 1px solid var(--jsdoc-surface-3) !important;
                color: var(--jsdoc-text-primary) !important;
                padding: 0.5rem;
                border-radius: 4px;
            }
            .params td, .props td {
                background-color: var(--jsdoc-surface-1) !important;
            }
            .params thead tr, .props thead tr {
                background-color: var(--jsdoc-surface-2) !important;
            }
            .type-signature {
                color: #50fa7b !important;
                font-weight: 500;
            }

            /* Footer */
            footer {
                background-color: var(--jsdoc-surface-1) !important;
                border-top: 1px solid var(--jsdoc-surface-3) !important;
                color: var(--jsdoc-text-secondary) !important;
                padding: 1rem;
            }

            /* Details sections */
            .details {
                background-color: var(--jsdoc-surface-1) !important;
                border-left: 3px solid var(--jsdoc-link) !important;
                padding: 0.5rem;
                margin: 1rem 0;
            }
            dt {
                color: var(--jsdoc-text-primary) !important;
                font-weight: 600;
            }
            dd {
                color: var(--jsdoc-text-primary) !important;
                margin-left: 1rem;
            }

            /* Articles and documentation sections */
            article {
                background-color: var(--jsdoc-surface-base) !important;
                color: var(--jsdoc-text-primary) !important;
            }
            article h2, article h3 {
                border-bottom: 1px solid var(--jsdoc-surface-3);
                padding-bottom: 0.25rem;
                margin-top: 1.5rem;
            }

            /* Container sections and wrappers */
            .container, .container-overview {
                background-color: var(--jsdoc-surface-base) !important;
                color: var(--jsdoc-text-primary) !important;
            }

            /* Section containers */
            section {
                background-color: var(--jsdoc-surface-base) !important;
                color: var(--jsdoc-text-primary) !important;
            }

            /* Method and member sections */
            .method-details, .member-details, .description {
                background-color: var(--jsdoc-surface-base) !important;
                color: var(--jsdoc-text-primary) !important;
            }

            /* Subsections */
            .subsection-title {
                color: var(--jsdoc-text-primary) !important;
                border-bottom: 1px solid var(--jsdoc-surface-3) !important;
            }

            /* Generic divs that might have white backgrounds */
            div[style*="background"] {
                background-color: var(--jsdoc-surface-base) !important;
            }

            /* Main content wrapper */
            #main > * {
                background-color: var(--jsdoc-surface-base) !important;
                color: var(--jsdoc-text-primary) !important;
            }

            /* Blockquotes */
            blockquote {
                background-color: var(--jsdoc-surface-1) !important;
                border-left: 4px solid var(--jsdoc-link) !important;
                padding: 1rem;
                margin: 1rem 0;
                color: var(--jsdoc-text-primary) !important;
            }

            /* Lists in documentation */
            article ul li, article ol li {
                color: var(--jsdoc-text-primary) !important;
                margin: 0.5rem 0;
            }

            /* Input fields */
            input[type="text"], input[type="search"] {
                background-color: var(--jsdoc-surface-1) !important;
                border: 1px solid var(--jsdoc-surface-3) !important;
                color: var(--jsdoc-text-primary) !important;
                padding: 0.5rem;
            }
            input[type="text"]:focus, input[type="search"]:focus {
                outline: 2px solid var(--jsdoc-link) !important;
                border-color: var(--jsdoc-link) !important;
            }

            /* Scrollbar styling */
            ::-webkit-scrollbar {
                width: 12px;
                height: 12px;
            }
            ::-webkit-scrollbar-track {
                background: var(--jsdoc-surface-1);
            }
            ::-webkit-scrollbar-thumb {
                background: var(--jsdoc-surface-3);
                border-radius: 6px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: var(--jsdoc-surface-4);
            }

            /* Improve readability for paragraphs */
            p {
                color: var(--jsdoc-text-primary) !important;
                line-height: 1.7;
                background-color: transparent !important;
            }

            /* All text elements */
            span, div, section, article, aside {
                color: var(--jsdoc-text-primary) !important;
            }

            /* Ensure no white backgrounds on any elements */
            * {
                background-color: transparent;
            }

            /* Then apply specific backgrounds where needed */
            body, html {
                background-color: var(--jsdoc-surface-base) !important;
            }

            /* Source file links */
            .source-link {
                background-color: var(--jsdoc-surface-2) !important;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
            }

            /* Name and type wrappers */
            .name, .type-signature, .signature {
                background-color: transparent !important;
            }

            /* Member and method containers */
            .members, .methods {
                background-color: var(--jsdoc-surface-base) !important;
            }

            .members h4, .methods h4 {
                background-color: var(--jsdoc-surface-1) !important;
                padding: 0.5rem;
                border-radius: 4px;
                margin: 1rem 0 0.5rem 0;
            }

            /* Parameter descriptions */
            .param-desc, .returns-desc {
                color: var(--jsdoc-text-primary) !important;
            }

            /* Examples section */
            .examples h5 {
                color: var(--jsdoc-text-primary) !important;
                background-color: var(--jsdoc-surface-1) !important;
                padding: 0.5rem;
                border-radius: 4px;
            }

            /* Readme and home sections */
            .readme, .home-section {
                background-color: var(--jsdoc-surface-base) !important;
                color: var(--jsdoc-text-primary) !important;
            }

            /* Important: Override any inline styles */
            [style*="background-color: white"],
            [style*="background-color: #fff"],
            [style*="background-color: #ffffff"],
            [style*="background: white"],
            [style*="background: #fff"],
            [style*="background: #ffffff"] {
                background-color: var(--jsdoc-surface-base) !important;
            }
        \`;
        document.head.appendChild(darkStyles);
    }
})();
</script>
`;

function injectThemeScript() {
    // Get all HTML files in dev-docs-html directory
    const files = fs.readdirSync(DEV_DOCS_DIR)
        .filter(file => file.endsWith(".html"))
        .map(file => path.join(DEV_DOCS_DIR, file));

    console.log(`Found ${files.length} HTML files to process...`);

    files.forEach(filePath => {
        let content = fs.readFileSync(filePath, "utf8");

        // Remove old version if present
        if (content.includes("jsdoc-dark-theme")) {
            // Remove old script tag and its content
            content = content.replace(/<script>\s*\/\/ Theme synchronization[\s\S]*?<\/script>\s*(?=<\/head>)/g, "");
            console.log(`✓ ${path.basename(filePath)} - removed old theme script`);
        }

        // Inject new version before closing </head> tag
        content = content.replace("</head>", `${THEME_SCRIPT}</head>`);

        fs.writeFileSync(filePath, content, "utf8");
        console.log(`✓ ${path.basename(filePath)} - theme script updated`);
    });

    console.log("Theme injection complete!");
}

// Run the injection
injectThemeScript();