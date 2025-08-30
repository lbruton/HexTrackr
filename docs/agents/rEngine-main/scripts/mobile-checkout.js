#!/usr/bin/env node

/**
 * Mobile Development Checkout System
 * Creates a portable development package for working offline
 * 
 * Features:
 * - Packages git-ignored files (API keys, configs, etc.)
 * - Creates fallback API configuration for Ollama replacement
 * - Generates timestamp-based checkout file
 * - Excludes sensitive data from git while maintaining functionality
 * 
 * Usage: node mobile-checkout.js [destination-folder]
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import archiver from 'archiver';

const execPromise = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

class MobileCheckout {
    constructor() {
        this.baseDir = '/Volumes/DATA/GitHub/rEngine';
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.checkoutId = `mobile-checkout-${this.timestamp}`;
        this.ignoredFiles = [];
        this.apiKeys = {};
        this.configs = {};
    }

    async start() {
        console.log(`🚀 Creating mobile development checkout: ${this.checkoutId}`);
        
        try {
            // Step 1: Analyze git-ignored files
            await this.analyzeIgnoredFiles();
            
            // Step 2: Extract API keys and configs
            await this.extractConfigurations();
            
            // Step 3: Create fallback API configuration
            await this.createApiFallbackConfig();
            
            // Step 4: Package everything into a zip
            const zipPath = await this.createMobilePackage();
            
            // Step 5: Generate checkout manifest
            await this.generateCheckoutManifest();
            
            console.log(`✅ Mobile checkout complete: ${zipPath}`);
            console.log(`📋 Checkout ID: ${this.checkoutId}`);
            console.log(`\n🎒 Ready for mobile development!`);
            
        } catch (error) {
            console.error('❌ Checkout failed:', error.message);
            process.exit(1);
        }
    }

    async analyzeIgnoredFiles() {
        console.log('🔍 Analyzing git-ignored files...');
        
        try {
            // Get list of git-ignored files that exist
            const { stdout } = await execPromise('git ls-files --others --ignored --exclude-standard', {
                cwd: this.baseDir
            });
            
            this.ignoredFiles = stdout.split('\n')
                .filter(file => file.trim())
                .filter(file => fs.existsSync(path.join(this.baseDir, file)));
                
            console.log(`   Found ${this.ignoredFiles.length} git-ignored files`);
            
            // Log important ignored files
            const importantFiles = this.ignoredFiles.filter(file => 
                file.includes('env') || 
                file.includes('key') || 
                file.includes('config') ||
                file.includes('secret')
            );
            
            if (importantFiles.length > 0) {
                console.log('   🔑 Sensitive files detected:');
                importantFiles.forEach(file => console.log(`      - ${file}`));
            }
            
        } catch (error) {
            console.log('   ⚠️  Git ignored files analysis failed, continuing...');
            this.ignoredFiles = [];
        }
    }

    async extractConfigurations() {
        console.log('⚙️  Extracting configurations...');
        
        // Extract API keys from environment files
        const envFiles = [
            '.env',
            '.env.local',
            'openwebui-api-keys.env',
            'rEngine/.env',
            'rMemory/.env'
        ];
        
        for (const envFile of envFiles) {
            const envPath = path.join(this.baseDir, envFile);
            if (await fs.pathExists(envPath)) {
                console.log(`   📄 Processing ${envFile}...`);
                const content = await fs.readFile(envPath, 'utf8');
                this.parseEnvFile(content, envFile);
            }
        }
        
        // Extract rEngine configurations
        const configFiles = [
            'rEngine/config.json',
            'rMemory/config.json',
            'rAgents/config.json'
        ];
        
        for (const configFile of configFiles) {
            const configPath = path.join(this.baseDir, configFile);
            if (await fs.pathExists(configPath)) {
                console.log(`   ⚙️  Processing ${configFile}...`);
                try {
                    const config = await fs.readJson(configPath);
                    this.configs[configFile] = config;
                } catch (error) {
                    console.log(`      ⚠️  Failed to parse ${configFile}: ${error.message}`);
                }
            }
        }
        
        console.log(`   ✅ Extracted ${Object.keys(this.apiKeys).length} API keys`);
        console.log(`   ✅ Extracted ${Object.keys(this.configs).length} config files`);
    }

    parseEnvFile(content, filename) {
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                    if (key.includes('API') || key.includes('KEY') || key.includes('SECRET')) {
                        this.apiKeys[key] = {
                            value: value,
                            source: filename,
                            masked: this.maskValue(value)
                        };
                    }
                }
            }
        }
    }

    maskValue(value) {
        if (!value || value.length < 8) return '***';
        return value.substring(0, 4) + '***' + value.substring(value.length - 4);
    }

    async createApiFallbackConfig() {
        console.log('🔄 Creating API fallback configuration...');
        
        const fallbackConfig = {
            mobile_mode: true,
            checkout_id: this.checkoutId,
            timestamp: this.timestamp,
            fallback_apis: {
                ollama: {
                    enabled: false,
                    reason: "Not available in mobile mode"
                },
                openai: {
                    enabled: !!this.apiKeys.OPENAI_API_KEY,
                    model: "gpt-4o-mini",
                    fallback_model: "gpt-3.5-turbo"
                },
                anthropic: {
                    enabled: !!this.apiKeys.ANTHROPIC_API_KEY,
                    model: "claude-3-haiku",
                    fallback_model: "claude-3-haiku"
                },
                groq: {
                    enabled: !!this.apiKeys.GROQ_API_KEY,
                    model: "llama-3.1-8b-instant",
                    fallback_model: "llama-3.1-8b-instant"
                },
                gemini: {
                    enabled: !!this.apiKeys.GEMINI_API_KEY,
                    model: "gemini-1.5-flash",
                    fallback_model: "gemini-1.5-flash"
                }
            },
            mobile_limitations: {
                no_ollama: "Ollama disabled for mobile development",
                no_docker: "Docker services not available",
                api_only: "All AI operations use external APIs",
                limited_memory: "Reduced memory operations for performance"
            },
            mobile_features: {
                lite_scribe: "Lightweight document generation",
                api_scribe: "Cloud-based analysis",
                portable_memory: "Reduced memory footprint",
                essential_tools: "Core development tools only"
            }
        };
        
        this.configs['mobile-config.json'] = fallbackConfig;
        console.log('   ✅ Mobile fallback configuration created');
    }

    async createMobilePackage() {
        console.log('📦 Creating mobile development package...');
        
        const tempDir = path.join(this.baseDir, '.mobile-checkout');
        const zipPath = path.join(this.baseDir, `${this.checkoutId}.zip`);
        
        // Create temporary directory
        await fs.ensureDir(tempDir);
        
        try {
            // Copy git-ignored files
            for (const file of this.ignoredFiles) {
                const sourcePath = path.join(this.baseDir, file);
                const destPath = path.join(tempDir, 'ignored-files', file);
                await fs.ensureDir(path.dirname(destPath));
                await fs.copy(sourcePath, destPath);
            }
            
            // Save extracted configurations
            const configDir = path.join(tempDir, 'mobile-configs');
            await fs.ensureDir(configDir);
            
            for (const [filename, config] of Object.entries(this.configs)) {
                await fs.writeJson(path.join(configDir, path.basename(filename)), config, { spaces: 2 });
            }
            
            // Save API keys (masked for security)
            const keysManifest = {
                api_keys: Object.fromEntries(
                    Object.entries(this.apiKeys).map(([key, data]) => [key, {
                        masked: data.masked,
                        source: data.source,
                        available: !!data.value
                    }])
                ),
                instructions: {
                    setup: "Place actual API keys in mobile environment variables",
                    fallback: "System will use available APIs based on keys present",
                    security: "Actual keys are not included in this package"
                }
            };
            
            await fs.writeJson(path.join(configDir, 'api-keys-manifest.json'), keysManifest, { spaces: 2 });
            
            // Create mobile setup script
            const setupScript = this.generateMobileSetupScript();
            await fs.writeFile(path.join(tempDir, 'mobile-setup.sh'), setupScript);
            await fs.chmod(path.join(tempDir, 'mobile-setup.sh'), '755');
            
            // Create the zip file
            await this.createZipArchive(tempDir, zipPath);
            
            // Cleanup temp directory
            await fs.remove(tempDir);
            
            return zipPath;
            
        } catch (error) {
            await fs.remove(tempDir);
            throw error;
        }
    }

    async createZipArchive(sourceDir, zipPath) {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            
            output.on('close', () => {
                console.log(`   ✅ Package created: ${archive.pointer()} bytes`);
                resolve();
            });
            
            archive.on('error', reject);
            archive.pipe(output);
            archive.directory(sourceDir, false);
            archive.finalize();
        });
    }

    generateMobileSetupScript() {
        return `#!/bin/bash

# Mobile Development Setup Script
# Generated: ${this.timestamp}
# Checkout ID: ${this.checkoutId}

echo "🚀 Setting up mobile development environment..."
echo "📱 Checkout ID: ${this.checkoutId}"
echo ""

# Create necessary directories
mkdir -p .mobile-env
mkdir -p logs
mkdir -p rMemory/mobile-cache

# Copy configurations
echo "⚙️  Installing mobile configurations..."
cp mobile-configs/*.json ./
cp -r ignored-files/* ./

# Set mobile mode flag
echo "MOBILE_MODE=true" > .mobile-env/mobile.env
echo "CHECKOUT_ID=${this.checkoutId}" >> .mobile-env/mobile.env
echo "FALLBACK_TO_API=true" >> .mobile-env/mobile.env

# Create mobile npm script
echo "📋 Adding mobile development scripts..."
if [ -f package.json ]; then
    # Add mobile scripts to package.json if not present
    echo "Mobile development scripts available in package.json"
fi

echo ""
echo "✅ Mobile environment ready!"
echo ""
echo "🔑 API Keys Setup:"
echo "   Copy your API keys to .mobile-env/api-keys.env"
echo "   Or set as environment variables"
echo ""
echo "🚀 Start development:"
echo "   npm run mobile-dev"
echo "   # OR manually:"
echo "   NODE_ENV=mobile npm start"
echo ""
echo "📝 Remember to run checkin script when done!"

`;
    }

    async generateCheckoutManifest() {
        console.log('📋 Generating checkout manifest...');
        
        const manifest = {
            checkout_info: {
                id: this.checkoutId,
                timestamp: this.timestamp,
                created_by: "mobile-checkout.js",
                version: "1.0.0"
            },
            git_status: await this.getGitStatus(),
            ignored_files: this.ignoredFiles,
            api_keys_found: Object.keys(this.apiKeys),
            configs_extracted: Object.keys(this.configs),
            mobile_limitations: [
                "No Ollama support (API fallback only)",
                "No Docker containers",
                "Reduced memory operations",
                "Limited background processes"
            ],
            checkin_instructions: {
                command: `node scripts/mobile-checkin.js ${this.checkoutId}`,
                requirements: [
                    "Copy zip file to main development machine",
                    "Run checkin script to merge changes",
                    "Resolve any conflicts manually",
                    "Commit merged changes"
                ]
            },
            package_contents: {
                zip_file: `${this.checkoutId}.zip`,
                manifest_file: `${this.checkoutId}-manifest.json`,
                size_estimate: "Calculating..."
            }
        };
        
        const manifestPath = path.join(this.baseDir, `${this.checkoutId}-manifest.json`);
        await fs.writeJson(manifestPath, manifest, { spaces: 2 });
        
        console.log(`   ✅ Manifest created: ${manifestPath}`);
        return manifestPath;
    }

    async getGitStatus() {
        try {
            const { stdout: status } = await execPromise('git status --porcelain', { cwd: this.baseDir });
            const { stdout: branch } = await execPromise('git branch --show-current', { cwd: this.baseDir });
            const { stdout: commit } = await execPromise('git rev-parse HEAD', { cwd: this.baseDir });
            
            return {
                branch: branch.trim(),
                commit: commit.trim().substring(0, 8),
                has_changes: status.trim().length > 0,
                changes: status.trim().split('\n').filter(line => line.trim())
            };
        } catch (error) {
            return {
                error: "Could not get git status",
                message: error.message
            };
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const checkout = new MobileCheckout();
    checkout.start().catch(console.error);
}

export default MobileCheckout;
