import { prisma, Prisma } from './prisma';
import type { Message, ToolCall, Resource } from './prisma';

export async function createConversation(userId: string, title: string) {
  return prisma.conversation.create({
    data: {
      userId,
      title,
    },
    include: {
      messages: true
    }
  });
}

export async function addMessageToConversation(
  conversationId: string,
  content: string,
  role: string,
  toolCalls?: Array<{
    name: string;
    args: Prisma.InputJsonValue;
    result?: Prisma.InputJsonValue;
    status: string;
    error?: string;
  }>,
  resources?: Array<{
    uri: string;
    content: string;
    mimeType?: string;
    metadata?: Prisma.InputJsonValue;
  }>
) {
  return prisma.message.create({
    data: {
      conversationId,
      content,
      role,
      toolCalls: toolCalls ? {
        create: toolCalls
      } : undefined,
      resources: resources ? {
        create: resources
      } : undefined
    },
    include: {
      toolCalls: true,
      resources: true
    }
  });
}

export async function getUserSettings(userId: string) {
  return prisma.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: {}
  });
} 