import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { MCPClient } from '@/lib/mcp/client';
import { Tool, CallToolResult, McpError } from '@modelcontextprotocol/sdk/types.js';
import type { Session } from 'next-auth';
import { MCPManager } from '@/lib/mcp/manager';
import { mcpServers } from '@/lib/config/mcp';

// Add interface to extend Session type
interface CustomSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  id: string;
}

interface CustomServer extends Server {
  ws?: WebSocketServer;
}

interface UserContext {
  userId: string;
  sessionId: string;
}

interface WSMessage {
  type: 'TOOL_CALL' | 'LIST_TOOLS';
  payload?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
}

interface WSResponse {
  type: 'TOOL_RESULT' | 'TOOLS_LIST' | 'ERROR';
  payload?: {
    tools?: Tool[];
    result?: CallToolResult;
    error?: string;
  };
}

function sendWSResponse(ws: WebSocket, response: WSResponse): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(response));
  }
}

const mcpManager = new MCPManager();

// Listen for health events
mcpManager.on('server:health', ({ name, health }) => {
  console.log(`Server ${name} health:`, health);
  if (health.status === 'unhealthy') {
    // Handle unhealthy server
  }
});

mcpManager.on('server:recovered', ({ name }) => {
  console.log(`Server ${name} recovered`);
});

// Move health check inside the request handler
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;
    
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get initial health status
    const health = await mcpManager.getServerHealth();
    console.log('Server health status:', health);

    // Initialize MCP connections if not already connected
    if (mcpManager.getConnectedCount() === 0) {
      await Promise.all(
        Object.values(mcpServers).map(config => 
          mcpManager.connectToServer(config)
        )
      );
    }

    const upgradeHeader = req.headers.get('upgrade');
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
      return new Response('WebSocket connection required', { status: 426 });
    }

    // Get the server instance
    const { server } = (req as any).socket;
    const wsServer = server as CustomServer;

    // Initialize WebSocket server if it doesn't exist
    if (!wsServer.ws) {
      wsServer.ws = new WebSocketServer({ noServer: true });

      wsServer.on('upgrade', (request, socket, head) => {
        wsServer.ws!.handleUpgrade(request, socket, head, (ws) => {
          wsServer.ws!.emit('connection', ws, request);
        });
      });

      // Handle WebSocket connections
      wsServer.ws.on('connection', async (ws: WebSocket) => {
        if (!session.user || !session.id) {
          ws.close(1011, 'Invalid session');
          return;
        }

        // Store user context
        const userContext: UserContext = {
          userId: session.user.id,
          sessionId: session.id
        };

        // Handle incoming messages
        ws.on('message', async (data: Buffer) => {
          try {
            const message = JSON.parse(data.toString()) as WSMessage;
            
            switch (message.type) {
              case 'TOOL_CALL':
                await handleToolCall(message, userContext, ws);
                break;
              case 'LIST_TOOLS':
                await handleListTools(userContext, ws);
                break;
              default:
                sendWSResponse(ws, {
                  type: 'ERROR',
                  payload: { error: 'Unknown message type' }
                });
            }
          } catch (error) {
            console.error('WebSocket message error:', error);
            sendWSResponse(ws, {
              type: 'ERROR',
              payload: { error: 'Invalid message format' }
            });
          }
        });

        // Handle disconnection
        ws.on('close', async () => {
          // No need to handle individual client cleanup since manager handles it
        });

        // Handle WebSocket errors
        ws.on('error', async (error) => {
          console.error('WebSocket error:', error);
        });
      });
    }

    return new Response(null, {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade'
      }
    });
  } catch (error) {
    console.error('WebSocket setup error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

async function handleToolCall(
  message: WSMessage, 
  userContext: UserContext, 
  ws: WebSocket
): Promise<void> {
  const { name, arguments: args } = message.payload || {};
  if (!name || !args) {
    sendWSResponse(ws, {
      type: 'ERROR',
      payload: { error: 'Invalid tool call parameters' }
    });
    return;
  }

  try {
    // Find appropriate client for this tool
    const client = findClientForTool(name);
    if (!client) {
      throw new Error('No MCP client available for this tool');
    }

    const result = await client.callTool(name, args);
    sendWSResponse(ws, {
      type: 'TOOL_RESULT',
      payload: { result }
    });
  } catch (error) {
    console.error('Tool call error:', error);
    sendWSResponse(ws, {
      type: 'ERROR',
      payload: { 
        error: error instanceof McpError ? error.message : 'Tool call failed'
      }
    });
  }
}

async function handleListTools(
  userContext: UserContext, 
  ws: WebSocket
): Promise<void> {
  try {
    // Aggregate tools from all connected clients
    const allTools = await getAllAvailableTools();
    sendWSResponse(ws, {
      type: 'TOOLS_LIST',
      payload: { tools: allTools }
    });
  } catch (error) {
    console.error('List tools error:', error);
    sendWSResponse(ws, {
      type: 'ERROR',
      payload: { 
        error: error instanceof McpError ? error.message : 'Failed to list tools'
      }
    });
  }
}

// Helper functions
function findClientForTool(toolName: string): MCPClient | undefined {
  // Implement logic to find the right client for a given tool
  // This could be based on tool prefixes, configuration, or discovery
  return Array.from(mcpManager.getClients().values())[0];
}

async function getAllAvailableTools(): Promise<Tool[]> {
  const tools: Tool[] = [];
  const clients = Array.from(mcpManager.getClients().values());
  
  for (const client of clients) {
    const clientTools = await client.listTools();
    tools.push(...clientTools);
  }
  return tools;
} 