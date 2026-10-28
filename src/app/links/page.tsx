'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { SavedLink } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Link2,
  Plus,
  Trash2,
  ExternalLink,
  Star,
  Search,
  Bookmark,
  Tv,
  Gamepad2,
  GraduationCap,
} from 'lucide-react';

export default function LinksPage() {
  const { storageVersion, refreshStorage, addToast } = useDaymark();
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'read_later' | 'watch_later' | 'play_later' | 'learn_later' | 'research' | 'other'>('read_later');
  const [tagsStr, setTagsStr] = useState('');

  useEffect(() => {
    setLinks(StorageAPI.getSavedLinks());
  }, [storageVersion]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newLink: SavedLink = {
      id: 'link_' + Date.now(),
      url: url.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      tags,
      isFavorite: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    StorageAPI.saveSavedLink(newLink);
    addToast('Bookmark Saved', newLink.title, 'success');
    setUrl('');
    setTitle('');
    setDescription('');
    setTagsStr('');
    setIsModalOpen(false);
    refreshStorage();
  };

  const toggleFavorite = (link: SavedLink) => {
    const updated = { ...link, isFavorite: !link.isFavorite };
    StorageAPI.saveSavedLink(updated);
    refreshStorage();
  };

  const deleteLink = (id: string) => {
    StorageAPI.deleteSavedLink(id);
    addToast('Link Removed', undefined, 'info');
    refreshStorage();
  };

  const filteredLinks = links.filter((l) => {
    if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q);
    }
    return true;
  });

  const categories = [
    { id: 'all', label: 'All Links' },
    { id: 'read_later', label: 'Read Later', icon: <Bookmark size={13} /> },
    { id: 'watch_later', label: 'Watch Later', icon: <Tv size={13} /> },
    { id: 'learn_later', label: 'Learn Later', icon: <GraduationCap size={13} /> },
    { id: 'play_later', label: 'Play Later', icon: <Gamepad2 size={13} /> },
    { id: 'research', label: 'Research' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Links & Media Organiser
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Save articles to read later, video bookmarks, podcasts, and research resources.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
          <Plus size={15} />
          <span>Save Link</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                categoryFilter === c.id
                  ? 'bg-[#E50914] text-white font-semibold'
                  : 'bg-[#141414] text-[#AAAAAA] hover:text-white border border-[#242424]'
              }`}
            >
              {c.icon}
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center px-3 py-2 bg-[#141414] border border-[#242424] focus-within:border-[#E50914] rounded-xl text-xs w-full sm:w-64 transition-colors">
          <Search size={14} className="text-[#777777] mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-0 p-0 text-white placeholder-[#777777] outline-none focus:outline-none focus:ring-0 w-full"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLinks.map((link) => (
          <Card key={link.id} className="p-4 flex flex-col justify-between space-y-3 rounded-xl border border-[#242424] bg-[#141414]">
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[10px] uppercase font-bold text-[#E50914] tracking-wider font-heading">
                  {link.category.replace('_', ' ')}
                </span>
                <button
                  onClick={() => toggleFavorite(link)}
                  className={`p-1 rounded ${
                    link.isFavorite ? 'text-[#F59E0B]' : 'text-[#777777] hover:text-white'
                  }`}
                >
                  <Star size={14} className={link.isFavorite ? 'fill-[#F59E0B]' : ''} />
                </button>
              </div>

              <h4 className="font-bold text-sm text-white font-heading mt-1 line-clamp-1">{link.title}</h4>
              <p className="text-xs text-[#777777] mt-0.5 truncate font-mono">{link.url}</p>

              {link.description && (
                <p className="text-xs text-[#AAAAAA] mt-2 line-clamp-2">{link.description}</p>
              )}

              {link.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {link.tags.map((t) => (
                    <Badge key={t} variant="muted">
                      #{t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1C1C1C] text-xs">
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#E50914] hover:underline flex items-center gap-1 font-medium"
              >
                <span>Open Link</span>
                <ExternalLink size={12} />
              </a>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteLink(link.id)}
                className="h-7 w-7 text-[#777777] hover:text-[#E50914]"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        ))}

        {filteredLinks.length === 0 && (
          <div className="col-span-full text-center py-14 bg-[#141414] border border-[#242424] rounded-xl">
            <Link2 size={36} className="mx-auto text-[#777777] mb-2 opacity-40" />
            <p className="text-sm font-medium text-[#AAAAAA]">No saved bookmarks</p>
            <p className="text-xs text-[#777777] mt-1">
              Save web pages, videos, and articles to revisit later.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Save Bookmark / Link">
        <form onSubmit={handleSave} className="space-y-3">
          <Input
            label="URL *"
            placeholder="https://github.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Title *"
            placeholder="e.g. Next.js 15 App Architecture Best Practices"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            options={[
              { value: 'read_later', label: 'Read Later' },
              { value: 'watch_later', label: 'Watch Later' },
              { value: 'learn_later', label: 'Learn Later' },
              { value: 'play_later', label: 'Play Later' },
              { value: 'research', label: 'Research' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Textarea
            label="Notes / Summary"
            placeholder="Why you saved it or key quotes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <Input
            label="Tags (comma separated)"
            placeholder="engineering, react, guide"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2F38]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Bookmark</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
