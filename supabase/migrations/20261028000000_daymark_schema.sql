-- ==============================================================================
-- DAYMARK DATABASE SCHEMA & MIGRATION
-- Production PostgreSQL Schema with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES & USER SETTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'dark',
    accent_color TEXT NOT NULL DEFAULT 'red',
    currency TEXT NOT NULL DEFAULT 'EUR',
    timezone TEXT NOT NULL DEFAULT 'Europe/Lisbon',
    unit_system TEXT NOT NULL DEFAULT 'metric', -- 'metric' | 'imperial'
    time_format TEXT NOT NULL DEFAULT '24h',    -- '12h' | '24h'
    date_format TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    weather_city TEXT NOT NULL DEFAULT 'Lisbon',
    weather_lat NUMERIC(8, 4) DEFAULT 38.7223,
    weather_lon NUMERIC(8, 4) DEFAULT -9.1393,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '07:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_module_preferences (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, module_id)
);

-- ------------------------------------------------------------------------------
-- 2. CALENDAR & EVENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
    category TEXT NOT NULL DEFAULT 'general',
    color TEXT DEFAULT '#EF4444',
    recurrence_rule TEXT, -- e.g. 'FREQ=DAILY', 'FREQ=WEEKLY;BYDAY=MO,WE,FR'
    reminder_minutes INTEGER,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TASKS & TO-DOS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#EF4444',
    icon TEXT DEFAULT 'list',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    list_id UUID REFERENCES task_lists(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo', -- 'todo' | 'in_progress' | 'completed' | 'cancelled'
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'urgent'
    due_date TIMESTAMPTZ,
    start_date TIMESTAMPTZ,
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    recurrence TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. HABITS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekdays', 'weekly', 'custom'
    target_days_per_week INTEGER DEFAULT 7,
    scheduled_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Mon, 7=Sun
    color TEXT DEFAULT '#EF4444',
    icon TEXT DEFAULT 'check-circle',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(habit_id, entry_date)
);

-- ------------------------------------------------------------------------------
-- 5. NOTES & JOURNAL
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS note_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#EF4444',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES note_folders(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_trashed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    mood TEXT, -- 'great', 'good', 'neutral', 'bad', 'awful'
    highlights TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, entry_date)
);

-- ------------------------------------------------------------------------------
-- 6. FOCUS SESSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'work', -- 'work', 'short_break', 'long_break'
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. FITNESS & WORKOUTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL means system-provided exercise
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL, -- 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'
    equipment TEXT NOT NULL,    -- 'Barbell', 'Dumbbell', 'Machine', 'Bodyweight', 'Cable'
    exercise_type TEXT NOT NULL DEFAULT 'weight_reps', -- 'weight_reps', 'reps_only', 'distance_time', 'time_only'
    instructions TEXT,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_days INTEGER[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_template_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    target_sets INTEGER NOT NULL DEFAULT 3,
    target_reps INTEGER NOT NULL DEFAULT 10,
    target_weight_kg NUMERIC(6, 2),
    rest_seconds INTEGER NOT NULL DEFAULT 60,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'completed', -- 'in_progress', 'completed', 'cancelled'
    notes TEXT,
    total_volume_kg NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    set_type TEXT NOT NULL DEFAULT 'normal', -- 'warmup', 'normal', 'drop', 'failure'
    reps INTEGER NOT NULL,
    weight_kg NUMERIC(6, 2) NOT NULL DEFAULT 0,
    rpe INTEGER,
    is_completed BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    weight_kg NUMERIC(5, 2),
    waist_cm NUMERIC(5, 2),
    neck_cm NUMERIC(5, 2),
    chest_cm NUMERIC(5, 2),
    hips_cm NUMERIC(5, 2),
    biceps_cm NUMERIC(5, 2),
    body_fat_pct NUMERIC(4, 1),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. NUTRITION & WATER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition_goals (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    daily_calories INTEGER NOT NULL DEFAULT 2200,
    daily_protein_g INTEGER NOT NULL DEFAULT 150,
    daily_carbs_g INTEGER NOT NULL DEFAULT 220,
    daily_fat_g INTEGER NOT NULL DEFAULT 70,
    daily_water_ml INTEGER NOT NULL DEFAULT 2500,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL means public/standard catalogue
    name TEXT NOT NULL,
    brand TEXT,
    serving_size TEXT NOT NULL DEFAULT '100g',
    serving_weight_g NUMERIC(6, 2) DEFAULT 100,
    calories INTEGER NOT NULL,
    protein_g NUMERIC(5, 1) NOT NULL DEFAULT 0,
    carbs_g NUMERIC(5, 1) NOT NULL DEFAULT 0,
    fat_g NUMERIC(5, 1) NOT NULL DEFAULT 0,
    fiber_g NUMERIC(5, 1) DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
    custom_name TEXT NOT NULL,
    entry_date DATE NOT NULL,
    meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    servings NUMERIC(4, 2) NOT NULL DEFAULT 1,
    calories INTEGER NOT NULL,
    protein_g NUMERIC(5, 1) NOT NULL DEFAULT 0,
    carbs_g NUMERIC(5, 1) NOT NULL DEFAULT 0,
    fat_g NUMERIC(5, 1) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    amount_ml INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. FINANCE & BUDGETS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL DEFAULT 'checking', -- 'checking', 'savings', 'credit', 'cash', 'investment'
    currency TEXT NOT NULL DEFAULT 'EUR',
    initial_balance_cents BIGINT NOT NULL DEFAULT 0,
    color TEXT DEFAULT '#EF4444',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transaction_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'expense', -- 'income', 'expense'
    color TEXT DEFAULT '#EF4444',
    icon TEXT DEFAULT 'tag',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'income', 'expense', 'transfer'
    amount_cents BIGINT NOT NULL, -- stored in minor units (e.g. cents) to avoid float inaccuracies
    currency TEXT NOT NULL DEFAULT 'EUR',
    date DATE NOT NULL,
    payee_merchant TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_interval TEXT, -- 'weekly', 'monthly', 'yearly'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES transaction_categories(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL, -- e.g. '2026-10'
    limit_cents BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, category_id, month_year)
);

CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount_cents BIGINT NOT NULL,
    current_amount_cents BIGINT NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'EUR',
    target_date DATE,
    color TEXT DEFAULT '#EF4444',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS savings_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. MEAL PLANNER & GROCERY LISTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    servings INTEGER NOT NULL DEFAULT 2,
    prep_time_min INTEGER DEFAULT 15,
    cook_time_min INTEGER DEFAULT 20,
    ingredients JSONB NOT NULL DEFAULT '[]', -- Array of { name, amount, unit }
    instructions TEXT[] NOT NULL DEFAULT '{}',
    calories_per_serving INTEGER,
    protein_per_serving NUMERIC(5,1),
    carbs_per_serving NUMERIC(5,1),
    fat_per_serving NUMERIC(5,1),
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    custom_meal_title TEXT,
    plan_date DATE NOT NULL,
    meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. SHOPPING LISTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shopping_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    color TEXT DEFAULT '#EF4444',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    budget_cents BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shopping_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity NUMERIC(6, 2) DEFAULT 1,
    unit TEXT DEFAULT 'item',
    estimated_price_cents BIGINT DEFAULT 0,
    category TEXT DEFAULT 'Produce',
    is_checked BOOLEAN NOT NULL DEFAULT FALSE,
    priority TEXT DEFAULT 'normal',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. READING & LEARNING TRACKER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reading_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    content_type TEXT NOT NULL DEFAULT 'book', -- 'book', 'article', 'course', 'paper', 'podcast'
    url TEXT,
    status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'paused'
    current_progress INTEGER NOT NULL DEFAULT 0,
    total_progress INTEGER,
    progress_unit TEXT DEFAULT 'pages', -- 'pages', 'chapters', 'minutes', 'percent'
    rating INTEGER, -- 1 to 5
    notes TEXT,
    started_at DATE,
    completed_at DATE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. TRAVEL PLANNER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget_cents BIGINT DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    description TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_itinerary_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    activity_date DATE NOT NULL,
    start_time TIME,
    duration_min INTEGER,
    location TEXT,
    estimated_cost_cents BIGINT DEFAULT 0,
    notes TEXT,
    url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_packing_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT DEFAULT 'Clothing',
    is_packed BOOLEAN NOT NULL DEFAULT FALSE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 14. DOCUMENT ORGANISER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    folder TEXT DEFAULT 'General',
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 15. LINK & MEDIA ORGANISER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'read_later', -- 'read_later', 'watch_later', 'play_later', 'learn_later', 'research', 'other'
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 16. AI CONVERSATIONS & ACTIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    action_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Users can ONLY access their own records
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Generation for standard user-owned tables
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'profiles', 'user_settings', 'user_module_preferences', 'events', 
            'task_lists', 'tasks', 'habits', 'habit_entries', 'note_folders', 
            'notes', 'journal_entries', 'focus_sessions', 'workout_templates', 
            'workout_sessions', 'body_measurements', 'nutrition_goals', 'food_entries', 
            'water_entries', 'financial_accounts', 'transaction_categories', 
            'transactions', 'budgets', 'savings_goals', 'recipes', 'meal_plans', 
            'shopping_lists', 'reading_items', 'trips', 'documents', 'saved_links', 
            'ai_conversations'
        ])
    LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS %I_user_policy ON %I;
            CREATE POLICY %I_user_policy ON %I
                FOR ALL
                USING (user_id = auth.uid() OR id = auth.uid())
                WITH CHECK (user_id = auth.uid() OR id = auth.uid());
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END $$;

-- Exercises: readable if user_id IS NULL (system default) OR user_id = auth.uid()
CREATE POLICY exercises_select_policy ON exercises
    FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY exercises_modify_policy ON exercises
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Foods: readable if user_id IS NULL (system standard) OR user_id = auth.uid()
CREATE POLICY foods_select_policy ON foods
    FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY foods_modify_policy ON foods
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
