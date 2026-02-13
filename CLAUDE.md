# Shopify Store MCP Server

An MCP server that connects to **live Shopify stores** via Admin and Storefront APIs.

## Quick Reference

```bash
npm run build      # Compile TypeScript + generate Prisma
npm run dev        # Watch mode
npm run inspect    # MCP Inspector for testing
npm run db:studio  # Browse SQLite database
```

## Architecture

### Two-Tier Tool Design

1. **`run_graphql_query`** — Universal escape hatch for ANY Shopify GraphQL operation
2. **Smart tools** — Multi-step workflows (polling, staged uploads, bulk ops)

**Don't create per-resource CRUD tools.** Shopify has hundreds of operations. Use `run_graphql_query` for simple operations, smart tools for complex workflows.

### Current Tools (11)

| Tool | Type | Purpose |
|------|------|---------|
| `get_shop_info` | Core | Store configuration |
| `run_graphql_query` | Core | Execute any GraphQL |
| `upload_file` | Smart | URL/path/base64 → poll → CDN URL |
| `bulk_export` | Smart | Bulk query → JSONL URL |
| `bulk_import` | Smart | Staged upload → bulk mutation |
| `upsert_metaobject` | Smart | Idempotent create/update |
| `delete_metaobject` | Smart | Delete by ID or type+handle |
| `schema_discover` | Smart | Metafield/metaobject definitions |
| `configure` | Infra | Set rate limit tier |
| `get_history` | Infra | Query past operations |
| `get_stats` | Infra | Usage statistics |

## Critical Patterns

### Never use console.log

STDIO transport uses stdout for MCP protocol. Always use `console.error`:

```typescript
console.error("[shopify-store-mcp] Log message");  // Good
console.log("Log message");  // BREAKS MCP PROTOCOL
```

### ES Module imports

Use `.js` extension in all imports:

```typescript
import { foo } from "./foo.js";  // Good
import { foo } from "./foo";     // Bad
```

### Error handling

Use utilities from `errors.ts`:

```typescript
import { formatSuccessResponse, formatErrorResponse, formatGraphQLErrors, formatUserErrors } from "../errors.js";

// In tool handler
if (response.errors) return formatGraphQLErrors(response);
if (userErrors?.length) return formatUserErrors(userErrors);
return formatSuccessResponse(data);
```

### GID normalization

Always use `normalizeGid` — accepts both `"123"` and `"gid://shopify/Product/123"`:

```typescript
import { normalizeGid } from "../errors.js";
const gid = normalizeGid(id, "Product");
```

### Rate limiting

All API calls should go through the queue:

```typescript
import { enqueue } from "../queue.js";
const result = await enqueue(() => client.request(query));
```

## Project Structure

```
src/
├── index.ts              # Entry point
├── config.ts             # Environment config
├── shopify-client.ts     # API client factories
├── errors.ts             # Response formatters
├── db.ts                 # Prisma client
├── queue.ts              # Rate-limited queue
├── logger.ts             # Operation logging
├── utils/polling.ts      # Async polling helper
├── graphql/
│   ├── admin/            # Admin API queries
│   │   ├── common/       # Products, orders, customers
│   │   ├── specialized/  # Bulk, files, metaobjects
│   │   └── index.ts      # Barrel export
│   └── storefront/       # Storefront API queries
├── tools/                # MCP tools
│   ├── shop.ts           # get_shop_info
│   ├── graphql.ts        # run_graphql_query
│   ├── smart-*.ts        # Smart tools
│   └── infrastructure.ts # Config/debugging tools
├── prompts/              # MCP prompts
└── resources/            # MCP resources
```

## Adding a New Smart Tool

1. Create `src/tools/smart-{name}.ts`
2. Add GraphQL queries to `src/graphql/admin/specialized/{name}.ts`
3. Export from `src/graphql/admin/index.ts`
4. Register in `src/tools/index.ts`

See `.cursor/rules/adding-tools.mdc` for detailed patterns.

## Rate Limit Tiers

| Tier | Req/sec | Plans |
|------|---------|-------|
| STANDARD | 1 | Basic, Development |
| ADVANCED | 2 | Advanced |
| PLUS | 5 | Shopify Plus |
| ENTERPRISE | 10 | Commerce Components |

## Database

SQLite at `~/.shopify-mcp/mcp.db`:
- **StoreConfig** — Per-store tier
- **OperationLog** — All GraphQL operations
- **BackgroundJob** — Async job tracking

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SHOPIFY_STORE_URL` | Yes | Store's myshopify.com domain |
| `SHOPIFY_ACCESS_TOKEN` | Yes | Admin API token |
| `SHOPIFY_API_VERSION` | No | Default: 2025-01 |
| `SHOPIFY_TIER` | No | Rate limit tier |
