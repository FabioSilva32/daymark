'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { ReadingItem } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Bookmark,
  Plus,
  Trash2,
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  ExternalLink,
} from 'lucide-react';

export default function ReadingPage() {
  const { storageVersion, refreshStorage, addToast } = useDaymark();
  const [items, setItems] = useState<ReadingItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'planned' | 'completed'>('in_progress');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [contentType, setContentType] = useState<'book' | 'article' | 'course' | 'paper' | 'podcast'>('book');
  const [totalProgress, setTotalProgress] = useState('300');
  const [progressUnit, setProgressUnit] = useState<'pages' | 'chapters' | 'minutes' | 'percent'>('pages');
  const [notes, setNotes] = useState('');

  // Update progress modal
  const [progressItem, setProgressItem] = useState<ReadingItem | null>(null);
  const [newProgressVal, setNewProgressVal] = useState('');

  useEffect(() => {
    setItems(StorageAPI.getReadingItems());
  }, [storageVersion]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: ReadingItem = {
      id: 'read_' + Date.now(),
      title: title.trim(),
      author: author.trim() || undefined,
      contentType,
      status: 'in_progress',
      currentProgress: 0,
      totalProgress: parseInt(totalProgress, 10) || undefined,
      progressUnit,
      notes: notes.trim() || undefined,
      tags: [],
      createdAt: new Date().toISOString(),
    };

    StorageAPI.saveReadingItem(newItem);
    addToast('Added to Reading List', newItem.title, 'success');
    setTitle('');
    setAuthor('');
    setNotes('');
    setIsModalOpen(false);
    refreshStorage();
  };

  const updateProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressItem) return;
    const val = parseInt(newProgressVal, 10) || 0;
    const isCompleted = progressItem.totalProgress && val >= progressItem.totalProgress;

    const updated: ReadingItem = {
      ...progressItem,
      currentProgress: val,
      status: isCompleted ? 'completed' : progressItem.status,
      completedAt: isCompleted ? new Date().toISOString() : progressItem.completedAt,
    };

    StorageAPI.saveReadingItem(updated);
    addToast('Progress Updated', `${val} ${updated.progressUnit}`, 'success');
    setProgressItem(null);
    refreshStorage();
  };

  const deleteItem = (id: string) => {
    StorageAPI.deleteReadingItem(id);
    addToast('Item Removed', undefined, 'info');
    refreshStorage();
  };

  const filteredItems = items.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Reading & Learning Tracker
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Catalogue books, online courses, research papers, and track completion progress.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
          <Plus size={15} />
          <span>Add Item</span>
        </Button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 p-1 bg-[#141414] border border-[#242424] rounded-xl text-xs w-fit">
        {[
          { id: 'in_progress', label: 'Currently Reading / Learning' },
          { id: 'planned', label: 'Up Next' },
          { id: 'completed', label: 'Finished' },
          { id: 'all', label: 'All Library' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id as any)}
            className={`px-3 py-1.5 rounded-lg transition-colors text-xs ${
              statusFilter === f.id
                ? 'bg-[#E50914] text-white font-semibold'
                : 'text-[#AAAAAA] hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid of Books & Materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const pct = item.totalProgress
            ? Math.min(100, Math.round((item.currentProgress / item.totalProgress) * 100))
            : 0;

          return (
            <Card key={item.id} className="p-4 flex flex-col justify-between space-y-4 rounded-xl border border-[#242424] bg-[#141414]">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#E50914] tracking-wider font-heading">
                      {item.contentType}
                    </span>
                    <h4 className="font-bold text-sm text-white font-heading mt-0.5">{item.title}</h4>
                    {item.author && (
                      <p className="text-xs text-[#777777] mt-0.5">by {item.author}</p>
                    )}
                  </div>
                  <Badge variant={item.status === 'completed' ? 'success' : 'muted'}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#AAAAAA]">
                      {item.currentProgress} / {item.totalProgress || '?'} {item.progressUnit}
                    </span>
                    <span className="text-white font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-[#181818] border border-[#242424] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#E50914] h-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-[#777777] mt-3 line-clamp-2">{item.notes}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1C1C1C]">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteItem(item.id)}
                  className="h-8 w-8 text-[#777777] hover:text-[#E50914]"
                >
                  <Trash2 size={14} />
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setProgressItem(item);
                    setNewProgressVal(String(item.currentProgress));
                  }}
                  className="text-xs"
                >
                  Update Progress
                </Button>
              </div>
            </Card>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full text-center py-14 bg-[#141414] border border-[#242424] rounded-xl">
            <Bookmark size={36} className="mx-auto text-[#777777] mb-2 opacity-40" />
            <p className="text-sm font-medium text-[#AAAAAA]">No items in this view</p>
            <p className="text-xs text-[#777777] mt-1">
              Add books, articles or courses to keep track of your reading goals.
            </p>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add to Reading & Learning Tracker"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            label="Title *"
            placeholder="e.g. Designing Data-Intensive Applications"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Author / Instructor"
            placeholder="e.g. Martin Kleppmann"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2">
            <Select
              label="Type"
              value={contentType}
              onChange={(e) => setContentType(e.target.value as any)}
              options={[
                { value: 'book', label: 'Book' },
                { value: 'article', label: 'Article' },
                { value: 'course', label: 'Course' },
                { value: 'paper', label: 'Paper' },
                { value: 'podcast', label: 'Podcast' },
              ]}
            />
            <Input
              type="number"
              label="Total Units"
              value={totalProgress}
              onChange={(e) => setTotalProgress(e.target.value)}
            />
            <Select
              label="Unit"
              value={progressUnit}
              onChange={(e) => setProgressUnit(e.target.value as any)}
              options={[
                { value: 'pages', label: 'Pages' },
                { value: 'chapters', label: 'Chapters' },
                { value: 'minutes', label: 'Minutes' },
                { value: 'percent', label: 'Percent (%)' },
              ]}
            />
          </div>
          <Textarea
            label="Notes / Key Takeaways"
            placeholder="Initial thoughts or reading agenda..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2F38]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </div>
        </form>
      </Modal>

      {/* Update Progress Modal */}
      {progressItem && (
        <Modal
          isOpen={Boolean(progressItem)}
          onClose={() => setProgressItem(null)}
          title={`Update Progress: ${progressItem.title}`}
        >
          <form onSubmit={updateProgress} className="space-y-4">
            <Input
              type="number"
              label={`Current Progress (${progressItem.progressUnit})`}
              value={newProgressVal}
              onChange={(e) => setNewProgressVal(e.target.value)}
              autoFocus
              required
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2F38]">
              <Button type="button" variant="ghost" onClick={() => setProgressItem(null)}>
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
