// Daymark Storage Engine — Local-First Persistence & Sync Adapter
import {
  UserSettings,
  UserAccount,
  Task,
  CalendarEvent,
  Habit,
  HabitEntry,
  Note,
  NoteFolder,
  JournalEntry,
  FocusSession,
  Exercise,
  WorkoutTemplate,
  WorkoutSession,
  BodyMeasurement,
  NutritionGoals,
  FoodItem,
  FoodEntry,
  WaterEntry,
  FinancialAccount,
  TransactionCategory,
  Transaction,
  Budget,
  SavingsGoal,
  Recipe,
  MealPlan,
  ShoppingList,
  ShoppingListItem,
  ReadingItem,
  Trip,
  TripItineraryItem,
  TripPackingItem,
  DocumentRecord,
  SavedLink,
  AIConversation,
} from '@/types';
import { DEFAULT_ENABLED_MODULES } from './modules';

export const USER_STORAGE_KEYS = {
  USER_ACCOUNTS: 'daymark_user_accounts',
  ACTIVE_USER_ID: 'daymark_active_user_id',
  AUTH_SESSION: 'daymark_auth_session',
};

export const DEFAULT_PRIMARY_ACCOUNT: UserAccount = {
  id: 'usr_default',
  name: 'User',
  username: 'user',
  avatarColor: '#E50914',
  createdAt: '2026-01-01T00:00:00Z',
};

export function getActiveUserId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(USER_STORAGE_KEYS.ACTIVE_USER_ID) || '';
}

export function getScopedKey(baseKey: string): string {
  if (typeof window === 'undefined') return baseKey;
  if (
    baseKey === USER_STORAGE_KEYS.USER_ACCOUNTS ||
    baseKey === USER_STORAGE_KEYS.ACTIVE_USER_ID ||
    baseKey === USER_STORAGE_KEYS.AUTH_SESSION
  ) {
    return baseKey;
  }
  const activeId = getActiveUserId();
  if (!activeId) {
    return baseKey;
  }
  return `${baseKey}_${activeId}`;
}

const STORAGE_KEYS = {
  SETTINGS: 'daymark_settings',
  TASKS: 'daymark_tasks',
  EVENTS: 'daymark_events',
  HABITS: 'daymark_habits',
  HABIT_ENTRIES: 'daymark_habit_entries',
  NOTES: 'daymark_notes',
  NOTE_FOLDERS: 'daymark_note_folders',
  JOURNAL: 'daymark_journal',
  FOCUS: 'daymark_focus',
  EXERCISES: 'daymark_exercises',
  WORKOUT_TEMPLATES: 'daymark_workout_templates',
  WORKOUT_SESSIONS: 'daymark_workout_sessions',
  BODY_MEASUREMENTS: 'daymark_body_measurements',
  NUTRITION_GOALS: 'daymark_nutrition_goals',
  FOODS: 'daymark_foods',
  FOOD_ENTRIES: 'daymark_food_entries',
  WATER_ENTRIES: 'daymark_water_entries',
  FINANCE_ACCOUNTS: 'daymark_finance_accounts',
  TRANSACTION_CATEGORIES: 'daymark_transaction_categories',
  TRANSACTIONS: 'daymark_transactions',
  BUDGETS: 'daymark_budgets',
  SAVINGS_GOALS: 'daymark_savings_goals',
  RECIPES: 'daymark_recipes',
  MEAL_PLANS: 'daymark_meal_plans',
  SHOPPING_LISTS: 'daymark_shopping_lists',
  SHOPPING_ITEMS: 'daymark_shopping_items',
  READING: 'daymark_reading',
  TRIPS: 'daymark_trips',
  TRIP_ITINERARY: 'daymark_trip_itinerary',
  TRIP_PACKING: 'daymark_trip_packing',
  DOCUMENTS: 'daymark_documents',
  LINKS: 'daymark_links',
  AI_CONVERSATIONS: 'daymark_ai_conversations',
  LAST_SYNC: 'daymark_last_sync_timestamp',
};

// Background push to SQLite database
function syncToDatabase(key: string, value: any) {
  if (typeof window === 'undefined') return;
  fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  }).catch((e) => console.warn('SQLite sync warning:', e));
}

// Safe JSON loader
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const scopedKey = getScopedKey(key);
    const raw = localStorage.getItem(scopedKey);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

// Safe JSON setter
function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    const scopedKey = getScopedKey(key);
    localStorage.setItem(scopedKey, JSON.stringify(value));
    syncToDatabase(scopedKey, value);
    // Trigger storage event for same-tab reactive updates
    window.dispatchEvent(new Event('daymark-storage-update'));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// Initial Standard Data
const DEFAULT_SETTINGS: UserSettings = {
  id: 'usr_default',
  email: 'user@daymark.local',
  name: 'Alexandre Silva',
  currency: 'EUR',
  currencySymbol: '€',
  timezone: 'Europe/Lisbon',
  unitSystem: 'metric',
  timeFormat: '24h',
  dateFormat: 'YYYY-MM-DD',
  theme: 'dark',
  accentColor: 'red',
  weatherCity: 'Porto',
  weatherLat: 41.1496,
  weatherLon: -8.611,
  homeCity: 'Porto',
  homeCountry: 'Portugal',
  homeLat: 41.1496,
  homeLon: -8.611,
  enabledModules: DEFAULT_ENABLED_MODULES,
};

const DEFAULT_EXERCISES: Exercise[] = [
  // CHEST
  { id: 'ex_1', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/1.jpg', instructions: 'Lie flat on bench, lower bar to mid-chest, drive up with feet planted.' },
  { id: 'ex_2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/1.jpg', instructions: 'Set bench to 30-45 degrees, press dumbbells overhead maintaining control.' },
  { id: 'ex_c1', name: 'Decline Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/1.jpg', instructions: 'Secure feet on decline bench, lower bar to lower sternum, drive back up.' },
  { id: 'ex_c2', name: 'Dumbbell Chest Flye', muscleGroup: 'Chest', equipment: 'Dumbbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/1.jpg', instructions: 'Slight bend in elbows, arc dumbbells outward until deep chest stretch, contract together.' },
  { id: 'ex_c3', name: 'Cable Chest Crossover', muscleGroup: 'Chest', equipment: 'Cable', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/1.jpg', instructions: 'Set pulleys high or mid, squeeze hands together in front of sternum, control the return.' },
  { id: 'ex_c4', name: 'Weighted Chest Dips', muscleGroup: 'Chest', equipment: 'Bodyweight', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/1.jpg', instructions: 'Lean torso forward 30 degrees to bias chest, lower until 90-degree elbow bend, drive up.' },
  { id: 'ex_c5', name: 'Standard Push-Up', muscleGroup: 'Chest', equipment: 'Bodyweight', exerciseType: 'reps_only', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/1.jpg', instructions: 'Hands slightly wider than shoulders, core braced, lower chest to floor and push.' },
  { id: 'ex_c6', name: 'Machine Chest Press', muscleGroup: 'Chest', equipment: 'Machine', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Chest_Press/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Chest_Press/1.jpg', instructions: 'Adjust seat so handles align with mid-chest, press forward smoothly without locking elbows.' },
  { id: 'ex_c7', name: 'Low-to-High Cable Flye', muscleGroup: 'Chest', equipment: 'Cable', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/1.jpg', instructions: 'Pulleys low, scoop upwards and inward to target upper clavicular chest fibers.' },
  { id: 'ex_c8', name: 'Incline Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/1.jpg', instructions: 'Bench at 30 degrees, lower bar to upper chest below collarbones, press up.' },

  // BACK
  { id: 'ex_5', name: 'Pull-Up', muscleGroup: 'Back', equipment: 'Bodyweight', exerciseType: 'reps_only', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/1.jpg', instructions: 'Overhand grip, pull chest to bar, retract scapula, control the descent.' },
  { id: 'ex_b1', name: 'Chin-Up', muscleGroup: 'Back', equipment: 'Bodyweight', exerciseType: 'reps_only', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/1.jpg', instructions: 'Underhand supinated grip, engage lats and biceps, pull chin clearly over bar.' },
  { id: 'ex_b2', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/1.jpg', instructions: 'Thighs locked under pads, pull bar toward upper collarbone, squeeze shoulder blades down.' },
  { id: 'ex_6', name: 'Barbell Bent-Over Row', muscleGroup: 'Back', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/1.jpg', instructions: 'Bend knees slightly, hinge forward 45 deg, pull bar to belly button.' },
  { id: 'ex_b3', name: 'One-Arm Dumbbell Row', muscleGroup: 'Back', equipment: 'Dumbbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/1.jpg', instructions: 'One knee on bench, pull dumbbell to hip keeping elbow close, full stretch at bottom.' },
  { id: 'ex_b4', name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Cable', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/1.jpg', instructions: 'Feet braced, pull handle to lower abdomen, keep chest tall and avoid rounding lower back.' },
  { id: 'ex_b5', name: 'T-Bar Row', muscleGroup: 'Back', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/T-Bar_Row_with_Handle/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/T-Bar_Row_with_Handle/1.jpg', instructions: 'Straddle bar with neutral grip, pull weight toward mid-torso with a rigid flat back.' },
  { id: 'ex_b6', name: 'Straight-Arm Cable Pulldown', muscleGroup: 'Back', equipment: 'Cable', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/1.jpg', instructions: 'Hinge hips slightly, keep elbows locked with slight bend, sweep bar down to thighs.' },
  { id: 'ex_b7', name: 'Barbell Shrug', muscleGroup: 'Back', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/1.jpg', instructions: 'Stand upright, elevate traps straight toward ears without rolling shoulders.' },
  { id: 'ex_b8', name: 'Face Pull', muscleGroup: 'Back', equipment: 'Cable', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/1.jpg', instructions: 'Set rope at eye level, pull toward forehead while externally rotating thumbs back.' },
  { id: 'ex_b9', name: 'Back Extension (Hyperextension)', muscleGroup: 'Back', equipment: 'Bodyweight', exerciseType: 'reps_only', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_Back_Extensions/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_Back_Extensions/1.jpg', instructions: 'Hinge at waist on 45-degree bench, extend spine using glutes and erector spinae.' },

  // LEGS
  { id: 'ex_3', name: 'Barbell Back Squat', muscleGroup: 'Legs', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/1.jpg', instructions: 'Bar across upper traps, squat below parallel, push through heels.' },
  { id: 'ex_l1', name: 'Barbell Front Squat', muscleGroup: 'Legs', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat/1.jpg', instructions: 'Clean rack or cross-arm hold, elbows high, stay upright as you descend deeply.' },
  { id: 'ex_4', name: 'Romanian Deadlift', muscleGroup: 'Legs', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/1.jpg', instructions: 'Hinge at hips, keep back neutral, feel stretch in hamstrings.' },
  { id: 'ex_l2', name: 'Conventional Deadlift', muscleGroup: 'Legs', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/1.jpg', instructions: 'Mid-foot under bar, grip outside knees, pull slack out, drive floor away with legs.' },
  { id: 'ex_l3', name: 'Sumo Deadlift', muscleGroup: 'Legs', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/1.jpg', instructions: 'Wide stance, toes pointed outward, hips close to bar, drive knees open as you stand.' },
  { id: 'ex_l4', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', equipment: 'Dumbbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squats/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squats/1.jpg', instructions: 'Rear foot elevated on bench, drop back knee straight down, drive through front heel.' },
  { id: 'ex_l5', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/1.jpg', instructions: 'Feet shoulder-width on platform, lower until knees hit 90 degrees, do not lock out.' },
  { id: 'ex_l6', name: 'Walking Dumbbell Lunges', muscleGroup: 'Legs', equipment: 'Dumbbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/1.jpg', instructions: 'Take controlled steps, lower back knee to just above floor, maintain upright posture.' },
  { id: 'ex_l7', name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/1.jpg', instructions: 'Sit back firmly, extend knees to full contraction, pause for 1 second, lower slowly.' },
  { id: 'ex_l8', name: 'Lying Hamstring Curl', muscleGroup: 'Legs', equipment: 'Machine', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/1.jpg', instructions: 'Lie facedown, curl heels toward glutes, squeeze hamstrings, controlled eccentric return.' },
  { id: 'ex_l9', name: 'Seated Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/1.jpg', instructions: 'Knees aligned with machine pivot, flex hamstrings to pull roller under seat.' },
  { id: 'ex_l10', name: 'Barbell Hip Thrust', muscleGroup: 'Legs', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/1.jpg', instructions: 'Upper back against bench, barbell across hips with pad, drive hips up until flat tabletop.' },
  { id: 'ex_l11', name: 'Standing Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/1.jpg', instructions: 'Balls of feet on ledge, drop heels for full stretch, push through big toes to peak.' },
  { id: 'ex_l12', name: 'Goblet Squat', muscleGroup: 'Legs', equipment: 'Dumbbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/1.jpg', instructions: 'Hold dumbbell at chest, elbows inside knees at the bottom of the squat.' },

  // SHOULDERS
  { id: 'ex_7', name: 'Overhead Barbell Press (OHP)', muscleGroup: 'Shoulders', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/1.jpg', instructions: 'Stand tall, press bar overhead from clavicle to full lockout.' },
  { id: 'ex_s1', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Press/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Press/1.jpg', instructions: 'Bench at 80-90 degrees, press dumbbells overhead in a slight natural arc.' },
  { id: 'ex_8', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/1.jpg', instructions: 'Raise dumbbells to side until arms are parallel with ground, lead with elbows.' },
  { id: 'ex_s2', name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Cable', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Lateral_Raise/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Lateral_Raise/1.jpg', instructions: 'Cable behind or in front of body, raise arm out to side maintaining continuous tension.' },
  { id: 'ex_s3', name: 'Arnold Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/1.jpg', instructions: 'Start with palms facing you at chin level, rotate palms outward as you press overhead.' },
  { id: 'ex_s4', name: 'Reverse Pec Deck / Rear Delt Flye', muscleGroup: 'Shoulders', equipment: 'Machine', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_Rear_Delt_Raise/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_Rear_Delt_Raise/1.jpg', instructions: 'Chest against pad, sweep handles backward to isolate rear deltoids.' },
  { id: 'ex_s5', name: 'Dumbbell Front Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/1.jpg', instructions: 'Lift dumbbells forward to eye level with controlled cadence.' },
  { id: 'ex_s6', name: 'Upright Barbell Row', muscleGroup: 'Shoulders', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/1.jpg', instructions: 'Grip shoulder-width, pull bar vertically toward upper chest leading with elbows.' },

  // ARMS
  { id: 'ex_9', name: 'Barbell Biceps Curl', muscleGroup: 'Arms', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/1.jpg', instructions: 'Keep elbows tucked, curl bar up without swinging torso.' },
  { id: 'ex_a1', name: 'Dumbbell Hammer Curl', muscleGroup: 'Arms', equipment: 'Dumbbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/1.jpg', instructions: 'Neutral grip (palms facing each other), curl upward to target brachialis and forearm.' },
  { id: 'ex_a2', name: 'Incline Dumbbell Biceps Curl', muscleGroup: 'Arms', equipment: 'Dumbbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Curl/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Curl/1.jpg', instructions: 'Lie on 45-degree incline, let arms hang for maximum stretch, curl dumbbells up.' },
  { id: 'ex_a3', name: 'Preacher Curl', muscleGroup: 'Arms', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/1.jpg', instructions: 'Arms braced over angled pad, curl EZ-bar without lifting elbows off cushion.' },
  { id: 'ex_a4', name: 'Cable Biceps Curl', muscleGroup: 'Arms', equipment: 'Cable', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Preacher_Curl/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Preacher_Curl/1.jpg', instructions: 'Constant cable tension from bottom stretch to peak contraction at chin height.' },
  { id: 'ex_10', name: 'Triceps Rope Pushdown', muscleGroup: 'Arms', equipment: 'Cable', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/1.jpg', instructions: 'Push rope down, spread rope ends at bottom for maximum triceps contraction.' },
  { id: 'ex_a5', name: 'Skull Crusher (Lying Triceps Extension)', muscleGroup: 'Arms', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/1.jpg', instructions: 'Lie on bench with EZ-bar, bend elbows lowering bar to forehead, extend upward.' },
  { id: 'ex_a6', name: 'Close-Grip Bench Press', muscleGroup: 'Arms', equipment: 'Barbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/1.jpg', instructions: 'Hands shoulder-width apart, keep elbows tucked to ribcage to load triceps.' },
  { id: 'ex_a7', name: 'Overhead Dumbbell Triceps Extension', muscleGroup: 'Arms', equipment: 'Dumbbell', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Triceps_Extension/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Triceps_Extension/1.jpg', instructions: 'Hold dumbbell with both hands overhead, bend elbows behind neck, press to lockout.' },
  { id: 'ex_a8', name: 'Bench Dips', muscleGroup: 'Arms', equipment: 'Bodyweight', exerciseType: 'reps_only', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/1.jpg', instructions: 'Hands on bench edge behind you, legs out straight, lower hips until 90-deg elbow bend.' },
  { id: 'ex_a9', name: 'Farmer’s Walk (Grip & Forearms)', muscleGroup: 'Arms', equipment: 'Dumbbell', exerciseType: 'distance_time', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/1.jpg', instructions: 'Pick up heavy weights in each hand, walk with tall posture and firm locked grip.' },

  // CORE
  { id: 'ex_11', name: 'Hanging Leg Raise', muscleGroup: 'Core', equipment: 'Bodyweight', exerciseType: 'reps_only', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/1.jpg', instructions: 'Hang from pull-up bar, raise legs to 90 degrees or to bar without swinging.' },
  { id: 'ex_cr1', name: 'Cable Kneeling Crunch', muscleGroup: 'Core', equipment: 'Cable', exerciseType: 'weight_reps', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Cable_Crunch/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Cable_Crunch/1.jpg', instructions: 'Kneel with rope behind head, flex spine to pull elbows toward thighs.' },
  { id: 'ex_cr2', name: 'Ab Wheel Rollout', muscleGroup: 'Core', equipment: 'Bodyweight', exerciseType: 'reps_only', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Roller/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Roller/1.jpg', instructions: 'Kneel with wheel under shoulders, extend body forward keeping core hollow, pull back.' },
  { id: 'ex_cr3', name: 'Core Plank', muscleGroup: 'Core', equipment: 'Bodyweight', exerciseType: 'time_only', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg', instructions: 'Forearms and toes on floor, squeeze glutes, keep rigid line from heels to head.' },
  { id: 'ex_cr4', name: 'Russian Twist', muscleGroup: 'Core', equipment: 'Bodyweight', exerciseType: 'reps_only', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/1.jpg', instructions: 'Sit in V-position, feet elevated, rotate torso side to side tapping floor.' },
  { id: 'ex_cr5', name: 'Bicycle Crunch', muscleGroup: 'Core', equipment: 'Bodyweight', exerciseType: 'reps_only', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bicycle_Kicks/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bicycle_Kicks/1.jpg', instructions: 'Opposite elbow to opposite knee, extend other leg straight out, rotate with control.' },

  // CARDIO
  { id: 'ex_12', name: '5K Outdoor Run', muscleGroup: 'Cardio', equipment: 'Bodyweight', exerciseType: 'distance_time', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Running_Treadmill/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Running_Treadmill/1.jpg', instructions: 'Paced steady-state run for cardiovascular endurance and mental stamina.' },
  { id: 'ex_cd1', name: 'Treadmill Incline Walk', muscleGroup: 'Cardio', equipment: 'Machine', exerciseType: 'distance_time', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Walking_Treadmill/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Walking_Treadmill/1.jpg', instructions: '12% incline at 5 km/h for low-impact steady-state fat burning.' },
  { id: 'ex_cd2', name: 'Rowing Machine (Ergometer)', muscleGroup: 'Cardio', equipment: 'Machine', exerciseType: 'distance_time', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rowing_Stationary/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rowing_Stationary/1.jpg', instructions: 'Legs drive first, then back swing, then arm pull; reverse sequence on return.' },
  { id: 'ex_cd3', name: 'Stationary Bike / Spinning', muscleGroup: 'Cardio', equipment: 'Machine', exerciseType: 'distance_time', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bicycling_Stationary/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bicycling_Stationary/1.jpg', instructions: 'Maintain 85-95 RPM cadence with moderate resistance for leg stamina.' },
  { id: 'ex_cd4', name: 'Jump Rope Intervals', muscleGroup: 'Cardio', equipment: 'Bodyweight', exerciseType: 'time_only', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Jumping/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Jumping/1.jpg', instructions: 'Light on balls of feet, wrist flick rotation, rhythm and foot coordination.' },
  { id: 'ex_cd5', name: 'StairMaster Climber', muscleGroup: 'Cardio', equipment: 'Machine', exerciseType: 'time_only', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stairmaster/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stairmaster/1.jpg', instructions: 'Continuous step intervals, upright posture, avoid leaning on side rails.' },
  { id: 'ex_cd6', name: 'Burpees HIIT', muscleGroup: 'Cardio', equipment: 'Bodyweight', exerciseType: 'reps_only', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Press_Sit-Up/0.jpg', imageUrlFinish: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Press_Sit-Up/1.jpg', instructions: 'Drop to floor, kick feet back, push-up, jump feet in, explosive vertical jump.' },
];

const DEFAULT_CATEGORIES: TransactionCategory[] = [
  { id: 'cat_groceries', name: 'Groceries & Food', type: 'expense', color: '#10B981', icon: 'ShoppingBasket' },
  { id: 'cat_housing', name: 'Housing & Rent', type: 'expense', color: '#3B82F6', icon: 'Home' },
  { id: 'cat_transport', name: 'Transport & Fuel', type: 'expense', color: '#F59E0B', icon: 'Car' },
  { id: 'cat_dining', name: 'Dining Out & Cafe', type: 'expense', color: '#EC4899', icon: 'Coffee' },
  { id: 'cat_utilities', name: 'Bills & Utilities', type: 'expense', color: '#6366F1', icon: 'Zap' },
  { id: 'cat_fitness', name: 'Fitness & Health', type: 'expense', color: '#EF4444', icon: 'Dumbbell' },
  { id: 'cat_tech', name: 'Software & Tech', type: 'expense', color: '#8B5CF6', icon: 'Laptop' },
  { id: 'cat_salary', name: 'Monthly Salary', type: 'income', color: '#10B981', icon: 'Banknote' },
  { id: 'cat_freelance', name: 'Freelance & Consulting', type: 'income', color: '#34D399', icon: 'Briefcase' },
];

const DEFAULT_NUTRITION_GOALS: NutritionGoals = {
  dailyCalories: 2250,
  dailyProteinG: 160,
  dailyCarbsG: 220,
  dailyFatG: 70,
  dailyWaterMl: 2800,
};

export const DEFAULT_WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'tpl_push_hypertrophy',
    title: 'Push Day: Chest, Shoulders & Triceps',
    description: 'Heavy barbell bench press, incline dumbbell press, lateral raises and tricep pushdowns.',
    imageUrl: '/images/workouts/push.jpg',
    scheduledDays: [1, 4],
    createdAt: '2026-01-01T00:00:00Z',
    items: [
      { id: 'item_1', exerciseId: 'ex_bench_press', targetSets: 4, targetReps: 8, restSeconds: 90 },
      { id: 'item_2', exerciseId: 'ex_incline_db_press', targetSets: 3, targetReps: 10, restSeconds: 60 },
      { id: 'item_3', exerciseId: 'ex_db_lat_raise', targetSets: 4, targetReps: 12, restSeconds: 60 },
      { id: 'item_4', exerciseId: 'ex_tricep_rope', targetSets: 3, targetReps: 12, restSeconds: 60 },
    ],
  },
  {
    id: 'tpl_pull_strength',
    title: 'Pull Day: Deadlift, Back & Biceps',
    description: 'Heavy conventional deadlifts, wide grip pull-ups, barbell rows and hammer curls.',
    imageUrl: '/images/workouts/pull.jpg',
    scheduledDays: [2, 5],
    createdAt: '2026-01-01T00:00:00Z',
    items: [
      { id: 'item_5', exerciseId: 'ex_conv_deadlift', targetSets: 3, targetReps: 5, restSeconds: 120 },
      { id: 'item_6', exerciseId: 'ex_pullup', targetSets: 3, targetReps: 8, restSeconds: 90 },
      { id: 'item_7', exerciseId: 'ex_barbell_row', targetSets: 3, targetReps: 10, restSeconds: 75 },
      { id: 'item_8', exerciseId: 'ex_hammer_curl', targetSets: 3, targetReps: 12, restSeconds: 60 },
    ],
  },
  {
    id: 'tpl_legs_power',
    title: 'Leg Day: Quads, Hamstrings & Calves',
    description: 'Barbell back squats, Romanian deadlifts, Bulgarian split squats and calf raises.',
    imageUrl: '/images/workouts/legs.jpg',
    scheduledDays: [3, 6],
    createdAt: '2026-01-01T00:00:00Z',
    items: [
      { id: 'item_9', exerciseId: 'ex_barbell_squat', targetSets: 4, targetReps: 8, restSeconds: 120 },
      { id: 'item_10', exerciseId: 'ex_rdl', targetSets: 3, targetReps: 10, restSeconds: 90 },
      { id: 'item_11', exerciseId: 'ex_bulgarian_split', targetSets: 3, targetReps: 10, restSeconds: 60 },
      { id: 'item_12', exerciseId: 'ex_standing_calf', targetSets: 4, targetReps: 15, restSeconds: 45 },
    ],
  },
];

// Initial Seed Data generator
export function initDaymarkStorage(): void {
  if (typeof window === 'undefined') return;

  // 1. Initialize User Accounts
  if (!localStorage.getItem(USER_STORAGE_KEYS.USER_ACCOUNTS)) {
    localStorage.setItem(USER_STORAGE_KEYS.USER_ACCOUNTS, JSON.stringify([]));
    syncToDatabase(USER_STORAGE_KEYS.USER_ACCOUNTS, []);
  }

  const settingsKey = getScopedKey(STORAGE_KEYS.SETTINGS);
  if (!localStorage.getItem(settingsKey)) {
    localStorage.setItem(settingsKey, JSON.stringify(DEFAULT_SETTINGS));
  }

  const exercisesKey = getScopedKey(STORAGE_KEYS.EXERCISES);
  if (!localStorage.getItem(exercisesKey)) {
    localStorage.setItem(exercisesKey, JSON.stringify(DEFAULT_EXERCISES));
  }

  const templatesKey = getScopedKey(STORAGE_KEYS.WORKOUT_TEMPLATES);
  if (!localStorage.getItem(templatesKey)) {
    localStorage.setItem(templatesKey, JSON.stringify(DEFAULT_WORKOUT_TEMPLATES));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTION_CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTION_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }

  if (!localStorage.getItem(STORAGE_KEYS.NUTRITION_GOALS)) {
    localStorage.setItem(STORAGE_KEYS.NUTRITION_GOALS, JSON.stringify(DEFAULT_NUTRITION_GOALS));
  }

  // Pre-populate sample starter records if empty
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    const today = new Date().toISOString().split('T')[0];
    const starterTasks: Task[] = [
      {
        id: 'task_init_1',
        title: 'Review weekly life goals & priorities',
        description: 'Check active fitness targets, project deadlines, and monthly budget.',
        status: 'todo',
        priority: 'high',
        dueDate: `${today}T18:00:00Z`,
        category: 'Personal',
        tags: ['planning', 'productivity'],
        subtasks: [
          { id: 'st_1', title: 'Check budget balance', isCompleted: false },
          { id: 'st_2', title: 'Schedule 3 gym sessions', isCompleted: true },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task_init_2',
        title: 'Log daily hydration and evening reflection',
        status: 'todo',
        priority: 'medium',
        dueDate: `${today}T21:00:00Z`,
        category: 'Health',
        tags: ['health', 'routine'],
        subtasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(starterTasks));
  }

  if (!localStorage.getItem(STORAGE_KEYS.HABITS)) {
    const starterHabits: Habit[] = [
      {
        id: 'hab_1',
        title: 'Drink 2.5L Water',
        description: 'Maintain hydration throughout the day',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        scheduledDays: [1, 2, 3, 4, 5, 6, 7],
        color: '#3B82F6',
        icon: 'Droplet',
        isArchived: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'hab_2',
        title: '30 Minutes Focused Reading',
        description: 'Read non-fiction, philosophy or engineering literature',
        frequency: 'daily',
        targetDaysPerWeek: 5,
        scheduledDays: [1, 2, 3, 4, 5],
        color: '#EF4444',
        icon: 'Book',
        isArchived: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'hab_3',
        title: 'Morning Mobility & Stretch',
        description: '10 min hip openers and thoracic spine stretch',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        scheduledDays: [1, 2, 3, 4, 5, 6, 7],
        color: '#10B981',
        icon: 'Activity',
        isArchived: false,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(starterHabits));
  }
}

// Hydrate local cache from SQLite Database
export async function syncFromDatabase(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/db');
    if (!res.ok) return false;
    const json = await res.json();
    if (json.success && json.data) {
      const keys = Object.keys(json.data);
      if (keys.length > 0) {
        for (const [k, v] of Object.entries(json.data)) {
          localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
        }
        window.dispatchEvent(new Event('daymark-storage-update'));
        return true;
      } else {
        // Seed initial data from localStorage into SQLite Database
        const items: Record<string, any> = {};
        for (const [_, storageKey] of Object.entries(STORAGE_KEYS)) {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            try {
              items[storageKey] = JSON.parse(raw);
            } catch {
              items[storageKey] = raw;
            }
          }
        }
        if (Object.keys(items).length > 0) {
          await fetch('/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          });
        }
        return true;
      }
    }
  } catch (e) {
    console.warn('Initial SQLite sync error:', e);
  }
  return false;
}

// STORAGE API
export const StorageAPI = {
  // User Accounts & Authentication
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(USER_STORAGE_KEYS.AUTH_SESSION) === 'authenticated';
  },
  authenticateUser: (
    usernameOrEmail: string,
    password?: string
  ): { success: boolean; account?: UserAccount; error?: string } => {
    const accounts = StorageAPI.getUserAccounts();
    const query = usernameOrEmail.trim().toLowerCase();
    const target = accounts.find(
      (a) =>
        a.username.toLowerCase() === query ||
        (a.email && a.email.toLowerCase() === query)
    );

    if (!target) {
      return { success: false, error: 'No account found with this username or email.' };
    }

    // Password verification
    if (target.password && target.password.length > 0) {
      if (!password || target.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
    } else if (password && password.trim()) {
      target.password = password.trim();
      localStorage.setItem(USER_STORAGE_KEYS.USER_ACCOUNTS, JSON.stringify(accounts));
      syncToDatabase(USER_STORAGE_KEYS.USER_ACCOUNTS, accounts);
    }

    StorageAPI.setActiveUserId(target.id);
    localStorage.setItem(USER_STORAGE_KEYS.AUTH_SESSION, 'authenticated');
    window.dispatchEvent(new Event('daymark-storage-update'));
    return { success: true, account: target };
  },
  createUserAccount: (data: {
    name: string;
    username: string;
    email?: string;
    password?: string;
    avatarColor?: string;
  }): { success: boolean; account?: UserAccount; error?: string } => {
    const accounts = StorageAPI.getUserAccounts();
    // Allow uppercase characters in username! Preserve exact capitalization entered by the user.
    const cleanUsername = data.username.trim().replace(/\s+/g, '_');

    if (!cleanUsername) {
      return { success: false, error: 'Username is required.' };
    }
    // Case-insensitive uniqueness check
    if (accounts.some((a) => a.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return { success: false, error: 'This username is already taken. Please choose another.' };
    }

    const newId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const newAcc: UserAccount = {
      id: newId,
      name: data.name.trim() || cleanUsername,
      username: cleanUsername,
      email: data.email?.trim() || undefined,
      password: data.password?.trim() || undefined,
      avatarColor: data.avatarColor || '#E50914',
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAcc);
    localStorage.setItem(USER_STORAGE_KEYS.USER_ACCOUNTS, JSON.stringify(accounts));
    syncToDatabase(USER_STORAGE_KEYS.USER_ACCOUNTS, accounts);

    // Switch to new account, mark logged in, and seed their isolated workspace
    StorageAPI.setActiveUserId(newId);
    localStorage.setItem(USER_STORAGE_KEYS.AUTH_SESSION, 'authenticated');

    const userSettings: UserSettings = {
      ...DEFAULT_SETTINGS,
      id: newId,
      name: newAcc.name,
      email: data.email?.trim() || `${newAcc.username}@daymark.local`,
    };
    setItem(STORAGE_KEYS.SETTINGS, userSettings);
    setItem(STORAGE_KEYS.EXERCISES, DEFAULT_EXERCISES);
    setItem(STORAGE_KEYS.WORKOUT_TEMPLATES, DEFAULT_WORKOUT_TEMPLATES);

    window.dispatchEvent(new Event('daymark-storage-update'));
    return { success: true, account: newAcc };
  },
  logout: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_STORAGE_KEYS.AUTH_SESSION);
    window.dispatchEvent(new Event('daymark-storage-update'));
  },
  getUserAccounts: (): UserAccount[] => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(USER_STORAGE_KEYS.USER_ACCOUNTS);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  getActiveUserId: (): string => getActiveUserId(),
  setActiveUserId: (id: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_STORAGE_KEYS.ACTIVE_USER_ID, id);
    window.dispatchEvent(new Event('daymark-storage-update'));
  },
  deleteUserAccount: (id: string): void => {
    const accounts = StorageAPI.getUserAccounts().filter((a) => a.id !== id);
    localStorage.setItem(USER_STORAGE_KEYS.USER_ACCOUNTS, JSON.stringify(accounts));
    syncToDatabase(USER_STORAGE_KEYS.USER_ACCOUNTS, accounts);
    if (getActiveUserId() === id) {
      if (accounts.length > 0) {
        StorageAPI.setActiveUserId(accounts[0].id);
      } else {
        StorageAPI.setActiveUserId('');
        StorageAPI.logout();
      }
    } else {
      window.dispatchEvent(new Event('daymark-storage-update'));
    }
  },

  // Settings
  getSettings: (): UserSettings => getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  saveSettings: (settings: UserSettings): void => setItem(STORAGE_KEYS.SETTINGS, settings),

  // Tasks
  getTasks: (): Task[] => getItem(STORAGE_KEYS.TASKS, []),
  saveTask: (task: Task): void => {
    const tasks = StorageAPI.getTasks();
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      tasks[idx] = { ...task, updatedAt: new Date().toISOString() };
    } else {
      tasks.unshift(task);
    }
    setItem(STORAGE_KEYS.TASKS, tasks);
  },
  deleteTask: (id: string): void => {
    const tasks = StorageAPI.getTasks().filter((t) => t.id !== id);
    setItem(STORAGE_KEYS.TASKS, tasks);
  },

  // Events
  getEvents: (): CalendarEvent[] => getItem(STORAGE_KEYS.EVENTS, []),
  saveEvent: (event: CalendarEvent): void => {
    const events = StorageAPI.getEvents();
    const idx = events.findIndex((e) => e.id === event.id);
    if (idx >= 0) {
      events[idx] = event;
    } else {
      events.push(event);
    }
    setItem(STORAGE_KEYS.EVENTS, events);
  },
  deleteEvent: (id: string): void => {
    setItem(STORAGE_KEYS.EVENTS, StorageAPI.getEvents().filter((e) => e.id !== id));
  },

  // Habits
  getHabits: (): Habit[] => getItem(STORAGE_KEYS.HABITS, []),
  saveHabit: (habit: Habit): void => {
    const habits = StorageAPI.getHabits();
    const idx = habits.findIndex((h) => h.id === habit.id);
    if (idx >= 0) habits[idx] = habit;
    else habits.push(habit);
    setItem(STORAGE_KEYS.HABITS, habits);
  },
  deleteHabit: (id: string): void => {
    setItem(STORAGE_KEYS.HABITS, StorageAPI.getHabits().filter((h) => h.id !== id));
  },
  getHabitEntries: (): HabitEntry[] => getItem(STORAGE_KEYS.HABIT_ENTRIES, []),
  toggleHabitEntry: (habitId: string, date: string): void => {
    const entries = StorageAPI.getHabitEntries();
    const existingIdx = entries.findIndex((e) => e.habitId === habitId && e.date === date);
    if (existingIdx >= 0) {
      entries[existingIdx].completed = !entries[existingIdx].completed;
    } else {
      entries.push({ habitId, date, completed: true });
    }
    setItem(STORAGE_KEYS.HABIT_ENTRIES, entries);
  },

  // Notes & Folders
  getNotes: (): Note[] => getItem(STORAGE_KEYS.NOTES, []),
  saveNote: (note: Note): void => {
    const notes = StorageAPI.getNotes();
    const idx = notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) notes[idx] = { ...note, updatedAt: new Date().toISOString() };
    else notes.unshift(note);
    setItem(STORAGE_KEYS.NOTES, notes);
  },
  deleteNote: (id: string): void => {
    setItem(STORAGE_KEYS.NOTES, StorageAPI.getNotes().filter((n) => n.id !== id));
  },
  getNoteFolders: (): NoteFolder[] => getItem(STORAGE_KEYS.NOTE_FOLDERS, []),
  saveNoteFolder: (folder: NoteFolder): void => {
    const folders = StorageAPI.getNoteFolders();
    const idx = folders.findIndex((f) => f.id === folder.id);
    if (idx >= 0) folders[idx] = folder;
    else folders.push(folder);
    setItem(STORAGE_KEYS.NOTE_FOLDERS, folders);
  },

  // Journal
  getJournalEntries: (): JournalEntry[] => getItem(STORAGE_KEYS.JOURNAL, []),
  saveJournalEntry: (entry: JournalEntry): void => {
    const list = StorageAPI.getJournalEntries();
    const idx = list.findIndex((j) => j.date === entry.date);
    if (idx >= 0) list[idx] = { ...entry, updatedAt: new Date().toISOString() };
    else list.unshift(entry);
    setItem(STORAGE_KEYS.JOURNAL, list);
  },

  // Focus Sessions
  getFocusSessions: (): FocusSession[] => getItem(STORAGE_KEYS.FOCUS, []),
  saveFocusSession: (session: FocusSession): void => {
    const list = StorageAPI.getFocusSessions();
    list.unshift(session);
    setItem(STORAGE_KEYS.FOCUS, list);
  },

  // Exercises & Workouts
  getExercises: (): Exercise[] => {
    const stored = getItem<Exercise[]>(STORAGE_KEYS.EXERCISES, []);
    if (!stored || stored.length === 0) {
      setItem(STORAGE_KEYS.EXERCISES, DEFAULT_EXERCISES);
      return DEFAULT_EXERCISES;
    }
    const existingIds = new Set(stored.map((e) => e.id));
    const defaultById = new Map(DEFAULT_EXERCISES.map((d) => [d.id, d]));
    const defaultByName = new Map(DEFAULT_EXERCISES.map((d) => [d.name.toLowerCase().trim(), d]));
    let updated = false;
    const hydrated = stored.map((e) => {
      const def = defaultById.get(e.id) || defaultByName.get(e.name.toLowerCase().trim());
      if (def) {
        if (!e.imageUrl || !e.imageUrlFinish || e.imageUrl !== def.imageUrl) {
          updated = true;
          return {
            ...e,
            imageUrl: def.imageUrl,
            imageUrlFinish: def.imageUrlFinish,
            instructions: e.instructions || def.instructions,
          };
        }
      }
      return e;
    });
    const newDefaults = DEFAULT_EXERCISES.filter((d) => !existingIds.has(d.id));
    if (newDefaults.length > 0 || updated) {
      const merged = [...hydrated, ...newDefaults];
      setItem(STORAGE_KEYS.EXERCISES, merged);
      return merged;
    }
    return hydrated;
  },
  saveExercise: (ex: Exercise): void => {
    const list = StorageAPI.getExercises();
    const idx = list.findIndex((e) => e.id === ex.id);
    if (idx >= 0) list[idx] = ex;
    else list.push(ex);
    setItem(STORAGE_KEYS.EXERCISES, list);
  },
  deleteExercise: (id: string): void => {
    const list = StorageAPI.getExercises().filter((e) => e.id !== id);
    setItem(STORAGE_KEYS.EXERCISES, list);
  },
  getWorkoutTemplates: (): WorkoutTemplate[] => {
    if (typeof window === 'undefined') return DEFAULT_WORKOUT_TEMPLATES;
    const scopedKey = getScopedKey(STORAGE_KEYS.WORKOUT_TEMPLATES);
    const raw = localStorage.getItem(scopedKey);
    if (raw === null) {
      setItem(STORAGE_KEYS.WORKOUT_TEMPLATES, DEFAULT_WORKOUT_TEMPLATES);
      return DEFAULT_WORKOUT_TEMPLATES;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((t) => {
        if (t.imageUrl) return t;
        const lower = (t.title || '').toLowerCase();
        const img = lower.includes('pull') || lower.includes('back')
          ? '/images/workouts/pull.jpg'
          : lower.includes('leg') || lower.includes('squat')
          ? '/images/workouts/legs.jpg'
          : '/images/workouts/push.jpg';
        return { ...t, imageUrl: img };
      });
    } catch {
      return [];
    }
  },
  saveWorkoutTemplate: (tpl: WorkoutTemplate): void => {
    const list = StorageAPI.getWorkoutTemplates();
    const idx = list.findIndex((t) => t.id === tpl.id);
    if (idx >= 0) list[idx] = tpl;
    else list.push(tpl);
    setItem(STORAGE_KEYS.WORKOUT_TEMPLATES, list);
  },
  deleteWorkoutTemplate: (id: string): void => {
    const remaining = StorageAPI.getWorkoutTemplates().filter((t) => t.id !== id);
    setItem(STORAGE_KEYS.WORKOUT_TEMPLATES, remaining);
  },
  getWorkoutSessions: (): WorkoutSession[] => getItem(STORAGE_KEYS.WORKOUT_SESSIONS, []),
  saveWorkoutSession: (session: WorkoutSession): void => {
    const list = StorageAPI.getWorkoutSessions();
    const idx = list.findIndex((s) => s.id === session.id);
    if (idx >= 0) list[idx] = session;
    else list.unshift(session);
    setItem(STORAGE_KEYS.WORKOUT_SESSIONS, list);
  },
  getBodyMeasurements: (): BodyMeasurement[] => getItem(STORAGE_KEYS.BODY_MEASUREMENTS, []),
  saveBodyMeasurement: (item: BodyMeasurement): void => {
    const list = StorageAPI.getBodyMeasurements();
    const idx = list.findIndex((m) => m.date === item.date);
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    setItem(STORAGE_KEYS.BODY_MEASUREMENTS, list);
  },

  // Nutrition & Water
  getNutritionGoals: (): NutritionGoals => getItem(STORAGE_KEYS.NUTRITION_GOALS, DEFAULT_NUTRITION_GOALS),
  saveNutritionGoals: (goals: NutritionGoals): void => setItem(STORAGE_KEYS.NUTRITION_GOALS, goals),
  getFoodEntries: (): FoodEntry[] => getItem(STORAGE_KEYS.FOOD_ENTRIES, []),
  saveFoodEntry: (entry: FoodEntry): void => {
    const list = StorageAPI.getFoodEntries();
    list.unshift(entry);
    setItem(STORAGE_KEYS.FOOD_ENTRIES, list);
  },
  deleteFoodEntry: (id: string): void => {
    setItem(STORAGE_KEYS.FOOD_ENTRIES, StorageAPI.getFoodEntries().filter((f) => f.id !== id));
  },
  getWaterEntries: (): WaterEntry[] => getItem(STORAGE_KEYS.WATER_ENTRIES, []),
  addWaterEntry: (amountMl: number, date?: string): void => {
    const d = date || new Date().toISOString().split('T')[0];
    const list = StorageAPI.getWaterEntries();
    list.push({
      id: 'water_' + Date.now(),
      date: d,
      amountMl,
      createdAt: new Date().toISOString(),
    });
    setItem(STORAGE_KEYS.WATER_ENTRIES, list);
  },
  undoLastWaterEntry: (date?: string): void => {
    const d = date || new Date().toISOString().split('T')[0];
    const list = StorageAPI.getWaterEntries();
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].date === d) {
        list.splice(i, 1);
        break;
      }
    }
    setItem(STORAGE_KEYS.WATER_ENTRIES, list);
  },

  // Finance
  getAccounts: (): FinancialAccount[] => getItem(STORAGE_KEYS.FINANCE_ACCOUNTS, [
    { id: 'acc_main', name: 'Main Checking', accountType: 'checking', currency: 'EUR', initialBalanceCents: 245000, color: '#3B82F6' },
    { id: 'acc_savings', name: 'Emergency Fund', accountType: 'savings', currency: 'EUR', initialBalanceCents: 500000, color: '#10B981' },
  ]),
  saveAccount: (acc: FinancialAccount): void => {
    const list = StorageAPI.getAccounts();
    const idx = list.findIndex((a) => a.id === acc.id);
    if (idx >= 0) list[idx] = acc;
    else list.push(acc);
    setItem(STORAGE_KEYS.FINANCE_ACCOUNTS, list);
  },
  getCategories: (): TransactionCategory[] => getItem(STORAGE_KEYS.TRANSACTION_CATEGORIES, DEFAULT_CATEGORIES),
  saveCategory: (cat: TransactionCategory): void => {
    const list = StorageAPI.getCategories();
    const idx = list.findIndex((c) => c.id === cat.id);
    if (idx >= 0) list[idx] = cat;
    else list.push(cat);
    setItem(STORAGE_KEYS.TRANSACTION_CATEGORIES, list);
  },
  getTransactions: (): Transaction[] => getItem(STORAGE_KEYS.TRANSACTIONS, []),
  saveTransaction: (tx: Transaction): void => {
    const list = StorageAPI.getTransactions();
    const idx = list.findIndex((t) => t.id === tx.id);
    if (idx >= 0) list[idx] = tx;
    else list.unshift(tx);
    setItem(STORAGE_KEYS.TRANSACTIONS, list);
  },
  deleteTransaction: (id: string): void => {
    setItem(STORAGE_KEYS.TRANSACTIONS, StorageAPI.getTransactions().filter((t) => t.id !== id));
  },
  getBudgets: (): Budget[] => getItem(STORAGE_KEYS.BUDGETS, []),
  saveBudget: (b: Budget): void => {
    const list = StorageAPI.getBudgets();
    const idx = list.findIndex((item) => item.categoryId === b.categoryId && item.monthYear === b.monthYear);
    if (idx >= 0) list[idx] = b;
    else list.push(b);
    setItem(STORAGE_KEYS.BUDGETS, list);
  },
  getSavingsGoals: (): SavingsGoal[] => getItem(STORAGE_KEYS.SAVINGS_GOALS, []),
  saveSavingsGoal: (goal: SavingsGoal): void => {
    const list = StorageAPI.getSavingsGoals();
    const idx = list.findIndex((g) => g.id === goal.id);
    if (idx >= 0) list[idx] = goal;
    else list.push(goal);
    setItem(STORAGE_KEYS.SAVINGS_GOALS, list);
  },

  // Recipes, Meals, Shopping
  getRecipes: (): Recipe[] => getItem(STORAGE_KEYS.RECIPES, []),
  saveRecipe: (recipe: Recipe): void => {
    const list = StorageAPI.getRecipes();
    const idx = list.findIndex((r) => r.id === recipe.id);
    if (idx >= 0) list[idx] = recipe;
    else list.push(recipe);
    setItem(STORAGE_KEYS.RECIPES, list);
  },
  deleteRecipe: (id: string): void => {
    setItem(STORAGE_KEYS.RECIPES, StorageAPI.getRecipes().filter((r) => r.id !== id));
  },
  getMealPlans: (): MealPlan[] => getItem(STORAGE_KEYS.MEAL_PLANS, []),
  saveMealPlan: (plan: MealPlan): void => {
    const list = StorageAPI.getMealPlans();
    const idx = list.findIndex((p) => p.id === plan.id);
    if (idx >= 0) list[idx] = plan;
    else list.push(plan);
    setItem(STORAGE_KEYS.MEAL_PLANS, list);
  },
  deleteMealPlan: (id: string): void => {
    setItem(STORAGE_KEYS.MEAL_PLANS, StorageAPI.getMealPlans().filter((p) => p.id !== id));
  },
  getShoppingLists: (): ShoppingList[] => getItem(STORAGE_KEYS.SHOPPING_LISTS, [
    { id: 'list_groceries', title: 'Weekly Groceries', category: 'Groceries', color: '#EF4444', budgetCents: 8500, isArchived: false, createdAt: new Date().toISOString() },
  ]),
  saveShoppingList: (list: ShoppingList): void => {
    const lists = StorageAPI.getShoppingLists();
    const idx = lists.findIndex((l) => l.id === list.id);
    if (idx >= 0) lists[idx] = list;
    else lists.push(list);
    setItem(STORAGE_KEYS.SHOPPING_LISTS, lists);
  },
  getShoppingItems: (listId?: string): ShoppingListItem[] => {
    const all = getItem<ShoppingListItem[]>(STORAGE_KEYS.SHOPPING_ITEMS, []);
    return listId ? all.filter((i) => i.listId === listId) : all;
  },
  saveShoppingItem: (item: ShoppingListItem): void => {
    const all = StorageAPI.getShoppingItems();
    const idx = all.findIndex((i) => i.id === item.id);
    if (idx >= 0) all[idx] = item;
    else all.push(item);
    setItem(STORAGE_KEYS.SHOPPING_ITEMS, all);
  },
  deleteShoppingItem: (id: string): void => {
    setItem(STORAGE_KEYS.SHOPPING_ITEMS, StorageAPI.getShoppingItems().filter((i) => i.id !== id));
  },

  // Reading & Learning
  getReadingItems: (): ReadingItem[] => getItem(STORAGE_KEYS.READING, []),
  saveReadingItem: (item: ReadingItem): void => {
    const list = StorageAPI.getReadingItems();
    const idx = list.findIndex((r) => r.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    setItem(STORAGE_KEYS.READING, list);
  },
  deleteReadingItem: (id: string): void => {
    setItem(STORAGE_KEYS.READING, StorageAPI.getReadingItems().filter((r) => r.id !== id));
  },

  // Travel
  getTrips: (): Trip[] => getItem(STORAGE_KEYS.TRIPS, []),
  saveTrip: (trip: Trip): void => {
    const list = StorageAPI.getTrips();
    const idx = list.findIndex((t) => t.id === trip.id);
    if (idx >= 0) list[idx] = trip;
    else list.unshift(trip);
    setItem(STORAGE_KEYS.TRIPS, list);
  },
  deleteTrip: (id: string): void => {
    setItem(STORAGE_KEYS.TRIPS, StorageAPI.getTrips().filter((t) => t.id !== id));
  },
  getTripItinerary: (tripId: string): TripItineraryItem[] => {
    const all = getItem<TripItineraryItem[]>(STORAGE_KEYS.TRIP_ITINERARY, []);
    return all.filter((i) => i.tripId === tripId);
  },
  saveTripItineraryItem: (item: TripItineraryItem): void => {
    const all = getItem<TripItineraryItem[]>(STORAGE_KEYS.TRIP_ITINERARY, []);
    const idx = all.findIndex((i) => i.id === item.id);
    if (idx >= 0) all[idx] = item;
    else all.push(item);
    setItem(STORAGE_KEYS.TRIP_ITINERARY, all);
  },
  getTripPacking: (tripId: string): TripPackingItem[] => {
    const all = getItem<TripPackingItem[]>(STORAGE_KEYS.TRIP_PACKING, []);
    return all.filter((p) => p.tripId === tripId);
  },
  saveTripPackingItem: (item: TripPackingItem): void => {
    const all = getItem<TripPackingItem[]>(STORAGE_KEYS.TRIP_PACKING, []);
    const idx = all.findIndex((p) => p.id === item.id);
    if (idx >= 0) all[idx] = item;
    else all.push(item);
    setItem(STORAGE_KEYS.TRIP_PACKING, all);
  },

  // Documents & Links
  getDocuments: (): DocumentRecord[] => getItem(STORAGE_KEYS.DOCUMENTS, []),
  saveDocument: (doc: DocumentRecord): void => {
    const list = StorageAPI.getDocuments();
    const idx = list.findIndex((d) => d.id === doc.id);
    if (idx >= 0) list[idx] = doc;
    else list.unshift(doc);
    setItem(STORAGE_KEYS.DOCUMENTS, list);
  },
  deleteDocument: (id: string): void => {
    setItem(STORAGE_KEYS.DOCUMENTS, StorageAPI.getDocuments().filter((d) => d.id !== id));
  },
  getSavedLinks: (): SavedLink[] => getItem(STORAGE_KEYS.LINKS, []),
  saveSavedLink: (link: SavedLink): void => {
    const list = StorageAPI.getSavedLinks();
    const idx = list.findIndex((l) => l.id === link.id);
    if (idx >= 0) list[idx] = link;
    else list.unshift(link);
    setItem(STORAGE_KEYS.LINKS, list);
  },
  deleteSavedLink: (id: string): void => {
    setItem(STORAGE_KEYS.LINKS, StorageAPI.getSavedLinks().filter((l) => l.id !== id));
  },

  // AI Conversations
  getAIConversations: (): AIConversation[] => getItem(STORAGE_KEYS.AI_CONVERSATIONS, []),
  saveAIConversation: (conv: AIConversation): void => {
    const list = StorageAPI.getAIConversations();
    const idx = list.findIndex((c) => c.id === conv.id);
    if (idx >= 0) list[idx] = conv;
    else list.unshift(conv);
    setItem(STORAGE_KEYS.AI_CONVERSATIONS, list);
  },

  // Global Export / Import
  exportAllData: (): string => {
    if (typeof window === 'undefined') return '{}';
    const payload: Record<string, any> = {};
    for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
      payload[key] = getItem(storageKey, null);
    }
    payload.exportTimestamp = new Date().toISOString();
    payload.appVersion = '1.0.0';
    return JSON.stringify(payload, null, 2);
  },

  importAllData: (jsonString: string): { success: boolean; error?: string } => {
    if (typeof window === 'undefined') return { success: false, error: 'Window undefined' };
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Invalid backup file format' };
      }
      for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
        if (data[key] !== undefined && data[key] !== null) {
          localStorage.setItem(storageKey, JSON.stringify(data[key]));
        }
      }
      window.dispatchEvent(new Event('daymark-storage-update'));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to parse JSON' };
    }
  },

  exportTasksCSV: (): string => {
    const tasks = StorageAPI.getTasks();
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Category', 'Due Date', 'Created At'];
    const rows = tasks.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.category,
      t.dueDate || '',
      t.createdAt,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  exportFinanceCSV: (): string => {
    const txs = StorageAPI.getTransactions();
    const categories = StorageAPI.getCategories();
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    const headers = ['Date', 'Type', 'Amount', 'Currency', 'Category', 'Payee', 'Notes'];
    const rows = txs.map((t) => [
      t.date,
      t.type,
      (t.amountCents / 100).toFixed(2),
      t.currency,
      `"${(catMap.get(t.categoryId) || 'Other').replace(/"/g, '""')}"`,
      `"${(t.payeeMerchant || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
