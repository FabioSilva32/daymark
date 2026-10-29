'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserSettings, UserAccount, ModuleId } from '@/types';
import { StorageAPI, initDaymarkStorage, syncFromDatabase, DEFAULT_PRIMARY_ACCOUNT } from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error';
}

interface DaymarkContextType {
  // Accounts & Authentication
  accounts: UserAccount[];
  activeAccount: UserAccount;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password?: string) => { success: boolean; error?: string };
  register: (data: {
    name: string;
    username: string;
    email?: string;
    password?: string;
    avatarColor?: string;
  }) => { success: boolean; error?: string };
  logout: () => void;
  deleteAccount: (accountId: string) => void;

  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  isOnline: boolean;
  syncStatus: 'synced' | 'database' | 'offline' | 'local_only';
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  quickAddDefaultTab?: string;
  openQuickAdd: (tab?: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  storageVersion: number;
  refreshStorage: () => void;
  formatCurrency: (amountCents: number) => string;
}

const DaymarkContext = createContext<DaymarkContextType | undefined>(undefined);

const INITIAL_SETTINGS: UserSettings = {
  id: 'usr_default',
  email: 'user@daymark.local',
  name: 'Alexandre Silva',
  currency: 'EUR',
  currencySymbol: '€',
  timezone: 'Europe/Lisbon',
  unitSystem: 'metric',
  timeFormat: '24h',
  dateFormat: 'YYYY-MM-DD',
  theme: 'dark',
  accentColor: 'red',
  weatherCity: 'Porto',
  weatherLat: 41.1496,
  weatherLon: -8.611,
  homeCity: 'Porto',
  homeCountry: 'Portugal',
  homeLat: 41.1496,
  homeLon: -8.611,
  enabledModules: {} as any,
};

const GUEST_ACCOUNT: UserAccount = {
  id: '',
  name: 'New User',
  username: 'user',
  avatarColor: '#E50914',
  createdAt: '',
};

export function DaymarkProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<UserAccount>(GUEST_ACCOUNT);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [isOnline, setIsOnline] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddDefaultTab, setQuickAddDefaultTab] = useState<string | undefined>(undefined);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [storageVersion, setStorageVersion] = useState(0);

  const refreshStorage = useCallback(() => {
    setStorageVersion((v) => v + 1);
    setSettings(StorageAPI.getSettings());
    const currentAccounts = StorageAPI.getUserAccounts();
    const activeId = StorageAPI.getActiveUserId();
    const found = currentAccounts.find((a) => a.id === activeId) || currentAccounts[0] || GUEST_ACCOUNT;
    setAccounts(currentAccounts);
    setActiveAccount(found);
    setIsAuthenticated(StorageAPI.isAuthenticated() && currentAccounts.length > 0 && currentAccounts.some(a => a.id === activeId));
  }, []);

  const addToast = useCallback((title: string, description?: string, type: 'success' | 'info' | 'error' = 'info') => {
    // Suppress intrusive popups on every user click; only display actual error alerts
    if (type !== 'error') return;
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const login = useCallback(
    (usernameOrEmail: string, password?: string): { success: boolean; error?: string } => {
      const res = StorageAPI.authenticateUser(usernameOrEmail, password);
      if (res.success && res.account) {
        setIsAuthenticated(true);
        refreshStorage();
        addToast('Welcome Back', `Logged in as ${res.account.name}`, 'success');
        return { success: true };
      }
      return { success: false, error: res.error || 'Authentication failed' };
    },
    [refreshStorage, addToast]
  );

  const register = useCallback(
    (data: {
      name: string;
      username: string;
      email?: string;
      password?: string;
      avatarColor?: string;
    }): { success: boolean; error?: string } => {
      const res = StorageAPI.createUserAccount(data);
      if (res.success && res.account) {
        setIsAuthenticated(true);
        refreshStorage();
        addToast('Account Created', `Welcome to Daymark, ${res.account.name}!`, 'success');
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to create account' };
    },
    [refreshStorage, addToast]
  );

  const logout = useCallback(() => {
    StorageAPI.logout();
    setIsAuthenticated(false);
    refreshStorage();
    addToast('Signed Out', 'You have been logged out', 'info');
  }, [refreshStorage, addToast]);

  const deleteAccount = useCallback((accountId: string) => {
    StorageAPI.deleteUserAccount(accountId);
    refreshStorage();
    addToast('Account Removed', 'Profile has been removed', 'info');
  }, [refreshStorage, addToast]);

  useEffect(() => {
    initDaymarkStorage();
    refreshStorage();

    // Hydrate and sync from SQLite Database
    syncFromDatabase().then((ok) => {
      setDbConnected(ok);
      if (ok) refreshStorage();
    });

    // Listen to network changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen to local storage modifications
    const handleStorageChange = () => refreshStorage();
    window.addEventListener('daymark-storage-update', handleStorageChange);

    // Register service worker if available
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }

    // Global keyboard shortcut: Cmd+K / Ctrl+K opens Command Search or Quick Add
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setQuickAddOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('daymark-storage-update', handleStorageChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [refreshStorage]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    StorageAPI.saveSettings(updated);
    setSettings(updated);
  };

  const openQuickAdd = (tab?: string) => {
    setQuickAddDefaultTab(tab);
    setQuickAddOpen(true);
  };

  const syncStatus: 'synced' | 'database' | 'offline' | 'local_only' = !isOnline
    ? 'offline'
    : isSupabaseConfigured
    ? 'synced'
    : dbConnected
    ? 'database'
    : 'database';

  const formatCurrency = (amountCents: number): string => {
    const symbol = settings.currencySymbol || '€';
    const val = (amountCents / 100).toFixed(2);
    return `${symbol}${val}`;
  };

  return (
    <DaymarkContext.Provider
      value={{
        accounts,
        activeAccount,
        isAuthenticated,
        login,
        register,
        logout,
        deleteAccount,
        settings,
        updateSettings,
        isOnline,
        syncStatus,
        quickAddOpen,
        setQuickAddOpen,
        quickAddDefaultTab,
        openQuickAdd,
        searchOpen,
        setSearchOpen,
        toasts,
        addToast,
        removeToast,
        storageVersion,
        refreshStorage,
        formatCurrency,
      }}
    >
      {children}
    </DaymarkContext.Provider>
  );
}

export function useDaymark() {
  const context = useContext(DaymarkContext);
  if (!context) {
    throw new Error('useDaymark must be used within a DaymarkProvider');
  }
  return context;
}
