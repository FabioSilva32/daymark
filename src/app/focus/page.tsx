'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { FocusSession, Task } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function FocusPage() {
  const { storageVersion, refreshStorage, addToast } = useDaymark();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('none');

  // Mode: work (25), short_break (5), long_break (15)
  const [mode, setMode] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Reliable timestamp tracking to prevent suspension drift
  const targetEndTimeRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setTasks(StorageAPI.getTasks().filter((t) => t.status !== 'completed'));
    setSessions(StorageAPI.getFocusSessions());
  }, [storageVersion]);

  // Audio synthesis chime for completion
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn('AudioContext not supported');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const remaining = Math.max(0, Math.round((targetEndTimeRef.current - Date.now()) / 1000));
        setSecondsRemaining(remaining);

        if (remaining <= 0) {
          setIsRunning(false);
          targetEndTimeRef.current = null;
          playChime();

          // Log session
          if (mode === 'work') {
            const durationMin = Math.round(totalSeconds / 60);
            const taskObj = tasks.find((t) => t.id === selectedTaskId);
            const newSession: FocusSession = {
              id: 'focus_' + Date.now(),
              taskId: selectedTaskId !== 'none' ? selectedTaskId : undefined,
              taskTitle: taskObj?.title,
              durationMinutes: durationMin,
              sessionType: 'work',
              startedAt: new Date(sessionStartTimeRef.current || Date.now() - durationMin * 60000).toISOString(),
              endedAt: new Date().toISOString(),
            };
            StorageAPI.saveFocusSession(newSession);
            addToast('Focus Session Completed', `Great job! ${durationMin} minutes logged.`, 'success');
            refreshStorage();
          } else {
            addToast('Break Completed', 'Ready to focus again?', 'info');
          }
        }
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, selectedTaskId, tasks, totalSeconds, addToast, refreshStorage]);

  const switchMode = (newMode: 'work' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setMode(newMode);
    const secs = newMode === 'work' ? 25 * 60 : newMode === 'short_break' ? 5 * 60 : 15 * 60;
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
  };

  const handleStart = () => {
    if (!isRunning) {
      sessionStartTimeRef.current = Date.now();
      targetEndTimeRef.current = Date.now() + secondsRemaining * 1000;
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    if (isRunning) {
      setIsRunning(false);
      targetEndTimeRef.current = null;
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setSecondsRemaining(totalSeconds);
  };

  // Format MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Progress percentage
  const progressPct = Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100);

  // Total daily focus calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.startedAt.startsWith(todayStr));
  const totalFocusMinutesToday = todaySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Focus & Deep Work Timer
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Sustained deep work intervals inspired by the Pomodoro technique.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[#141414] border border-[#242424] rounded-lg text-xs font-mono">
            <span className="text-[#777777] mr-1.5">Today:</span>
            <span className="font-bold text-[#E50914]">{totalFocusMinutesToday} mins</span>
          </div>
        </div>
      </div>

      {/* Main Focus Clock Card */}
      <Card className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-8 bg-[#141414] border border-[#242424] rounded-xl">
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#0D0D0D] border border-[#242424] rounded-xl text-xs font-heading">
          <button
            onClick={() => switchMode('work')}
            className={`px-5 py-2 rounded-lg font-bold transition-all ${
              mode === 'work' ? 'bg-[#E50914] text-white shadow-none' : 'text-[#AAAAAA] hover:text-white'
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => switchMode('short_break')}
            className={`px-5 py-2 rounded-lg font-bold transition-all ${
              mode === 'short_break'
                ? 'bg-[#E50914] text-white shadow-none'
                : 'text-[#AAAAAA] hover:text-white'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => switchMode('long_break')}
            className={`px-5 py-2 rounded-lg font-bold transition-all ${
              mode === 'long_break'
                ? 'bg-[#E50914] text-white shadow-none'
                : 'text-[#AAAAAA] hover:text-white'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Big Crisp Clock */}
        <div className="space-y-4">
          <div className="text-8xl md:text-9xl font-black font-heading text-white tracking-tight select-none">
            {timeFormatted}
          </div>
          <div className="w-80 max-w-full mx-auto bg-[#181818] h-2 rounded-full overflow-hidden border border-[#242424]">
            <div
              className="bg-[#E50914] h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Task Association */}
        {mode === 'work' && (
          <div className="w-full max-w-sm">
            <label className="text-xs text-[#777777] block mb-1.5 font-medium">Link with current task:</label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full bg-[#181818] border border-[#242424] text-xs text-white p-2.5 rounded-lg focus:border-[#E50914] outline-none"
            >
              <option value="none">None (General Deep Work)</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {!isRunning ? (
            <Button size="lg" onClick={handleStart} className="px-10 h-12 gap-2 font-heading font-bold text-sm bg-[#E50914] hover:bg-[#C11119] text-white rounded-xl">
              <Play size={18} fill="currentColor" />
              <span>Start Session</span>
            </Button>
          ) : (
            <Button size="lg" variant="secondary" onClick={handlePause} className="px-10 h-12 gap-2 font-heading font-bold text-sm bg-[#181818] border-[#242424] text-white rounded-xl">
              <Pause size={18} fill="currentColor" />
              <span>Pause</span>
            </Button>
          )}

          <Button size="lg" variant="ghost" onClick={handleReset} className="h-12 w-12 p-0 text-[#777777] hover:text-white hover:bg-[#181818] rounded-xl" title="Reset">
            <RotateCcw size={18} />
          </Button>
        </div>
      </Card>

      {/* Session History */}
      <Card className="bg-[#141414] border border-[#242424] rounded-xl p-5">
        <CardHeader className="p-0 pb-4 border-b border-[#1C1C1C]">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#E50914]" />
            <CardTitle className="font-heading font-bold text-white text-base">Recent Focus Sessions</CardTitle>
          </div>
          <span className="text-xs text-[#777777] font-mono">{sessions.length} sessions logged</span>
        </CardHeader>

        <div className="space-y-2 pt-4">
          {sessions.length > 0 ? (
            sessions.slice(0, 6).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-[#242424] text-xs hover:border-[#333333] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                  <div>
                    <span className="font-semibold text-white">
                      {s.taskTitle || 'General Focus Session'}
                    </span>
                    <span className="text-[10px] text-[#777777] block mt-0.5 font-mono">
                      {new Date(s.endedAt).toLocaleDateString()} • {new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <Badge variant="muted">{s.durationMinutes} mins</Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-[#777777]">
              No focus sessions recorded yet. Start a session above!
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
