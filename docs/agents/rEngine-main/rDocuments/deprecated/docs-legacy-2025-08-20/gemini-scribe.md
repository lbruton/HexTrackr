# gemini-scribe.js - Markdown to HTML Documentation Generator

This script converts Markdown files found within a specified directory into HTML files, creating an index page for easy navigation. It's designed to automate the generation of human-readable documentation from Markdown source files, specifically within the StackTrackr project.

## How to Use

1. **Prerequisites:** Node.js and npm must be installed. The project requires the `marked` and `fs/promises` (built-in with Node.js) packages. Ensure they are installed by running `npm install marked` within the project directory.
2. **Execution:** Navigate to the project's root directory in your terminal and run the script using Node.js: `node gemini-scribe.js`.
3. **Output:** The script generates HTML files corresponding to each Markdown file in `/Volumes/DATA/GitHub/rEngine/docs/generated` and places them, along with an index.html file, in `/Volumes/DATA/GitHub/rEngine/docs/generated/human-readable`. It also removes the old directory `/Volumes/DATA/GitHub/rEngine/docs/generated/human`.

## Core Logic Breakdown

1. **Import necessary modules:** The script imports `marked` for Markdown parsing, `fs/promises` for file system operations, and `path` for path manipulation.
2. **Define directory constants:** `generatedDir`, `outputDir`, and `oldHumanDir` store the paths for input Markdown files, output HTML files, and the old output directory to be deleted, respectively.
3. **`getMarkdownFiles(dir)`:** This function recursively searches the given directory for `.md` files. It returns an array of absolute paths to these Markdown files.
4. **`main()`:** This asynchronous function is the entry point of the script.
    * Creates the output directory if it doesn't exist.
    * Calls `getMarkdownFiles()` to get a list of Markdown files.
    * Iterates through each Markdown file:
        * Reads the Markdown content.
        * Converts the Markdown to HTML using `marked()`.
        * Generates an HTML file name based on the relative path of the Markdown file.
        * Constructs the complete HTML document, including a title, viewport meta tag, a link to a CSS stylesheet, and the converted HTML content wrapped in a `div` with the class "container".
        * Writes the HTML to the output directory.
        * Adds the file name and path to an array for index creation.
    * Creates an `index.html` file containing links to all generated HTML files.
    * Logs a success message to the console.
    * Removes the old output directory (`oldHumanDir`) if it exists, handling potential errors gracefully.
1. **Execution:** Finally, `main()` is called to start the process.

## Configuration & Dependencies

* **Dependencies:**
  * `marked`: Used for Markdown to HTML conversion. Install via npm: `npm install marked`.
  * `fs/promises`: Used for asynchronous file system operations. This is a built-in module in Node.js and requires no separate installation.
  * `path`: Used for path manipulation.  This is a built-in module in Node.js and requires no separate installation.

* **Configuration:**
  * The script is configured through hardcoded paths at the beginning of the file: `generatedDir`, `outputDir`, and `oldHumanDir`. These paths specify the input directory, output directory, and the directory to be removed.
  * The CSS stylesheet path is also hardcoded within the HTML template as `../../../css/styles.css`, relative to the generated HTML files.

## Machine-Readable Summary

```json
{
  "scriptName": "gemini-scribe.js",
  "purpose": "Converts Markdown files to HTML and generates an index file for easy navigation of the generated documentation.",
  "inputs": {
    "arguments": [],
    "dependencies": [
      "marked",
      "fs/promises",
      "path"
    ],
    "inputDirectory": "/Volumes/DATA/GitHub/rEngine/docs/generated"
  },
  "outputs": {
    "outputDirectory": "/Volumes/DATA/GitHub/rEngine/docs/generated/human-readable",
    "files": [
      "*.html",
      "index.html"
    ],
    "consoleOutput": "Generated HTML files and index."
  }
}
```
