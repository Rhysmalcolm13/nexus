import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { LayerMarketplace } from '@/lib/mcp/marketplace';
import { LayerError } from '@/lib/mcp/errors';

const marketplace = new LayerMarketplace();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    
    const layers = await marketplace.searchLayers(query);
    return NextResponse.json(layers);
  } catch (error) {
    if (error instanceof LayerError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { layerId, action } = await req.json();
    
    switch (action) {
      case 'install':
        await marketplace.installLayer(layerId, session.user.id);
        break;
      case 'purchase':
        await marketplace.purchaseLayer(layerId, session.user.id);
        break;
      default:
        return new NextResponse('Invalid action', { status: 400 });
    }

    return new NextResponse('Success');
  } catch (error) {
    if (error instanceof LayerError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 