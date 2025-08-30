#!/usr/bin/env node

// Document Manager - Powered by Gemini
// Generates high-quality documentation for any given script using a powerful API-based LLM.

import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file at the project root
dotenv.config({ path: path.join(__dirname, '.env') });

class DocumentManager {
    constructor() {
        this.configPath = path.join(__dirname, 'system-config.json');
        if (!fs.existsSync(this.configPath)) {
            console.error('❌ Error: system-config.json not found. Please run setup.');
            process.exit(1);
        }
        this.config = fs.readJsonSync(this.configPath);
        this.docManagerConfig = this.config.brainShareSystem.documentManager;
        this.apiEndpoint = this.docManagerConfig.api.endpoint;
        this.model = this.docManagerConfig.api.model;
        this.apiKey = process.env.GEMINI_API_KEY; // Use the key from the .env file
        this.docsDir = path.join(this.config.brainShareSystem.storage.memoryDirectory, '../..', 'docs', 'generated');

        if (!this.apiKey) {
            console.error('❌ Error: GEMINI_API_KEY not found in .env. Please add it.');
            process.exit(1);
        }
    }

    async generate(filePath) {
        if (!filePath) {
            console.error('❌ Error: Please provide a file path to document.');
            console.log('Usage: node document-generator.js <path/to/file.js>');
            return;
        }

        const absoluteFilePath = path.resolve(filePath);
        if (!fs.existsSync(absoluteFilePath)) {
            console.error(`❌ Error: File not found at ${absoluteFilePath}`);
            return;
        }

        console.log(`📄 Generating documentation for: ${path.basename(absoluteFilePath)}`);
        console.log(`🧠 Using model: ${this.model}`);

        try {
            const fileContent = await fs.readFile(absoluteFilePath, 'utf-8');
            const prompt = this.createPrompt(path.basename(absoluteFilePath), fileContent);

            const response = await axios.post(`${this.apiEndpoint}?key=${this.apiKey}`, {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const generatedDoc = response.data.candidates[0].content.parts[0].text;
            await this.saveDocumentation(absoluteFilePath, generatedDoc);

        } catch (error) {
            console.error('❌ An error occurred during documentation generation:');
            if (error.response) {
                console.error('API Error:', error.response.data);
            } else {
                console.error(error.message);
            }
        }
    }

    createPrompt(filename, fileContent) {
        return `
You are a world-class senior technical writer, known for creating exceptionally clear, comprehensive, and accessible documentation. Your task is to generate a complete markdown documentation file for the provided script.

**Script Name:** ${filename}

**Full Script Content:**
\`\`\`javascript
${fileContent}
\`\`\`

**Instructions:**

Generate a complete and detailed markdown file. The documentation MUST include the following sections:

1.  **Title**: A clear H1 title for the document.
2.  **Overview**: A concise, one-paragraph summary of the script's purpose and its role within the broader system.
3.  **How to Use**: Clear instructions on how to run the script from the command line, including any required arguments. Provide at least one practical example.
4.  **Core Logic Breakdown**: A detailed, step-by-step explanation of what the script does. Describe the main functions, classes, and their responsibilities. Explain the flow of data and control.
5.  **Configuration & Dependencies**: Detail any external dependencies (npm packages) or configuration files (e.g., \`system-config.json\`) that the script relies on. Explain the key configuration parameters it uses.
6.  **Machine-Readable Summary**: A section containing a single JSON object that programmatically describes the script. The JSON object should include keys for \`scriptName\`, \`purpose\`, \`inputs\` (including arguments and dependencies), and \`outputs\` (what the script produces, e.g., a file, console output).

Produce only the raw markdown content for the documentation file. Do not include any conversational text or introductory phrases like "Here is the documentation".
        `;
    }

    async saveDocumentation(sourceFilePath, docContent) {
        const relativePath = path.relative(path.join(__dirname, '..'), sourceFilePath);
        const docPath = path.join(this.docsDir, relativePath).replace(/\.js$/, '.md');

        await fs.ensureDir(path.dirname(docPath));
        await fs.writeFile(docPath, docContent);

        console.log('✅ Documentation successfully generated and saved to:');
        console.log(docPath);

        // Update the generated-system-info.json
        await this.updateGeneratedSystemInfo(sourceFilePath, docContent);
    }

    async updateGeneratedSystemInfo(sourceFilePath, docContent) {
        const infoPath = path.join(__dirname, 'generated-system-info.json');
        const infoData = await fs.readJson(infoPath);

        const machineReadableRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = docContent.match(machineReadableRegex);

        if (match && match[1]) {
            try {
                const scriptInfo = JSON.parse(match[1]);
                const scriptName = path.basename(sourceFilePath);
                infoData.scripts[scriptName] = scriptInfo;
                await fs.writeJson(infoPath, infoData, { spaces: 2 });
                console.log(`ℹ️  Updated generated-system-info.json for ${scriptName}`);
            } catch (error) {
                console.error(`❌ Error parsing machine-readable summary for ${sourceFilePath}:`, error);
            }
        } else {
            console.warn(`⚠️  Could not find machine-readable summary for ${sourceFilePath}`);
        }
    }
}

// Command-line execution
if (process.argv[2]) {
    const manager = new DocumentManager();
    manager.generate(process.argv[2]);
} else {
    console.log('Usage: node document-generator.js <path/to/file.js>');
}
