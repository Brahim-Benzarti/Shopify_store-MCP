import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ShopifyConfig } from "../config.js";

export function registerAllResources(
  server: McpServer,
  config: ShopifyConfig
): void {
  // Store Configuration Resource
  server.registerResource(
    "store-config",
    "shopify://config",
    {
      title: "Store Configuration",
      description:
        "Current store connection configuration including domain and API version. " +
        "Use this to verify which store you're connected to.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "shopify://config",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              storeDomain: config.storeDomain,
              apiVersion: config.apiVersion,
              hasStorefrontAccess: !!config.storefrontAccessToken,
              hasCustomerAccess: !!config.customerAccessToken,
            },
            null,
            2
          ),
        },
      ],
    })
  );

  // Shopify Query Syntax Reference
  server.registerResource(
    "query-syntax",
    "shopify://docs/query-syntax",
    {
      title: "Shopify Query Syntax Reference",
      description:
        "Reference guide for Shopify's search query syntax used in filtering products, orders, customers, etc.",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "shopify://docs/query-syntax",
          mimeType: "text/markdown",
          text: `# Shopify Query Syntax Reference

## Basic Syntax

Queries use field:value pairs separated by spaces (AND logic).

## Common Fields by Resource

### Products
- \`title:boots\` - Title contains "boots"
- \`status:active\` - Product status (active, draft, archived)
- \`vendor:Nike\` - Filter by vendor
- \`product_type:shoes\` - Filter by product type
- \`tag:sale\` - Has specific tag
- \`created_at:>2024-01-01\` - Created after date
- \`inventory_total:>0\` - Has inventory

### Orders
- \`name:#1001\` - Order number
- \`email:customer@example.com\` - Customer email
- \`financial_status:paid\` - Payment status (paid, pending, refunded, voided)
- \`fulfillment_status:unfulfilled\` - Fulfillment status (unfulfilled, partial, fulfilled)
- \`created_at:>=7_days_ago\` - Relative date
- \`tag:wholesale\` - Has specific tag

### Customers
- \`email:john@example.com\` - Email address
- \`country:US\` - Country code
- \`orders_count:>5\` - Number of orders
- \`total_spent:>100\` - Total amount spent
- \`tag:vip\` - Has specific tag
- \`state:enabled\` - Account state

### Collections
- \`title:Summer\` - Collection title
- \`collection_type:smart\` - Type (smart or custom)

## Operators
- \`:value\` - Equals or contains
- \`:>value\` - Greater than
- \`:>=value\` - Greater than or equal
- \`:<value\` - Less than
- \`:<=value\` - Less than or equal

## Date Shortcuts
- \`today\`
- \`yesterday\`
- \`7_days_ago\`
- \`30_days_ago\`
- \`90_days_ago\`

## Examples
\`\`\`
# Active products from Nike with low inventory
status:active vendor:Nike inventory_total:<10

# Paid but unfulfilled orders from this week
financial_status:paid fulfillment_status:unfulfilled created_at:>=7_days_ago

# VIP customers with multiple orders
tag:vip orders_count:>3
\`\`\`
`,
        },
      ],
    })
  );

  // GID Format Reference
  server.registerResource(
    "gid-format",
    "shopify://docs/gid-format",
    {
      title: "Shopify GID Format Reference",
      description:
        "Reference for Shopify's Global ID (GID) format used to identify resources.",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "shopify://docs/gid-format",
          mimeType: "text/markdown",
          text: `# Shopify GID (Global ID) Format

## Format
\`gid://shopify/{ResourceType}/{NumericID}\`

## Common Resource Types
| Type | GID Example |
|------|-------------|
| Product | \`gid://shopify/Product/123456789\` |
| ProductVariant | \`gid://shopify/ProductVariant/123456789\` |
| Order | \`gid://shopify/Order/123456789\` |
| Customer | \`gid://shopify/Customer/123456789\` |
| Collection | \`gid://shopify/Collection/123456789\` |
| InventoryItem | \`gid://shopify/InventoryItem/123456789\` |
| InventoryLevel | \`gid://shopify/InventoryLevel/123456789?inventory_item_id=X&location_id=Y\` |
| Location | \`gid://shopify/Location/123456789\` |
| Metafield | \`gid://shopify/Metafield/123456789\` |
| FulfillmentOrder | \`gid://shopify/FulfillmentOrder/123456789\` |

## Notes
- Most tools in this MCP accept both numeric IDs and full GIDs
- When in doubt, use the full GID format
- GIDs from query responses can be used directly in subsequent calls
`,
        },
      ],
    })
  );

  // Available Scopes Reference
  server.registerResource(
    "api-scopes",
    "shopify://docs/scopes",
    {
      title: "API Scopes Reference",
      description:
        "Reference for Shopify Admin API access scopes required for different operations.",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "shopify://docs/scopes",
          mimeType: "text/markdown",
          text: `# Shopify Admin API Scopes

## Required Scopes by Operation

### Products
- \`read_products\` - List and view products
- \`write_products\` - Create and update products

### Orders
- \`read_orders\` - List and view orders
- \`write_orders\` - Update orders, create fulfillments

### Customers
- \`read_customers\` - List and view customers
- \`write_customers\` - Create and update customers

### Inventory
- \`read_inventory\` - View inventory levels
- \`write_inventory\` - Adjust inventory quantities

### Other Common Scopes
- \`read_locations\` - View store locations
- \`read_shipping\` - View shipping settings
- \`read_fulfillments\` - View fulfillments
- \`write_fulfillments\` - Create fulfillments

## Checking Your Scopes
If a tool returns a 403 error, it likely means your custom app is missing the required scope. Update your app's API access scopes in:

**Shopify Admin → Settings → Apps and sales channels → Develop apps → [Your App] → Configuration**
`,
        },
      ],
    })
  );

  // Smart Tools Reference
  server.registerResource(
    "smart-tools",
    "shopify://docs/smart-tools",
    {
      title: "Smart Tools Reference",
      description:
        "Reference guide for smart multi-step tools that handle complex workflows automatically.",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "shopify://docs/smart-tools",
          mimeType: "text/markdown",
          text: `# Smart Tools Reference

Smart tools handle complex multi-step workflows automatically, including polling and staged uploads.

## upload_file

Upload files to Shopify with automatic status polling. Returns the final CDN URL when ready.

### Mode 1: External URL
Shopify fetches the file from a publicly accessible URL.

\`\`\`json
{
  "url": "https://example.com/image.jpg",
  "alt": "Product image"
}
\`\`\`

### Mode 2: Local File Path (Recommended for large files)
Read file directly from disk. MIME type is auto-detected.

\`\`\`json
{
  "filePath": "/path/to/document.pdf",
  "alt": "Product manual"
}
\`\`\`

### Mode 3: Base64 Content (Small files only, < 5MB)
For small files when you already have the content encoded.

\`\`\`json
{
  "content": "iVBORw0KGgoAAAANSUhEUgAA...",
  "filename": "photo.jpg",
  "mimeType": "image/jpeg"
}
\`\`\`

**Required for Mode 3:** \`content\`, \`filename\`, \`mimeType\`

### Content Types
- \`IMAGE\` - jpg, png, gif, webp, svg
- \`VIDEO\` - mp4, mov, webm
- \`FILE\` - pdf, documents, other files

## bulk_export

Export large datasets to JSONL format.

\`\`\`json
{
  "query": "{ products { edges { node { id title } } } }"
}
\`\`\`

Returns a download URL for the JSONL file when complete.

## bulk_import

Import data via bulk mutations.

\`\`\`json
{
  "mutation": "mutation($input: ProductInput!) { productUpdate(input: $input) { product { id } } }",
  "jsonlUrl": "https://example.com/data.jsonl"
}
\`\`\`

## upsert_metaobject

Create or update a metaobject by handle (idempotent).

\`\`\`json
{
  "type": "color_swatch",
  "handle": "navy-blue",
  "fields": [
    { "key": "name", "value": "Navy Blue" },
    { "key": "hex", "value": "#000080" }
  ]
}
\`\`\`

## schema_discover

Discover custom schema definitions in the store.

\`\`\`json
{
  "includeMetafields": true,
  "includeMetaobjects": true,
  "metafieldOwnerTypes": ["PRODUCT", "VARIANT"]
}
\`\`\`
`,
        },
      ],
    })
  );
}
