#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';

async function cleanupDocumentationStructure() {
    console.log('🧹 Cleaning up Documentation Directory Structure...\n');
    
    const docsDir = '/Volumes/DATA/GitHub/rEngine/docs';
    
    try {
        // 1. Create the correct structure
        await createCorrectStructure(docsDir);
        
        // 2. Move files to correct locations
        await moveFilesToCorrectLocations(docsDir);
        
        // 3. Clean up recursive/nested directories
        await cleanupRecursiveDirectories(docsDir);
        
        // 4. Verify the final structure
        await verifyStructure(docsDir);
        
        console.log('\n🎉 Documentation structure cleanup complete!');
        
    } catch (error) {
        console.error('💥 Error during cleanup:', error.message);
    }
}

async function createCorrectStructure(docsDir) {
    console.log('📁 Creating correct directory structure...');
    
    const requiredDirs = [
        path.join(docsDir, 'generated'),
        path.join(docsDir, 'generated/html'),
        path.join(docsDir, 'generated/json')
    ];
    
    for (const dir of requiredDirs) {
        await fs.ensureDir(dir);
        console.log(`   ✅ Created: ${path.relative(docsDir, dir)}/`);
    }
}

async function moveFilesToCorrectLocations(docsDir) {
    console.log('\n📦 Moving files to correct locations...');
    
    // Find all misplaced files
    const htmlFiles = await findFilesRecursively(docsDir, '.html');
    const jsonFiles = await findFilesRecursively(docsDir, '.json');
    const mdFiles = await findFilesRecursively(docsDir, '.md');
    
    let movedCount = 0;
    
    // Move HTML files to docs/generated/html/
    for (const htmlFile of htmlFiles) {
        if (!htmlFile.includes('/generated/html/') && !htmlFile.endsWith('/index.html')) {
            const targetPath = await calculateCorrectPath(htmlFile, docsDir, 'html');
            if (targetPath !== htmlFile) {
                await moveFileWithBackup(htmlFile, targetPath);
                movedCount++;
            }
        }
    }
    
    // Move JSON files to docs/generated/json/
    for (const jsonFile of jsonFiles) {
        if (!jsonFile.includes('/generated/json/')) {
            const targetPath = await calculateCorrectPath(jsonFile, docsDir, 'json');
            if (targetPath !== jsonFile) {
                await moveFileWithBackup(jsonFile, targetPath);
                movedCount++;
            }
        }
    }
    
    // Move MD files to docs/generated/
    for (const mdFile of mdFiles) {
        if (!mdFile.includes('/generated/') || mdFile.includes('/generated/html/') || mdFile.includes('/generated/json/')) {
            const targetPath = await calculateCorrectPath(mdFile, docsDir, 'md');
            if (targetPath !== mdFile) {
                await moveFileWithBackup(mdFile, targetPath);
                movedCount++;
            }
        }
    }
    
    console.log(`   📊 Moved ${movedCount} files to correct locations`);
}

async function calculateCorrectPath(filePath, docsDir, type) {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(docsDir, filePath);
    
    // Extract the project path from the current location
    let projectPath = '';
    
    // Remove all the nested docs/generated patterns
    let cleanPath = relativePath;
    cleanPath = cleanPath.replace(/^(html\/)?generated\//, '');
    cleanPath = cleanPath.replace(/\/docs\/generated/g, '');
    cleanPath = cleanPath.replace(/^docs\/generated\//, '');
    
    // Get directory part
    projectPath = path.dirname(cleanPath);
    if (projectPath === '.') projectPath = '';
    
    // Calculate target based on file type
    let targetDir;
    if (type === 'html') {
        targetDir = path.join(docsDir, 'generated/html', projectPath);
    } else if (type === 'json') {
        targetDir = path.join(docsDir, 'generated/json', projectPath);
    } else { // markdown
        targetDir = path.join(docsDir, 'generated', projectPath);
    }
    
    return path.join(targetDir, fileName);
}

async function moveFileWithBackup(sourcePath, targetPath) {
    try {
        await fs.ensureDir(path.dirname(targetPath));
        
        // If target exists, don't overwrite
        if (await fs.pathExists(targetPath)) {
            console.log(`   ⚠️  Target exists, skipping: ${path.basename(targetPath)}`);
            return;
        }
        
        await fs.move(sourcePath, targetPath);
        console.log(`   📁 Moved: ${path.basename(sourcePath)} → ${path.relative('/Volumes/DATA/GitHub/rEngine/docs', targetPath)}`);
    } catch (error) {
        console.error(`   ❌ Failed to move ${sourcePath}: ${error.message}`);
    }
}

async function findFilesRecursively(dir, extension) {
    const files = [];
    
    try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                files.push(...await findFilesRecursively(fullPath, extension));
            } else if (item.name.endsWith(extension)) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        // Directory doesn't exist or can't be read
    }
    
    return files;
}

async function cleanupRecursiveDirectories(docsDir) {
    console.log('\n🗑️  Cleaning up recursive directories...');
    
    try {
        // Find and remove empty nested docs/generated directories
        const recursiveDirs = await findRecursiveDirectories(docsDir);
        
        for (const dir of recursiveDirs) {
            const items = await fs.readdir(dir);
            if (items.length === 0) {
                await fs.remove(dir);
                console.log(`   🗑️  Removed empty: ${path.relative(docsDir, dir)}`);
            }
        }
        
    } catch (error) {
        console.error(`   ⚠️  Cleanup warning: ${error.message}`);
    }
}

async function findRecursiveDirectories(dir) {
    const recursiveDirs = [];
    
    try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
            if (item.isDirectory()) {
                const fullPath = path.join(dir, item.name);
                
                // Look for nested docs/generated patterns
                if (fullPath.includes('/docs/generated/docs/') || 
                    fullPath.includes('/generated/docs/') ||
                    fullPath.includes('/html/generated/docs/')) {
                    recursiveDirs.push(fullPath);
                }
                
                recursiveDirs.push(...await findRecursiveDirectories(fullPath));
            }
        }
    } catch (error) {
        // Directory doesn't exist or can't be read
    }
    
    return recursiveDirs;
}

async function verifyStructure(docsDir) {
    console.log('\n📋 Verifying final structure:');
    
    const structure = {
        'generated/': await countFiles(path.join(docsDir, 'generated'), '.md'),
        'generated/html/': await countFiles(path.join(docsDir, 'generated/html'), '.html'),
        'generated/json/': await countFiles(path.join(docsDir, 'generated/json'), '.json')
    };
    
    for (const [dir, count] of Object.entries(structure)) {
        console.log(`   📁 ${dir} - ${count} files`);
    }
}

async function countFiles(dir, extension) {
    try {
        const files = await findFilesRecursively(dir, extension);
        return files.length;
    } catch (error) {
        return 0;
    }
}

// Run the cleanup
cleanupDocumentationStructure();
