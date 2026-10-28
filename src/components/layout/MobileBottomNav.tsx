'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDaymark } from '@/context/DaymarkContext';
import {
  LayoutDashboard,
  CheckSquare,
  Plus,
  Dumbbell,
  Menu,
} from 'lucide-react';

export function MobileBottomNav({ onOpenMore }: { onOpenMore: () => void }) {
  const pathname = usePathname();
  const { openQuickAdd } = useDaymark();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full max-w-full bg-[#000000] border-t border-[#1C1C1C] z-50 safe-bottom">
      <div className="flex items-center justify-around h-14 relative px-2 w-full max-w-full">
        {/* Today */}
        <Link
          href="/"
          prefetch={true}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] transition-colors ${
            pathname === '/' ? 'text-[#E50914] font-bold' : 'text-[#777777] hover:text-[#FFFFFF]'
          }`}
        >
          <LayoutDashboard size={19} className={pathname === '/' ? 'text-[#E50914]' : ''} />
          <span className="mt-1">Today</span>
        </Link>

        {/* Tasks */}
        <Link
          href="/tasks"
          prefetch={true}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] transition-colors ${
            pathname.startsWith('/tasks') ? 'text-[#E50914] font-bold' : 'text-[#777777] hover:text-[#FFFFFF]'
          }`}
        >
          <CheckSquare size={19} className={pathname.startsWith('/tasks') ? 'text-[#E50914]' : ''} />
          <span className="mt-1">Tasks</span>
        </Link>

        {/* Central Standout CineLog-style Red Quick Add FAB */}
        <div className="flex items-center justify-center -translate-y-3 px-1">
          <button
            onClick={() => openQuickAdd()}
            className="w-12 h-12 rounded-full bg-[#E50914] hover:bg-[#C11119] active:scale-95 text-white flex items-center justify-center border-4 border-[#000000] shadow-xl transition-transform"
            aria-label="Quick Add"
          >
            <Plus size={22} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Fitness */}
        <Link
          href="/fitness"
          prefetch={true}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] transition-colors ${
            pathname.startsWith('/fitness') ? 'text-[#E50914] font-bold' : 'text-[#777777] hover:text-[#FFFFFF]'
          }`}
        >
          <Dumbbell size={19} className={pathname.startsWith('/fitness') ? 'text-[#E50914]' : ''} />
          <span className="mt-1">Fitness</span>
        </Link>

        {/* More */}
        <button
          onClick={onOpenMore}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] text-[#777777] hover:text-[#FFFFFF] transition-colors"
        >
          <Menu size={19} />
          <span className="mt-1">More</span>
        </button>
      </div>
    </nav>
  );
}
