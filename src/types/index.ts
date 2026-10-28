// Daymark — Universal Types & Interfaces

export type ModuleId =
  | 'dashboard'
  | 'calendar'
  | 'tasks'
  | 'habits'
  | 'notes'
  | 'journal'
  | 'focus'
  | 'fitness'
  | 'nutrition'
  | 'meal_planner'
  | 'water'
  | 'finance'
  | 'reading'
  | 'travel'
  | 'shopping'
  | 'documents'
  | 'links'
  | 'weather'
  | 'tools'
  | 'ai_assistant'
  | 'settings';

export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  category: 'Overview' | 'Personal' | 'Health' | 'Manage' | 'Utilities' | 'System';
  description: string;
  icon: string;
  route: string;
  defaultEnabled: boolean;
}

export interface UserSettings {
  id: string;
  email: string;
  name: string;
  currency: string; // 'EUR', 'USD', 'GBP', etc.
  currencySymbol: string;
  timezone: string; // 'Europe/Lisbon'
  unitSystem: 'metric' | 'imperial';
  timeFormat: '12h' | '24h';
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  theme: 'dark';
  accentColor: 'red';
  weatherCity: string;
  weatherLat: number;
  weatherLon: number;
  homeCity?: string;
  homeCountry?: string;
  homeLat?: number;
  homeLon?: number;
  enabledModules: Record<ModuleId, boolean>;
}

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email?: string;
  password?: string;
  avatarColor: string;
  pin?: string;
  createdAt: string;
}

// Productivity
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

export interface TaskSubtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // ISO date string
  startDate?: string;
  category: string;
  tags: string[];
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  subtasks: TaskSubtask[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  isAllDay: boolean;
  category: string;
  color: string;
  recurrenceRule?: string;
  reminderMinutes?: number;
  linkUrl?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekdays' | 'weekly' | 'custom';
  targetDaysPerWeek: number;
  scheduledDays: number[]; // 1=Mon, 7=Sun
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: string;
}

export interface HabitEntry {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
}

export interface NoteFolder {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  folderId?: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title?: string;
  content: string;
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'awful';
  highlights: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  sessionType: 'work' | 'short_break' | 'long_break';
  startedAt: string;
  endedAt: string;
  notes?: string;
}

// Fitness & Nutrition
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';
  equipment: 'Barbell' | 'Dumbbell' | 'Machine' | 'Bodyweight' | 'Cable' | 'Kettlebell';
  exerciseType: 'weight_reps' | 'reps_only' | 'distance_time' | 'time_only';
  instructions?: string;
  imageUrl?: string;
  imageUrlFinish?: string;
  videoUrl?: string;
  isCustom?: boolean;
}

export interface WorkoutTemplateItem {
  id: string;
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  targetWeightKg?: number;
  restSeconds: number;
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  items: WorkoutTemplateItem[];
  scheduledDays: number[];
  createdAt: string;
  updatedAt?: string;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  setType: 'warmup' | 'normal' | 'drop' | 'failure';
  reps: number;
  weightKg: number;
  isCompleted: boolean;
}

export interface WorkoutSession {
  id: string;
  templateId?: string;
  title: string;
  startedAt: string;
  endedAt?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  sets: WorkoutSet[];
  totalVolumeKg: number;
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  waistCm?: number;
  neckCm?: number;
  chestCm?: number;
  bodyFatPct?: number;
  notes?: string;
  createdAt?: string;
}

export interface NutritionGoals {
  dailyCalories: number;
  dailyProteinG: number;
  dailyCarbsG: number;
  dailyFatG: number;
  dailyWaterMl: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  servingWeightG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  isVerified?: boolean;
}

export interface FoodEntry {
  id: string;
  foodId?: string;
  customName: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  createdAt: string;
}

export interface WaterEntry {
  id: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  createdAt: string;
}

// Finance
export interface FinancialAccount {
  id: string;
  name: string;
  accountType: 'checking' | 'savings' | 'credit' | 'cash' | 'investment';
  currency: string;
  initialBalanceCents: number;
  color: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  accountId?: string;
  categoryId: string;
  type: 'income' | 'expense' | 'transfer';
  amountCents: number; // Stored in minor units (e.g. 1000 = €10.00)
  currency: string;
  date: string; // YYYY-MM-DD
  payeeMerchant: string;
  notes?: string;
  tags: string[];
  isRecurring: boolean;
  recurrenceInterval?: 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthYear: string; // '2026-10'
  limitCents: number;
  currency: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmountCents: number;
  currentAmountCents: number;
  currency: string;
  targetDate?: string;
  color: string;
  isCompleted: boolean;
}

// Recipes, Meal Plans, Shopping
export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  servings: number;
  prepTimeMin: number;
  cookTimeMin: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  caloriesPerServing?: number;
  proteinPerServing?: number;
  carbsPerServing?: number;
  fatPerServing?: number;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
}

export interface MealPlan {
  id: string;
  recipeId?: string;
  customMealTitle?: string;
  planDate: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
}

export interface ShoppingListItem {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPriceCents: number;
  category: string;
  isChecked: boolean;
  priority: 'low' | 'normal' | 'high';
  notes?: string;
  createdAt?: string;
}

export interface ShoppingList {
  id: string;
  title: string;
  category: string;
  color: string;
  budgetCents: number;
  isArchived: boolean;
  createdAt: string;
}

// Reading & Learning
export interface ReadingItem {
  id: string;
  title: string;
  author?: string;
  contentType: 'book' | 'article' | 'course' | 'paper' | 'podcast';
  url?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'paused';
  currentProgress: number;
  totalProgress?: number;
  progressUnit: 'pages' | 'chapters' | 'minutes' | 'percent';
  rating?: number; // 1 to 5
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  tags: string[];
  createdAt: string;
}

// Travel
export interface TripItineraryItem {
  id: string;
  tripId: string;
  title: string;
  activityDate: string;
  startTime?: string;
  durationMin?: number;
  location?: string;
  estimatedCostCents: number;
  notes?: string;
  url?: string;
  createdAt?: string;
}

export interface TripPackingItem {
  id: string;
  tripId: string;
  itemName: string;
  category: string;
  isPacked: boolean;
  quantity: number;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetCents: number;
  currency: string;
  description?: string;
  notes?: string;
  createdAt: string;
}

// Documents & Saved Links
export interface DocumentRecord {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  folder: string;
  description?: string;
  tags: string[];
  createdAt: string;
  fileDataUrl?: string; // For local storage demo / preview
}

export interface SavedLink {
  id: string;
  url: string;
  title: string;
  description?: string;
  category: 'read_later' | 'watch_later' | 'play_later' | 'learn_later' | 'research' | 'other';
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  notes?: string;
  createdAt: string;
}

// AI Assistant
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actionData?: {
    type: 'create_task' | 'create_event' | 'create_note' | 'add_shopping_item' | 'suggest_meal';
    payload: any;
    status: 'pending' | 'accepted' | 'dismissed';
  };
  createdAt: string;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
}
