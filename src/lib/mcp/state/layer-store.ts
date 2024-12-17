import { create } from 'zustand';
import type { Layer } from '../types/layer';

interface LayerState {
  activeLayers: Layer[];
  equippedLayers: Record<string, boolean>;
  configurations: Record<string, unknown>;
  setActiveLayers: (layers: Layer[]) => void;
  toggleLayer: (layerId: string) => void;
  updateConfiguration: (layerId: string, config: unknown) => void;
}

export const useLayerStore = create<LayerState>((set: any) => ({
  activeLayers: [],
  equippedLayers: {},
  configurations: {},
  setActiveLayers: (layers: Layer[]) => set({ activeLayers: layers }),
  toggleLayer: (layerId: string) =>
    set((state: LayerState) => ({
      equippedLayers: {
        ...state.equippedLayers,
        [layerId]: !state.equippedLayers[layerId]
      }
    })),
  updateConfiguration: (layerId: string, config: unknown) =>
    set((state: LayerState) => ({
      configurations: {
        ...state.configurations,
        [layerId]: config
      }
    }))
})); 