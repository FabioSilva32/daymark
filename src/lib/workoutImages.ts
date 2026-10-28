// Workout Banners & Visual Asset Registry

export interface WorkoutCoverPreset {
  id: string;
  label: string;
  imageUrl: string;
  url: string;
  category: string;
}

export const WORKOUT_COVER_PRESETS: WorkoutCoverPreset[] = [
  {
    id: 'push',
    label: 'Push Day',
    imageUrl: '/images/workouts/push.jpg',
    url: '/images/workouts/push.jpg',
    category: 'Hypertrophy',
  },
  {
    id: 'pull',
    label: 'Pull Day',
    imageUrl: '/images/workouts/pull.jpg',
    url: '/images/workouts/pull.jpg',
    category: 'Strength',
  },
  {
    id: 'legs',
    label: 'Leg Day',
    imageUrl: '/images/workouts/legs.jpg',
    url: '/images/workouts/legs.jpg',
    category: 'Legs',
  },
  {
    id: 'upper',
    label: 'Upper Body',
    imageUrl: '/images/workouts/upper.jpg',
    url: '/images/workouts/upper.jpg',
    category: 'Hypertrophy',
  },
  {
    id: 'fullbody',
    label: 'Full Body',
    imageUrl: '/images/workouts/fullbody.jpg',
    url: '/images/workouts/fullbody.jpg',
    category: 'Athletic',
  },
  {
    id: 'cardio',
    label: 'Cardio & HIIT',
    imageUrl: '/images/workouts/cardio.jpg',
    url: '/images/workouts/cardio.jpg',
    category: 'Endurance',
  },
];

export function getWorkoutCover(templateTitle?: string, customImageUrl?: string): string {
  if (customImageUrl && customImageUrl.trim().length > 0) {
    return customImageUrl;
  }
  if (!templateTitle) return '/images/workouts/push.jpg';

  const lower = templateTitle.toLowerCase();
  if (lower.includes('pull') || lower.includes('back') || lower.includes('deadlift')) {
    return '/images/workouts/pull.jpg';
  }
  if (lower.includes('leg') || lower.includes('squat') || lower.includes('quad')) {
    return '/images/workouts/legs.jpg';
  }
  if (lower.includes('push') || lower.includes('chest') || lower.includes('bench') || lower.includes('upper')) {
    return '/images/workouts/push.jpg';
  }
  return '/images/workouts/push.jpg';
}
