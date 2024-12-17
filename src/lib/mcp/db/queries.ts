import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import type { RawLayerQueryResult } from '../types/prisma';

export const layerQueries = {
  getLayerWithPurchases: async (layerId: string) => {
    return prisma.$queryRaw<RawLayerQueryResult>`
      SELECT l.*, json_agg(lp.*) as purchases
      FROM "Layer" l
      LEFT JOIN "LayerPurchase" lp ON l.id = lp."layerId"
      WHERE l.id = ${layerId}
      GROUP BY l.id
    `;
  },
  
  getLayerCollaborators: async (layerId: string) => {
    return prisma.layerCollaborator.findMany({
      where: { layerId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  }
}; 