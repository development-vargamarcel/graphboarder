# Claude Code Configuration

## MCP Server Configuration

This project is configured to work with the Svelte MCP server.

### Configuration Files

1. **Global Configuration**: `/root/.config/Claude/claude_desktop_config.json`
   - Contains the MCP server configuration for Claude Desktop

2. **Project Configuration**: `.claude/mcp_servers.json`
   - Project-specific MCP server settings

### Svelte MCP Server

- **URL**: https://mcp.svelte.dev/mcp
- **Transport**: SSE (Server-Sent Events)
- **Purpose**: Provides access to Svelte documentation and APIs

### Usage

After configuration, restart Claude Code to establish the connection with the MCP server.

**Note**: If the server requires authentication, you may need to add API keys or tokens to the configuration.
