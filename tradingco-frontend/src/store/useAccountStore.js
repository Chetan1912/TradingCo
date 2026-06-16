import { create } from 'zustand';
import { accountApi } from '../api/accountApi';
import useSettingsStore from './useSettingsStore';

const useAccountStore = create((set, get) => ({
  accounts: [],
  activeAccount: null,
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await accountApi.getAccounts();
      set({ accounts: data, isLoading: false });
      
      // Select active account
      const storedAccountId = useSettingsStore.getState().activeAccountId;
      let selected = null;
      
      if (storedAccountId) {
        selected = data.find((a) => a.id === storedAccountId);
      }
      
      if (!selected && data.length > 0) {
        selected = data[0];
      }
      
      if (selected) {
        get().selectAccount(selected.id);
      }
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to fetch accounts' });
    }
  },

  selectAccount: (accountId) => {
    const { accounts } = get();
    const account = accounts.find((a) => a.id === accountId) || null;
    set({ activeAccount: account });
    if (account) {
      useSettingsStore.getState().setActiveAccount(account.id);
    }
  },

  createAccount: async (name, initialBalance) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await accountApi.createAccount(name, initialBalance);
      set((state) => {
        const newAccounts = [...state.accounts, data];
        return {
          accounts: newAccounts,
          isLoading: false
        };
      });
      get().selectAccount(data.id);
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to create account' });
      throw err;
    }
  },

  resetAccount: async (accountId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await accountApi.resetAccount(accountId);
      set((state) => ({
        accounts: state.accounts.map((a) => a.id === accountId ? data : a),
        activeAccount: state.activeAccount?.id === accountId ? data : state.activeAccount,
        isLoading: false
      }));
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to reset account' });
      throw err;
    }
  }
}));

export default useAccountStore;
