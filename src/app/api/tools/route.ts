import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

// Get all enabled tools for the user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    });

    return NextResponse.json({ tools: settings?.enabledTools ?? [] });
  } catch (error) {
    return new NextResponse('Internal error', { status: 500 });
  }
} 