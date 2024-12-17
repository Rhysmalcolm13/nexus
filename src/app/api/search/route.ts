import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1),
  type: z.enum(['conversations', 'messages', 'all']).default('all')
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const params = searchSchema.parse({
      query: searchParams.get('query'),
      type: searchParams.get('type')
    });

    const results = await prisma.$transaction(async (tx) => {
      const conversations = params.type !== 'messages' ? await tx.conversation.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: params.query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        include: {
          messages: { take: 1 }
        }
      }) : [];

      const messages = params.type !== 'conversations' ? await tx.message.findMany({
        where: {
          conversation: { userId: session.user.id },
          content: { contains: params.query, mode: 'insensitive' }
        },
        take: 10,
        include: {
          conversation: true
        }
      }) : [];

      return { conversations, messages };
    });

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid search parameters', { status: 422 });
    }
    return new NextResponse('Internal error', { status: 500 });
  }
} 