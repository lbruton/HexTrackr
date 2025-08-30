
class VisibleMemoryWriter {
    static async writeWithNotification(file, data, operation = "write") {
        console.log("\x1b[95m📝 MEMORY WRITE: \x1b[92m" + file + "\x1b[0m");
        console.log("\x1b[94m   Operation: " + operation + "\x1b[0m");
        console.log("\x1b[93m   Data size: " + JSON.stringify(data).length + " chars\x1b[0m");
        
        // Actual write operation here
        const fs = require("fs-extra");
        await fs.writeFile(file, JSON.stringify(data, null, 2));
        
        console.log("\x1b[92m✅ MEMORY SAVED SUCCESSFULLY\x1b[0m\n");
    }
}

module.exports = VisibleMemoryWriter;
        