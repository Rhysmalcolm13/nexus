import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { addMessageToConversation } from '@/lib/db/utils';
import { Prisma } from '@prisma/client';

const createMessageSchema = z.object({
  content: z.string().min(1),
  role: z.enum(['user', 'assistant']),
  toolCalls: z.array(z.object({
    name: z.string(),
    args: z.any().transform(val => val as Prisma.InputJsonValue),
    result: z.any().transform(val => val as Prisma.InputJsonValue).optional(),
    status: z.string(),
    error: z.string().optional()
  })).optional(),
  resources: z.array(z.object({
    uri: z.string(),
    content: z.string(),
    mimeType: z.string().optional(),
    metadata: z.any().transform(val => val as Prisma.InputJsonValue).optional()
  })).optional()
});

export async function POST(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await req.json();
    const body = createMessageSchema.parse(json);

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: params.conversationId,
        userId: session.user.id
      }
    });

    if (!conversation) {
      return new NextResponse('Not found', { status: 404 });
    }

    const message = await addMessageToConversation(
      params.conversationId,
      body.content,
      body.role,
      body.toolCalls,
      body.resources
    );

    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }
    return new NextResponse('Internal error', { status: 500 });
  }
} 