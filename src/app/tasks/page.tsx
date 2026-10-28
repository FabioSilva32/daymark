'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  ListPlus,
} from 'lucide-react';

export default function TasksPage() {
  const { storageVersion, refreshStorage, addToast } = useDaymark();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterView, setFilterView] = useState<'today' | 'upcoming' | 'overdue' | 'completed' | 'all'>('today');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');
  const [quickDueDate, setQuickDueDate] = useState('');

  // Subtask modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    setTasks(StorageAPI.getTasks());
  }, [storageVersion]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const newTask: Task = {
      id: 'task_' + Date.now(),
      title: quickTitle.trim(),
      status: 'todo',
      priority: quickPriority,
      dueDate: quickDueDate ? new Date(quickDueDate).toISOString() : undefined,
      category: 'General',
      tags: [],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageAPI.saveTask(newTask);
    addToast('Task Created', newTask.title, 'success');
    setQuickTitle('');
    setQuickDueDate('');
    refreshStorage();
  };

  const toggleTaskStatus = (task: Task) => {
    const isNowDone = task.status !== 'completed';
    const updated: Task = {
      ...task,
      status: isNowDone ? 'completed' : 'todo',
      completedAt: isNowDone ? new Date().toISOString() : undefined,
    };
    StorageAPI.saveTask(updated);
    addToast(isNowDone ? 'Task Completed' : 'Task Reopened', task.title, 'success');
    refreshStorage();
  };

  const deleteTask = (id: string) => {
    StorageAPI.deleteTask(id);
    addToast('Task Deleted', undefined, 'info');
    refreshStorage();
  };

  const addSubtask = () => {
    if (!selectedTask || !newSubtaskTitle.trim()) return;
    const updatedSubtasks = [
      ...selectedTask.subtasks,
      { id: 'st_' + Date.now(), title: newSubtaskTitle.trim(), isCompleted: false },
    ];
    const updated = { ...selectedTask, subtasks: updatedSubtasks };
    StorageAPI.saveTask(updated);
    setSelectedTask(updated);
    setNewSubtaskTitle('');
    refreshStorage();
  };

  const toggleSubtask = (stId: string) => {
    if (!selectedTask) return;
    const updatedSubtasks = selectedTask.subtasks.map((st) =>
      st.id === stId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    const updated = { ...selectedTask, subtasks: updatedSubtasks };
    StorageAPI.saveTask(updated);
    setSelectedTask(updated);
    refreshStorage();
  };

  // Filter logic
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    if (filterView === 'completed') return t.status === 'completed';
    if (t.status === 'completed' && filterView !== 'all') return false;

    if (filterView === 'today') {
      if (!t.dueDate) return true; // Undated tasks show in Today
      return t.dueDate.split('T')[0] === todayStr;
    }
    if (filterView === 'upcoming') {
      if (!t.dueDate) return false;
      return t.dueDate.split('T')[0] > todayStr;
    }
    if (filterView === 'overdue') {
      if (!t.dueDate) return false;
      return t.dueDate.split('T')[0] < todayStr && t.status !== 'completed';
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C] min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white truncate">
            Tasks & To-Dos
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Organise daily priorities, milestones, subtasks, and deadlines.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const csv = StorageAPI.exportTasksCSV();
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `daymark_tasks_${todayStr}.csv`;
              a.click();
              addToast('CSV Exported', 'Tasks saved to CSV', 'success');
            }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Quick Add Form Bar */}
      <Card className="min-w-0 overflow-hidden">
        <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center w-full min-w-0">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Add a new task (e.g. Schedule gym, Review invoices)..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <Select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value as any)}
              className="w-full sm:w-28 text-xs"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
            <Input
              type="date"
              value={quickDueDate}
              onChange={(e) => setQuickDueDate(e.target.value)}
              className="w-full sm:w-36 text-xs"
            />
          </div>
          <Button type="submit" size="md" className="w-full sm:w-auto shrink-0 gap-1.5 bg-[#E50914] hover:bg-[#C11119] text-white">
            <Plus size={16} />
            <span>Add Task</span>
          </Button>
        </form>
      </Card>

      {/* Filters and View Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs w-full min-w-0">
        <div className="flex items-center gap-1 p-1 bg-[#141414] border border-[#242424] rounded-xl overflow-x-auto max-w-full no-scrollbar">
          {[
            { id: 'today', label: 'Today' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
            { id: 'all', label: 'All Tasks' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setFilterView(v.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors text-xs whitespace-nowrap shrink-0 ${
                filterView === v.id
                  ? 'bg-[#E50914] text-white font-semibold'
                  : 'text-[#AAAAAA] hover:text-white'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-[#777777]">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#141414] border border-[#242424] text-white text-xs px-2.5 py-1.5 rounded-lg focus:border-[#E50914] outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((t) => {
            const isCompleted = t.status === 'completed';
            const isOverdue =
              t.dueDate && t.dueDate.split('T')[0] < todayStr && !isCompleted;

            return (
              <div
                key={t.id}
                className={`p-3.5 rounded-xl bg-[#141414] border transition-colors flex items-center justify-between gap-3 ${
                  isCompleted
                    ? 'border-[#1C1C1C] opacity-50 bg-[#0D0D0D]'
                    : isOverdue
                    ? 'border-[#E50914]/40 bg-[#170C0D]'
                    : 'border-[#242424] hover:border-[#383838]'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => toggleTaskStatus(t)}
                    className="h-4 w-4 rounded border-[#282828] bg-[#0D0D0D] text-[#E50914] focus:ring-0 cursor-pointer shrink-0"
                  />
                  <div className="truncate">
                    <p
                      className={`text-sm font-medium truncate ${
                        isCompleted
                          ? 'line-through text-[#777777]'
                          : 'text-white'
                      }`}
                    >
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#777777]">
                      {t.dueDate && (
                        <span
                          className={`flex items-center gap-1 ${
                            isOverdue ? 'text-[#E50914] font-medium' : ''
                          }`}
                        >
                          <Calendar size={12} />
                          {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <span>•</span>
                      <span>{t.category}</span>
                      {t.subtasks.length > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            {t.subtasks.filter((s) => s.isCompleted).length} /{' '}
                            {t.subtasks.length} subtasks
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      t.priority === 'urgent'
                        ? 'red'
                        : t.priority === 'high'
                        ? 'warning'
                        : 'muted'
                    }
                  >
                    {t.priority}
                  </Badge>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelectedTask(t)}
                    title="Subtasks"
                    className="h-7 w-7 text-[#777777] hover:text-white"
                  >
                    <ListPlus size={15} />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteTask(t.id)}
                    title="Delete task"
                    className="h-7 w-7 text-[#777777] hover:text-[#E50914]"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-14 bg-[#141414] border border-[#242424] rounded-xl">
            <CheckCircle2 size={36} className="mx-auto text-[#777777] mb-2 opacity-40" />
            <p className="text-sm font-medium text-[#AAAAAA]">No tasks in this view</p>
            <p className="text-xs text-[#777777] mt-1">
              Add a task using the bar above or Quick Add (⌘B).
            </p>
          </div>
        )}
      </div>

      {/* Subtasks Modal */}
      {selectedTask && (
        <Modal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          title={`Subtasks: ${selectedTask.title}`}
          description="Break down complex tasks into actionable checklists"
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New subtask step..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
              />
              <Button onClick={addSubtask} size="md">
                Add Step
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedTask.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-3 p-2.5 bg-[#181818] border border-[#242424] rounded-lg text-xs"
                >
                  <input
                    type="checkbox"
                    checked={st.isCompleted}
                    onChange={() => toggleSubtask(st.id)}
                    className="h-4 w-4 rounded border-[#282828] bg-[#0D0D0D] text-[#E50914] cursor-pointer"
                  />
                  <span
                    className={`flex-1 ${
                      st.isCompleted ? 'line-through text-[#777777]' : 'text-white'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
              ))}
              {selectedTask.subtasks.length === 0 && (
                <p className="text-xs text-[#777777] text-center py-4">
                  No subtasks added yet.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1C1C1C]">
              <Button variant="ghost" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
