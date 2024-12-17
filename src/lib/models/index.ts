import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, Message, ContentBlock, ToolUseBlock, Tool as AnthropicTool, MessageCreateParams } from '@anthropic-ai/sdk/resources/messages';
import type { Tool as MCPTool } from '@modelcontextprotocol/sdk/types.js';
import env from '../config/env';

export interface ModelResponse {
  readonly content: string;
  readonly toolCalls?: ReadonlyArray<{
    readonly name: string;
    readonly arguments: Record<string, unknown>;
  }>;
}

type ModelOptions = Readonly<Partial<Pick<MessageCreateParams, 'model' | 'max_tokens' | 'temperature'>>>;

export class ModelClient {
  private readonly anthropic: Anthropic;
  private readonly defaultModel = 'claude-3-opus-20240229' as const;
  private readonly defaultMaxTokens = 1024 as const;
  private readonly defaultTimeout = 10 * 60 * 1000; // 10 minutes

  constructor(apiKey?: string) {
    const key = apiKey ?? env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('Anthropic API key is required');
    }
    this.anthropic = new Anthropic({ 
      apiKey: key,
      maxRetries: 2,
      timeout: this.defaultTimeout
    });
  }

  async generateResponse(
    messages: ReadonlyArray<MessageParam>,
    tools?: ReadonlyArray<MCPTool>,
    options: Readonly<ModelOptions> = {}
  ): Promise<ModelResponse> {
    if (!messages.length) {
      throw new Error('At least one message is required');
    }

    try {
      // Convert MCP tools to Anthropic tools format
      const anthropicTools = tools?.map(tool => ({
        type: 'function' as const,
        name: tool.name,
        description: tool.description ?? undefined,
        parameters: tool.inputSchema,
        input_schema: tool.inputSchema
      }));

      // Create a mutable copy of the messages array
      const mutableMessages = [...messages];
      
      const response = await this.anthropic.messages.create({
        model: options.model ?? this.defaultModel,
        max_tokens: options.max_tokens ?? this.defaultMaxTokens,
        temperature: options.temperature,
        messages: mutableMessages,
        tools: anthropicTools ? [...anthropicTools] : undefined
      });

      return this.processResponse(response);
    } catch (error) {
      if (error instanceof Error) {
        if ('status' in error) { // Check if it's an Anthropic API error
          throw new Error(`Anthropic API error: ${error.message}`);
        }
      }
      throw new Error('Unknown error occurred');
    }
  }
  private processResponse(response: Readonly<Message>): ModelResponse {
    const toolCalls = response.content
      .filter((content): content is ToolUseBlock => content.type === 'tool_use')
      .map(content => ({
        name: content.name,
        arguments: content.input as Record<string, unknown>
      }));

    const textContent = response.content
      .filter((content): content is Extract<ContentBlock, { type: 'text' }> => content.type === 'text')
      .map(content => content.text)
      .filter((text): text is string => text !== undefined)
      .join('\n');

    if (!textContent && !toolCalls.length) {
      throw new Error('Response contains neither text content nor tool calls');
    }

    return {
      content: textContent,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined
    } as const;
  }
}