const fs = require("fs").promises;
const path = require("path");

const sourceDir = path.join(process.cwd(), "docs-prototype", "content");
const targetDir = path.join(process.cwd(), "docs-source");

async function replicateStructure() {
    console.log(`Scanning ${sourceDir} to replicate structure in ${targetDir}...`);
    
    try {
        const items = await fs.readdir(sourceDir, { withFileTypes: true });
        
        for (const item of items) {
            const sourcePath = path.join(sourceDir, item.name);
            const targetPath = path.join(targetDir, item.name.replace(/\.html$/, ".md"));

            if (item.isDirectory()) {
                await fs.mkdir(path.join(targetDir, item.name), { recursive: true });
                await replicateDirectory(sourcePath, path.join(targetDir, item.name));
            } else if (item.name.endsWith(".html")) {
                await fs.writeFile(targetPath, "");
                console.log(`Created empty file: ${path.relative(process.cwd(), targetPath)}`);
            }
        }
        console.log("✅ Initial file structure replication complete.");

    } catch (error) {
        console.error("❌ Error during initial structure replication:", error);
    }
}

async function replicateDirectory(currentSourceDir, currentTargetDir) {
    const items = await fs.readdir(currentSourceDir, { withFileTypes: true });

    for (const item of items) {
        const sourcePath = path.join(currentSourceDir, item.name);
        const targetPath = path.join(currentTargetDir, item.name.replace(/\.html$/, ".md"));

        if (item.isDirectory()) {
            await fs.mkdir(targetPath, { recursive: true });
            await replicateDirectory(sourcePath, targetPath);
        } else if (item.name.endsWith(".html")) {
            await fs.writeFile(targetPath, "");
            console.log(`Created empty file: ${path.relative(process.cwd(), targetPath)}`);
        }
    }
}

replicateStructure();
