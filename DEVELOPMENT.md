# Development Setup

This guide explains how to set up your local development environment for contributing to shopify-store-mcp.

## Prerequisites

- Node.js 18+
- A Shopify store with a custom app (for testing)
- Cursor IDE or Claude Code (optional but recommended)

## Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/shopify-store-mcp.git
cd shopify-store-mcp

# Install dependencies
npm install

# Create your local env file
cp .env.example .env.local
# Edit .env.local with your Shopify credentials

# Build
npm run build

# Test with MCP Inspector
npm run inspect
```

## Environment Setup

Create a `.env.local` file (gitignored) with your test store credentials:

```bash
SHOPIFY_STORE_URL=your-dev-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_VERSION=2025-01
MCP_LOG_OPERATIONS=true
```

## IDE Setup

### Cursor

The `.cursor/rules/` directory contains MDC files that help Cursor AI understand the project:

- `project-context.mdc` — Overall architecture
- `code-patterns.mdc` — Coding conventions
- `adding-tools.mdc` — How to add new tools
- `graphql-patterns.mdc` — GraphQL patterns

To use the MCP server while developing, create `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "shopify-store-mcp-dev": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxx"
      }
    },
    "shopify-dev-mcp": {
      "command": "npx",
      "args": ["-y", "@shopify/dev-mcp@latest"]
    }
  }
}
```

### Claude Code

The `CLAUDE.md` file provides context to Claude Code. For MCP servers, create `.claude/settings.json`:

```json
{
  "mcpServers": {
    "shopify-store-mcp-dev": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxx"
      }
    }
  }
}
```

## Development Workflow

### 1. Make changes

Edit files in `src/`. Key directories:

- `src/tools/` — MCP tool implementations
- `src/graphql/` — GraphQL queries and mutations
- `src/prompts/` — MCP prompts
- `src/resources/` — MCP resources

### 2. Build

```bash
npm run build
# Or watch mode:
npm run dev
```

### 3. Test

```bash
# MCP Inspector (interactive testing)
npm run inspect

# Or test via your IDE's MCP integration
```

### 4. Debug

Check the operation logs:

```bash
npm run db:studio
```

This opens Prisma Studio where you can browse:
- `OperationLog` — All GraphQL operations
- `StoreConfig` — Store configurations
- `BackgroundJob` — Async job tracking

## Adding New Tools

See `.cursor/rules/adding-tools.mdc` for detailed instructions.

Quick summary:

1. Decide: Smart tool (multi-step) or just document a `run_graphql_query` example?
2. Create `src/tools/smart-{name}.ts`
3. Add GraphQL to `src/graphql/admin/specialized/{name}.ts`
4. Export from `src/graphql/admin/index.ts`
5. Register in `src/tools/index.ts`

## Code Style

- **No console.log** — Use `console.error` (STDIO transport)
- **ES Modules** — Use `.js` extension in imports
- **Error handling** — Use `errors.ts` utilities
- **Rate limiting** — All API calls through `enqueue()`

## Database

The SQLite database is at `~/.shopify-mcp/mcp.db`. To reset:

```bash
rm ~/.shopify-mcp/mcp.db
npm run build  # Recreates on next run
```

## Troubleshooting

### "Invalid access token" error

- Check your `.env.local` credentials
- Ensure the token has required scopes
- Verify the store URL matches the token's store

### Build errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Database errors

```bash
# Reset database
rm ~/.shopify-mcp/mcp.db
```
