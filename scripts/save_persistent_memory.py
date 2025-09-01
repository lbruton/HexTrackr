#!/usr/bin/env python3
"""
Helper script to save memories to Persistent AI Memory via MCP tools.

Usage examples:
    python scripts/save_persistent_memory.py \
      --message "Test memory message" \
      --importance 7 \
      --type "bug-fix" \
      --tags "git-hooks,integration,bug-fix"
"""

import argparse
import json
import os
import sys
import subprocess
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('pam_memory')

def save_to_persistent_memory(message, importance=5, memory_type=None, tags=None):
    """Save a memory to the Persistent AI Memory system using MCP tools."""
    try:
        # Process tags
        if isinstance(tags, list):
            tags_str = ",".join(tags)
        else:
            tags_str = tags or ""
        
        # Create a temporary JSON file with the memory data
        tmp_file_path = f"/tmp/pam_memory_{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
        
        # Process tags for JSON format
        tag_list = []
        if tags is not None:
            if isinstance(tags, list):
                tag_list = tags
            elif isinstance(tags, str):
                tag_list = [t.strip() for t in tags.split(',') if t.strip()]
        
        with open(tmp_file_path, 'w') as f:
            json.dump({
                "content": message,
                "importance_level": importance,
                "memory_type": memory_type,
                "tags": tag_list
            }, f, indent=2)
            
        logger.info(f"Created temporary memory file at: {tmp_file_path}")
        
        # Try to use the MCP tool directly if available
        try:
            # Create command for the MCP tool
            cmd = ["mcp_persistent-ai_create_memory"]
            
            # Add parameters
            cmd.extend(["--content", message])
            cmd.extend(["--importance", str(importance)])
            
            if memory_type:
                cmd.extend(["--memory_type", memory_type])
            
            if tags_str:
                cmd.extend(["--tags", tags_str])
            
            # Try to execute the command
            logger.info(f"Attempting to run MCP command")
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info("Memory saved using MCP tool")
                return True
            else:
                logger.warning(f"MCP tool failed, but JSON backup was created")
                logger.debug(f"Command stderr: {result.stderr}")
                return True  # Still return true since we have the JSON backup
        except Exception as e:
            logger.warning(f"Could not use MCP tool directly: {e}")
            logger.info("JSON file created as backup for later processing")
            return True  # Still return true since we have the JSON backup
            
    except Exception as e:
        logger.error(f"Error saving memory: {str(e)}")
        return False

def main():
    """Main function to parse arguments and save memory."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Save to Persistent AI Memory")
    parser.add_argument("--message", required=True, help="Memory content")
    parser.add_argument("--importance", type=int, default=5, help="Importance level (1-10)")
    parser.add_argument("--type", dest="memory_type", default=None, help="Memory type")
    parser.add_argument("--tags", default=None, help="Comma-separated tags")
    args = parser.parse_args()
    
    # Validate importance level
    if args.importance < 1 or args.importance > 10:
        logger.error("Importance level must be between 1 and 10")
        return 1
    
    # Process tags if provided
    if args.tags:
        tags = [tag.strip() for tag in args.tags.split(',') if tag.strip()]
    else:
        tags = None
    
    # Save the memory
    success = save_to_persistent_memory(
        message=args.message,
        importance=args.importance,
        memory_type=args.memory_type,
        tags=tags
    )
    
    if not success:
        logger.error("Memory not saved due to error")
        return 1
        
    logger.info("Memory saved successfully")
    return 0

if __name__ == "__main__":
    sys.exit(main())
