'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { CalendarEvent } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trash2,
  List,
  Grid,
} from 'lucide-react';

export default function CalendarPage() {
  const { storageVersion, refreshStorage, addToast } = useDaymark();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // New Event Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [category, setCategory] = useState('General');
  const [color, setColor] = useState('#EF4444');

  useEffect(() => {
    setEvents(StorageAPI.getEvents());
  }, [storageVersion]);

  // Date math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar grid days
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const startISO = new Date(`${eventDate}T${startTime}:00`).toISOString();
    const endISO = new Date(`${eventDate}T${endTime}:00`).toISOString();

    const newEvent: CalendarEvent = {
      id: 'evt_' + Date.now(),
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startTime: startISO,
      endTime: endISO,
      isAllDay,
      category,
      color,
      createdAt: new Date().toISOString(),
    };

    StorageAPI.saveEvent(newEvent);
    addToast('Event Scheduled', newEvent.title, 'success');
    setTitle('');
    setDescription('');
    setLocation('');
    setIsModalOpen(false);
    refreshStorage();
  };

  const handleDeleteEvent = (id: string) => {
    StorageAPI.deleteEvent(id);
    addToast('Event Deleted', undefined, 'info');
    refreshStorage();
  };

  const todayISOStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#2A2F38]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Schedule & Calendar
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Plan your weeks, schedule meetings, appointments, and recurring events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-[#141414] border border-[#242424] rounded-lg">
            <button
              onClick={() => setViewMode('month')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'month' ? 'bg-[#E50914] text-white' : 'text-[#777777] hover:text-white'
              }`}
              title="Month View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'agenda' ? 'bg-[#E50914] text-white' : 'text-[#777777] hover:text-white'
              }`}
              title="Agenda List View"
            >
              <List size={15} />
            </button>
          </div>

          <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
            <Plus size={15} />
            <span>New Event</span>
          </Button>
        </div>
      </div>

      {/* Navigation Toolbar */}
      <div className="flex items-center justify-between bg-[#141414] border border-[#242424] p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="secondary" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft size={16} />
          </Button>
          <Button size="icon" variant="secondary" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight size={16} />
          </Button>
          <span className="text-sm font-bold text-white ml-2 font-heading tracking-wide">
            {monthName}
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={jumpToToday}>
          Today
        </Button>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <Card className="p-0 overflow-hidden rounded-xl border border-[#242424]">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-[#242424] bg-[#0D0D0D] text-center text-xs font-semibold text-[#777777] py-2.5">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#242424]/60">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[90px] p-1.5 bg-[#000000]/60" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const isToday = dayStr === todayISOStr;

              // Filter events for this day
              const dayEvents = events.filter((e) => e.startTime.startsWith(dayStr));

              return (
                <div
                  key={dayStr}
                  className={`min-h-[90px] p-2 flex flex-col justify-between transition-colors ${
                    isToday ? 'bg-[#180C0E] border-t-2 border-t-[#E50914]' : 'bg-[#141414]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-mono font-medium ${
                        isToday
                          ? 'bg-[#E50914] text-white px-1.5 py-0.5 rounded font-bold'
                          : 'text-[#AAAAAA]'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-[#777777] font-mono">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 flex-1 overflow-y-auto max-h-16">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#181818] border border-[#242424] text-white truncate flex items-center justify-between group"
                      >
                        <span className="truncate">{ev.title}</span>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="hidden group-hover:inline text-[#777777] hover:text-[#E50914] ml-1"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <div className="space-y-3">
          {events.length > 0 ? (
            events
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map((ev) => (
                <Card key={ev.id} className="flex items-center justify-between p-3.5 rounded-xl border border-[#242424]">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-10 rounded-full bg-[#E50914]" />
                    <div>
                      <h4 className="text-sm font-semibold text-white font-heading">{ev.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-[#AAAAAA] mt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={12} />
                          {new Date(ev.startTime).toLocaleDateString()} •{' '}
                          {new Date(ev.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {ev.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {ev.location}
                          </span>
                        )}
                        <Badge variant="muted">{ev.category}</Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="text-[#777777] hover:text-[#E50914]"
                    title="Delete event"
                  >
                    <Trash2 size={16} />
                  </Button>
                </Card>
              ))
          ) : (
            <div className="text-center py-14 bg-[#141414] border border-[#242424] rounded-xl">
              <CalendarIcon size={36} className="mx-auto text-[#777777] mb-2 opacity-40" />
              <p className="text-sm font-medium text-[#AAAAAA]">No scheduled events</p>
              <p className="text-xs text-[#777777] mt-1">
                Click 'New Event' above or use Quick Add (⌘B).
              </p>
            </div>
          )}
        </div>
      )}

      {/* New Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Event"
        description="Add a calendar event with time, location, and reminders"
      >
        <form onSubmit={handleSaveEvent} className="space-y-3">
          <Input
            label="Event Title *"
            placeholder="e.g. Product sync or dentist appointment"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="date"
              label="Date *"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
            <Input
              type="time"
              label="Start Time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              type="time"
              label="End Time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <Input
            label="Location"
            placeholder="e.g. Conference Room B / Zoom URL"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Textarea
            label="Description / Notes"
            placeholder="Additional agenda or preparation notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'General', label: 'General' },
              { value: 'Work', label: 'Work & Career' },
              { value: 'Personal', label: 'Personal' },
              { value: 'Health', label: 'Health & Fitness' },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2F38]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Event</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
