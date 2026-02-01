# Claude Code Configuration

## MCP Server Configuration

This project is configured to work with the Svelte MCP server.

### Configuration Files

1. **Claude Code Configuration**: `~/.claude.json`
   - Contains the MCP server configuration for Claude Code CLI
   - Project-specific servers are stored under `projects["/home/user/graphboarder"].mcpServers`

2. **Claude Desktop Configuration** (reference only): `.claude/mcp_servers.json`
   - Legacy configuration file for Claude Desktop app
   - Not used by Claude Code CLI

### Svelte MCP Server

- **Name**: svelte
- **URL**: https://mcp.svelte.dev/mcp
- **Transport**: HTTP
- **Purpose**: Provides access to Svelte documentation and APIs
- **Configuration Location**: `~/.claude.json` (lines 18-23 for this project)

### Setup Methods

#### Method 1: Command Line (Recommended)

```bash
claude mcp add -t http -s project svelte https://mcp.svelte.dev/mcp
```

#### Method 2: Manual Configuration

Edit `~/.claude.json` and add the server configuration under the project's `mcpServers` object:

```json
"mcpServers": {
  "svelte": {
    "url": "https://mcp.svelte.dev/mcp",
    "transport": "http"
  }
}
```

### Usage

After configuration, **restart Claude Code** to establish the connection with the MCP server. The MCP tools should be available in the next session.

To verify the connection:

- Use `/mcp` command to list configured MCP servers
- Look for tools prefixed with `mcp__svelte__*`

**Note**: If the server requires authentication, you may need to add API keys or tokens to the configuration.
