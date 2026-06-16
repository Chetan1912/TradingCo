import { create } from 'zustand';
import { watchlistApi } from '../api/watchlistApi';

const useWatchlistStore = create((set) => ({
  watchlists: [],
  activeWatchlistId: null,
  isLoading: false,

  fetchWatchlists: async () => {
    set({ isLoading: true });
    try {
      const { data } = await watchlistApi.getWatchlists();
      const lists = data.content || data;
      set({ watchlists: lists, isLoading: false });
      if (lists.length > 0 && !useWatchlistStore.getState().activeWatchlistId) {
        set({ activeWatchlistId: lists[0].id });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  createWatchlist: async (name) => {
    const { data } = await watchlistApi.createWatchlist(name);
    set((state) => ({ watchlists: [...state.watchlists, data] }));
    return data;
  },

  addSymbol: async (watchlistId, symbol) => {
    await watchlistApi.addSymbol(watchlistId, symbol);
    set((state) => ({
      watchlists: state.watchlists.map((wl) =>
        wl.id === watchlistId
          ? { ...wl, symbols: [...(wl.symbols || []), symbol] }
          : wl
      ),
    }));
  },

  removeSymbol: async (watchlistId, symbol) => {
    await watchlistApi.removeSymbol(watchlistId, symbol);
    set((state) => ({
      watchlists: state.watchlists.map((wl) =>
        wl.id === watchlistId
          ? { ...wl, symbols: (wl.symbols || []).filter((s) => s !== symbol) }
          : wl
      ),
    }));
  },

  setActiveWatchlist: (id) => set({ activeWatchlistId: id }),
}));

export default useWatchlistStore;
