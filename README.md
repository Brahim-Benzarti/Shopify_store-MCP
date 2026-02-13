# Shopify Store MCP Server

[![npm version](https://img.shields.io/npm/v/shopify-store-mcp.svg)](https://www.npmjs.com/package/shopify-store-mcp)
[![npm downloads](https://img.shields.io/npm/dm/shopify-store-mcp.svg)](https://www.npmjs.com/package/shopify-store-mcp)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)

A Model Context Protocol (MCP) server that connects to **live Shopify stores** via the Admin and Storefront APIs. Unlike documentation-only MCPs, this server enables AI agents to perform **real operations** on your store.

## Why This MCP?

| Feature | Shopify Store MCP | [Shopify Dev MCP](https://shopify.dev/docs/apps/build/devmcp) |
|---------|-------------------|---------------------------------------------------------------|
| Execute GraphQL queries | ✅ Real API calls | ❌ Documentation only |
| Modify store data | ✅ Full CRUD | ❌ No |
| Upload files | ✅ Yes | ❌ No |
| Bulk operations | ✅ Yes | ❌ No |
| API documentation | ❌ No | ✅ Yes |
| Schema introspection | ❌ No | ✅ Yes |

> **Important:** For the best experience, use **both** this MCP and the official [Shopify Dev MCP](https://shopify.dev/docs/apps/build/devmcp) together. The Dev MCP helps your AI agent understand Shopify's API schemas and documentation, while this MCP executes the actual operations on your store.

## Features

- **Universal GraphQL Access** — Execute any Admin API query or mutation via `run_graphql_query`
- **Smart Multi-Step Tools** — File uploads, bulk operations, metaobject upserts with automatic polling
- **Rate Limiting** — Respects Shopify's plan-based rate limits (Standard/Advanced/Plus/Enterprise)
- **Operation Logging** — SQLite database tracks all operations for debugging and history
- **Schema Discovery** — Explore your store's metafield definitions and metaobject types

## Prerequisites

1. **Node.js 18+**
2. **Shopify store** with a [custom app](https://help.shopify.com/en/manual/apps/app-types/custom-apps)
3. **Admin API access token** — Create a custom app in Shopify Admin → Settings → Apps and development channels → Develop apps

## Installation

<details>
<summary><strong>Cursor</strong></summary>

### Quick Install

[![Install in Cursor](https://img.shields.io/badge/Install%20in-Cursor-blue?style=for-the-badge&logo=cursor)](https://cursor.com/install-mcp?name=shopify-store-mcp&config=eyJtY3BTZXJ2ZXJzIjp7InNob3BpZnktc3RvcmUtbWNwIjp7ImNvbW1hbmQiOiJucHgiLCJhcmdzIjpbIi15Iiwic2hvcGlmeS1zdG9yZS1tY3AiXSwiZW52Ijp7IlNIT1BJRllfU1RPUkVfVVJMIjoieW91ci1zdG9yZS5teXNob3BpZnkuY29tIiwiU0hPUElGWV9BQ0NFU1NfVE9LRU4iOiJzaHBhdF94eHh4eHh4eHh4eHh4eHh4eHh4eHgifX19fQ==)

After installing, edit the configuration to add your actual store credentials.

### Manual Configuration

Add to your Cursor MCP settings (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "shopify-store-mcp": {
      "command": "npx",
      "args": ["-y", "shopify-store-mcp"],
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

<details>
<summary>Windows Configuration</summary>

```json
{
  "mcpServers": {
    "shopify-store-mcp": {
      "command": "cmd",
      "args": ["/k", "npx", "-y", "shopify-store-mcp"],
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

</details>

</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to your Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "shopify-store-mcp": {
      "command": "npx",
      "args": ["-y", "shopify-store-mcp"],
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

<details>
<summary>Windows Configuration</summary>

```json
{
  "mcpServers": {
    "shopify-store-mcp": {
      "command": "cmd",
      "args": ["/k", "npx", "-y", "shopify-store-mcp"],
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

</details>

</details>

<details>
<summary><strong>Claude Code (CLI)</strong></summary>

Add to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "shopify-store-mcp": {
      "command": "npx",
      "args": ["-y", "shopify-store-mcp"],
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>VS Code (Copilot)</strong></summary>

Add to your VS Code settings (`settings.json`):

```json
{
  "mcp.servers": {
    "shopify-store-mcp": {
      "command": "npx",
      "args": ["-y", "shopify-store-mcp"],
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Windsurf</strong></summary>

Add to your Windsurf MCP config (`~/.windsurf/mcp.json`):

```json
{
  "mcpServers": {
    "shopify-store-mcp": {
      "command": "npx",
      "args": ["-y", "shopify-store-mcp"],
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Other MCP Clients</strong></summary>

For any MCP-compatible client, use:

```bash
npx -y shopify-store-mcp
```

With environment variables:
- `SHOPIFY_STORE_URL` — Your store's myshopify.com domain
- `SHOPIFY_ACCESS_TOKEN` — Admin API access token

</details>

## Recommended: Add Shopify Dev MCP

For the best AI agent experience, also add the official **[Shopify Dev MCP](https://shopify.dev/docs/apps/build/devmcp)**. It provides:

- API documentation search
- GraphQL schema introspection
- Query validation
- Up-to-date Shopify API knowledge

This helps your AI agent know **what queries to write** before executing them with this MCP.

```json
{
  "mcpServers": {
    "shopify-store-mcp": {
      "command": "npx",
      "args": ["-y", "shopify-store-mcp"],
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxxxxxxxxxxxxxxxxxxxx"
      }
    },
    "shopify-dev-mcp": {
      "command": "npx",
      "args": ["-y", "@shopify/dev-mcp@latest"]
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SHOPIFY_STORE_URL` | Yes | — | Store's myshopify.com domain |
| `SHOPIFY_ACCESS_TOKEN` | Yes | — | Admin API access token |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | No | — | Storefront API token |
| `SHOPIFY_API_VERSION` | No | `2026-01` | API version (or `unstable` for bleeding edge) |
| `SHOPIFY_TIER` | No | `STANDARD` | Rate limit tier |
| `MCP_LOG_OPERATIONS` | No | `true` | Enable operation logging |

## Available Tools

### Core Tools

| Tool | Description |
|------|-------------|
| `get_shop_info` | Retrieve store configuration, plan info, and settings |
| `run_graphql_query` | **Universal tool** — Execute any GraphQL query or mutation |

### Smart Tools

Multi-step workflows that handle complexity automatically:

| Tool | Description |
|------|-------------|
| `upload_file` | Upload file (URL, local path, or base64) → poll until ready → return CDN URL |
| `bulk_export` | Start bulk query → poll completion → return JSONL download URL |
| `bulk_import` | Staged upload → bulk mutation → poll completion |
| `upsert_metaobject` | Create or update metaobject by handle (idempotent) |
| `delete_metaobject` | Delete metaobject by ID or type+handle |
| `schema_discover` | Discover metafield definitions and metaobject types |

### Infrastructure Tools

| Tool | Description |
|------|-------------|
| `configure` | Set rate limit tier (manual or auto-detect from shop plan) |
| `get_history` | Query past operations for debugging |
| `get_stats` | Aggregated usage statistics (calls, errors, response times) |

## Rate Limiting

The server automatically respects Shopify's rate limits based on your shop plan:

| Tier | Requests/sec | Plans |
|------|--------------|-------|
| `STANDARD` | 1 | Basic, Development, Lite |
| `ADVANCED` | 2 | Advanced |
| `PLUS` | 5 | Shopify Plus |
| `ENTERPRISE` | 10 | Commerce Components |

Use the `configure` tool to set your tier or auto-detect from your shop plan.

## Available Prompts

| Prompt | Description |
|--------|-------------|
| `analyze-product` | Product analysis template |
| `summarize-orders` | Order summary by timeframe |
| `inventory-health` | Inventory health check |
| `customer-insights` | Customer segment analysis |
| `custom-query` | Help building custom GraphQL queries |

## Available Resources

| Resource | Description |
|----------|-------------|
| `shopify://config` | Current store connection info |
| `shopify://docs/query-syntax` | Query syntax reference |
| `shopify://docs/gid-format` | GID format reference |
| `shopify://docs/scopes` | API scopes reference |

## Development

```bash
# Clone the repo
git clone https://github.com/Brahim-Benzarti/Shopify_store-MCP.git
cd Shopify_store-MCP

# Install dependencies
npm install

# Build
npm run build

# Run with MCP Inspector
npm run inspect

# Watch mode
npm run dev

# View database
npm run db:studio
```

### Database

The server uses SQLite for operation logging and configuration. Database is automatically created at `~/.shopify-mcp/mcp.db`.

## Security

- **Never commit** your `.env` file or access tokens
- Use **environment variables** or MCP config for credentials
- Access tokens should have **minimal required scopes**
- Operations are logged locally for debugging (disable with `MCP_LOG_OPERATIONS=false`)

## License

[ISC](LICENSE)

## Related

- [Shopify Dev MCP](https://shopify.dev/docs/apps/build/devmcp) — Official Shopify MCP for API documentation
- [Shopify Admin API](https://shopify.dev/docs/api/admin-graphql) — GraphQL API reference
- [Model Context Protocol](https://modelcontextprotocol.io/) — MCP specification
