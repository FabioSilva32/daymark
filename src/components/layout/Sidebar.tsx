'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MODULE_REGISTRY } from '@/lib/modules';
import { useDaymark } from '@/context/DaymarkContext';
import {
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
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={17} />,
  Calendar: <Calendar size={17} />,
  CheckSquare: <CheckSquare size={17} />,
  Flame: <Flame size={17} />,
  FileText: <FileText size={17} />,
  BookOpen: <BookOpen size={17} />,
  Timer: <Timer size={17} />,
  Dumbbell: <Dumbbell size={17} />,
  Utensils: <Utensils size={17} />,
  Droplets: <Droplets size={17} />,
  ChefHat: <ChefHat size={17} />,
  Wallet: <Wallet size={17} />,
  Bookmark: <Bookmark size={17} />,
  Compass: <Compass size={17} />,
  ShoppingBag: <ShoppingBag size={17} />,
  FolderArchive: <FolderArchive size={17} />,
  Link2: <Link2 size={17} />,
  CloudSun: <CloudSun size={17} />,
  Calculator: <Calculator size={17} />,
  Sparkles: <Sparkles size={17} />,
  Settings: <Settings size={17} />,
};

export function Sidebar() {
  const pathname = usePathname();
  const { settings, openQuickAdd, activeAccount, logout } = useDaymark();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('daymark_sidebar_collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('daymark_sidebar_collapsed', String(next));
  };

  const categories = ['Overview', 'Personal', 'Health', 'Manage', 'Utilities', 'System'] as const;

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#0D0D0D] border-r border-[#1C1C1C] transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-64'
      } shrink-0 h-screen sticky top-0 z-30`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#1C1C1C]">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/icon.svg"
              alt="Daymark"
              className="w-7 h-7 rounded-lg object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-heading font-black text-sm text-[#FFFFFF] tracking-tight group-hover:text-[#E50914] transition-colors">
                DAYMARK
              </span>
              <span className="block text-[9px] font-bold text-[#777777] uppercase tracking-wider leading-none">
                Command Centre
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/" className="mx-auto" title="Daymark Home">
            <img
              src="/icon.svg"
              alt="Daymark"
              className="w-7 h-7 rounded-lg object-contain hover:scale-105 transition-transform"
            />
          </Link>
        )}
        <button
          onClick={toggleCollapse}
          className="text-[#777777] hover:text-[#FFFFFF] p-1.5 rounded-md hover:bg-[#1A1A1A] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Quick Add Action Button */}
      <div className="p-3 border-b border-[#1C1C1C]">
        <button
          onClick={() => openQuickAdd()}
          className={`w-full bg-[#E50914] hover:bg-[#C11119] active:scale-[0.98] text-white rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
            collapsed ? 'h-9 p-0' : 'h-9 px-3 gap-2'
          }`}
          title="Quick Add (⌘B / Ctrl+B)"
        >
          <Plus size={16} />
          {!collapsed && <span>Quick Add</span>}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {categories.map((category) => {
          const items = MODULE_REGISTRY.filter(
            (m) => m.category === category && (settings.enabledModules?.[m.id] ?? true)
          );
          if (items.length === 0) return null;

          return (
            <div key={category} className="space-y-0.5">
              {!collapsed && (
                <div className="text-[10px] font-heading font-bold text-[#777777] uppercase tracking-wider px-2.5 py-1">
                  {category}
                </div>
              )}
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
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors group relative ${
                      isActive
                        ? 'bg-[#181818] text-[#FFFFFF] font-bold border-l-2 border-[#E50914]'
                        : 'text-[#AAAAAA] hover:bg-[#141414] hover:text-[#FFFFFF] font-medium'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <span
                      className={`shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#E50914]'
                          : 'text-[#777777] group-hover:text-[#FFFFFF]'
                      }`}
                    >
                      {iconMap[item.icon] || <LayoutDashboard size={17} />}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* User Profile Card */}
      <div className="p-3 border-t border-[#1C1C1C]">
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 bg-[#141414] border border-[#242424] rounded-lg">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs text-white shrink-0"
                style={{ backgroundColor: activeAccount?.avatarColor || '#E50914' }}
              >
                {activeAccount?.name ? activeAccount.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate mr-1">
                <p suppressHydrationWarning className="text-xs font-bold text-[#FFFFFF] truncate">
                  {activeAccount?.name || settings.name}
                </p>
                <p suppressHydrationWarning className="text-[10px] text-[#777777] truncate font-mono">
                  @{activeAccount?.username || 'user'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <Link
                href="/settings"
                className="text-[#777777] hover:text-[#FFFFFF] p-1.5 rounded hover:bg-[#1F1F1F] transition-colors"
                title="Settings"
              >
                <Settings size={14} />
              </Link>
              <button
                onClick={() => logout()}
                className="text-[#777777] hover:text-[#EF4444] p-1.5 rounded hover:bg-[#201112] transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs text-white"
              style={{ backgroundColor: activeAccount?.avatarColor || '#E50914' }}
              title={`Logged in as ${activeAccount?.name || 'User'}`}
            >
              {activeAccount?.name ? activeAccount.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 text-[#777777] hover:text-[#EF4444] rounded hover:bg-[#201112] transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
