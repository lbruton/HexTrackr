# Update Footer Branding Script

## Purpose & Overview

The `update-footer-branding.js` script is part of the rEngine Core platform, responsible for automatically updating the HTML documentation files with standardized rEngine branding. This script ensures a consistent and professional look and feel across all the generated HTML documentation, providing a seamless experience for users.

The script scans the `docs/generated/html` directory for HTML files, and then updates the footer section of each file with the following changes:

1. Adds a standardized footer HTML structure with the rEngine branding information.
2. Adds the corresponding CSS styles for the footer.
3. Ensures that the footer is present in the HTML file, even if it was not there before.

This script is typically run as part of the rEngine documentation generation process, ensuring that all newly generated HTML files are branded correctly.

## Key Functions/Classes

The main components and their roles in the `update-footer-branding.js` script are:

1. **`findHTMLFiles(dir)`**: This asynchronous function recursively searches the provided directory (`docsDir`) for all HTML files and returns their file paths.
2. **`updateHTMLFile(filePath)`**: This asynchronous function takes the file path of an HTML file, reads its contents, and updates the footer section with the new branding information. It checks for various footer patterns and replaces them with the new standardized footer HTML and CSS.
3. **`main()`**: This is the entry point of the script. It logs the overall process, checks the existence of the documentation directory, scans for HTML files, updates them, and provides a summary of the changes made.

## Dependencies

The `update-footer-branding.js` script has the following dependencies:

- **`fs-extra`**: A comprehensive file system library for Node.js that provides extra functionality over the built-in `fs` module.
- **`path`**: The built-in Node.js module for working with file and directory paths.
- **`fileURLToPath`**: A function from the built-in `url` module that converts a URL object to a file path.

These dependencies are imported at the beginning of the script.

## Usage Examples

To use the `update-footer-branding.js` script, follow these steps:

1. Ensure that the script is located in the appropriate directory within the rEngine Core project.
2. Open a terminal or command prompt and navigate to the rEngine Core project directory.
3. Run the script using the following command:

   ```bash
   node rEngine/update-footer-branding.js
   ```

   This will scan the `docs/generated/html` directory, update the HTML files with the new branding, and provide a summary of the changes made.

## Configuration

The `update-footer-branding.js` script does not require any external configuration. The `docsDir` variable is set to the `docs/generated/html` directory, which is the default location for the generated HTML documentation files.

## Integration Points

The `update-footer-branding.js` script is closely integrated with the rEngine Core documentation generation process. It is typically executed as part of the build or deployment pipeline, ensuring that all newly generated HTML files are updated with the correct branding information.

## Troubleshooting

If you encounter any issues while running the `update-footer-branding.js` script, here are some common problems and their solutions:

1. **Documentation directory not found**:
   - Ensure that the `docs/generated/html` directory exists within the rEngine Core project.
   - Check the `docsDir` variable in the script to make sure it is pointing to the correct location.

1. **Error updating HTML files**:
   - Check the file permissions and ensure that the script has the necessary write access to the HTML files.
   - Verify that the HTML files are not being used or locked by other processes.
   - Inspect the error messages printed by the script to identify the specific issue.

1. **Branding not updated correctly**:
   - Ensure that the new footer HTML and CSS are correctly formatted and match the expected structure.
   - Check if the script is correctly identifying and replacing the existing footer sections in the HTML files.
   - Verify that the script is running successfully and not encountering any errors during the update process.

If you continue to encounter issues, you can reach out to the rEngine Core development team for further assistance.
