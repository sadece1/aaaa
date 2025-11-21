import { create } from 'zustand';
import { Gear, GearFilters } from '@/types';
import { gearService } from '@/services/gearService';

interface GearState {
  gear: Gear[];
  currentGear: Gear | null;
  filters: GearFilters;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  
  fetchGear: (filters?: GearFilters, page?: number, limit?: number) => Promise<void>;
  fetchGearById: (id: string) => Promise<void>;
  addGear: (gear: Omit<Gear, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGearInStore: (id: string, gear: Partial<Gear>) => Promise<void>;
  deleteGear: (id: string) => Promise<void>;
  setFilters: (filters: GearFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
}

const initialFilters: GearFilters = {};

export const useGearStore = create<GearState>((set, get) => ({
  gear: [],
  currentGear: null,
  filters: initialFilters,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,

  fetchGear: async (filters, page = 1, limit?: number) => {
    set({ isLoading: true, error: null });
    try {
      const activeFilters = filters || get().filters;
      const response = await gearService.getGear(activeFilters, page, limit);
      set({
        gear: response.data,
        total: response.total,
        page: response.page,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Malzemeler yüklenemedi',
      });
    }
  },

  fetchGearById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const item = await gearService.getGearById(id);
      set({
        currentGear: item,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Malzeme yüklenemedi',
      });
    }
  },

  addGear: async (gearData) => {
    set({ isLoading: true, error: null });
    try {
      // Send as JSON (backend will handle FormData if needed)
      const jsonData = {
        name: gearData.name,
        description: gearData.description || '',
        category_id: gearData.categoryId || gearData.category,
        price_per_day: gearData.pricePerDay,
        deposit: gearData.deposit,
        status: gearData.status || (gearData.available ? 'for-sale' : 'sold'),
        available: gearData.available ?? true,
        images: gearData.images || [],
        brand: gearData.brand,
        color: gearData.color,
        specifications: gearData.specifications,
        recommended_products: gearData.recommendedProducts,
      };

      await gearService.createGear(jsonData as any);
      // Refresh gear list
      await get().fetchGear(get().filters, get().page);
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ürün eklenemedi',
      });
      throw error;
    }
  },

  updateGearInStore: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await gearService.updateGear(id, updates);
      await get().fetchGear(get().filters, get().page);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ürün güncellenemedi',
      });
      throw error;
    }
  },

  deleteGear: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await gearService.deleteGear(id);
      await get().fetchGear(get().filters, get().page);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ürün silinemedi',
      });
      throw error;
    }
  },

  setFilters: (filters: GearFilters) => {
    set({ filters, page: 1 });
  },

  clearFilters: () => {
    set({ filters: initialFilters, page: 1 });
  },

  clearError: () => {
    set({ error: null });
  },
}));

