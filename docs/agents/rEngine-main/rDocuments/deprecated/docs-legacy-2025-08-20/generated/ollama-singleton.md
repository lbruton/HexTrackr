# Ollama Singleton Manager

## Purpose & Overview

The `ollama-singleton.sh` script is a part of the rEngine Core ecosystem, and its primary purpose is to ensure that only a single instance of the Ollama language model is running at a time. This is crucial for preventing memory issues that can arise from multiple concurrent models, which can lead to performance degradation and potential system instability.

The script provides a set of functions to manage the Ollama instance, including starting, stopping, and restarting the model, as well as running specific models and listing available models. It also includes mechanisms to detect and terminate any existing Ollama processes to maintain a single, stable instance.

## Key Functions/Classes

1. **`kill_all_ollama()`**: This function is responsible for terminating all existing Ollama processes, including any lingering processes that may not have been properly terminated. It also cleans up any lock files that were created.

1. **`is_ollama_running()`**: This function checks if an Ollama process is currently running by searching for any processes with the "ollama" keyword.

1. **`start_ollama()`**: This function starts a new Ollama instance, sets the necessary environment variables, and creates a lock file with the process ID to ensure that only one instance is running at a time.

1. **`run_model()`**: This function allows the user to run a specific Ollama model, with an optional prompt. It also includes a warning for using heavy models that require a significant amount of VRAM.

1. **`list_models()`**: This function lists all the available Ollama models that can be used.

1. **`check_status()`**: This function provides a comprehensive status check, displaying information about the lock file, PID file, whether Ollama is running, and the memory usage of the running Ollama processes.

## Dependencies

The `ollama-singleton.sh` script depends on the following:

1. **Ollama**: The script assumes that the Ollama language model is installed and available on the system. It interacts with the Ollama command-line interface to manage the model.
2. **Bash**: The script is written in Bash and requires a Bash-compatible shell to execute.

## Usage Examples

### Starting Ollama

```bash
./ollama-singleton.sh
```

This will start the Ollama instance if it's not already running.

### Restarting Ollama

```bash
./ollama-singleton.sh restart
```

This will stop any existing Ollama processes and start a new instance.

### Running a Model

```bash
./ollama-singleton.sh run qwen2.5-coder:3b "Write a short story about a robot exploring a new planet."
```

This will run the `qwen2.5-coder:3b` model with the provided prompt.

### Listing Available Models

```bash
./ollama-singleton.sh list
```

This will display a list of all the available Ollama models.

### Checking Ollama Status

```bash
./ollama-singleton.sh status
```

This will provide a comprehensive status report, including information about the lock file, PID file, running processes, and memory usage.

## Configuration

The `ollama-singleton.sh` script uses the following environment variables:

1. **`OLLAMA_MODELS_DIR`**: The directory where the Ollama models are stored. By default, it is set to `/Volumes/DATA/ollama`.
2. **`LOCK_FILE`**: The path to the lock file, which is used to ensure that only one Ollama instance is running. By default, it is set to `/tmp/ollama.lock`.
3. **`PID_FILE`**: The path to the PID file, which stores the process ID of the running Ollama instance. By default, it is set to `/tmp/ollama.pid`.

These variables can be modified as needed to match the specific setup of the rEngine Core platform.

## Integration Points

The `ollama-singleton.sh` script is designed to be a standalone component within the rEngine Core ecosystem. It can be integrated with other rEngine Core components that require the use of the Ollama language model, ensuring that a single, stable instance is maintained throughout the system.

## Troubleshooting

1. **Ollama not starting**: If the Ollama instance fails to start, check the following:
   - Ensure that the Ollama software is properly installed and configured on the system.
   - Verify that the `OLLAMA_MODELS_DIR` environment variable is set correctly and that the directory exists.
   - Check for any error messages or logs that may provide more information about the issue.

1. **Multiple Ollama instances running**: If the script detects multiple Ollama instances running, it will automatically restart the Ollama instance to ensure a single, stable instance is maintained. However, if the issue persists, check the following:
   - Ensure that the `LOCK_FILE` and `PID_FILE` paths are correct and accessible.
   - Verify that there are no other processes or scripts that may be starting Ollama instances concurrently.

1. **Heavy model usage**: When running heavy Ollama models (e.g., `llama3:8b`), the script will warn the user about the high VRAM requirements and suggest using a more memory-efficient model. If the user chooses to proceed with the heavy model, ensure that the system has enough available VRAM to handle the model's requirements.

1. **Locked files**: If the script is unable to remove the `LOCK_FILE` or `PID_FILE`, check the following:
   - Ensure that the script has the necessary permissions to read, write, and delete these files.
   - Verify that the files are not being used by any other processes.

By addressing these potential issues, you can ensure that the `ollama-singleton.sh` script operates smoothly and maintains a single, stable Ollama instance within the rEngine Core ecosystem.
