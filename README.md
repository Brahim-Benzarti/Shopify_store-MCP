# Shopify Store MCP Server

[![npm version](https://img.shields.io/npm/v/shopify-store-mcp.svg)](https://www.npmjs.com/package/shopify-store-mcp)
[![npm downloads](https://img.shields.io/npm/dm/shopify-store-mcp.svg)](https://www.npmjs.com/package/shopify-store-mcp)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)

A Model Context Protocol (MCP) server that connects to **live Shopify stores** via the Admin and Storefront APIs. Unlike documentation-only MCPs, this server enables AI agents to perform real operations on your store.

## Features

- **Universal GraphQL Access** - Execute any Admin API query or mutation via `run_graphql_query`
- **Smart Multi-Step Tools** - File uploads, bulk operations, metaobject upserts with automatic polling
- **Rate Limiting** - Respects Shopify's plan-based rate limits (Standard/Advanced/Plus/Enterprise)
- **Operation Logging** - SQLite database tracks all operations for debugging and history
- **Schema Discovery** - Explore your store's metafield definitions and metaobject types

## Setup

### Prerequisites

1. A Shopify store with a [custom app](https://help.shopify.com/en/manual/apps/app-types/custom-apps)
2. Admin API access token with required scopes
3. Node.js 18+

### Installation

```bash
npm install -g shopify-store-mcp
```

Or run directly with npx:

```bash
npx shopify-store-mcp
```

## Usage with Claude Desktop or Cursor

Add the following to your MCP configuration:

```json
{
  "mcpServers": {
    "shopify-store": {
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

On Windows, use this configuration:

```json
{
  "mcpServers": {
    "shopify-store": {
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

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SHOPIFY_STORE_URL` | Yes | - | Store's myshopify.com domain |
| `SHOPIFY_ACCESS_TOKEN` | Yes | - | Admin API access token |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | No | - | Storefront API token |
| `SHOPIFY_API_VERSION` | No | `2025-01` | API version |
| `SHOPIFY_TIER` | No | `STANDARD` | Rate limit tier |

## Available Tools

### Core Tools

| Tool | Description |
|------|-------------|
| `get_shop_info` | Retrieve store configuration and settings |
| `run_graphql_query` | Execute any GraphQL query or mutation |

### Smart Tools

| Tool | Description |
|------|-------------|
| `upload_file` | Upload file from URL, poll until ready, return CDN URL |
| `bulk_export` | Start bulk query, poll completion, return JSONL download URL |
| `bulk_import` | Staged upload + bulk mutation with automatic polling |
| `upsert_metaobject` | Create or update metaobject by handle (idempotent) |
| `schema_discover` | Discover metafield definitions and metaobject types |

### Infrastructure Tools

| Tool | Description |
|------|-------------|
| `configure` | Set rate limit tier (manual or auto-detect from shop plan) |
| `get_history` | Query past operations for debugging |
| `get_stats` | Aggregated usage statistics |

## Rate Limiting

The server respects Shopify's rate limits based on your shop plan:

| Tier | Requests/sec | Plans |
|------|--------------|-------|
| STANDARD | 1 | Basic, Development, Lite |
| ADVANCED | 2 | Advanced |
| PLUS | 5 | Shopify Plus |
| ENTERPRISE | 10 | Commerce Components |

Use the `configure` tool to set your tier manually or auto-detect from your shop plan.

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
# Install dependencies
npm install

# Build
npm run build

# Run with inspector
npm run inspect

# Watch mode
npm run dev
```

### Database

The server uses SQLite for operation logging and configuration. The database is automatically created at `~/.shopify-mcp/mcp.db`.

```bash
# View database
npm run db:studio
```

## Security

- Never commit your `.env` file or access tokens
- Use environment variables or MCP config for credentials
- Access tokens should have minimal required scopes
- The server logs operations locally for debugging (disable with `MCP_LOG_OPERATIONS=false`)

## License

ISC
