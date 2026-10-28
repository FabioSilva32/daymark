'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { JournalEntry } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea, Input } from '@/components/ui/Input';
import {
  BookOpen,
  Calendar,
  Smile,
  Meh,
  Frown,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

export default function JournalPage() {
  const { storageVersion, refreshStorage, addToast } = useDaymark();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<'great' | 'good' | 'neutral' | 'bad' | 'awful'>('good');
  const [highlightInput, setHighlightInput] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved'>('saved');

  useEffect(() => {
    const entries = StorageAPI.getJournalEntries();
    const current = entries.find((e) => e.date === selectedDate);
    if (current) {
      setTitle(current.title || '');
      setContent(current.content || '');
      setMood(current.mood || 'good');
      setHighlights(current.highlights || []);
    } else {
      setTitle('');
      setContent('');
      setMood('good');
      setHighlights([]);
    }
    setSaveStatus('saved');
  }, [selectedDate, storageVersion]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !title.trim()) return;

    const entry: JournalEntry = {
      id: 'journal_' + selectedDate,
      date: selectedDate,
      title: title.trim(),
      content: content.trim(),
      mood,
      highlights,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageAPI.saveJournalEntry(entry);
    setSaveStatus('saved');
    addToast('Journal Entry Saved', `Saved reflection for ${selectedDate}`, 'success');
    refreshStorage();
  };

  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    setHighlights([...highlights, highlightInput.trim()]);
    setHighlightInput('');
    setSaveStatus('unsaved');
  };

  const removeHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
    setSaveStatus('unsaved');
  };

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Personal Journal & Reflection
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Private daily journal for mental clarity, highlights, and personal reflections.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2">
          <Button size="icon" variant="secondary" onClick={prevDay} className="h-9 w-9 bg-[#181818] border-[#242424] text-white hover:text-white">
            <ChevronLeft size={16} />
          </Button>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-36 text-xs h-9 bg-[#141414] border-[#242424] text-white"
          />
          <Button size="icon" variant="secondary" onClick={nextDay} className="h-9 w-9 bg-[#181818] border-[#242424] text-white hover:text-white">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Main Journal Form */}
      <Card className="max-w-3xl mx-auto space-y-6 bg-[#141414] border border-[#242424] rounded-xl p-6">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Mood Selector */}
          <div>
            <label className="text-xs font-semibold font-heading text-[#AAAAAA] uppercase tracking-wider block mb-2.5">
              Daily Mood & State of Mind
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'great', label: 'Great' },
                { id: 'good', label: 'Good' },
                { id: 'neutral', label: 'Neutral' },
                { id: 'bad', label: 'Tough' },
                { id: 'awful', label: 'Awful' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMood(m.id as any);
                    setSaveStatus('unsaved');
                  }}
                  className={`flex-1 py-2 px-3 text-xs rounded-xl font-heading font-semibold border transition-all ${
                    mood === m.id
                      ? 'bg-[#E50914] border-[#E50914] text-white shadow-none'
                      : 'bg-[#181818] border-[#242424] text-[#AAAAAA] hover:text-white hover:border-[#333333]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Highlights of the Day */}
          <div>
            <label className="text-xs font-semibold font-heading text-[#AAAAAA] uppercase tracking-wider block mb-2">
              Daily Highlights & Gratitude
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="What went well today? (e.g. Great workout, solved hard bug)..."
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addHighlight();
                  }
                }}
                className="bg-[#181818] border-[#242424] text-white"
              />
              <Button type="button" size="md" onClick={addHighlight} className="bg-[#E50914] hover:bg-[#C11119] text-white px-5">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {highlights.map((h, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 text-xs bg-[#181818] border border-[#242424] px-3 py-1.5 rounded-lg text-white"
                >
                  <span className="text-[#E50914] font-bold">✓</span>
                  <span>{h}</span>
                  <button
                    type="button"
                    onClick={() => removeHighlight(i)}
                    className="text-[#777777] hover:text-[#E50914] ml-1 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Entry Title */}
          <Input
            label="Entry Title (optional)"
            placeholder="e.g. Quiet afternoon walk and deep work"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaveStatus('unsaved');
            }}
            className="bg-[#181818] border-[#242424] text-white"
          />

          {/* Entry Content */}
          <Textarea
            label="Daily Reflection"
            placeholder="Write your personal thoughts, lessons, reflections, or stream of consciousness..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setSaveStatus('unsaved');
            }}
            rows={8}
            className="bg-[#181818] border-[#242424] text-white font-mono text-sm leading-relaxed"
          />

          <div className="flex items-center justify-between pt-4 border-t border-[#1C1C1C]">
            <span className="text-xs text-[#777777] font-mono">
              {saveStatus === 'saved' ? 'Entry saved for this date' : 'Unsaved modifications'}
            </span>
            <Button type="submit" size="md" className="gap-2 bg-[#E50914] hover:bg-[#C11119] text-white px-5">
              <Check size={16} />
              <span>Save Journal Entry</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
