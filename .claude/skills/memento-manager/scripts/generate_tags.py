#!/usr/bin/env python3
"""
Generates current temporal tags for Memento knowledge graph.

Outputs:
- Current week tag (week-XX-YYYY)
- Current month tag (YYYY-MM)
- Current quarter tag (qX-YYYY)
- Current version tag (vX.Y.Z from package.json)

Usage:
    python3 generate_tags.py [--json] [--package-json <path>]

Options:
    --json              Output as JSON instead of plain text
    --package-json PATH Path to package.json (default: auto-detect from HexTrackr root)
"""

import sys
import os
import json
from datetime import datetime

def get_iso_week(dt):
    """
    Get ISO week number and year.
    Returns: (week_number, year)
    """
    iso_calendar = dt.isocalendar()
    return iso_calendar[1], iso_calendar[0]

def get_quarter(month):
    """
    Get quarter number from month (1-4).
    """
    if month <= 3:
        return 1
    elif month <= 6:
        return 2
    elif month <= 9:
        return 3
    else:
        return 4

def find_package_json():
    """
    Attempt to find package.json in HexTrackr root.
    Walks up from script location to find project root.
    """
    current = os.path.dirname(os.path.abspath(__file__))

    # Walk up directories looking for package.json
    for _ in range(5):  # Max 5 levels up
        parent = os.path.dirname(current)
        package_path = os.path.join(parent, 'package.json')

        if os.path.exists(package_path):
            return package_path

        current = parent

    return None

def get_version(package_json_path=None):
    """
    Get version from package.json.
    Returns: "vX.Y.Z" or None if not found
    """
    if not package_json_path:
        package_json_path = find_package_json()

    if not package_json_path or not os.path.exists(package_json_path):
        return None

    try:
        with open(package_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            version = data.get('version')
            if version:
                return f"v{version}"
    except Exception:
        pass

    return None

def generate_tags(package_json_path=None, output_json=False):
    """
    Generate all temporal tags for current date/time.

    Returns: dict with tag types or prints formatted output
    """
    now = datetime.now()

    # Week tag (week-44-2025)
    week_num, week_year = get_iso_week(now)
    week_tag = f"week-{week_num}-{week_year}"

    # Month tag (2025-10)
    month_tag = now.strftime("%Y-%m")

    # Quarter tag (q4-2025)
    quarter = get_quarter(now.month)
    quarter_tag = f"q{quarter}-{now.year}"

    # Version tag (v1.1.10)
    version_tag = get_version(package_json_path)

    tags = {
        "week": week_tag,
        "month": month_tag,
        "quarter": quarter_tag,
        "version": version_tag
    }

    if output_json:
        print(json.dumps(tags, indent=2))
    else:
        # Plain text output (one per line, for easy copy/paste)
        print(week_tag)
        print(month_tag)
        print(quarter_tag)
        if version_tag:
            print(version_tag)
        else:
            print("# Version not found in package.json")

    return tags

def main():
    output_json = False
    package_json_path = None

    # Parse arguments
    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]

        if arg == '--json':
            output_json = True
        elif arg == '--package-json':
            if i + 1 < len(sys.argv):
                package_json_path = sys.argv[i + 1]
                i += 1
            else:
                print("Error: --package-json requires a path argument", file=sys.stderr)
                sys.exit(1)
        elif arg in ['-h', '--help']:
            print(__doc__)
            sys.exit(0)
        else:
            print(f"Error: Unknown argument '{arg}'", file=sys.stderr)
            print("Use --help for usage information", file=sys.stderr)
            sys.exit(1)

        i += 1

    # Generate and output tags
    generate_tags(package_json_path, output_json)

if __name__ == '__main__':
    main()
