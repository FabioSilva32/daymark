'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { Exercise, WorkoutTemplate, WorkoutSession, WorkoutSet } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { MuscleDiagram } from '@/components/fitness/MuscleDiagram';
import { getWorkoutCover, WORKOUT_COVER_PRESETS } from '@/lib/workoutImages';
import {
  Dumbbell,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  Trophy,
  History,
  Activity,
  Flame,
  Search,
  Eye,
  Image as ImageIcon,
  Edit2,
  X,
  ChevronUp,
  ChevronDown,
  Check,
  RotateCcw,
  Pause,
  AlertCircle,
  Film,
} from 'lucide-react';

interface RoutineSelectedExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  targetWeightKg?: number;
}

export default function FitnessPage() {
  const { storageVersion, refreshStorage } = useDaymark();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  // Navigation tabs: 'routines' | 'active' | 'exercises' | 'history'
  const [tab, setTab] = useState<'routines' | 'active' | 'exercises' | 'history'>('routines');

  // Exercise Library Filters
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [equipmentFilter, setEquipmentFilter] = useState('All');

  // Active workout session state
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [addExToActiveModalOpen, setAddExToActiveModalOpen] = useState(false);
  const [activeExSearch, setActiveExSearch] = useState('');
  const [activeMuscleFilter, setActiveMuscleFilter] = useState('All');

  // Routine Create & Edit Modal
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');
  const [routineCover, setRoutineCover] = useState('/images/workouts/push.jpg');
  const [selectedRoutineItems, setSelectedRoutineItems] = useState<RoutineSelectedExercise[]>([]);
  const [routineExSearch, setRoutineExSearch] = useState('');
  const [routineMuscleFilter, setRoutineMuscleFilter] = useState('All');

  // Open Routine (Inspection Modal)
  const [viewingTemplate, setViewingTemplate] = useState<WorkoutTemplate | null>(null);

  // Custom exercise modal
  const [exModalOpen, setExModalOpen] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState<Exercise['muscleGroup']>('Chest');
  const [newExEquipment, setNewExEquipment] = useState<Exercise['equipment']>('Barbell');
  const [newExType, setNewExType] = useState<Exercise['exerciseType']>('weight_reps');
  const [newExInstructions, setNewExInstructions] = useState('');
  const [newExImageUrl, setNewExImageUrl] = useState('');

  // Routine validation error state
  const [routineError, setRoutineError] = useState('');

  // Exercise Detail Modal (Form cues & motion player)
  const [detailEx, setDetailEx] = useState<Exercise | null>(null);
  const [guideMode, setGuideMode] = useState<'animated' | 'sidebyside'>('animated');
  const [guideFrame, setGuideFrame] = useState<0 | 1>(0);
  const [isGuidePlaying, setIsGuidePlaying] = useState(true);

  // Auto-play exercise motion loop between Start and Finish frame
  useEffect(() => {
    if (!detailEx || !isGuidePlaying || !detailEx.imageUrlFinish) return;
    const timer = setInterval(() => {
      setGuideFrame((f) => (f === 0 ? 1 : 0));
    }, 950);
    return () => clearInterval(timer);
  }, [detailEx, isGuidePlaying]);

  useEffect(() => {
    setExercises(StorageAPI.getExercises());
    setTemplates(StorageAPI.getWorkoutTemplates());
    setSessions(StorageAPI.getWorkoutSessions());
  }, [storageVersion]);

  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

  // Start workout from template or blank quick session
  const startWorkout = (tpl?: WorkoutTemplate) => {
    const title = tpl ? tpl.title : 'Quick Workout Session';
    const initialSets: WorkoutSet[] = [];

    if (tpl) {
      tpl.items.forEach((item) => {
        for (let s = 1; s <= item.targetSets; s++) {
          initialSets.push({
            id: 'set_' + Math.random().toString(36).substring(2, 9),
            exerciseId: item.exerciseId,
            setNumber: s,
            setType: 'normal',
            reps: item.targetReps,
            weightKg: item.targetWeightKg || 0,
            isCompleted: false,
          });
        }
      });
    }

    const newSession: WorkoutSession = {
      id: 'session_' + Date.now(),
      templateId: tpl?.id,
      title,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      sets: initialSets,
      totalVolumeKg: 0,
    };

    setActiveSession(newSession);
    setViewingTemplate(null);
    setTab('active');
  };

  // Cancel / discard workout with ZERO annoying dialog popups
  const cancelActiveWorkout = () => {
    setActiveSession(null);
    setTab('routines');
  };

  // Add a new exercise to the active workout
  const addExerciseToActive = (exerciseId: string) => {
    if (!activeSession) return;
    const existing = activeSession.sets.filter((s) => s.exerciseId === exerciseId);
    const newSet: WorkoutSet = {
      id: 'set_' + Math.random().toString(36).substring(2, 9),
      exerciseId,
      setNumber: existing.length + 1,
      setType: 'normal',
      reps: 10,
      weightKg: 0,
      isCompleted: false,
    };
    setActiveSession({
      ...activeSession,
      sets: [...activeSession.sets, newSet],
    });
    setAddExToActiveModalOpen(false);
  };

  // Remove entire exercise from active workout
  const removeExerciseFromActive = (exerciseId: string) => {
    if (!activeSession) return;
    setActiveSession({
      ...activeSession,
      sets: activeSession.sets.filter((s) => s.exerciseId !== exerciseId),
    });
  };

  // Remove single set from active workout
  const removeSetFromActive = (setId: string) => {
    if (!activeSession) return;
    setActiveSession({
      ...activeSession,
      sets: activeSession.sets.filter((s) => s.id !== setId),
    });
  };

  // Toggle set completion in active workout
  const toggleSet = (setId: string) => {
    if (!activeSession) return;
    const updatedSets = activeSession.sets.map((s) =>
      s.id === setId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    setActiveSession({ ...activeSession, sets: updatedSets });
  };

  // Update set values
  const updateSet = (setId: string, reps: number, weightKg: number) => {
    if (!activeSession) return;
    const updatedSets = activeSession.sets.map((s) =>
      s.id === setId ? { ...s, reps, weightKg } : s
    );
    setActiveSession({ ...activeSession, sets: updatedSets });
  };

  // Add another set to an exercise in active workout
  const addSetToActive = (exerciseId: string) => {
    if (!activeSession) return;
    const existing = activeSession.sets.filter((s) => s.exerciseId === exerciseId);
    const last = existing[existing.length - 1];
    const newSet: WorkoutSet = {
      id: 'set_' + Math.random().toString(36).substring(2, 9),
      exerciseId,
      setNumber: existing.length + 1,
      setType: 'normal',
      reps: last ? last.reps : 10,
      weightKg: last ? last.weightKg : 0,
      isCompleted: false,
    };
    setActiveSession({ ...activeSession, sets: [...activeSession.sets, newSet] });
  };

  // Finish active workout
  const finishActiveWorkout = () => {
    if (!activeSession) return;
    const completedSets = activeSession.sets.filter((s) => s.isCompleted);
    const volume = completedSets.reduce((acc, curr) => acc + curr.reps * curr.weightKg, 0);

    const finished: WorkoutSession = {
      ...activeSession,
      status: 'completed',
      endedAt: new Date().toISOString(),
      totalVolumeKg: volume,
    };

    StorageAPI.saveWorkoutSession(finished);
    setActiveSession(null);
    setTab('history');
    refreshStorage();
  };

  // Open Create Routine Modal
  const openCreateRoutine = () => {
    setEditingTemplate(null);
    setRoutineTitle('');
    setRoutineDescription('');
    setRoutineCover('/images/workouts/push.jpg');
    setSelectedRoutineItems([]);
    setRoutineExSearch('');
    setRoutineMuscleFilter('All');
    setRoutineError('');
    setRoutineModalOpen(true);
  };

  // Open Edit Routine Modal
  const openEditRoutine = (tpl: WorkoutTemplate) => {
    setEditingTemplate(tpl);
    setRoutineTitle(tpl.title);
    setRoutineDescription(tpl.description || '');
    setRoutineCover(tpl.imageUrl || getWorkoutCover(tpl.title));
    setSelectedRoutineItems(
      tpl.items.map((it) => ({
        exerciseId: it.exerciseId,
        targetSets: it.targetSets || 3,
        targetReps: it.targetReps || 10,
        targetWeightKg: it.targetWeightKg || 0,
      }))
    );
    setRoutineExSearch('');
    setRoutineMuscleFilter('All');
    setRoutineError('');
    setViewingTemplate(null);
    setRoutineModalOpen(true);
  };

  // Add / remove exercise in routine editor
  const toggleRoutineExercise = (exId: string) => {
    const exists = selectedRoutineItems.some((it) => it.exerciseId === exId);
    if (exists) {
      setSelectedRoutineItems(selectedRoutineItems.filter((it) => it.exerciseId !== exId));
    } else {
      setRoutineError('');
      setSelectedRoutineItems([
        ...selectedRoutineItems,
        { exerciseId: exId, targetSets: 3, targetReps: 10, targetWeightKg: 0 },
      ]);
    }
  };

  const updateRoutineItemSets = (exId: string, sets: number) => {
    setSelectedRoutineItems(
      selectedRoutineItems.map((it) =>
        it.exerciseId === exId ? { ...it, targetSets: Math.max(1, sets) } : it
      )
    );
  };

  const updateRoutineItemReps = (exId: string, reps: number) => {
    setSelectedRoutineItems(
      selectedRoutineItems.map((it) =>
        it.exerciseId === exId ? { ...it, targetReps: Math.max(1, reps) } : it
      )
    );
  };

  const moveRoutineItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= selectedRoutineItems.length) return;
    const reordered = [...selectedRoutineItems];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setSelectedRoutineItems(reordered);
  };

  // Save or update routine
  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineTitle.trim()) {
      setRoutineError('Please enter a routine title');
      return;
    }
    if (selectedRoutineItems.length === 0) {
      setRoutineError('Please add at least one exercise to your routine');
      return;
    }
    setRoutineError('');

    const items = selectedRoutineItems.map((item, idx) => ({
      id: 'item_' + idx,
      exerciseId: item.exerciseId,
      targetSets: Number(item.targetSets) || 3,
      targetReps: Number(item.targetReps) || 10,
      targetWeightKg: Number(item.targetWeightKg) || 0,
      restSeconds: 60,
    }));

    if (editingTemplate) {
      const updatedTpl: WorkoutTemplate = {
        ...editingTemplate,
        title: routineTitle.trim(),
        description: routineDescription.trim() || undefined,
        imageUrl: routineCover || getWorkoutCover(routineTitle),
        items,
        updatedAt: new Date().toISOString(),
      };
      StorageAPI.saveWorkoutTemplate(updatedTpl);
    } else {
      const newTpl: WorkoutTemplate = {
        id: 'tpl_' + Date.now(),
        title: routineTitle.trim(),
        description: routineDescription.trim() || undefined,
        imageUrl: routineCover || getWorkoutCover(routineTitle),
        items,
        scheduledDays: [1, 3, 5],
        createdAt: new Date().toISOString(),
      };
      StorageAPI.saveWorkoutTemplate(newTpl);
    }

    setRoutineModalOpen(false);
    setEditingTemplate(null);
    refreshStorage();
  };

  // Delete routine permanently without resurrecting
  const handleDeleteRoutine = (id: string) => {
    StorageAPI.deleteWorkoutTemplate(id);
    setTemplates(StorageAPI.getWorkoutTemplates());
    refreshStorage();
  };

  // Create custom exercise
  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const newEx: Exercise = {
      id: 'ex_custom_' + Date.now(),
      name: newExName.trim(),
      muscleGroup: newExMuscle,
      equipment: newExEquipment,
      exerciseType: newExType,
      instructions: newExInstructions.trim() || undefined,
      imageUrl: newExImageUrl.trim() || undefined,
      isCustom: true,
    };

    StorageAPI.saveExercise(newEx);
    setExercises(StorageAPI.getExercises());
    setExModalOpen(false);
    setNewExName('');
    setNewExInstructions('');
    setNewExImageUrl('');
    refreshStorage();
  };

  // Delete custom exercise
  const handleDeleteExercise = (id: string) => {
    StorageAPI.deleteExercise(id);
    setExercises(StorageAPI.getExercises());
    refreshStorage();
  };

  // Filter exercises in Library
  const filteredExercises = exercises.filter((ex) => {
    if (muscleFilter !== 'All' && ex.muscleGroup !== muscleFilter) return false;
    if (equipmentFilter !== 'All' && ex.equipment !== equipmentFilter) return false;
    if (exerciseSearch.trim()) {
      const q = exerciseSearch.toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q) ||
        ex.muscleGroup.toLowerCase().includes(q) ||
        (ex.instructions && ex.instructions.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filter exercises inside Routine Modal
  const routineAvailableExercises = exercises.filter((ex) => {
    if (routineMuscleFilter !== 'All' && ex.muscleGroup !== routineMuscleFilter) return false;
    if (routineExSearch.trim()) {
      const q = routineExSearch.toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q) ||
        ex.muscleGroup.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter exercises for Active Workout Add Modal
  const activeAvailableExercises = exercises.filter((ex) => {
    if (activeMuscleFilter !== 'All' && ex.muscleGroup !== activeMuscleFilter) return false;
    if (activeExSearch.trim()) {
      const q = activeExSearch.toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q) ||
        ex.muscleGroup.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Fitness & Workout Tracker
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Structured workout routines, set-by-set logging, and exercise history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSession ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setTab('active')}
              className="gap-1.5 animate-pulse cursor-pointer"
            >
              <Activity size={14} />
              <span>Resume Active Workout</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => startWorkout()}
              className="gap-1.5 bg-[#E50914] hover:bg-[#C11119] text-white cursor-pointer font-bold"
            >
              <Play size={14} />
              <span>Quick Session</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#141414] border border-[#242424] rounded-xl text-xs w-fit">
        {[
          { id: 'routines', label: 'Routines' },
          { id: 'active', label: 'Active Session' },
          { id: 'exercises', label: 'Exercise Library' },
          { id: 'history', label: 'History' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-3 py-1.5 rounded-lg transition-colors text-xs cursor-pointer ${
              tab === t.id
                ? 'bg-[#E50914] text-white font-semibold'
                : 'text-[#AAAAAA] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. ROUTINES VIEW */}
      {tab === 'routines' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-[#F3F4F6]">Your Workout Routines</h3>
            <Button size="sm" onClick={openCreateRoutine} className="bg-[#E50914] hover:bg-[#C11119] text-white gap-1.5 cursor-pointer font-bold">
              <Plus size={14} />
              <span>Create Routine</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <Card
                key={tpl.id}
                className="p-0 overflow-hidden flex flex-col justify-between bg-[#141414] border border-[#242424] hover:border-[#383838] transition-colors rounded-xl group cursor-pointer"
                onClick={() => setViewingTemplate(tpl)}
              >
                <div>
                  {/* Workout Banner Image */}
                  <div className="relative h-36 w-full overflow-hidden bg-[#0A0A0A]">
                    <img
                      src={tpl.imageUrl || getWorkoutCover(tpl.title)}
                      alt={tpl.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="bg-[#000000]/85 backdrop-blur-sm border border-[#333333] text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                        {tpl.items.length} Movements
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-3.5 right-3.5">
                      <h4 className="font-heading font-bold text-base text-white truncate drop-shadow">
                        {tpl.title}
                      </h4>
                      {tpl.description && (
                        <p className="text-[11px] text-[#CCCCCC] truncate drop-shadow-sm mt-0.5">
                          {tpl.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Exercises preview */}
                  <div className="p-3.5 space-y-1.5 text-xs">
                    {tpl.items.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[#AAAAAA]">
                        <span className="truncate flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] shrink-0" />
                          <span className="truncate">{exerciseMap.get(item.exerciseId)?.name || 'Exercise'}</span>
                        </span>
                        <span className="font-mono text-[#777777] text-[11px] shrink-0 ml-2">
                          {item.targetSets} × {item.targetReps}
                        </span>
                      </div>
                    ))}
                    {tpl.items.length > 4 && (
                      <p className="text-[11px] text-[#666666] pt-0.5 font-mono">
                        +{tpl.items.length - 4} more movements...
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className="p-3 pt-0 flex items-center justify-between border-t border-[#1C1C1C] mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteRoutine(tpl.id)}
                      className="h-8 w-8 text-[#777777] hover:text-[#EF4444] cursor-pointer"
                      title="Delete routine permanently"
                    >
                      <Trash2 size={13} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditRoutine(tpl)}
                      className="h-8 w-8 text-[#777777] hover:text-white cursor-pointer"
                      title="Edit routine"
                    >
                      <Edit2 size={13} />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewingTemplate(tpl)}
                      className="text-xs gap-1 border-[#282828] text-[#CCCCCC] hover:text-white cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Open</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => startWorkout(tpl)}
                      className="gap-1.5 bg-[#E50914] hover:bg-[#C11119] text-white cursor-pointer font-bold"
                    >
                      <Play size={12} />
                      <span>Start</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {templates.length === 0 && (
              <div className="col-span-full text-center py-14 bg-[#141414] border border-[#242424] rounded-xl">
                <Dumbbell size={36} className="mx-auto text-[#777777] mb-2 opacity-40" />
                <p className="text-sm font-medium text-[#AAAAAA]">No routines in your account</p>
                <p className="text-xs text-[#777777] mt-1">
                  Default routines were deleted. Create your own custom routines anytime.
                </p>
                <Button size="sm" onClick={openCreateRoutine} className="mt-3 bg-[#E50914] text-white font-bold cursor-pointer">
                  + Create Custom Routine
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ACTIVE SESSION VIEW (WITH COMPLETE QUICK LOGGING) */}
      {tab === 'active' && (
        <div className="space-y-4">
          {activeSession ? (
            <div className="space-y-4">
              {/* Active Session Header Bar */}
              <Card className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-[#141414] border border-[#242424]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#E50914] font-bold block mb-1">
                    Active Workout Session
                  </span>
                  <h3 className="text-lg font-bold text-white font-heading">{activeSession.title}</h3>
                  <p className="text-xs text-[#AAAAAA] mt-0.5">
                    Started at {new Date(activeSession.startedAt).toLocaleTimeString()} •{' '}
                    {activeSession.sets.filter((s) => s.isCompleted).length} of {activeSession.sets.length} sets completed
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelActiveWorkout}
                    className="border-[#282828] text-[#888888] hover:text-[#EF4444] hover:border-[#EF4444]/40 cursor-pointer text-xs"
                    title="Discard active workout session"
                  >
                    Cancel Workout
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setActiveExSearch('');
                      setActiveMuscleFilter('All');
                      setAddExToActiveModalOpen(true);
                    }}
                    className="bg-[#242424] hover:bg-[#333333] text-white font-semibold text-xs gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Movement</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={finishActiveWorkout}
                    className="bg-[#10B981] hover:bg-[#059669] text-white font-bold gap-1.5 cursor-pointer text-xs"
                  >
                    <CheckCircle2 size={15} />
                    <span>Finish Workout</span>
                  </Button>
                </div>
              </Card>

              {/* Exercises in active workout */}
              <Card className="p-4 bg-[#141414] border border-[#242424]">
                {activeSession.sets.length > 0 ? (
                  <div className="space-y-6">
                    {Array.from(new Set(activeSession.sets.map((s) => s.exerciseId))).map((exId) => {
                      const ex = exerciseMap.get(exId);
                      const exerciseSets = activeSession.sets.filter((s) => s.exerciseId === exId);

                      return (
                        <div key={exId} className="space-y-2.5 pb-4 border-b border-[#1C1C1C] last:border-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              {ex && (
                                <MuscleDiagram
                                  muscleGroup={ex.muscleGroup}
                                  imageUrl={ex.imageUrl}
                                  imageUrlFinish={ex.imageUrlFinish}
                                  size="sm"
                                  className="shrink-0"
                                />
                              )}
                              <div>
                                <h4 className="text-sm font-bold text-white font-heading">
                                  {ex?.name || 'Custom Exercise'}
                                </h4>
                                <span className="text-[10px] text-[#777777] uppercase font-mono">
                                  {ex?.muscleGroup} • {ex?.equipment}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeExerciseFromActive(exId)}
                              className="text-[#666666] hover:text-[#EF4444] p-1 rounded hover:bg-[#201112] transition-colors cursor-pointer text-xs flex items-center gap-1"
                              title="Remove this exercise from active session"
                            >
                              <Trash2 size={13} />
                              <span className="hidden sm:inline text-[11px]">Remove</span>
                            </button>
                          </div>

                          {/* Sets list */}
                          <div className="space-y-1.5">
                            {exerciseSets.map((st, sIdx) => (
                              <div
                                key={st.id}
                                className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                                  st.isCompleted
                                    ? 'bg-[#10B981]/10 border border-[#10B981]/30 text-white'
                                    : 'bg-[#0F0F0F] border border-[#242424] text-[#CCCCCC]'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-[11px] text-[#777777] w-6">
                                    #{sIdx + 1}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min="0"
                                      value={st.weightKg || ''}
                                      placeholder="0"
                                      onChange={(e) => updateSet(st.id, st.reps, parseFloat(e.target.value) || 0)}
                                      className="w-16 px-2 py-1 bg-[#1A1A1A] border border-[#333333] rounded text-center text-xs text-white outline-none"
                                    />
                                    <span className="text-[10px] text-[#777777]">kg</span>
                                  </div>
                                  <span className="text-[#555555]">×</span>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min="1"
                                      value={st.reps}
                                      onChange={(e) => updateSet(st.id, parseInt(e.target.value) || 1, st.weightKg)}
                                      className="w-14 px-2 py-1 bg-[#1A1A1A] border border-[#333333] rounded text-center text-xs text-white outline-none"
                                    />
                                    <span className="text-[10px] text-[#777777]">reps</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => toggleSet(st.id)}
                                    className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                                      st.isCompleted
                                        ? 'bg-[#10B981] text-white'
                                        : 'bg-[#222222] text-[#888888] hover:text-white'
                                    }`}
                                  >
                                    {st.isCompleted ? '✓ Completed' : 'Complete Set'}
                                  </button>
                                  {exerciseSets.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeSetFromActive(st.id)}
                                      className="text-[#555555] hover:text-[#EF4444] p-1"
                                      title="Delete set"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addSetToActive(exId)}
                            className="text-xs text-[#777777] hover:text-white cursor-pointer"
                          >
                            + Add Set
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* EMPTY QUICK WORKOUT STARTER */
                  <div className="text-center py-12 bg-[#0E0E0E] border border-dashed border-[#242424] rounded-xl space-y-3">
                    <Dumbbell size={38} className="mx-auto text-[#E50914] opacity-80" />
                    <h4 className="text-base font-bold text-white font-heading">Quick Session Ready to Log</h4>
                    <p className="text-xs text-[#888888] max-w-sm mx-auto">
                      Click below to add your first movement and begin recording your weight and reps.
                    </p>
                    <Button
                      onClick={() => {
                        setActiveExSearch('');
                        setActiveMuscleFilter('All');
                        setAddExToActiveModalOpen(true);
                      }}
                      className="bg-[#E50914] hover:bg-[#C11119] text-white font-bold gap-1.5 cursor-pointer mt-1"
                    >
                      <Plus size={14} />
                      <span>Select First Movement</span>
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="text-center py-16 bg-[#141414] border border-[#242424] rounded-xl">
              <Dumbbell size={40} className="mx-auto text-[#777777] mb-3 opacity-40" />
              <h3 className="text-base font-semibold text-white font-heading">No Active Workout</h3>
              <p className="text-xs text-[#AAAAAA] mt-1 max-w-sm mx-auto">
                Select a routine from the Routines tab or start a quick workout now.
              </p>
              <Button onClick={() => startWorkout()} size="md" className="mt-4 gap-2 bg-[#E50914] text-white font-bold cursor-pointer">
                <Play size={15} />
                <span>Start Quick Session Now</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 3. EXERCISE LIBRARY (WITH INSTANT SEARCH & FILTERS) */}
      {tab === 'exercises' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-heading">Movement Library</span>
              <span className="text-xs font-mono text-[#E50914] bg-[#E50914]/10 px-2 py-0.5 rounded-full border border-[#E50914]/30">
                {filteredExercises.length} movements
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => setExModalOpen(true)}
              className="gap-1.5 bg-[#E50914] hover:bg-[#C11119] text-white shrink-0 cursor-pointer font-bold"
            >
              <Plus size={14} />
              <span>Add Custom Exercise</span>
            </Button>
          </div>

          {/* Search Bar & Muscle Filters */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1 flex items-center px-3 py-2 bg-[#141414] border border-[#242424] focus-within:border-[#E50914] rounded-xl text-xs transition-colors">
                <Search size={14} className="text-[#777777] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search exercises by name, equipment, or muscle..."
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  className="bg-transparent border-0 p-0 text-xs text-white placeholder-[#777777] outline-none focus:outline-none w-full"
                />
                {exerciseSearch && (
                  <button
                    type="button"
                    onClick={() => setExerciseSearch('')}
                    className="text-[#777777] hover:text-white p-0.5 ml-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
                className="bg-[#141414] border border-[#242424] text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-[#E50914]"
              >
                <option value="All">All Equipment</option>
                <option value="Barbell">Barbell</option>
                <option value="Dumbbell">Dumbbell</option>
                <option value="Cable">Cable</option>
                <option value="Machine">Machine</option>
                <option value="Bodyweight">Bodyweight</option>
                <option value="Kettlebell">Kettlebell</option>
              </select>
            </div>

            {/* Muscle Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {MUSCLE_GROUPS.map((mg) => (
                <button
                  key={mg}
                  type="button"
                  onClick={() => setMuscleFilter(mg)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    muscleFilter === mg
                      ? 'bg-[#E50914] text-white'
                      : 'bg-[#141414] text-[#AAAAAA] hover:text-white border border-[#242424]'
                  }`}
                >
                  {mg}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredExercises.map((ex) => (
              <Card
                key={ex.id}
                className="p-3.5 bg-[#141414] border border-[#242424] hover:border-[#383838] transition-colors group cursor-pointer"
                onClick={() => setDetailEx(ex)}
              >
                <div className="flex items-start gap-3">
                  <MuscleDiagram
                    muscleGroup={ex.muscleGroup}
                    imageUrl={ex.imageUrl}
                    imageUrlFinish={ex.imageUrlFinish}
                    size="md"
                    className="shrink-0 group-hover:border-[#E50914] transition-colors"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className="text-xs font-bold text-white font-heading truncate group-hover:text-[#E50914] transition-colors">
                        {ex.name}
                      </h4>
                      {ex.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteExercise(ex.id);
                          }}
                          className="text-[#666666] hover:text-[#EF4444] p-0.5 shrink-0 cursor-pointer"
                          title="Delete custom exercise"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono text-[#E50914] bg-[#E50914]/10 border border-[#E50914]/30 px-1.5 py-0.2 rounded font-semibold">
                        {ex.muscleGroup}
                      </span>
                      <span className="text-[10px] text-[#777777]">•</span>
                      <span className="text-[10px] text-[#AAAAAA] truncate">{ex.equipment}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#1C1C1C] text-[10px] text-[#666666]">
                      <span className="uppercase font-mono">{ex.exerciseType.replace('_', ' ')}</span>
                      <span className="flex items-center gap-1 text-[#888888] group-hover:text-white transition-colors">
                        <Eye size={11} /> Guide
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {filteredExercises.length === 0 && (
              <div className="col-span-full text-center py-14 bg-[#141414] border border-[#242424] rounded-xl">
                <Search size={32} className="mx-auto text-[#666666] mb-2" />
                <p className="text-sm font-semibold text-white">No exercises match your search</p>
                <p className="text-xs text-[#777777] mt-1">
                  Try adjusting your keywords or clearing the muscle filters.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setExerciseSearch('');
                    setMuscleFilter('All');
                    setEquipmentFilter('All');
                  }}
                  className="mt-3 gap-1.5 text-xs border-[#2A2A2A] cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Reset Filters</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. WORKOUT HISTORY */}
      {tab === 'history' && (
        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.map((sess) => (
              <Card key={sess.id} className="flex items-center justify-between p-3.5 bg-[#141414] border border-[#242424]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#1D2128] border border-[#2A2F38] flex items-center justify-center text-[#EF4444]">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F3F4F6]">{sess.title}</h4>
                    <p className="text-xs text-[#737B89]">
                      {new Date(sess.startedAt).toLocaleDateString()} •{' '}
                      {sess.sets.filter((s) => s.isCompleted).length} sets completed
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-[#F3F4F6]">
                    {sess.totalVolumeKg.toLocaleString()} kg
                  </span>
                  <span className="text-[10px] text-[#737B89] block">Total Volume</span>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-14 bg-[#141414] border border-[#242424] rounded-xl">
              <History size={36} className="mx-auto text-[#777777] mb-2 opacity-40" />
              <p className="text-sm font-medium text-[#AAAAAA]">No completed workouts yet</p>
              <p className="text-xs text-[#777777] mt-1">
                Completed workouts will record volume, completed sets, and dates here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD MOVEMENT TO ACTIVE WORKOUT                     */}
      {/* ======================================================== */}
      {addExToActiveModalOpen && (
        <Modal
          isOpen={addExToActiveModalOpen}
          onClose={() => setAddExToActiveModalOpen(false)}
          title="Add Exercise to Active Session"
          size="md"
        >
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center px-3 py-1.5 bg-[#141414] border border-[#242424] focus-within:border-[#E50914] rounded-lg text-xs">
                <Search size={13} className="text-[#666666] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search movement to add..."
                  value={activeExSearch}
                  onChange={(e) => setActiveExSearch(e.target.value)}
                  className="bg-transparent border-0 p-0 text-xs text-white placeholder-[#666666] outline-none w-full"
                  autoFocus
                />
                {activeExSearch && (
                  <button
                    type="button"
                    onClick={() => setActiveExSearch('')}
                    className="text-[#666666] hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <select
                value={activeMuscleFilter}
                onChange={(e) => setActiveMuscleFilter(e.target.value)}
                className="bg-[#141414] border border-[#242424] text-xs text-white px-2.5 py-1.5 rounded-lg outline-none"
              >
                {MUSCLE_GROUPS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 border border-[#242424] p-2 rounded-xl bg-[#0A0A0A]">
              {activeAvailableExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#121212] hover:bg-[#181818] border border-[#202020] text-[#CCCCCC] text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MuscleDiagram
                      muscleGroup={ex.muscleGroup}
                      imageUrl={ex.imageUrl}
                      imageUrlFinish={ex.imageUrlFinish}
                      size="sm"
                      className="shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-white truncate block">{ex.name}</span>
                      <span className="text-[10px] text-[#777777] font-mono">
                        {ex.muscleGroup} • {ex.equipment}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => addExerciseToActive(ex.id)}
                    className="bg-[#E50914] hover:bg-[#C11119] text-white text-xs font-bold shrink-0 ml-2 cursor-pointer"
                  >
                    + Add to Session
                  </Button>
                </div>
              ))}

              {activeAvailableExercises.length === 0 && (
                <div className="text-center py-6 text-xs text-[#666666]">
                  No exercises match your search
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#202020]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddExToActiveModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* OPEN ROUTINE (INSPECTION MODAL)                          */}
      {/* ======================================================== */}
      {viewingTemplate && (
        <Modal
          isOpen={!!viewingTemplate}
          onClose={() => setViewingTemplate(null)}
          title={viewingTemplate.title}
          size="lg"
        >
          <div className="space-y-4">
            {/* Banner Cover */}
            <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#242424]">
              <img
                src={viewingTemplate.imageUrl || getWorkoutCover(viewingTemplate.title)}
                alt={viewingTemplate.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/50 to-transparent" />
              <div className="absolute top-3 right-3">
                <span className="bg-[#000000]/85 backdrop-blur-sm border border-[#333333] text-white text-xs font-mono px-2.5 py-1 rounded-full font-bold">
                  {viewingTemplate.items.length} Movements
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-xl font-heading font-black text-white drop-shadow">
                  {viewingTemplate.title}
                </h3>
                {viewingTemplate.description && (
                  <p className="text-xs text-[#CCCCCC] mt-0.5 line-clamp-2">
                    {viewingTemplate.description}
                  </p>
                )}
              </div>
            </div>

            {/* Movements List Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#AAAAAA] uppercase tracking-wider font-mono">
                Routine Movements & Prescribed Sets
              </h4>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {viewingTemplate.items.map((item, idx) => {
                  const ex = exerciseMap.get(item.exerciseId);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-[#141414] border border-[#242424] rounded-xl hover:border-[#333333] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#202020] text-[#AAAAAA] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        {ex && (
                          <MuscleDiagram
                            muscleGroup={ex.muscleGroup}
                            imageUrl={ex.imageUrl}
                            imageUrlFinish={ex.imageUrlFinish}
                            size="sm"
                            className="shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {ex?.name || 'Movement'}
                          </p>
                          <p className="text-[10px] text-[#777777] font-mono truncate">
                            {ex?.muscleGroup} • {ex?.equipment}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-white block">
                            {item.targetSets} sets × {item.targetReps} reps
                          </span>
                          {item.targetWeightKg && item.targetWeightKg > 0 ? (
                            <span className="text-[10px] text-[#E50914] font-mono">
                              @{item.targetWeightKg} kg
                            </span>
                          ) : null}
                        </div>
                        {ex && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDetailEx(ex)}
                            className="h-7 w-7 text-[#777777] hover:text-white cursor-pointer"
                            title="View exercise instructions"
                          >
                            <Eye size={13} />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#222222]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditRoutine(viewingTemplate)}
                className="gap-1.5 border-[#2A2A2A] text-[#CCCCCC] hover:text-white cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit Routine</span>
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingTemplate(null)}
                  className="cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => startWorkout(viewingTemplate)}
                  className="bg-[#E50914] hover:bg-[#C11119] text-white font-bold gap-1.5 cursor-pointer"
                >
                  <Play size={13} />
                  <span>Start Workout</span>
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* CREATE & EDIT ROUTINE MODAL (WITH FAST EXERCISE SEARCH)  */}
      {/* ======================================================== */}
      <Modal
        isOpen={routineModalOpen}
        onClose={() => {
          setRoutineModalOpen(false);
          setEditingTemplate(null);
        }}
        title={editingTemplate ? `Edit Routine: ${editingTemplate.title}` : 'Create Workout Routine'}
        description="Search and pick exercises, set target sets & reps, and choose a banner."
        size="lg"
      >
        <form onSubmit={handleSaveRoutine} noValidate className="space-y-4">
          {routineError && (
            <div className="p-3 rounded-xl bg-[#201112] border border-[#E50914]/40 text-[#FFA3A7] text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle size={15} className="text-[#E50914] shrink-0" />
              <span>{routineError}</span>
            </div>
          )}

          <Input
            label="Routine Title *"
            placeholder="e.g. Chest & Back Hypertrophy, Leg Day"
            value={routineTitle}
            onChange={(e) => {
              setRoutineTitle(e.target.value);
              if (routineError) setRoutineError('');
            }}
            autoFocus
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. High intensity hypertrophy focus on upper body compound lifts"
            value={routineDescription}
            onChange={(e) => setRoutineDescription(e.target.value)}
          />

          {/* Banner Preset Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#AAAAAA]">
                Routine Cover Banner
              </label>
              <span className="text-[10px] text-[#666666] font-mono">
                Pick a cover theme
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {WORKOUT_COVER_PRESETS.map((p) => {
                const coverPath = p.imageUrl || p.url;
                const isSelected = routineCover === coverPath;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setRoutineCover(coverPath)}
                    className={`relative h-16 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#E50914] ring-2 ring-[#E50914] shadow-md shadow-[#E50914]/30'
                        : 'border-[#242424] opacity-75 hover:opacity-100 hover:border-[#444444]'
                    }`}
                  >
                    <img
                      src={coverPath}
                      alt={p.label}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E50914] flex items-center justify-center text-white shadow-md z-10">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-[#000000]/85 text-[9px] text-center text-white truncate py-0.5 font-bold">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SELECTED EXERCISES LIST */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-white">
                Selected Movements ({selectedRoutineItems.length})
              </label>
              <span className="text-[10px] text-[#777777]">
                Configure target sets & reps below
              </span>
            </div>

            {selectedRoutineItems.length > 0 ? (
              <div className="max-h-52 overflow-y-auto space-y-1.5 border border-[#242424] p-2 rounded-xl bg-[#0D0D0D]">
                {selectedRoutineItems.map((item, idx) => {
                  const ex = exerciseMap.get(item.exerciseId);
                  return (
                    <div
                      key={item.exerciseId}
                      className="flex items-center justify-between p-2 bg-[#141414] border border-[#222222] rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex flex-col">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveRoutineItem(idx, 'up')}
                            className="text-[#666666] hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronUp size={11} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === selectedRoutineItems.length - 1}
                            onClick={() => moveRoutineItem(idx, 'down')}
                            className="text-[#666666] hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronDown size={11} />
                          </button>
                        </div>
                        <span className="font-mono text-[10px] text-[#777777] w-4">
                          {idx + 1}.
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{ex?.name || 'Exercise'}</p>
                          <p className="text-[10px] text-[#777777]">{ex?.muscleGroup}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={item.targetSets}
                            onChange={(e) => updateRoutineItemSets(item.exerciseId, parseInt(e.target.value) || 1)}
                            className="w-11 px-1.5 py-1 bg-[#1A1A1A] border border-[#333333] rounded text-center text-xs text-white"
                            title="Target Sets"
                          />
                          <span className="text-[10px] text-[#666666]">sets</span>
                        </div>
                        <span className="text-[#555555]">×</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={item.targetReps}
                            onChange={(e) => updateRoutineItemReps(item.exerciseId, parseInt(e.target.value) || 1)}
                            className="w-12 px-1.5 py-1 bg-[#1A1A1A] border border-[#333333] rounded text-center text-xs text-white"
                            title="Target Reps"
                          />
                          <span className="text-[10px] text-[#666666]">reps</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleRoutineExercise(item.exerciseId)}
                          className="text-[#666666] hover:text-[#EF4444] p-1 ml-1 cursor-pointer"
                          title="Remove movement"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-center border border-dashed border-[#282828] rounded-xl text-xs text-[#777777]">
                No exercises added yet. Search and pick exercises below.
              </div>
            )}
          </div>

          {/* SEARCH & PICK EXERCISES */}
          <div className="pt-2 border-t border-[#202020] space-y-2">
            <label className="text-xs font-semibold text-[#AAAAAA] block">
              Search Exercises to Add
            </label>

            <div className="flex gap-2">
              <div className="flex-1 flex items-center px-3 py-1.5 bg-[#141414] border border-[#242424] focus-within:border-[#E50914] rounded-lg text-xs">
                <Search size={13} className="text-[#666666] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Filter by name (e.g. Bench, Squat, Curl)..."
                  value={routineExSearch}
                  onChange={(e) => setRoutineExSearch(e.target.value)}
                  className="bg-transparent border-0 p-0 text-xs text-white placeholder-[#666666] outline-none w-full"
                />
                {routineExSearch && (
                  <button
                    type="button"
                    onClick={() => setRoutineExSearch('')}
                    className="text-[#666666] hover:text-white cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <select
                value={routineMuscleFilter}
                onChange={(e) => setRoutineMuscleFilter(e.target.value)}
                className="bg-[#141414] border border-[#242424] text-xs text-white px-2.5 py-1.5 rounded-lg outline-none"
              >
                {MUSCLE_GROUPS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Exercise Picker List */}
            <div className="max-h-48 overflow-y-auto space-y-1 border border-[#242424] p-2 rounded-xl bg-[#0A0A0A]">
              {routineAvailableExercises.map((ex) => {
                const isSelected = selectedRoutineItems.some((it) => it.exerciseId === ex.id);
                return (
                  <div
                    key={ex.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#1C0D0E] border border-[#E50914]/40 text-white'
                        : 'bg-[#121212] hover:bg-[#181818] border border-[#202020] text-[#CCCCCC]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MuscleDiagram
                        muscleGroup={ex.muscleGroup}
                        imageUrl={ex.imageUrl}
                        imageUrlFinish={ex.imageUrlFinish}
                        size="sm"
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-medium truncate block">{ex.name}</span>
                        <span className="text-[10px] text-[#777777] font-mono">
                          {ex.muscleGroup} • {ex.equipment}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleRoutineExercise(ex.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ml-2 ${
                        isSelected
                          ? 'bg-[#E50914] text-white hover:bg-[#C11119]'
                          : 'bg-[#222222] text-[#AAAAAA] hover:text-white hover:bg-[#333333]'
                      }`}
                    >
                      {isSelected ? '✓ Added' : '+ Add'}
                    </button>
                  </div>
                );
              })}

              {routineAvailableExercises.length === 0 && (
                <div className="text-center py-6 text-xs text-[#666666]">
                  No exercises match '{routineExSearch}'
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#242424]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setRoutineModalOpen(false);
                setEditingTemplate(null);
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#E50914] hover:bg-[#C11119] text-white font-bold cursor-pointer">
              {editingTemplate ? 'Update Routine' : 'Save Routine'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* CUSTOM EXERCISE MODAL                                    */}
      {/* ======================================================== */}
      <Modal
        isOpen={exModalOpen}
        onClose={() => setExModalOpen(false)}
        title="Add Custom Exercise"
      >
        <form onSubmit={handleCreateExercise} className="space-y-4">
          <Input
            label="Exercise Name"
            placeholder="e.g. Incline Smith Machine Press"
            value={newExName}
            onChange={(e) => setNewExName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Primary Muscle Group"
              value={newExMuscle}
              onChange={(e) => setNewExMuscle(e.target.value as any)}
              options={[
                { value: 'Chest', label: 'Chest' },
                { value: 'Back', label: 'Back' },
                { value: 'Legs', label: 'Legs' },
                { value: 'Shoulders', label: 'Shoulders' },
                { value: 'Arms', label: 'Arms' },
                { value: 'Core', label: 'Core / Abs' },
                { value: 'Cardio', label: 'Cardio' },
              ]}
            />

            <Select
              label="Equipment"
              value={newExEquipment}
              onChange={(e) => setNewExEquipment(e.target.value as any)}
              options={[
                { value: 'Barbell', label: 'Barbell' },
                { value: 'Dumbbell', label: 'Dumbbell' },
                { value: 'Machine', label: 'Machine' },
                { value: 'Cable', label: 'Cable' },
                { value: 'Bodyweight', label: 'Bodyweight' },
                { value: 'Kettlebell', label: 'Kettlebell' },
              ]}
            />
          </div>

          <Select
            label="Tracking Metric"
            value={newExType}
            onChange={(e) => setNewExType(e.target.value as any)}
            options={[
              { value: 'weight_reps', label: 'Weight & Reps (Strength)' },
              { value: 'reps_only', label: 'Reps Only (Calisthenics)' },
              { value: 'distance_time', label: 'Distance & Time (Running / Rowing)' },
              { value: 'time_only', label: 'Time Only (Planks / Intervals)' },
            ]}
          />

          <Input
            label="Exercise Image URL (Optional)"
            placeholder="https://images.unsplash.com/... or /images/..."
            value={newExImageUrl}
            onChange={(e) => setNewExImageUrl(e.target.value)}
          />

          <Textarea
            label="Form Cues & Instructions (Optional)"
            placeholder="e.g. Keep chest high, pause at the bottom for 1 second..."
            value={newExInstructions}
            onChange={(e) => setNewExInstructions(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-[#242424]">
            <Button type="button" variant="ghost" onClick={() => setExModalOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" className="bg-[#E50914] hover:bg-[#C11119] text-white cursor-pointer font-bold">
              Create Exercise
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* EXERCISE DETAIL / FORM GUIDE MODAL                       */}
      {/* ======================================================== */}
      {detailEx && (
        <Modal
          isOpen={!!detailEx}
          onClose={() => setDetailEx(null)}
          title={detailEx.name}
          size="lg"
        >
          <div className="space-y-4">
            {/* Visual Movement Demonstration Player */}
            {detailEx.imageUrl ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGuideMode('animated')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        guideMode === 'animated'
                          ? 'bg-[#E50914] text-white'
                          : 'bg-[#181818] text-[#888888] hover:text-white border border-[#262626]'
                      }`}
                    >
                      <Play size={11} /> Motion Player
                    </button>
                    {detailEx.imageUrlFinish && (
                      <button
                        type="button"
                        onClick={() => setGuideMode('sidebyside')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          guideMode === 'sidebyside'
                            ? 'bg-[#E50914] text-white'
                            : 'bg-[#181818] text-[#888888] hover:text-white border border-[#262626]'
                        }`}
                      >
                        <Film size={11} /> Side-by-Side (Start & Finish)
                      </button>
                    )}
                  </div>

                  {guideMode === 'animated' && detailEx.imageUrlFinish && (
                    <button
                      type="button"
                      onClick={() => setIsGuidePlaying(!isGuidePlaying)}
                      className="text-xs text-[#CCCCCC] hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181818] border border-[#2A2A2A] hover:border-[#444444] transition-colors cursor-pointer"
                    >
                      {isGuidePlaying ? <Pause size={11} /> : <Play size={11} />}
                      <span>{isGuidePlaying ? 'Pause Motion' : 'Play Motion'}</span>
                    </button>
                  )}
                </div>

                {guideMode === 'animated' ? (
                  <div className="relative h-64 sm:h-80 w-full rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#242424] flex items-center justify-center">
                    <img
                      src={
                        guideFrame === 0
                          ? detailEx.imageUrl
                          : (detailEx.imageUrlFinish || detailEx.imageUrl)
                      }
                      alt={`${detailEx.name} demonstration`}
                      className="w-full h-full object-contain object-center transition-all duration-300"
                    />

                    {/* Frame Indicator Pill */}
                    {detailEx.imageUrlFinish && (
                      <div className="absolute top-3 left-3 bg-[#000000]/85 backdrop-blur-md border border-[#333333] px-3 py-1 rounded-full flex items-center gap-2 text-xs font-mono shadow-lg">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            guideFrame === 0 ? 'bg-[#3B82F6]' : 'bg-[#E50914] animate-pulse'
                          }`}
                        />
                        <span className="text-white font-bold">
                          {guideFrame === 0 ? '1. Starting Setup' : '2. Finish / Peak Contraction'}
                        </span>
                      </div>
                    )}

                    {/* Step scrubber buttons */}
                    {detailEx.imageUrlFinish && (
                      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setGuideFrame(0);
                            setIsGuidePlaying(false);
                          }}
                          className={`px-3 py-1 rounded-full text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                            guideFrame === 0
                              ? 'bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/30'
                              : 'bg-[#000000]/80 text-[#888888] border border-[#333333] hover:text-white'
                          }`}
                        >
                          Start Frame
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setGuideFrame(1);
                            setIsGuidePlaying(false);
                          }}
                          className={`px-3 py-1 rounded-full text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                            guideFrame === 1
                              ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30'
                              : 'bg-[#000000]/80 text-[#888888] border border-[#333333] hover:text-white'
                          }`}
                        >
                          Finish Frame
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#242424] p-2 space-y-1.5">
                      <div className="h-56 w-full flex items-center justify-center overflow-hidden rounded-lg bg-[#000000]">
                        <img
                          src={detailEx.imageUrl}
                          alt="Start position"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 px-1 text-xs font-mono font-bold text-[#3B82F6]">
                        <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                        <span>1. Starting Setup</span>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#242424] p-2 space-y-1.5">
                      <div className="h-56 w-full flex items-center justify-center overflow-hidden rounded-lg bg-[#000000]">
                        <img
                          src={detailEx.imageUrlFinish || detailEx.imageUrl}
                          alt="Finish position"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 px-1 text-xs font-mono font-bold text-[#E50914]">
                        <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                        <span>2. Peak Contraction</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#242424]">
                <MuscleDiagram
                  muscleGroup={detailEx.muscleGroup}
                  imageUrl={detailEx.imageUrl}
                  imageUrlFinish={detailEx.imageUrlFinish}
                  size="xl"
                  className="w-full border-0 rounded-none"
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-[#141414] border border-[#242424] rounded-lg">
                <span className="text-[10px] text-[#777777] uppercase block font-mono">Muscle</span>
                <span className="text-xs font-bold text-[#E50914]">{detailEx.muscleGroup}</span>
              </div>
              <div className="p-2.5 bg-[#141414] border border-[#242424] rounded-lg">
                <span className="text-[10px] text-[#777777] uppercase block font-mono">Equipment</span>
                <span className="text-xs font-bold text-white">{detailEx.equipment}</span>
              </div>
              <div className="p-2.5 bg-[#141414] border border-[#242424] rounded-lg">
                <span className="text-[10px] text-[#777777] uppercase block font-mono">Metric</span>
                <span className="text-xs font-bold text-[#AAAAAA] uppercase">
                  {detailEx.exerciseType.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white font-heading mb-1.5">Execution & Form Cues</h5>
              <div className="p-3 bg-[#141414] border border-[#242424] rounded-xl text-xs text-[#CCCCCC] leading-relaxed">
                {detailEx.instructions ||
                  'Standard proper posture: engage core, control the eccentric phase, and perform a full active range of motion.'}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#222222]">
              {activeSession ? (
                <Button
                  size="sm"
                  onClick={() => {
                    addExerciseToActive(detailEx.id);
                    setDetailEx(null);
                  }}
                  className="bg-[#10B981] hover:bg-[#059669] text-white cursor-pointer font-bold text-xs"
                >
                  + Add to Active Workout
                </Button>
              ) : (
                <div />
              )}
              <Button
                size="sm"
                onClick={() => setDetailEx(null)}
                className="bg-[#E50914] hover:bg-[#C11119] text-white cursor-pointer font-bold text-xs"
              >
                Close Guide
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
