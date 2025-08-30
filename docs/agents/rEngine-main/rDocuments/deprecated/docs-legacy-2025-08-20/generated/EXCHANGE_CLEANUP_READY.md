# rMemoryBundles: EXCHANGE_CLEANUP_READY.md

## Purpose & Overview

The `EXCHANGE_CLEANUP_READY.md` file is part of the `rMemoryBundles` module within the rEngine Core platform. This file provides a comprehensive technical documentation for the `exchange-cleanup` prompt, which is an intelligent and automated process for managing the `portable_exchange/` folder in the rEngine Core ecosystem.

The `exchange-cleanup` prompt is designed to:

1. **Clean Export Files**: Remove outdated and duplicate ZIP bundles, MemoryChangeBundle files, and legacy export archives from the `portable_exchange/` folder.
2. **Preserve Important Files**: Maintain instructional, template, and setup files to ensure the integrity of the exchange process.
3. **Implement Smart Rules**: Develop a robust set of rules to identify and retain the most recent and relevant files, while safely removing obsolete or unnecessary data.

This prompt is an essential tool for rEngine Core users, enabling them to effortlessly maintain the organization and cleanliness of the `portable_exchange/` folder, ensuring efficient storage management and collaboration readiness.

## Key Functions/Classes

The `EXCHANGE_CLEANUP_READY.md` file does not contain any specific code or classes. Instead, it provides detailed instructions and documentation on the usage, configuration, and integration of the `exchange-cleanup` prompt within the rEngine Core platform.

## Dependencies

The `exchange-cleanup` prompt does not have any direct dependencies. However, it relies on the overall functionality and infrastructure of the rEngine Core platform, specifically the prompt system and the `portable_exchange/` folder management.

## Usage Examples

The `exchange-cleanup` prompt can be used in the following ways:

### Via Prompt System (Recommended)

```
Human: "Use the exchange-cleanup prompt"
GitHub Copilot: Executes smart cleanup of portable_exchange/ folder
```

### Custom Cleanup

```
Human: "Use the exchange-cleanup prompt but keep the last 2 exports of each type"
Result: Modified cleanup with custom retention rules
```

## Configuration

The `exchange-cleanup` prompt does not require any specific configuration or environment variables. It uses a set of predefined rules and heuristics to determine the files to be cleaned up and preserved.

## Integration Points

The `exchange-cleanup` prompt is fully integrated into the rEngine Core platform's prompt system. It is categorized as a "maintenance" prompt and is available for use as needed by rEngine Core users.

## Troubleshooting

The `exchange-cleanup` prompt is designed to be a robust and reliable tool for managing the `portable_exchange/` folder. However, in case of any issues or unexpected behavior, users can refer to the following troubleshooting steps:

1. **Review Prompt Execution**: Carefully review the output of the prompt execution to ensure that the cleanup process is working as expected.
2. **Check Folder Contents**: Manually inspect the `portable_exchange/` folder to verify the state of the files after the cleanup process.
3. **Adjust Retention Rules**: If necessary, modify the retention rules within the prompt to better suit the specific needs of the rEngine Core deployment.
4. **Backup Important Files**: For files larger than 10MB, it is recommended to create a backup before executing the cleanup process.
5. **Reach Out to rEngine Core Support**: If the issue persists or you have any further questions, contact the rEngine Core support team for assistance.

By following these troubleshooting steps, users can ensure the smooth and reliable operation of the `exchange-cleanup` prompt within the rEngine Core ecosystem.
