#!/usr/bin/env node

/* eslint-env node */
/* global require, process, console */

const fs = require("fs").promises;
const path = require("path");

/**
 * Secure path validation utility to prevent path traversal attacks
 */
class PathValidator {
    static validatePathComponent(component) {
        if (!component || typeof component !== "string") {
            throw new Error("Invalid path component: must be a non-empty string");
        }

        // Check for dangerous characters
        const dangerousChars = /[<>"|?*\0]/;
        if (dangerousChars.test(component)) {
            throw new Error(`Invalid characters in path component: ${component}`);
        }

        // Check for path traversal attempts
        if (component.includes("..") || component.startsWith("/") || component.includes("\\")) {
            throw new Error(`Path traversal attempt detected in component: ${component}`);
        }

        return component;
    }

    static validatePath(filePath, allowedBaseDir = process.cwd()) {
        if (!filePath || typeof filePath !== "string") {
            throw new Error("Invalid file path: path must be a non-empty string");
        }

        // Resolve the path to get absolute path
        const resolvedPath = path.resolve(filePath);
        const resolvedBase = path.resolve(allowedBaseDir);

        // Check if the resolved path is within the allowed base directory
        if (!resolvedPath.startsWith(resolvedBase)) {
            throw new Error(`Path traversal detected: ${filePath} is outside allowed directory ${allowedBaseDir}`);
        }

        return resolvedPath;
    }

    static async safeReaddir(dirPath, options = {}) {
        const validatedPath = PathValidator.validatePath(dirPath);
        return await fs.readdir(validatedPath, options);
    }

    static async safeWriteFile(filePath, data, options = "utf8") {
        const validatedPath = PathValidator.validatePath(filePath);
        return await fs.writeFile(validatedPath, data, options);
    }

    static async safeMkdir(dirPath, options = { recursive: true }) {
        const validatedPath = PathValidator.validatePath(dirPath);
        return await fs.mkdir(validatedPath, options);
    }
}

const sourceDir = path.join(process.cwd(), "docs-prototype", "content");
const targetDir = path.join(process.cwd(), "docs-source");

async function replicateStructure() {
    console.log(`Scanning ${sourceDir} to replicate structure in ${targetDir}...`);
    
    try {
        const items = await PathValidator.safeReaddir(sourceDir, { withFileTypes: true });
        
        for (const item of items) {
            // Validate item name before using in path operations
            const validatedName = PathValidator.validatePathComponent(item.name);
            const sourcePath = path.join(sourceDir, validatedName);
            const targetPath = path.join(targetDir, validatedName.replace(/\.html$/, ".md"));

            if (item.isDirectory()) {
                await PathValidator.safeMkdir(path.join(targetDir, validatedName), { recursive: true });
                await replicateDirectory(sourcePath, path.join(targetDir, validatedName));
            } else if (validatedName.endsWith(".html")) {
                await PathValidator.safeWriteFile(targetPath, "");
                console.log(`Created empty file: ${path.relative(process.cwd(), targetPath)}`);
            }
        }
        console.log("✅ Initial file structure replication complete.");

    } catch (error) {
        console.error("❌ Error during initial structure replication:", error);
    }
}

async function replicateDirectory(currentSourceDir, currentTargetDir) {
    const items = await PathValidator.safeReaddir(currentSourceDir, { withFileTypes: true });

    for (const item of items) {
        // Validate item name before using in path operations
        const validatedName = PathValidator.validatePathComponent(item.name);
        const sourcePath = path.join(currentSourceDir, validatedName);
        const targetPath = path.join(currentTargetDir, validatedName.replace(/\.html$/, ".md"));

        if (item.isDirectory()) {
            await PathValidator.safeMkdir(targetPath, { recursive: true });
            await replicateDirectory(sourcePath, targetPath);
        } else if (validatedName.endsWith(".html")) {
            await PathValidator.safeWriteFile(targetPath, "");
            console.log(`Created empty file: ${path.relative(process.cwd(), targetPath)}`);
        }
    }
}

replicateStructure();
