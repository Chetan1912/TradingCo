import { create } from 'zustand';

const useSettingsStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'DARK',
  activeAccountId: localStorage.getItem('activeAccountId') || null,
  sidebarExpanded: false,

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  setActiveAccount: (accountId) => {
    localStorage.setItem('activeAccountId', accountId);
    set({ activeAccountId: accountId });
  },

  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
}));

export default useSettingsStore;
