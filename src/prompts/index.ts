import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerAllPrompts(server: McpServer): void {
  // Product Analysis Prompt
  server.registerPrompt(
    "analyze-product",
    {
      title: "Analyze Product",
      description:
        "Generate a detailed analysis of a product including its variants, pricing, inventory status, and recommendations for optimization.",
      argsSchema: {
        productId: z
          .string()
          .describe("The product ID (GID or numeric) to analyze"),
      },
    },
    async ({ productId }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please analyze the product with ID "${productId}". Use the get_product tool to fetch its details, then provide:

1. **Product Overview**: Title, vendor, type, and current status
2. **Pricing Analysis**: Current prices across variants, compare-at prices if set
3. **Inventory Status**: Stock levels, which variants are low or out of stock
4. **SEO Review**: Handle, title length, description quality
5. **Recommendations**: Actionable suggestions to improve the product listing

Start by fetching the product data.`,
          },
        },
      ],
    })
  );

  // Order Summary Prompt
  server.registerPrompt(
    "summarize-orders",
    {
      title: "Summarize Recent Orders",
      description:
        "Generate a summary of recent orders including revenue, fulfillment status, and trends.",
      argsSchema: {
        timeframe: z
          .enum(["today", "week", "month"])
          .default("week")
          .describe("The timeframe to analyze"),
        limit: z
          .number()
          .default(50)
          .describe("Number of orders to fetch"),
      },
    },
    async ({ timeframe, limit }) => {
      const dateFilter =
        timeframe === "today"
          ? "created_at:>=today"
          : timeframe === "week"
            ? "created_at:>=7_days_ago"
            : "created_at:>=30_days_ago";

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Please provide a summary of orders from the ${timeframe}. Use the get_orders tool with query "${dateFilter}" and first=${limit}.

Include in your analysis:
1. **Total Orders**: Count and total revenue
2. **Fulfillment Status**: Breakdown by unfulfilled, partially fulfilled, fulfilled
3. **Payment Status**: Breakdown by paid, pending, refunded
4. **Top Products**: Most ordered items
5. **Average Order Value**: Calculate and compare to typical benchmarks

Start by fetching the order data.`,
            },
          },
        ],
      };
    }
  );

  // Inventory Health Check Prompt
  server.registerPrompt(
    "inventory-health",
    {
      title: "Inventory Health Check",
      description:
        "Analyze inventory levels across products and identify items that need attention (low stock, overstock, etc.).",
      argsSchema: {
        threshold: z
          .number()
          .default(10)
          .describe("Low stock threshold to flag items"),
      },
    },
    async ({ threshold }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please perform an inventory health check. Use the get_inventory tool to fetch inventory levels.

Analyze and report:
1. **Low Stock Items**: Products with inventory below ${threshold} units
2. **Out of Stock**: Items with zero inventory
3. **Overstock Candidates**: Items with unusually high inventory (if detectable)
4. **Inventory Distribution**: Summary by location if multiple locations exist
5. **Action Items**: Prioritized list of items needing restocking

Start by fetching inventory data.`,
          },
        },
      ],
    })
  );

  // Customer Insights Prompt
  server.registerPrompt(
    "customer-insights",
    {
      title: "Customer Insights",
      description:
        "Analyze customer data to identify patterns, VIP customers, and engagement opportunities.",
      argsSchema: {
        segment: z
          .enum(["all", "repeat", "high-value", "recent"])
          .default("all")
          .describe("Customer segment to analyze"),
      },
    },
    async ({ segment }) => {
      const queryMap: Record<string, string> = {
        all: "",
        repeat: "orders_count:>1",
        "high-value": "total_spent:>500",
        recent: "updated_at:>=30_days_ago",
      };

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Please analyze the "${segment}" customer segment. Use the get_customers tool${queryMap[segment] ? ` with query "${queryMap[segment]}"` : ""}.

Provide insights on:
1. **Customer Count**: Total customers in this segment
2. **Engagement Metrics**: Average orders, total spent
3. **Geographic Distribution**: Where customers are located
4. **VIP Identification**: Top customers by order count or spend
5. **Opportunities**: Suggestions for engagement or retention

Start by fetching customer data.`,
            },
          },
        ],
      };
    }
  );

  // Custom GraphQL Query Prompt
  server.registerPrompt(
    "custom-query",
    {
      title: "Custom GraphQL Query",
      description:
        "Help construct and execute a custom GraphQL query against the Shopify Admin API.",
      argsSchema: {
        intent: z
          .string()
          .describe("What data do you want to fetch or what action do you want to perform?"),
      },
    },
    async ({ intent }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `I need help with a custom Shopify Admin API query. My goal is: "${intent}"

Please:
1. Determine if this requires a query (read) or mutation (write)
2. Construct the appropriate GraphQL operation
3. Use the run_graphql_query tool to execute it
4. Explain the results

If you're unsure about the exact schema, start with a simpler query and iterate based on what fields are available.`,
          },
        },
      ],
    })
  );
}
