'use client';

import React, { useState } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileDrawer } from './MobileDrawer';
import { QuickAddModal } from '../modals/QuickAddModal';
import { GlobalSearchModal } from '../modals/GlobalSearchModal';
import { AuthScreen } from '../auth/AuthScreen';
import { ToastContainer } from '../ui/ToastContainer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useDaymark();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#000000] text-white font-sans w-full max-w-full overflow-x-hidden relative">
      {/* Standard Authentication Screen when signed out */}
      {!isAuthenticated && <AuthScreen />}

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full pb-24 md:pb-0 overflow-x-hidden">
        <TopBar onOpenMobileMenu={() => setMobileDrawerOpen(true)} />

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav onOpenMore={() => setMobileDrawerOpen(true)} />
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Global Modals & Notifications */}
      <QuickAddModal />
      <GlobalSearchModal />
      <ToastContainer />
    </div>
  );
}
