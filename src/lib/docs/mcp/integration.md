# Integration Points


## Integration Points

### src\lib\mcp\integration\layer-server.ts

#### `LayerServer`



**Methods:**
- `registerWithMCP(mcpClient: MCPClient): Promise<void>`

### src\lib\mcp\integration\manager.ts

#### `LayerIntegrationManager`

Manages integration between MCP.layers and MCP servers

**Methods:**
- `integrateLayer(layerId: string, serverId: string, context: LayerContext): Promise<void>` - Integrates a layer with an MCP server
- `validateCompatibility(metadata: LayerMetadata, server: MCPClientExtended): Promise<void>` - Validates layer compatibility with server
- `registerLayerTools(layer: Layer, server: MCPClientExtended): Promise<void>` - Registers layer tools with server