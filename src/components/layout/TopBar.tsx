'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import {
  Search,
  Plus,
  Menu,
  LogOut,
} from 'lucide-react';

export function TopBar({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const {
    settings,
    setSearchOpen,
    openQuickAdd,
    activeAccount,
    logout,
  } = useDaymark();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const tz = settings.timezone || 'Europe/Lisbon';
        const tf = settings.timeFormat === '12h' ? false : true;

        const timeFormatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: !tf,
        });

        const dateFormatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: tz,
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });

        setTimeStr(timeFormatter.format(now));
        setDateStr(dateFormatter.format(now));
      } catch (e) {
        setTimeStr(new Date().toLocaleTimeString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.timezone, settings.timeFormat]);

  return (
    <header className="h-14 bg-[#000000] border-b border-[#1C1C1C] px-4 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile hamburger & branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-[#AAAAAA] hover:text-[#FFFFFF] p-1.5 rounded-lg hover:bg-[#141414] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="md:hidden flex items-center gap-2">
          <div className="w-6 h-6 bg-[#E50914] rounded-md flex items-center justify-center font-heading font-black text-white text-[11px]">
            D
          </div>
          <span className="font-heading font-black text-xs text-[#FFFFFF] tracking-tight">DAYMARK</span>
        </div>

        {/* Desktop Search bar trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-[#141414] border border-[#242424] hover:border-[#383838] rounded-lg text-xs text-[#777777] w-80 transition-colors text-left"
        >
          <Search size={14} className="text-[#777777]" />
          <span className="flex-1 text-[#AAAAAA]">Search records, actions or navigate...</span>
          <kbd className="text-[10px] bg-[#1A1A1A] border border-[#282828] text-[#AAAAAA] px-1.5 py-0.5 rounded font-mono font-semibold">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Clock, Sync status, Mobile Quick Add */}
      <div className="flex items-center gap-3">
        {/* Mobile Search button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="md:hidden text-[#AAAAAA] hover:text-[#FFFFFF] p-1.5 rounded-lg hover:bg-[#141414]"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Live Clock & Date */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-mono font-bold text-[#FFFFFF]">{timeStr}</span>
          <span className="text-[10px] text-[#777777] flex items-center justify-end gap-1">
            <span>{dateStr}</span>
            <span>•</span>
            <span className="text-[#AAAAAA]">{settings.homeCity || 'Porto'}</span>
          </span>
        </div>

        {/* User Account Chip */}
        <div className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-[#141414] border border-[#242424] rounded-lg">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center font-heading font-bold text-[10px] text-white shrink-0"
            style={{ backgroundColor: activeAccount?.avatarColor || '#E50914' }}
          >
            {activeAccount?.name ? activeAccount.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-white truncate max-w-[110px]">
            {activeAccount?.name || 'User'}
          </span>
        </div>

        {/* Log Out Button */}
        <button
          onClick={() => logout()}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] hover:bg-[#201112] text-[#AAAAAA] hover:text-[#EF4444] border border-[#242424] hover:border-[#EF4444]/40 rounded-lg text-xs transition-colors cursor-pointer"
          title="Sign out of your account"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline font-medium">Log Out</span>
        </button>

        {/* Mobile Quick Add */}
        <button
          onClick={() => openQuickAdd()}
          className="md:hidden bg-[#E50914] hover:bg-[#C11119] text-white p-2 rounded-lg"
          aria-label="Quick Add"
        >
          <Plus size={16} />
        </button>
      </div>
    </header>
  );
}
