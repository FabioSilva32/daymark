'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { Note, NoteFolder } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Folder,
  Search,
  Check,
  Tag,
  Clock,
} from 'lucide-react';

export default function NotesPage() {
  const { storageVersion, refreshStorage, addToast } = useDaymark();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Active note editor state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const list = StorageAPI.getNotes().filter((n) => !n.isTrashed);
    setNotes(list);
    if (!selectedNoteId && list.length > 0) {
      setSelectedNoteId(list[0].id);
      setEditTitle(list[0].title);
      setEditContent(list[0].content);
      setEditTags(list[0].tags.join(', '));
    }
  }, [storageVersion, selectedNoteId]);

  const selectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags.join(', '));
  };

  const handleCreateNewNote = () => {
    const newNote: Note = {
      id: 'note_' + Date.now(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      isPinned: false,
      isArchived: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    StorageAPI.saveNote(newNote);
    setSelectedNoteId(newNote.id);
    setEditTitle(newNote.title);
    setEditContent('');
    setEditTags('');
    addToast('New Note Created', undefined, 'success');
    refreshStorage();
  };

  const triggerAutoSave = (newTitle: string, newContent: string, newTagsStr: string) => {
    if (!selectedNoteId) return;
    setSaveStatus('saving');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      const target = notes.find((n) => n.id === selectedNoteId);
      if (!target) return;

      const tagsArray = newTagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const updated: Note = {
        ...target,
        title: newTitle || 'Untitled Note',
        content: newContent,
        tags: tagsArray,
        updatedAt: new Date().toISOString(),
      };

      StorageAPI.saveNote(updated);
      setSaveStatus('saved');
      refreshStorage();
    }, 500);
  };

  const togglePin = (note: Note) => {
    const updated = { ...note, isPinned: !note.isPinned };
    StorageAPI.saveNote(updated);
    refreshStorage();
  };

  const deleteCurrentNote = () => {
    if (!selectedNoteId) return;
    StorageAPI.deleteNote(selectedNoteId);
    setSelectedNoteId(null);
    addToast('Note Deleted', undefined, 'info');
    refreshStorage();
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.content.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filterTag !== 'all' && !n.tags.includes(filterTag)) {
      return false;
    }
    return true;
  });

  // Extract all unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Notes & Ideas
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Capture thoughts, markdown notes, meeting memos, and technical documentation.
          </p>
        </div>

        <Button size="sm" onClick={handleCreateNewNote} className="gap-1.5">
          <Plus size={15} />
          <span>New Note</span>
        </Button>
      </div>

      {/* Main Split Layout: Sidebar list + Active Editor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[calc(100vh-230px)] min-h-[500px]">
        {/* Left: Notes List */}
        <div className="md:col-span-4 flex flex-col bg-[#141414] border border-[#242424] rounded-xl overflow-hidden">
          {/* Search bar & Tag filter */}
          <div className="p-3 border-b border-[#242424] space-y-2">
            <div className="flex items-center px-3 py-2 bg-[#0D0D0D] border border-[#242424] focus-within:border-[#E50914] rounded-lg text-xs transition-colors">
              <Search size={14} className="text-[#777777] mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 p-0 text-xs text-white outline-none focus:outline-none focus:ring-0 w-full placeholder-[#777777]"
              />
            </div>

            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
                <button
                  onClick={() => setFilterTag('all')}
                  className={`px-2.5 py-0.5 rounded-md whitespace-nowrap transition-colors ${
                    filterTag === 'all'
                      ? 'bg-[#E50914] text-white font-semibold'
                      : 'bg-[#181818] text-[#AAAAAA] hover:text-white'
                  }`}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`px-2.5 py-0.5 rounded-md whitespace-nowrap transition-colors ${
                      filterTag === tag
                        ? 'bg-[#E50914] text-white font-semibold'
                        : 'bg-[#181818] text-[#AAAAAA] hover:text-white'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#242424]">
            {filteredNotes.length > 0 ? (
              filteredNotes
                .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                .map((note) => {
                  const isSelected = note.id === selectedNoteId;

                  return (
                    <button
                      key={note.id}
                      onClick={() => selectNote(note)}
                      className={`w-full text-left p-3.5 transition-colors flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#181818] border-l-2 border-[#E50914]'
                          : 'hover:bg-[#181818]/60'
                      }`}
                    >
                      <div className="truncate flex-1">
                        <div className="flex items-center gap-1.5">
                          {note.isPinned && (
                            <Pin size={11} className="text-[#E50914] shrink-0 fill-[#E50914]" />
                          )}
                          <p className="text-xs font-semibold text-white font-heading truncate">
                            {note.title || 'Untitled Note'}
                          </p>
                        </div>
                        <p className="text-[11px] text-[#777777] truncate mt-0.5">
                          {note.content ? note.content.slice(0, 60) : 'No additional text'}
                        </p>
                        <span className="text-[10px] text-[#777777] block mt-1 font-mono">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  );
                })
            ) : (
              <div className="text-center py-12 text-xs text-[#777777]">No notes found</div>
            )}
          </div>
        </div>

        {/* Right: Active Note Editor */}
        <div className="md:col-span-8 flex flex-col bg-[#141414] border border-[#242424] rounded-xl overflow-hidden p-5">
          {selectedNoteId ? (
            <div className="flex-1 flex flex-col space-y-3">
              {/* Editor Toolbar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`flex items-center gap-1 ${
                      saveStatus === 'saved' ? 'text-[#10B981]' : 'text-[#F59E0B]'
                    }`}
                  >
                    <Check size={13} />
                    <span className="font-mono text-[11px]">{saveStatus === 'saved' ? 'Autosaved' : 'Saving...'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {(() => {
                    const activeNote = notes.find((n) => n.id === selectedNoteId);
                    if (!activeNote) return null;
                    return (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => togglePin(activeNote)}
                        className={`h-8 w-8 ${
                          activeNote.isPinned ? 'text-[#E50914]' : 'text-[#777777]'
                        }`}
                        title="Pin note"
                      >
                        <Pin size={15} />
                      </Button>
                    );
                  })()}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={deleteCurrentNote}
                    className="h-8 w-8 text-[#777777] hover:text-[#E50914]"
                    title="Delete note"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>

              {/* Title input */}
              <input
                type="text"
                placeholder="Note Title"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  triggerAutoSave(e.target.value, editContent, editTags);
                }}
                className="w-full text-lg md:text-xl font-heading font-extrabold bg-transparent border-none text-white placeholder-[#777777] outline-none"
              />

              {/* Tags input */}
              <div className="flex items-center gap-2 text-xs text-[#777777] pb-2 border-b border-[#1C1C1C]">
                <Tag size={13} />
                <input
                  type="text"
                  placeholder="Tags (comma-separated, e.g. project, architecture, ideas)"
                  value={editTags}
                  onChange={(e) => {
                    setEditTags(e.target.value);
                    triggerAutoSave(editTitle, editContent, e.target.value);
                  }}
                  className="bg-transparent border-none text-xs text-[#AAAAAA] placeholder-[#777777] outline-none flex-1"
                />
              </div>

              {/* Content textarea */}
              <textarea
                placeholder="Write your note in Markdown or plain text..."
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value);
                  triggerAutoSave(editTitle, e.target.value, editTags);
                }}
                className="w-full flex-1 bg-transparent border-none text-sm text-white placeholder-[#777777] outline-none resize-none font-mono leading-relaxed"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <FileText size={40} className="text-[#777777] mb-3 opacity-40" />
              <h3 className="text-sm font-semibold text-white font-heading">No Note Selected</h3>
              <p className="text-xs text-[#AAAAAA] mt-1 max-w-xs">
                Select an existing note from the list or create a new one.
              </p>
              <Button onClick={handleCreateNewNote} size="sm" className="mt-4 gap-1.5">
                <Plus size={15} />
                <span>Create New Note</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
