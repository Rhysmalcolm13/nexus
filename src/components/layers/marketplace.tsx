'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Layer, LayerMetadata } from '@/lib/mcp/layers/types';

export function LayerMarketplace() {
  const { data: session } = useSession();
  const [layers, setLayers] = useState<LayerMetadata[]>([]);

  useEffect(() => {
    // Fetch available layers
  }, []);

  return (
    <div>
      {/* Implement marketplace UI */}
    </div>
  );
} 