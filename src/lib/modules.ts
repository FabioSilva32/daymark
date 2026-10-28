import { ModuleDefinition, ModuleId } from '@/types';

export const MODULE_REGISTRY: ModuleDefinition[] = [
  // Overview
  {
    id: 'dashboard',
    label: 'Dashboard',
    category: 'Overview',
    description: 'Personal command centre, daily summary, and widget grid',
    icon: 'LayoutDashboard',
    route: '/',
    defaultEnabled: true,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    category: 'Overview',
    description: 'Month, week, day, and agenda schedule views',
    icon: 'Calendar',
    route: '/calendar',
    defaultEnabled: true,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    category: 'Overview',
    description: 'To-do lists, priorities, subtasks, and recurring tasks',
    icon: 'CheckSquare',
    route: '/tasks',
    defaultEnabled: true,
  },
  {
    id: 'habits',
    label: 'Habits',
    category: 'Overview',
    description: 'Habit streaks, routines, and monthly completion history',
    icon: 'Flame',
    route: '/habits',
    defaultEnabled: true,
  },

  // Personal
  {
    id: 'notes',
    label: 'Notes',
    category: 'Personal',
    description: 'Rich text and markdown notes with folders and tags',
    icon: 'FileText',
    route: '/notes',
    defaultEnabled: true,
  },
  {
    id: 'journal',
    label: 'Journal',
    category: 'Personal',
    description: 'Private daily reflections, mood, and daily highlights',
    icon: 'BookOpen',
    route: '/journal',
    defaultEnabled: true,
  },
  {
    id: 'focus',
    label: 'Focus Timer',
    category: 'Personal',
    description: 'Pomodoro timer with session statistics and task links',
    icon: 'Timer',
    route: '/focus',
    defaultEnabled: true,
  },

  // Health
  {
    id: 'fitness',
    label: 'Fitness',
    category: 'Health',
    description: 'Exercise library, workout routines, and active session tracker',
    icon: 'Dumbbell',
    route: '/fitness',
    defaultEnabled: true,
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    category: 'Health',
    description: 'Daily food diary, macro breakdown, and calorie targets',
    icon: 'Utensils',
    route: '/nutrition',
    defaultEnabled: true,
  },
  {
    id: 'water',
    label: 'Water & Body',
    category: 'Health',
    description: 'Hydration tracker and body measurement progress',
    icon: 'Droplets',
    route: '/water',
    defaultEnabled: true,
  },
  {
    id: 'meal_planner',
    label: 'Meal Planner',
    category: 'Health',
    description: 'Weekly meal planning, recipes, and ingredient prep',
    icon: 'ChefHat',
    route: '/meal-planner',
    defaultEnabled: true,
  },

  // Manage
  {
    id: 'finance',
    label: 'Finance',
    category: 'Manage',
    description: 'Income, expense logs, category budgets, and savings goals',
    icon: 'Wallet',
    route: '/finance',
    defaultEnabled: true,
  },
  {
    id: 'reading',
    label: 'Reading & Learning',
    category: 'Manage',
    description: 'Books, articles, courses, and study progress tracking',
    icon: 'Bookmark',
    route: '/reading',
    defaultEnabled: true,
  },
  {
    id: 'travel',
    label: 'Travel',
    category: 'Manage',
    description: 'Trip planner, daily itineraries, and packing lists',
    icon: 'Compass',
    route: '/travel',
    defaultEnabled: true,
  },
  {
    id: 'shopping',
    label: 'Shopping',
    category: 'Manage',
    description: 'General shopping lists and budget calculations',
    icon: 'ShoppingBag',
    route: '/shopping',
    defaultEnabled: true,
  },
  {
    id: 'documents',
    label: 'Documents',
    category: 'Manage',
    description: 'Private document organiser and file records',
    icon: 'FolderArchive',
    route: '/documents',
    defaultEnabled: true,
  },
  {
    id: 'links',
    label: 'Saved Links',
    category: 'Manage',
    description: 'Read-later and media bookmark library',
    icon: 'Link2',
    route: '/links',
    defaultEnabled: true,
  },

  // Utilities
  {
    id: 'weather',
    label: 'Weather',
    category: 'Utilities',
    description: 'Live forecasts, hourly predictions, and city lookup',
    icon: 'CloudSun',
    route: '/weather',
    defaultEnabled: true,
  },
  {
    id: 'tools',
    label: 'Calculators & Tools',
    category: 'Utilities',
    description: 'Scientific calculator, currency, unit, and date converters',
    icon: 'Calculator',
    route: '/tools',
    defaultEnabled: true,
  },

  // System
  {
    id: 'ai_assistant',
    label: 'AI Assistant',
    category: 'System',
    description: 'Life organiser, day planning, and smart assistance',
    icon: 'Sparkles',
    route: '/ai-assistant',
    defaultEnabled: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    category: 'System',
    description: 'User preferences, currency, modules, and data backups',
    icon: 'Settings',
    route: '/settings',
    defaultEnabled: true,
  },
];

export const DEFAULT_ENABLED_MODULES: Record<ModuleId, boolean> = MODULE_REGISTRY.reduce(
  (acc, mod) => {
    acc[mod.id] = mod.defaultEnabled;
    return acc;
  },
  {} as Record<ModuleId, boolean>
);
