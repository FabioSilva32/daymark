'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import {
  Task,
  CalendarEvent,
  Habit,
  HabitEntry,
  FoodEntry,
  WaterEntry,
  Transaction,
  Budget,
} from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  CheckSquare,
  Calendar as CalendarIcon,
  Flame,
  Dumbbell,
  Utensils,
  Droplets,
  Wallet,
  CloudSun,
  Timer,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  Home,
} from 'lucide-react';

interface WeatherData {
  currentTemp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  cityName: string;
}

export default function DashboardPage() {
  const { settings, openQuickAdd, formatCurrency, storageVersion, refreshStorage, addToast } = useDaymark();

  // State loaded from StorageAPI
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Live Weather State
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Load local records
    setTasks(StorageAPI.getTasks());
    setEvents(StorageAPI.getEvents());
    setHabits(StorageAPI.getHabits().filter((h) => !h.isArchived));
    setHabitEntries(StorageAPI.getHabitEntries());
    setFoodEntries(StorageAPI.getFoodEntries().filter((f) => f.date === todayStr));
    setWaterEntries(StorageAPI.getWaterEntries().filter((w) => w.date === todayStr));
    setTransactions(StorageAPI.getTransactions());
    setBudgets(StorageAPI.getBudgets());

    // Fetch Live Weather from Open-Meteo for Pinned Home Location
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const homeCityName = settings.homeCity || 'Porto';
        const lat = settings.homeLat ?? 41.1496;
        const lon = settings.homeLon ?? -8.611;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`
        );
        if (!res.ok) throw new Error('Weather API request failed');
        const data = await res.json();
        setWeather({
          currentTemp: Math.round(data.current?.temperature_2m ?? 18),
          feelsLike: Math.round(data.current?.apparent_temperature ?? 18),
          humidity: Math.round(data.current?.relative_humidity_2m ?? 60),
          windSpeed: Math.round(data.current?.wind_speed_10m ?? 12),
          precipitation: data.current?.precipitation ?? 0,
          weatherCode: data.current?.weather_code ?? 0,
          cityName: homeCityName,
        });
        setWeatherError(null);
      } catch (err: any) {
        console.warn('Weather fetch error:', err);
        setWeatherError('Weather service temporarily unavailable');
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [settings.homeLat, settings.homeLon, settings.homeCity, storageVersion, todayStr]);

  // Derived metrics
  const todayTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTodayTasks = tasks.filter((t) => t.status === 'completed');

  const toggleTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const isNowDone = target.status !== 'completed';
    const updated: Task = {
      ...target,
      status: isNowDone ? 'completed' : 'todo',
      completedAt: isNowDone ? new Date().toISOString() : undefined,
    };
    StorageAPI.saveTask(updated);
    addToast(isNowDone ? 'Task Completed' : 'Task Reopened', target.title, 'success');
    refreshStorage();
  };

  // Water Calculation
  const totalWaterMl = waterEntries.reduce((acc, curr) => acc + curr.amountMl, 0);
  const targetWaterMl = StorageAPI.getNutritionGoals().dailyWaterMl || 2500;
  const waterPct = Math.min(100, Math.round((totalWaterMl / targetWaterMl) * 100));

  // Nutrition Calculation
  const totalCalories = foodEntries.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = foodEntries.reduce((acc, curr) => acc + curr.proteinG, 0);
  const targetCalories = StorageAPI.getNutritionGoals().dailyCalories || 2200;
  const calPct = Math.min(100, Math.round((totalCalories / targetCalories) * 100));

  // Finance calculation
  const currentMonth = todayStr.substring(0, 7);
  const monthExpensesCents = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((acc, curr) => acc + curr.amountCents, 0);

  // Greeting by hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            {getGreeting()}, {settings.name}
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Here is your daily command overview for today. You have <span className="text-[#E50914] font-semibold">{todayTasks.length}</span> pending tasks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => openQuickAdd('task')}
            className="gap-1.5"
          >
            <Plus size={15} />
            <span>Quick Add</span>
          </Button>
          <Link href="/ai-assistant">
            <Button size="sm" variant="secondary" className="gap-1.5">
              <Sparkles size={14} className="text-[#E50914]" />
              <span>AI Assistant</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. TODAY'S TASKS WIDGET */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckSquare size={16} className="text-[#E50914]" />
              <CardTitle>Today's Tasks</CardTitle>
            </div>
            <Link
              href="/tasks"
              className="text-xs text-[#AAAAAA] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </Link>
          </CardHeader>

          <div className="flex-1 space-y-2">
            {todayTasks.length > 0 ? (
              todayTasks.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#181818] border border-[#242424] text-xs transition-colors hover:border-[#383838]"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <input
                      type="checkbox"
                      checked={t.status === 'completed'}
                      onChange={() => toggleTask(t.id)}
                      className="rounded border-[#282828] bg-[#101010] text-[#E50914] focus:ring-0 cursor-pointer h-4 w-4"
                    />
                    <span className="truncate font-medium text-white">{t.title}</span>
                  </div>
                  <Badge
                    variant={
                      t.priority === 'urgent'
                        ? 'red'
                        : t.priority === 'high'
                        ? 'warning'
                        : 'muted'
                    }
                  >
                    {t.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 size={28} className="mx-auto text-[#10B981] mb-2" />
                <p className="text-xs text-[#AAAAAA]">All caught up! No pending tasks.</p>
                <button
                  onClick={() => openQuickAdd('task')}
                  className="text-xs text-[#E50914] hover:underline mt-1 inline-block font-medium"
                >
                  + Add a new task
                </button>
              </div>
            )}
          </div>

          {completedTodayTasks.length > 0 && (
            <div className="pt-3 mt-3 border-t border-[#1C1C1C] text-[11px] text-[#777777] flex justify-between">
              <span>{completedTodayTasks.length} tasks completed</span>
              <span className="text-[#10B981] font-medium">Well done</span>
            </div>
          )}
        </Card>

        {/* 2. HABITS TRACKER WIDGET */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-[#E50914]" />
              <CardTitle>Habits Today</CardTitle>
            </div>
            <Link
              href="/habits"
              className="text-xs text-[#AAAAAA] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Habits</span>
              <ArrowRight size={12} />
            </Link>
          </CardHeader>

          <div className="flex-1 space-y-2">
            {habits.length > 0 ? (
              habits.slice(0, 4).map((h) => {
                const entry = habitEntries.find(
                  (e) => e.habitId === h.id && e.date === todayStr
                );
                const isCompleted = entry ? entry.completed : false;

                return (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#181818] border border-[#242424] text-xs"
                  >
                    <div className="truncate">
                      <p className="font-medium text-white truncate">{h.title}</p>
                      <p className="text-[10px] text-[#777777]">{h.frequency}</p>
                    </div>
                    <button
                      onClick={() => {
                        StorageAPI.toggleHabitEntry(h.id, todayStr);
                        refreshStorage();
                      }}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                        isCompleted
                          ? 'bg-[#12281E] text-[#10B981] border border-[#10B981]/40'
                          : 'bg-[#141414] text-[#AAAAAA] border border-[#242424] hover:border-[#E50914]'
                      }`}
                    >
                      {isCompleted ? '✓ Done' : 'Mark'}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-[#AAAAAA]">
                No active habits configured.
              </div>
            )}
          </div>
        </Card>

        {/* 3. WEATHER WIDGET */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CloudSun size={16} className="text-[#E50914]" />
              <CardTitle className="flex items-center gap-1.5">
                <span>Weather</span>
                <span className="text-[#555555]">•</span>
                <span className="flex items-center gap-1 text-white">
                  <Home size={12} className="text-[#E50914]" />
                  {settings.homeCity || 'Porto'}
                </span>
              </CardTitle>
            </div>
            <Link
              href="/weather"
              className="text-xs text-[#AAAAAA] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Forecast</span>
              <ArrowRight size={12} />
            </Link>
          </CardHeader>

          <div className="flex-1 flex flex-col justify-center">
            {weatherLoading ? (
              <div className="text-center py-6 text-xs text-[#777777]">Loading live weather...</div>
            ) : weather ? (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-heading font-black text-white">
                      {weather.currentTemp}°C
                    </span>
                    <p className="text-xs text-[#AAAAAA] mt-0.5">
                      Feels like {weather.feelsLike}°C
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="muted">Live Open-Meteo</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1C1C1C] text-center text-xs">
                  <div className="bg-[#181818] p-2 rounded-lg border border-[#242424]">
                    <p className="text-[10px] text-[#777777]">Humidity</p>
                    <p className="font-mono text-white font-semibold">{weather.humidity}%</p>
                  </div>
                  <div className="bg-[#181818] p-2 rounded-lg border border-[#242424]">
                    <p className="text-[10px] text-[#777777]">Wind</p>
                    <p className="font-mono text-white font-semibold">{weather.windSpeed} km/h</p>
                  </div>
                  <div className="bg-[#181818] p-2 rounded-lg border border-[#242424]">
                    <p className="text-[10px] text-[#777777]">Precip</p>
                    <p className="font-mono text-white font-semibold">{weather.precipitation} mm</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-[#777777]">
                {weatherError || 'Weather data unavailable'}
              </div>
            )}
          </div>
        </Card>

        {/* 4. NUTRITION & CALORIES WIDGET */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Utensils size={16} className="text-[#E50914]" />
              <CardTitle>Daily Nutrition</CardTitle>
            </div>
            <Link
              href="/nutrition"
              className="text-xs text-[#AAAAAA] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Food Log</span>
              <ArrowRight size={12} />
            </Link>
          </CardHeader>

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#AAAAAA]">Calories</span>
                <span className="font-mono text-white font-semibold">
                  {totalCalories} / {targetCalories} kcal
                </span>
              </div>
              <div className="w-full bg-[#181818] border border-[#242424] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#E50914] h-full transition-all duration-300"
                  style={{ width: `${calPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#181818] p-2 rounded-lg border border-[#242424]">
                <span className="text-[10px] text-[#777777]">Protein</span>
                <p className="font-mono text-sm font-semibold text-white">{totalProtein}g</p>
              </div>
              <div className="bg-[#181818] p-2 rounded-lg border border-[#242424]">
                <span className="text-[10px] text-[#777777]">Logged Items</span>
                <p className="font-mono text-sm font-semibold text-white">{foodEntries.length}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => openQuickAdd('food')}
            >
              + Log Food Item
            </Button>
          </div>
        </Card>

        {/* 5. WATER INTAKE WIDGET */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-[#3B82F6]" />
              <CardTitle>Hydration Tracker</CardTitle>
            </div>
            <Link
              href="/water"
              className="text-xs text-[#AAAAAA] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Details</span>
              <ArrowRight size={12} />
            </Link>
          </CardHeader>

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#AAAAAA]">Progress</span>
                <span className="font-mono text-white font-semibold">
                  {totalWaterMl} / {targetWaterMl} ml ({waterPct}%)
                </span>
              </div>
              <div className="w-full bg-[#181818] border border-[#242424] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#3B82F6] h-full transition-all duration-300"
                  style={{ width: `${waterPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  StorageAPI.addWaterEntry(250);
                  addToast('Added Water', '+250 ml', 'success');
                  refreshStorage();
                }}
              >
                +250 ml
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  StorageAPI.addWaterEntry(500);
                  addToast('Added Water', '+500 ml', 'success');
                  refreshStorage();
                }}
              >
                +500 ml
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#777777] hover:text-white"
                onClick={() => {
                  StorageAPI.undoLastWaterEntry();
                  refreshStorage();
                }}
              >
                Undo
              </Button>
            </div>
          </div>
        </Card>

        {/* 6. MONTHLY FINANCE OVERVIEW */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-[#10B981]" />
              <CardTitle>Monthly Finances</CardTitle>
            </div>
            <Link
              href="/finance"
              className="text-xs text-[#AAAAAA] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Finance</span>
              <ArrowRight size={12} />
            </Link>
          </CardHeader>

          <div className="flex-1 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[10px] text-[#777777] uppercase tracking-wider font-medium">
                  Recorded Expenses
                </p>
                <p className="text-2xl font-mono font-bold text-white">
                  {formatCurrency(monthExpensesCents)}
                </p>
              </div>
              <Badge variant="muted">{transactions.length} records</Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => openQuickAdd('expense')}
            >
              + Record Expense / Income
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
