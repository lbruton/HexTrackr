# MemoryChangeBundle Integration in rEngine Core

## Purpose & Overview

The `PROMPT_INTEGRATION.md` file in the `rAgents/rMemoryBundles` directory of the rEngine Core platform describes the integration of the MemoryChangeBundle format with the platform's prompt system. The MemoryChangeBundle format is a standardized way to represent changes to an agent's memory, and this integration allows for seamless import and export of these memory changes via prompts, enabling collaboration with various large language models (LLMs).

## Key Functions/Classes

The key components described in this file are:

1. **Prompt System Integration**: The MemoryChangeBundle format is now fully integrated with the rEngine Core prompt system, allowing for easy export and import of memory changes through prompts.
2. **Export Methods**: There are three main ways to export MemoryChangeBundles:
   - Via Prompts (Recommended)
   - Via Quick Commands
   - Via Universal Export
1. **Available Prompt Aliases**: The file lists the new and existing prompt aliases related to MemoryChangeBundle and other export functionality.
2. **Workflow Examples**: The file provides examples of how to use the various prompts and export methods for memory collaboration, universal export, and quick export.
3. **Memory System Integration**: The file outlines the current memory formats supported (JSON files, MemoryChangeBundle, and SQLite-ready), as well as the prompt-triggered workflows for export generation, format selection, collaboration setup, and patch application.
4. **Production-Ready Features**: The file provides examples of how to use the MemoryChangeBundle export functionality for both human users and LLM collaboration.
5. **Universal LLM Support**: The file lists the various LLMs supported by the prompt system and their corresponding export commands and prompt triggers.

## Dependencies

The MemoryChangeBundle integration in rEngine Core depends on the following components:

- Prompt System: The integration relies on the platform's prompt system to enable seamless export and import of MemoryChangeBundles.
- Memory Vault: The MemoryChangeBundle format is integrated with the platform's memory management system, allowing for atomic operations and a checkout/checkin protocol.
- Export Scripts: The file describes the various export scripts, such as `export.sh` and `universal_export.sh`, which are used to generate MemoryChangeBundles and other export types.
- Patch Application: The file mentions the future support for applying MemoryChangeBundle patches using scripts like `apply_json_patch.py` and `apply_sqlite_patch.py`.

## Usage Examples

Here are some examples of how to use the MemoryChangeBundle integration in rEngine Core:

### Exporting a MemoryChangeBundle via Prompts

```
Human: "Use the memory-changeb prompt to create a bundle for GPT"
GitHub Copilot:

1. Runs: ./agents/scripts/universal_export.sh change-bundle
2. Creates: MemoryChangeBundle-template-[timestamp].zip
3. Provides: RFC-6902 patch workflow instructions

```

### Exporting a Universal Bundle for Claude

```
Human: "Use the export-universal prompt for Claude collaboration"
GitHub Copilot:

1. Shows all export types available
2. Recommends: ./agents/scripts/universal_export.sh markdown --llm claude
3. Creates: Optimized export for Claude

```

### Quick Export for ChatGPT

```
Human: "Quick export for ChatGPT"
GitHub Copilot: ./agents/scripts/export.sh chatgpt
```

## Configuration

The MemoryChangeBundle integration in rEngine Core does not require any specific environment variables or configuration. However, the underlying export scripts and prompt system may have their own configuration requirements.

## Integration Points

The MemoryChangeBundle integration is a key component of the rEngine Core platform, connecting the following systems:

- Prompt System: The integration enables seamless export and import of MemoryChangeBundles via prompts.
- Memory Vault: The MemoryChangeBundle format is integrated with the platform's memory management system.
- Export Scripts: The integration utilizes the various export scripts to generate MemoryChangeBundles and other export types.
- Patch Application: Future support for applying MemoryChangeBundle patches will be integrated with the platform's memory management system.

## Troubleshooting

Common issues and solutions related to the MemoryChangeBundle integration in rEngine Core may include:

1. **Export Script Failures**: If the export scripts (`export.sh` or `universal_export.sh`) fail to generate the expected MemoryChangeBundle, check the script logs for any error messages and ensure that the necessary dependencies are installed.
2. **Prompt Recognition Issues**: If the prompts for MemoryChangeBundle export and import are not working as expected, verify that the prompt system is configured correctly and that the prompt aliases are defined in the `agents/prompts.json` file.
3. **Patch Application Errors**: When receiving a MemoryChangeBundle from an LLM collaboration and attempting to apply the patch, ensure that the `apply_json_patch.py` or `apply_sqlite_patch.py` scripts are functioning correctly and that the memory format is compatible.

If you encounter any other issues, please consult the rEngine Core documentation or reach out to the development team for assistance.
