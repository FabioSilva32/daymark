'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MODULE_REGISTRY } from '@/lib/modules';
import { useDaymark } from '@/context/DaymarkContext';
import {
  X,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Flame,
  FileText,
  BookOpen,
  Timer,
  Dumbbell,
  Utensils,
  Droplets,
  ChefHat,
  Wallet,
  Bookmark,
  Compass,
  ShoppingBag,
  FolderArchive,
  Link2,
  CloudSun,
  Calculator,
  Sparkles,
  Settings,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  Calendar: <Calendar size={18} />,
  CheckSquare: <CheckSquare size={18} />,
  Flame: <Flame size={18} />,
  FileText: <FileText size={18} />,
  BookOpen: <BookOpen size={18} />,
  Timer: <Timer size={18} />,
  Dumbbell: <Dumbbell size={18} />,
  Utensils: <Utensils size={18} />,
  Droplets: <Droplets size={18} />,
  ChefHat: <ChefHat size={18} />,
  Wallet: <Wallet size={18} />,
  Bookmark: <Bookmark size={18} />,
  Compass: <Compass size={18} />,
  ShoppingBag: <ShoppingBag size={18} />,
  FolderArchive: <FolderArchive size={18} />,
  Link2: <Link2 size={18} />,
  CloudSun: <CloudSun size={18} />,
  Calculator: <Calculator size={18} />,
  Sparkles: <Sparkles size={18} />,
  Settings: <Settings size={18} />,
};

export function MobileDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { settings } = useDaymark();

  if (!isOpen) return null;

  const categories = ['Overview', 'Personal', 'Health', 'Manage', 'Utilities', 'System'] as const;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[85vw] bg-[#0D0D0D] border-r border-[#1C1C1C] h-full flex flex-col z-10 animate-slideRight">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#1C1C1C]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#E50914] rounded-md flex items-center justify-center font-heading font-black text-white text-xs">
              D
            </div>
            <span className="font-heading font-black text-sm text-[#FFFFFF] tracking-tight">DAYMARK</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#777777] hover:text-[#FFFFFF] p-1.5 rounded-lg hover:bg-[#1A1A1A] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {categories.map((category) => {
            const items = MODULE_REGISTRY.filter(
              (m) => m.category === category && (settings.enabledModules?.[m.id] ?? true)
            );
            if (items.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <div className="text-[10px] font-heading font-bold text-[#777777] uppercase tracking-wider px-2">
                  {category}
                </div>
                {items.map((item) => {
                  const isActive =
                    item.route === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.route);

                  return (
                    <Link
                      key={item.id}
                      href={item.route}
                      prefetch={true}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                        isActive
                          ? 'bg-[#181818] text-[#FFFFFF] font-bold border-l-2 border-[#E50914]'
                          : 'text-[#AAAAAA] hover:bg-[#141414] hover:text-[#FFFFFF]'
                      }`}
                    >
                      <span className={isActive ? 'text-[#E50914]' : 'text-[#777777]'}>
                        {iconMap[item.icon] || <LayoutDashboard size={18} />}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#1C1C1C] text-xs bg-[#111111]">
          <p suppressHydrationWarning className="font-bold text-[#FFFFFF] truncate">{settings.name}</p>
          <p suppressHydrationWarning className="text-[10px] text-[#777777] truncate">{settings.email}</p>
        </div>
      </div>
    </div>
  );
}
