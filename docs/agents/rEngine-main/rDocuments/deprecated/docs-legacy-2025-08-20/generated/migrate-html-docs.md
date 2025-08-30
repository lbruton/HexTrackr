# migrate-html-docs.sh: Centralizing HTML Documentation for rEngine Core

## Purpose & Overview

The `migrate-html-docs.sh` script is a utility within the rEngine Core ecosystem that simplifies the management of HTML documentation. Its primary purpose is to move all HTML files from the `docs/generated/html` directory to a centralized `html-docs` folder, enabling easier organization and maintenance of the documentation.

This script serves as a crucial part of the rEngine Core documentation infrastructure, ensuring that the HTML content is properly organized and accessible to users and developers working with the platform.

## Key Functions/Classes

The script performs the following key functions:

1. **Directory Management**: It creates the necessary directory structure to hold the migrated HTML files, including the `html-docs/generated` and `html-docs/archive` directories.
2. **File Migration**: The script moves all HTML files from the `docs/generated/html` directory to the `html-docs/generated` directory, preserving the directory structure.
3. **Backup and Versioning**: If the `html-docs` directory already contains files, the script creates a backup of the existing content in the `html-docs/archive` directory, using a timestamp-based naming convention.
4. **Portal Link Updates**: If a `documentation.html` file exists in the `html-docs` directory, the script updates the relative paths in the file to ensure the links to the migrated HTML files are correct.
5. **Migration Index**: The script generates a Markdown file (`MIGRATION-<timestamp>.md`) in the `html-docs` directory, which provides a summary of the migration process and a list of all the migrated HTML files.

## Dependencies

The `migrate-html-docs.sh` script relies on the following dependencies:

- Bash shell
- `rsync` utility for efficient file copying and directory structure preservation
- `sed` command for updating the portal HTML file

## Usage Examples

To run the `migrate-html-docs.sh` script, simply execute the following command from the project's root directory:

```bash
./scripts/migrate-html-docs.sh
```

This will trigger the HTML documentation migration process, as described in the "Key Functions/Classes" section.

## Configuration

The script does not require any external configuration or environment variables. It operates based on the existing directory structure and assumes the presence of the `docs/generated/html` and `html-docs` directories.

## Integration Points

The `migrate-html-docs.sh` script is a standalone utility within the rEngine Core ecosystem, but it plays a crucial role in the overall documentation management workflow. It ensures that the HTML documentation is centralized and organized, making it easier for developers and users to access and navigate the documentation.

Other rEngine Core components, such as the documentation portal or the build scripts, may rely on the existence and structure of the `html-docs` directory created by this script.

## Troubleshooting

Here are some common issues that may arise and their potential solutions:

1. **Missing or Empty `docs/generated/html` Directory**:
   - If the `docs/generated/html` directory does not exist or is empty, the script will still run, but there will be no HTML files to migrate.
   - Ensure that the HTML documentation is being properly generated and placed in the `docs/generated/html` directory.

1. **Permissions Issues**:
   - If the script encounters any permission-related issues while creating directories or moving files, ensure that the executing user has the necessary permissions to perform these operations.
   - Check the file and directory permissions in the project's directories.

1. **Conflicts with Existing `html-docs` Content**:
   - If the `html-docs` directory already contains files, the script will attempt to back up the existing content to the `html-docs/archive` directory.
   - If the backup process fails or encounters any issues, check the permissions and available disk space in the project's directories.

1. **Broken Portal Links**:
   - If the script is unable to update the relative paths in the `documentation.html` file, the links to the migrated HTML files may be broken.
   - Manually verify and update the links in the `documentation.html` file if necessary.

By addressing these potential issues, you can ensure that the `migrate-html-docs.sh` script runs smoothly and the HTML documentation is properly migrated and integrated within the rEngine Core platform.
