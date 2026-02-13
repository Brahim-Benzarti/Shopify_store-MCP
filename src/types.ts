export interface ToolResponse {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface UserError {
  field: string[] | null;
  message: string;
}
