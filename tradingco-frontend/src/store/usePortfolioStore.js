import { create } from 'zustand';
import { portfolioApi } from '../api/portfolioApi';

const usePortfolioStore = create((set) => ({
  positions: [],
  trades: [],
  summary: null,
  isLoading: false,

  fetchPortfolio: async (accountId) => {
    set({ isLoading: true });
    try {
      const { data } = await portfolioApi.getPortfolio(accountId);
      set({ summary: data, positions: data.positions || [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchPositions: async (accountId) => {
    try {
      const { data } = await portfolioApi.getPositions(accountId);
      set({ positions: data });
    } catch { /* ignore */ }
  },

  updatePosition: (symbol, updates) => {
    set((state) => ({
      positions: state.positions.map((p) =>
        p.symbol === symbol ? { ...p, ...updates } : p
      ),
    }));
  },
}));

export default usePortfolioStore;
