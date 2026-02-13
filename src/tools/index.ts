import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AdminApiClient } from "../shopify-client.js";
// Core tools
import { registerShopTools } from "./shop.js";
import { registerGraphQLTools } from "./graphql.js";
// Smart tools (multi-step workflows)
import { registerSmartFileTools } from "./smart-files.js";
import { registerSmartBulkTools } from "./smart-bulk.js";
import { registerSmartMetaobjectTools } from "./smart-metaobjects.js";
import { registerSmartSchemaTools } from "./smart-schema.js";
// Infrastructure tools
import { registerInfrastructureTools } from "./infrastructure.js";

export function registerAllTools(
  server: McpServer,
  client: AdminApiClient,
  storeDomain: string
): void {
  // Core tools (2)
  registerShopTools(server, client, storeDomain);      // get_shop_info
  registerGraphQLTools(server, client, storeDomain);   // run_graphql_query - the universal escape hatch

  // Smart tools (5) - multi-step workflows that agents would struggle with
  registerSmartFileTools(server, client, storeDomain);      // upload_file
  registerSmartBulkTools(server, client, storeDomain);      // bulk_export, bulk_import
  registerSmartMetaobjectTools(server, client, storeDomain); // upsert_metaobject
  registerSmartSchemaTools(server, client, storeDomain);    // schema_discover

  // Infrastructure tools (3) - config, debugging, stats
  registerInfrastructureTools(server, client, storeDomain); // configure, get_history, get_stats
}
