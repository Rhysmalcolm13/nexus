import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Resource,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  Prompt,
  GetPromptResult,
  ResourceContents
} from "@modelcontextprotocol/sdk/types.js";
import { prisma } from '../db/prisma';
import { ModelClient } from '../models';
import { z } from 'zod';

export class NexusMCPServer {
  private server: Server;
  private tools: Map<string, Tool>;
  private prompts: Map<string, Prompt>;
  private resources: Map<string, Resource>;
  private subscriptions: Map<string, Set<string>>;
  private modelClient: ModelClient;

  constructor() {
    this.server = new Server(
      {
        name: "nexus-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
          resourceSubscriptions: {}
        },
      }
    );
    this.tools = new Map();
    this.prompts = new Map();
    this.resources = new Map();
    this.subscriptions = new Map();
    this.modelClient = new ModelClient();
    
    this.initializeTools();
    this.initializePrompts();
    this.initializeResources();
    this.setupHandlers();
  }

  private initializeTools() {
    const defaultTools: Tool[] = [
      // Conversation Management Tools
      {
        name: "search-conversations",
        description: "Search through user conversations with advanced filtering",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            type: { type: "string", enum: ["conversations", "messages", "all"] },
            dateRange: { type: "string", enum: ["today", "week", "month", "all"] },
            sortBy: { type: "string", enum: ["relevance", "date"] }
          },
          required: ["query"]
        }
      },
      {
        name: "analyze-conversation",
        description: "Perform deep analysis of a conversation",
        inputSchema: {
          type: "object",
          properties: {
            conversationId: { type: "string" },
            analysisType: { 
              type: "string", 
              enum: ["sentiment", "topics", "key-points", "action-items"] 
            }
          },
          required: ["conversationId", "analysisType"]
        }
      },
      // Knowledge Management Tools
      {
        name: "extract-knowledge",
        description: "Extract structured knowledge from conversations",
        inputSchema: {
          type: "object",
          properties: {
            conversationId: { type: "string" },
            format: { type: "string", enum: ["json", "markdown", "graph"] }
          },
          required: ["conversationId"]
        }
      },
      {
        name: "create-summary",
        description: "Generate a detailed summary with key insights",
        inputSchema: {
          type: "object",
          properties: {
            conversationId: { type: "string" },
            style: { type: "string", enum: ["brief", "detailed", "technical"] }
          },
          required: ["conversationId"]
        }
      },
      // Resource Management Tools
      {
        name: "manage-resources",
        description: "Manage conversation resources and attachments",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["add", "remove", "update"] },
            resourceUri: { type: "string" },
            metadata: { type: "object" }
          },
          required: ["action", "resourceUri"]
        }
      }
    ];

    defaultTools.forEach(tool => this.tools.set(tool.name, tool));
  }

  private initializePrompts() {
    const defaultPrompts: Prompt[] = [
      {
        name: "analyze-conversation-flow",
        description: "Analyze conversation flow and suggest improvements",
        arguments: [
          {
            name: "conversationId",
            description: "ID of the conversation to analyze",
            required: true
          },
          {
            name: "focusAreas",
            description: "Areas to focus analysis on",
            required: false
          }
        ]
      },
      {
        name: "generate-followup-questions",
        description: "Generate intelligent followup questions based on conversation context",
        arguments: [
          {
            name: "conversationId",
            description: "ID of the conversation",
            required: true
          },
          {
            name: "topic",
            description: "Specific topic to focus questions on",
            required: false
          }
        ]
      },
      {
        name: "extract-action-items",
        description: "Extract and prioritize action items from conversation",
        arguments: [
          {
            name: "conversationId",
            description: "ID of the conversation",
            required: true
          }
        ]
      }
    ];

    defaultPrompts.forEach(prompt => this.prompts.set(prompt.name, prompt));
  }

  private async initializeResources() {
    // Dynamic resource loading
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          include: {
            resources: true
          }
        }
      }
    });

    conversations.forEach(conversation => {
      this.resources.set(`conversation://${conversation.id}`, {
        uri: `conversation://${conversation.id}`,
        name: conversation.title,
        description: `Conversation with ${conversation.messages.length} messages`
      });
    });
  }

  private setupHandlers() {
    // Tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: Array.from(this.tools.values())
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const tool = this.tools.get(name);

      if (!tool) {
        throw new Error(`Tool not found: ${name}`);
      }

      return await this.executeTool(name, args || {});
    });

    // Resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: Array.from(this.resources.values())
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      return await this.readResource(uri);
    });

    // Prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: Array.from(this.prompts.values())
    }));

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return await this.getPrompt(name, args);
    });

    // Resource Subscriptions with proper schema
    this.server.setNotificationHandler(
      z.object({
        method: z.literal('notifications/resources/updated'),
        params: z.object({
          uri: z.string(),
          contents: z.array(z.any())
        })
      }),
      async (notification) => {
        const { uri, contents } = notification.params;
        const subscribers = this.subscriptions.get(uri);
        
        if (subscribers) {
          subscribers.forEach(subscriberId => {
            this.notifyResourceUpdate(subscriberId, uri, contents);
          });
        }
      }
    );
  }

  private async notifyResourceUpdate(subscriberId: string, uri: string, contents: ResourceContents[]) {
    // Implement notification logic
    console.log(`Notifying subscriber ${subscriberId} of update to ${uri}`);
  }

  private async executeTool(name: string, args: Record<string, unknown>): Promise<CallToolResult> {
    switch (name) {
      case "search-conversations":
        return await this.searchConversations(args as { query: string; type: string });
      case "get-conversation":
        return await this.getConversation(args as { conversationId: string });
      case "analyze-conversation":
        return await this.analyzeConversation(
          args as { conversationId: string; analysisType: string }
        );
      case "extract-knowledge":
        return await this.extractKnowledge(
          args as { conversationId: string; format: string }
        );
      case "create-summary":
        return await this.createSummary(
          args as { conversationId: string; style: string }
        );
      case "manage-resources":
        return await this.manageResources(
          args as { action: string; resourceUri: string; metadata?: Record<string, unknown> }
        );
      default:
        throw new Error(`Tool not implemented: ${name}`);
    }
  }

  private async readResource(uri: string) {
    const [type, id] = uri.split("://");
    
    if (type === "conversation") {
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: { messages: true }
      });

      if (!conversation) {
        throw new Error(`Resource not found: ${uri}`);
      }

      return {
        contents: [{
          uri,
          text: JSON.stringify(conversation, null, 2),
          mimeType: "application/json"
        }]
      };
    }

    throw new Error(`Unsupported resource type: ${type}`);
  }

  private async getPrompt(name: string, args?: Record<string, unknown>): Promise<GetPromptResult> {
    if (name === "summarize-conversation") {
      const conversationId = args?.conversationId as string;
      if (!conversationId) {
        throw new Error("conversationId is required");
      }

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please summarize the conversation with ID ${conversationId}`
            }
          }
        ]
      };
    }

    throw new Error(`Prompt not found: ${name}`);
  }

  private async searchConversations({ query, type }: { query: string; type: string }): Promise<CallToolResult> {
    const results = await prisma.$transaction(async (tx) => {
      const conversations = type !== 'messages' ? await tx.conversation.findMany({
        where: {
          title: { contains: query, mode: 'insensitive' }
        },
        take: 5,
        include: {
          messages: { take: 1 }
        }
      }) : [];

      const messages = type !== 'conversations' ? await tx.message.findMany({
        where: {
          content: { contains: query, mode: 'insensitive' }
        },
        take: 10,
        include: {
          conversation: true
        }
      }) : [];

      return { conversations, messages };
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }

  private async getConversation({ conversationId }: { conversationId: string }): Promise<CallToolResult> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          include: {
            toolCalls: true,
            resources: true
          }
        }
      }
    });

    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(conversation, null, 2)
        }
      ]
    };
  }

  // New tool implementations
  private async analyzeConversation({ conversationId, analysisType }: { 
    conversationId: string; 
    analysisType: string 
  }): Promise<CallToolResult> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true }
    });

    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    // Use ModelClient for analysis
    const response = await this.modelClient.generateResponse(
      [
        {
          role: "user",
          content: `Analyze this conversation with focus on ${analysisType}:\n${JSON.stringify(conversation)}`
        }
      ]
    );

    return {
      content: [
        {
          type: "text",
          text: response.content
        }
      ]
    };
  }

  private async extractKnowledge({ conversationId, format }: {
    conversationId: string;
    format: string;
  }): Promise<CallToolResult> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true }
    });

    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    // Use ModelClient for knowledge extraction
    const response = await this.modelClient.generateResponse(
      [
        {
          role: "user",
          content: `Extract knowledge from this conversation and format as ${format}:\n${JSON.stringify(conversation)}`
        }
      ]
    );

    return {
      content: [
        {
          type: "text",
          text: response.content
        }
      ]
    };
  }

  // Add missing tool implementations
  private async createSummary({ conversationId, style }: {
    conversationId: string;
    style: string;
  }): Promise<CallToolResult> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true }
    });

    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const response = await this.modelClient.generateResponse(
      [
        {
          role: "user",
          content: `Create a ${style} summary of this conversation:\n${JSON.stringify(conversation)}`
        }
      ]
    );

    return {
      content: [
        {
          type: "text",
          text: response.content
        }
      ]
    };
  }

  private async manageResources({ action, resourceUri, metadata }: {
    action: string;
    resourceUri: string;
    metadata?: Record<string, unknown>;
  }): Promise<CallToolResult> {
    switch (action) {
      case 'add':
        this.resources.set(resourceUri, {
          uri: resourceUri,
          name: metadata?.name as string || resourceUri,
          description: metadata?.description as string
        });
        break;
      case 'remove':
        this.resources.delete(resourceUri);
        break;
      case 'update':
        const existing = this.resources.get(resourceUri);
        if (!existing) {
          throw new Error(`Resource not found: ${resourceUri}`);
        }
        this.resources.set(resourceUri, {
          ...existing,
          ...metadata
        });
        break;
      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return {
      content: [
        {
          type: "text",
          text: `Successfully ${action}ed resource: ${resourceUri}`
        }
      ]
    };
  }

  // ... rest of the class implementation ...

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Nexus MCP Server running on stdio");
  }
} 