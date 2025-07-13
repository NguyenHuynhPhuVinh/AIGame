// Type declarations for MCP SDK
declare module '@modelcontextprotocol/sdk/server/mcp.js' {
  export class McpServer {
    constructor(config: {
      name: string;
      version: string;
      description: string;
    });
    
    tool(
      name: string,
      description: string,
      schema: any,
      handler: (params: any) => Promise<any>
    ): void;
    
    connect(transport: any): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/server/stdio.js' {
  export class StdioServerTransport {
    constructor();
  }
}
