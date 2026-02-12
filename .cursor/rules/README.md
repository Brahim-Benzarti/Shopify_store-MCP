# Cursor Rules

These MDC (Markdown with Context) files provide context to Cursor AI about this project.

## Files

| File | Purpose |
|------|---------|
| `project-context.mdc` | Overall architecture and structure |
| `code-patterns.mdc` | TypeScript conventions and patterns |
| `adding-tools.mdc` | How to add new MCP tools |
| `graphql-patterns.mdc` | Shopify GraphQL query patterns |

## How Rules Work

- Files with `alwaysApply: true` are always included in context
- Files with `globs` patterns are included when matching files are open
- Rules help the AI understand project conventions

## Adding New Rules

Create a new `.mdc` file with frontmatter:

```markdown
---
description: Brief description of the rule
globs: ["src/**/*.ts"]  # Optional file pattern
alwaysApply: false      # Set true to always include
---

# Rule Title

Content...
```
