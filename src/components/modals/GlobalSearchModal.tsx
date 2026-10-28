'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import {
  Search,
  X,
  CheckSquare,
  Calendar,
  FileText,
  Flame,
  Dumbbell,
  Wallet,
  Utensils,
  ShoppingBag,
  Bookmark,
  Compass,
  Link2,
  ArrowRight,
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  route: string;
  icon: React.ReactNode;
}

export function GlobalSearchModal() {
  const router = useRouter();
  const { searchOpen, setSearchOpen } = useDaymark();
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    if (searchOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  const allRecords = useMemo(() => {
    if (!searchOpen) return [];
    const results: SearchResult[] = [];

    // Tasks
    StorageAPI.getTasks().forEach((t) => {
      results.push({
        id: 'task_' + t.id,
        type: 'task',
        title: t.title,
        subtitle: `Task • Priority: ${t.priority} • ${t.status}`,
        route: '/tasks',
        icon: <CheckSquare size={16} className="text-[#3B82F6]" />,
      });
    });

    // Events
    StorageAPI.getEvents().forEach((e) => {
      results.push({
        id: 'event_' + e.id,
        type: 'event',
        title: e.title,
        subtitle: `Event • ${new Date(e.startTime).toLocaleDateString()}`,
        route: '/calendar',
        icon: <Calendar size={16} className="text-[#E50914]" />,
      });
    });

    // Notes
    StorageAPI.getNotes().forEach((n) => {
      results.push({
        id: 'note_' + n.id,
        type: 'note',
        title: n.title,
        subtitle: `Note • ${n.content.slice(0, 50)}...`,
        route: '/notes',
        icon: <FileText size={16} className="text-[#10B981]" />,
      });
    });

    // Habits
    StorageAPI.getHabits().forEach((h) => {
      results.push({
        id: 'habit_' + h.id,
        type: 'habit',
        title: h.title,
        subtitle: `Habit • ${h.frequency}`,
        route: '/habits',
        icon: <Flame size={16} className="text-[#F59E0B]" />,
      });
    });

    // Exercises
    StorageAPI.getExercises().forEach((ex) => {
      results.push({
        id: 'exercise_' + ex.id,
        type: 'fitness',
        title: ex.name,
        subtitle: `Exercise • ${ex.muscleGroup} • ${ex.equipment}`,
        route: '/fitness',
        icon: <Dumbbell size={16} className="text-[#8B5CF6]" />,
      });
    });

    // Transactions
    StorageAPI.getTransactions().forEach((tx) => {
      results.push({
        id: 'tx_' + tx.id,
        type: 'finance',
        title: tx.payeeMerchant || 'Transaction',
        subtitle: `Finance • ${tx.type === 'expense' ? '-' : '+'}€${(tx.amountCents / 100).toFixed(2)} • ${tx.date}`,
        route: '/finance',
        icon: <Wallet size={16} className="text-[#10B981]" />,
      });
    });

    // Recipes
    StorageAPI.getRecipes().forEach((r) => {
      results.push({
        id: 'recipe_' + r.id,
        type: 'recipe',
        title: r.title,
        subtitle: `Recipe • ${r.prepTimeMin + r.cookTimeMin}m • ${r.ingredients.length} ingredients`,
        route: '/meal-planner',
        icon: <Utensils size={16} className="text-[#EC4899]" />,
      });
    });

    // Reading
    StorageAPI.getReadingItems().forEach((rd) => {
      results.push({
        id: 'reading_' + rd.id,
        type: 'reading',
        title: rd.title,
        subtitle: `Reading • ${rd.author || rd.contentType} • ${rd.status}`,
        route: '/reading',
        icon: <Bookmark size={16} className="text-[#3B82F6]" />,
      });
    });

    // Trips
    StorageAPI.getTrips().forEach((tr) => {
      results.push({
        id: 'trip_' + tr.id,
        type: 'travel',
        title: tr.title,
        subtitle: `Trip • ${tr.destination} (${tr.startDate})`,
        route: '/travel',
        icon: <Compass size={16} className="text-[#F59E0B]" />,
      });
    });

    // Shopping items
    StorageAPI.getShoppingItems().forEach((s) => {
      results.push({
        id: 'shop_' + s.id,
        type: 'shopping',
        title: s.name,
        subtitle: `Shopping • Qty: ${s.quantity}`,
        route: '/shopping',
        icon: <ShoppingBag size={16} className="text-[#E50914]" />,
      });
    });

    // Saved links
    StorageAPI.getSavedLinks().forEach((l) => {
      results.push({
        id: 'link_' + l.id,
        type: 'link',
        title: l.title,
        subtitle: `Link • ${l.url}`,
        route: '/links',
        icon: <Link2 size={16} className="text-[#6366F1]" />,
      });
    });

    return results;
  }, [searchOpen]);

  const filteredResults = useMemo(() => {
    let list = allRecords;
    if (selectedFilter !== 'all') {
      list = list.filter((r) => r.type === selectedFilter);
    }
    if (!query.trim()) return list.slice(0, 8);

    const q = query.toLowerCase();
    return list
      .filter((r) => r.title.toLowerCase().includes(q) || (r.subtitle && r.subtitle.toLowerCase().includes(q)))
      .slice(0, 20);
  }, [allRecords, query, selectedFilter]);

  const handleSelect = (route: string) => {
    setSearchOpen(false);
    setQuery('');
    router.push(route);
  };

  if (!searchOpen) return null;

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'task', label: 'Tasks' },
    { id: 'event', label: 'Events' },
    { id: 'note', label: 'Notes' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'finance', label: 'Finance' },
    { id: 'recipe', label: 'Recipes' },
    { id: 'reading', label: 'Reading' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/85 backdrop-blur-none animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={() => setSearchOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl bg-[#141414] border border-[#282828] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#202020] gap-3">
          <Search size={18} className="text-[#777777]" />
          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-[#FFFFFF] placeholder-[#777777] outline-none border-none p-0 font-medium"
            placeholder="Search across all modules, routines, bookmarks or notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#777777] hover:text-[#FFFFFF]"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="text-[10px] bg-[#1A1A1A] border border-[#282828] text-[#AAAAAA] px-1.5 py-0.5 rounded font-mono font-bold">
            ESC
          </kbd>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0D0D0D] border-b border-[#1C1C1C] overflow-x-auto text-xs">
          {filterTabs.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1 rounded-full font-bold transition-all whitespace-nowrap text-[11px] ${
                selectedFilter === f.id
                  ? 'bg-[#E50914] text-white shadow-none'
                  : 'text-[#AAAAAA] hover:text-[#FFFFFF] hover:bg-[#1A1A1A]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#202020]/50">
          {filteredResults.length > 0 ? (
            filteredResults.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.route)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1C1C1C] transition-colors text-left group"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="p-2 rounded-lg bg-[#0D0D0D] border border-[#242424] shrink-0">
                    {item.icon}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#FFFFFF] group-hover:text-[#E50914] transition-colors truncate">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-[11px] text-[#777777] truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRight
                  size={14}
                  className="text-[#777777] group-hover:text-[#FFFFFF] group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                />
              </button>
            ))
          ) : (
            <div className="py-12 text-center">
              <Search size={32} className="mx-auto text-[#777777] mb-2 opacity-50" />
              <p className="text-xs font-bold text-[#AAAAAA]">No matching records found</p>
              <p className="text-[11px] text-[#777777] mt-0.5">
                Try searching for another keyword or check different filter categories.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#0D0D0D] border-t border-[#1C1C1C] text-[11px] text-[#777777] flex items-center justify-between">
          <span>{filteredResults.length} records found</span>
          <span>Press Enter or click to navigate</span>
        </div>
      </div>
    </div>
  );
}
