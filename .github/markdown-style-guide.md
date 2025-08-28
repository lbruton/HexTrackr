# HexTrackr Markdown Style Guide

*Version 1.0 - Codacy Compliance Standards*

## Formatting Rules

### 1. Headings Must Be Surrounded by Blank Lines

**Correct:**
```markdown
This is a paragraph.

## This is a heading

This is the next paragraph.
```

**Incorrect:**
```markdown
This is a paragraph.

## This is a heading (2)

This is the next paragraph.
```

### 2. Lists Must Be Surrounded by Blank Lines

**Correct:**
```markdown
This is a paragraph.

- List item 1
- List item 2
- List item 3

This is the next paragraph.
```

**Incorrect:**
```markdown
This is a paragraph.

- List item 1
- List item 2
- List item 3

This is the next paragraph.
```

### 3. Use Headings Instead of Emphasis for Titles

**Correct:**
```markdown

## Section Title

Content goes here.
```

**Incorrect:**
```markdown

## Section Title (2)

Content goes here.
```

### 4. Consistent Ordered List Prefixes

**Correct:**
```markdown

1. First item
2. Second item
3. Third item

```

**Incorrect:**
```markdown

1. First item
2. Second item
3. Third item

```

### 5. Avoid Duplicate Headings

Each heading should be unique within the document scope.

## Template Structure

```markdown

# Document Title

Brief description paragraph.

## Section 1

Content with proper spacing.

### Subsection 1.1

More content.

## Section 2

Another section.

- List item 1
- List item 2
- List item 3

Final paragraph.
```

## Automated Formatting

Use the `fix-markdown.js` script to automatically apply these standards:

```bash
node scripts/fix-markdown.js --file=path/to/file.md
node scripts/fix-markdown.js --all  # Fix all markdown files
```
