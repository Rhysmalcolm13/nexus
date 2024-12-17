import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { LayerManager } from '@/lib/mcp/layers/manager';

const layerManager = new LayerManager();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const tags = searchParams.getAll('tags');
    
    const layers = await layerManager.listAvailableLayers({
      category: category || undefined,
      tags: tags.length > 0 ? tags : undefined
    });

    return NextResponse.json(layers);
  } catch (error) {
    return new NextResponse('Internal error', { status: 500 });
  }
} 