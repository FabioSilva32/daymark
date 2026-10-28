'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { Habit, HabitEntry } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Flame,
  Plus,
  Trash2,
  Archive,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function HabitsPage() {
  const { storageVersion, refreshStorage, addToast } = useDaymark();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekly'>('daily');

  useEffect(() => {
    setHabits(StorageAPI.getHabits());
    setHabitEntries(StorageAPI.getHabitEntries());
  }, [storageVersion]);

  // Calculate past 7 days dates
  const past7Days = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
      list.push({ date: iso, label: dayName, isToday: i === 0 });
    }
    return list;
  }, []);

  const calculateStreak = (habit: Habit): number => {
    let streak = 0;
    const today = new Date();
    // Check backwards from today or yesterday
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay(); // 1=Mon, 7=Sun

      // If this day is scheduled for the habit
      if (habit.scheduledDays.includes(dayOfWeek)) {
        const entry = habitEntries.find((e) => e.habitId === habit.id && e.date === iso);
        if (entry && entry.completed) {
          streak++;
        } else {
          // If today has not been completed yet, don't break streak from yesterday
          if (i === 0) continue;
          break;
        }
      }
    }
    return streak;
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const scheduled =
      frequency === 'weekdays'
        ? [1, 2, 3, 4, 5]
        : frequency === 'weekly'
        ? [1]
        : [1, 2, 3, 4, 5, 6, 7];

    const newHabit: Habit = {
      id: 'hab_' + Date.now(),
      title: title.trim(),
      description: description.trim() || undefined,
      frequency,
      targetDaysPerWeek: frequency === 'daily' ? 7 : frequency === 'weekdays' ? 5 : 1,
      scheduledDays: scheduled,
      color: '#EF4444',
      icon: 'Flame',
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    StorageAPI.saveHabit(newHabit);
    addToast('Habit Created', newHabit.title, 'success');
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
    refreshStorage();
  };

  const toggleHabitEntry = (habitId: string, date: string) => {
    StorageAPI.toggleHabitEntry(habitId, date);
    refreshStorage();
  };

  const deleteHabit = (id: string) => {
    StorageAPI.deleteHabit(id);
    addToast('Habit Deleted', undefined, 'info');
    refreshStorage();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Habits & Daily Routines
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Build consistency, track streaks, and form long-term discipline.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
          <Plus size={15} />
          <span>New Habit</span>
        </Button>
      </div>

      {/* Habits Matrix Card */}
      <Card className="p-0 overflow-x-auto rounded-xl border border-[#242424]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#242424] bg-[#0D0D0D] text-[#777777]">
              <th className="p-3.5 font-semibold font-heading">Habit</th>
              <th className="p-3.5 font-semibold w-24 font-heading">Streak</th>
              {past7Days.map((d) => (
                <th
                  key={d.date}
                  className={`p-3.5 text-center font-semibold w-12 ${
                    d.isToday ? 'text-[#E50914] font-bold' : ''
                  }`}
                >
                  <div className="font-heading">{d.label}</div>
                  <div className="text-[10px] text-[#777777] font-mono">{d.date.slice(8)}</div>
                </th>
              ))}
              <th className="p-3.5 text-right font-semibold w-16 font-heading">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424]">
            {habits.map((habit) => {
              const streak = calculateStreak(habit);

              return (
                <tr key={habit.id} className="hover:bg-[#181818] transition-colors">
                  <td className="p-3.5">
                    <p className="font-semibold text-sm text-white font-heading">{habit.title}</p>
                    {habit.description && (
                      <p className="text-[11px] text-[#777777] mt-0.5">{habit.description}</p>
                    )}
                  </td>
                  <td className="p-3.5 font-mono">
                    <span className="inline-flex items-center gap-1 text-[#E50914] font-bold">
                      <Flame size={14} className="fill-[#E50914]" />
                      <span>{streak}d</span>
                    </span>
                  </td>
                  {past7Days.map((d) => {
                    const entry = habitEntries.find(
                      (e) => e.habitId === habit.id && e.date === d.date
                    );
                    const isDone = entry ? entry.completed : false;

                    return (
                      <td key={d.date} className="p-3.5 text-center">
                        <button
                          onClick={() => toggleHabitEntry(habit.id, d.date)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-colors font-bold text-xs ${
                            isDone
                              ? 'bg-[#E50914] text-white shadow-sm'
                              : 'bg-[#181818] border border-[#242424] text-[#777777] hover:border-[#E50914]'
                          }`}
                          title={`Toggle ${habit.title} for ${d.date}`}
                        >
                          {isDone ? '✓' : ''}
                        </button>
                      </td>
                    );
                  })}
                  <td className="p-3.5 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteHabit(habit.id)}
                      className="text-[#777777] hover:text-[#E50914] h-7 w-7"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {habits.length === 0 && (
          <div className="text-center py-14">
            <Flame size={36} className="mx-auto text-[#777777] mb-2 opacity-40" />
            <p className="text-sm font-medium text-[#AAAAAA]">No habits yet</p>
            <p className="text-xs text-[#777777] mt-1">
              Click 'New Habit' above to start tracking your daily routines.
            </p>
          </div>
        )}
      </Card>

      {/* New Habit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Habit"
        description="Set a target routine and track consistent execution"
      >
        <form onSubmit={handleCreateHabit} className="space-y-3">
          <Input
            label="Habit Name *"
            placeholder="e.g. 20 Minutes Reading, Cold Shower, Morning Meditation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Description"
            placeholder="e.g. After breakfast before starting work"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select
            label="Schedule Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
            options={[
              { value: 'daily', label: 'Daily (7 days / week)' },
              { value: 'weekdays', label: 'Weekdays Only (Mon-Fri)' },
              { value: 'weekly', label: 'Weekly (1 day / week)' },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2F38]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Habit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
