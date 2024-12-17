import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const updateConversationSchema = z.object({
  title: z.string().min(1).optional(),
  isArchived: z.boolean().optional()
});

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: params.conversationId,
        userId: session.user.id
      },
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
      return new NextResponse('Not found', { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await req.json();
    const body = updateConversationSchema.parse(json);

    const conversation = await prisma.conversation.update({
      where: {
        id: params.conversationId,
        userId: session.user.id
      },
      data: body
    });

    return NextResponse.json(conversation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.conversation.delete({
      where: {
        id: params.conversationId,
        userId: session.user.id
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse('Internal error', { status: 500 });
  }
} 