#!/usr/bin/env python3
"""
Validates HexTrackr changelog version files for required structure.

CRITICAL REQUIREMENTS (for docs generator to work):
1. YAML frontmatter with 5 required fields (title, date, version, status, category)
2. Overview section immediately after frontmatter

Without these, docs generation fails or produces broken output.
"""

import sys
import os
import re

def validate_changelog(filepath):
    """
    Validates changelog file structure.

    Returns: Tuple (is_valid: bool, messages: list)
    """
    messages = []
    is_valid = True

    # Check file exists
    if not os.path.exists(filepath):
        return False, [f"ERROR: File not found: {filepath}"]

    # Read file content
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check 1: YAML frontmatter exists and is at top
    if not content.startswith('---\n'):
        messages.append("ERROR: Missing YAML frontmatter (must start with '---')")
        is_valid = False
        return is_valid, messages

    # Extract frontmatter
    frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        messages.append("ERROR: Malformed YAML frontmatter (missing closing '---')")
        is_valid = False
        return is_valid, messages

    frontmatter_text = frontmatter_match.group(1)
    messages.append("✓ YAML frontmatter found")

    # Check 2: Required fields in frontmatter
    required_fields = {
        'title': r'title:\s*["\']?(.+?)["\']?\s*$',
        'date': r'date:\s*["\']?(\d{4}-\d{2}-\d{2})["\']?\s*$',
        'version': r'version:\s*["\']?([\d.]+)["\']?\s*$',
        'status': r'status:\s*["\']?(.+?)["\']?\s*$',
        'category': r'category:\s*["\']?(.+?)["\']?\s*$'
    }

    field_values = {}
    for field_name, pattern in required_fields.items():
        match = re.search(pattern, frontmatter_text, re.MULTILINE)
        if match:
            field_values[field_name] = match.group(1).strip()
            messages.append(f"✓ Required field '{field_name}': {field_values[field_name]}")
        else:
            messages.append(f"ERROR: Missing required field '{field_name}'")
            is_valid = False

    # Check 3: Version format validation (X.Y.Z)
    if 'version' in field_values:
        version = field_values['version']
        if not re.match(r'^\d+\.\d+\.\d+$', version):
            messages.append(f"WARNING: Version format unusual (expected X.Y.Z, got {version})")

    # Check 4: Category value validation
    if 'category' in field_values:
        valid_categories = ['Bug Fix', 'Update', 'Maintenance', 'Feature']
        if field_values['category'] not in valid_categories:
            messages.append(f"WARNING: Category '{field_values['category']}' not in standard list: {valid_categories}")

    # Check 5: Overview section exists
    if '## Overview' in content:
        messages.append("✓ Overview section found")

        # Extract content after frontmatter
        content_after_frontmatter = content[frontmatter_match.end():]

        # Check if Overview appears early (within first 500 chars)
        overview_pos = content_after_frontmatter.find('## Overview')
        if overview_pos > 500:
            messages.append("WARNING: Overview section found but appears late in file (should be immediately after frontmatter)")
    else:
        messages.append("ERROR: Missing '## Overview' section (docs generator needs this for summaries)")
        is_valid = False

    # Check 6: File location validation
    expected_dir = 'app/public/docs-source/changelog/versions'
    if expected_dir not in filepath:
        messages.append(f"WARNING: File not in expected directory: {expected_dir}")
    else:
        messages.append(f"✓ File location correct ({expected_dir})")

    return is_valid, messages


def main():
    if len(sys.argv) != 2:
        print("Usage: validate_changelog.py <path/to/changelog/version.md>")
        print("\nExample:")
        print("  python3 validate_changelog.py app/public/docs-source/changelog/versions/1.1.10.md")
        sys.exit(1)

    filepath = sys.argv[1]
    is_valid, messages = validate_changelog(filepath)

    # Print results
    print("\n" + "="*60)
    print("CHANGELOG VALIDATION RESULTS")
    print("="*60 + "\n")

    for message in messages:
        print(message)

    print("\n" + "="*60)
    if is_valid:
        print("✓ CHANGELOG READY FOR RELEASE")
        print("="*60 + "\n")
        print("Next steps:")
        print("  1. Run: npm run release")
        print("  2. Verify HTML output in app/public/docs-html/content/changelog/")
        print("  3. Update Linear issue status")
        print("  4. Push changes: git push origin dev --tags")
        sys.exit(0)
    else:
        print("✗ CHANGELOG HAS ERRORS - FIX BEFORE RELEASE")
        print("="*60 + "\n")
        print("Fix the errors above, then re-run validation.")
        sys.exit(1)


if __name__ == '__main__':
    main()
