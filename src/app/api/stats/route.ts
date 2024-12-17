import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const stats = await prisma.$transaction(async (tx) => {
      const totalConversations = await tx.conversation.count({
        where: { userId: session.user.id }
      });

      const totalMessages = await tx.message.count({
        where: { conversation: { userId: session.user.id } }
      });

      const totalToolCalls = await tx.toolCall.count({
        where: { message: { conversation: { userId: session.user.id } } }
      });

      return {
        conversations: totalConversations,
        messages: totalMessages,
        toolCalls: totalToolCalls
      };
    });

    return NextResponse.json(stats);
  } catch (error) {
    return new NextResponse('Internal error', { status: 500 });
  }
} 