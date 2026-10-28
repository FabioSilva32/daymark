'use client';

import React, { useState } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { StorageAPI } from '@/lib/storage';
import {
  CheckSquare,
  Calendar,
  FileText,
  Flame,
  Wallet,
  Utensils,
  ShoppingBag,
  Link2,
} from 'lucide-react';

export function QuickAddModal() {
  const { quickAddOpen, setQuickAddOpen, addToast, refreshStorage } = useDaymark();
  const [activeTab, setActiveTab] = useState<'task' | 'event' | 'note' | 'habit' | 'expense' | 'food' | 'shopping' | 'link'>('task');

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskCategory, setTaskCategory] = useState('Personal');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventStart, setEventStart] = useState('09:00');
  const [eventEnd, setEventEnd] = useState('10:00');
  const [eventLocation, setEventLocation] = useState('');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');

  const [habitTitle, setHabitTitle] = useState('');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekdays' | 'weekly'>('daily');

  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txCategory, setTxCategory] = useState('cat_groceries');
  const [txPayee, setTxPayee] = useState('');

  const [foodName, setFoodName] = useState('');
  const [foodMeal, setFoodMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProtein, setFoodProtein] = useState('');

  const [shopName, setShopName] = useState('');
  const [shopQty, setShopQty] = useState('1');
  const [shopEstPrice, setShopEstPrice] = useState('');

  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkCategory, setLinkCategory] = useState<'read_later' | 'watch_later' | 'play_later' | 'learn_later' | 'research' | 'other'>('read_later');

  const handleClose = () => {
    setQuickAddOpen(false);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const newTask = {
      id: 'task_' + Date.now(),
      title: taskTitle.trim(),
      status: 'todo' as const,
      priority: taskPriority,
      dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
      category: taskCategory,
      tags: [],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    StorageAPI.saveTask(newTask);
    addToast('Task Created', newTask.title, 'success');
    setTaskTitle('');
    refreshStorage();
    handleClose();
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;
    const startTime = new Date(`${eventDate}T${eventStart}:00`).toISOString();
    const endTime = new Date(`${eventDate}T${eventEnd}:00`).toISOString();
    const newEvent = {
      id: 'evt_' + Date.now(),
      title: eventTitle.trim(),
      startTime,
      endTime,
      isAllDay: false,
      category: 'General',
      location: eventLocation.trim() || undefined,
      color: '#E50914',
      createdAt: new Date().toISOString(),
    };
    StorageAPI.saveEvent(newEvent);
    addToast('Event Scheduled', newEvent.title, 'success');
    setEventTitle('');
    refreshStorage();
    handleClose();
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    const tags = noteTags.split(',').map((t) => t.trim()).filter(Boolean);
    const newNote = {
      id: 'note_' + Date.now(),
      title: noteTitle.trim(),
      content: noteContent,
      tags,
      isPinned: false,
      isArchived: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    StorageAPI.saveNote(newNote);
    addToast('Note Saved', newNote.title, 'success');
    setNoteTitle('');
    setNoteContent('');
    refreshStorage();
    handleClose();
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    const newHabit = {
      id: 'hab_' + Date.now(),
      title: habitTitle.trim(),
      frequency: habitFrequency,
      targetDaysPerWeek: habitFrequency === 'daily' ? 7 : 5,
      scheduledDays: habitFrequency === 'weekdays' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7],
      color: '#E50914',
      icon: 'Flame',
      isArchived: false,
      createdAt: new Date().toISOString(),
    };
    StorageAPI.saveHabit(newHabit);
    addToast('Habit Created', newHabit.title, 'success');
    setHabitTitle('');
    refreshStorage();
    handleClose();
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(txAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;
    const amountCents = Math.round(amountVal * 100);
    const newTx = {
      id: 'tx_' + Date.now(),
      categoryId: txCategory,
      type: txType,
      amountCents,
      currency: 'EUR',
      date: new Date().toISOString().split('T')[0],
      payeeMerchant: txPayee.trim() || 'General',
      tags: [],
      isRecurring: false,
      createdAt: new Date().toISOString(),
    };
    StorageAPI.saveTransaction(newTx);
    addToast('Transaction Recorded', `${txType === 'expense' ? '-' : '+'}€${amountVal.toFixed(2)}`, 'success');
    setTxAmount('');
    setTxPayee('');
    refreshStorage();
    handleClose();
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;
    const cal = parseInt(foodCalories, 10) || 0;
    const prot = parseFloat(foodProtein) || 0;
    const newFood = {
      id: 'food_' + Date.now(),
      customName: foodName.trim(),
      date: new Date().toISOString().split('T')[0],
      mealType: foodMeal,
      servings: 1,
      calories: cal,
      proteinG: prot,
      carbsG: 0,
      fatG: 0,
      createdAt: new Date().toISOString(),
    };
    StorageAPI.saveFoodEntry(newFood);
    addToast('Food Logged', `${newFood.customName} (${cal} kcal)`, 'success');
    setFoodName('');
    setFoodCalories('');
    refreshStorage();
    handleClose();
  };

  const handleSaveShopping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) return;
    const lists = StorageAPI.getShoppingLists();
    const targetListId = lists[0]?.id || 'list_default';
    const priceVal = parseFloat(shopEstPrice) || 0;
    const newItem = {
      id: 'item_' + Date.now(),
      listId: targetListId,
      name: shopName.trim(),
      quantity: parseFloat(shopQty) || 1,
      unit: 'item',
      estimatedPriceCents: Math.round(priceVal * 100),
      category: 'General',
      isChecked: false,
      priority: 'normal' as const,
      createdAt: new Date().toISOString(),
    };
    StorageAPI.saveShoppingItem(newItem);
    addToast('Item Added to Shopping List', newItem.name, 'success');
    setShopName('');
    refreshStorage();
    handleClose();
  };

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim() || !linkTitle.trim()) return;
    const newLink = {
      id: 'link_' + Date.now(),
      url: linkUrl.trim(),
      title: linkTitle.trim(),
      category: linkCategory,
      tags: [],
      isFavorite: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
    };
    StorageAPI.saveSavedLink(newLink);
    addToast('Link Saved', newLink.title, 'success');
    setLinkUrl('');
    setLinkTitle('');
    refreshStorage();
    handleClose();
  };

  const tabs = [
    { id: 'task', label: 'Task', icon: <CheckSquare size={14} /> },
    { id: 'event', label: 'Event', icon: <Calendar size={14} /> },
    { id: 'note', label: 'Note', icon: <FileText size={14} /> },
    { id: 'habit', label: 'Habit', icon: <Flame size={14} /> },
    { id: 'expense', label: 'Finance', icon: <Wallet size={14} /> },
    { id: 'food', label: 'Food', icon: <Utensils size={14} /> },
    { id: 'shopping', label: 'Shopping', icon: <ShoppingBag size={14} /> },
    { id: 'link', label: 'Link', icon: <Link2 size={14} /> },
  ] as const;

  return (
    <Modal
      isOpen={quickAddOpen}
      onClose={handleClose}
      title="Universal Quick Add"
      description="Create items instantly into your personal management system"
      maxWidth="max-w-xl"
    >
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#0D0D0D] border border-[#242424] rounded-xl mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[#E50914] text-white shadow-none'
                : 'text-[#AAAAAA] hover:text-[#FFFFFF] hover:bg-[#1A1A1A]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Task Form */}
      {activeTab === 'task' && (
        <form onSubmit={handleSaveTask} className="space-y-3.5">
          <Input
            label="Task Title *"
            placeholder="e.g. Finish quarterly project proposal"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            autoFocus
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as any)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
            <Input
              type="datetime-local"
              label="Due Date & Time"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />
          </div>
          <Select
            label="Category"
            value={taskCategory}
            onChange={(e) => setTaskCategory(e.target.value)}
            options={[
              { value: 'Personal', label: 'Personal' },
              { value: 'Work', label: 'Work' },
              { value: 'Health', label: 'Health' },
              { value: 'Finance', label: 'Finance' },
            ]}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[#202020]">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      )}

      {/* Event Form */}
      {activeTab === 'event' && (
        <form onSubmit={handleSaveEvent} className="space-y-3.5">
          <Input
            label="Event Title *"
            placeholder="e.g. Design review meeting"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            autoFocus
            required
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
              label="Start"
              value={eventStart}
              onChange={(e) => setEventStart(e.target.value)}
            />
            <Input
              type="time"
              label="End"
              value={eventEnd}
              onChange={(e) => setEventEnd(e.target.value)}
            />
          </div>
          <Input
            label="Location / Meeting Link"
            placeholder="e.g. Office Boardroom / Zoom"
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[#202020]">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save Event</Button>
          </div>
        </form>
      )}

      {/* Note Form */}
      {activeTab === 'note' && (
        <form onSubmit={handleSaveNote} className="space-y-3.5">
          <Input
            label="Note Title *"
            placeholder="e.g. Meeting notes or brainstorming idea"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            autoFocus
            required
          />
          <Textarea
            label="Content (Markdown supported)"
            placeholder="Write your note here..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={4}
          />
          <Input
            label="Tags (comma separated)"
            placeholder="ideas, architecture, sprint"
            value={noteTags}
            onChange={(e) => setNoteTags(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[#202020]">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save Note</Button>
          </div>
        </form>
      )}

      {/* Habit Form */}
      {activeTab === 'habit' && (
        <form onSubmit={handleSaveHabit} className="space-y-3.5">
          <Input
            label="Habit Name *"
            placeholder="e.g. 15-minute Morning Walk"
            value={habitTitle}
            onChange={(e) => setHabitTitle(e.target.value)}
            autoFocus
            required
          />
          <Select
            label="Frequency"
            value={habitFrequency}
            onChange={(e) => setHabitFrequency(e.target.value as any)}
            options={[
              { value: 'daily', label: 'Daily (7 days / week)' },
              { value: 'weekdays', label: 'Weekdays Only (Mon-Fri)' },
              { value: 'weekly', label: 'Weekly' },
            ]}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[#202020]">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create Habit</Button>
          </div>
        </form>
      )}

      {/* Expense Form */}
      {activeTab === 'expense' && (
        <form onSubmit={handleSaveExpense} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Type"
              value={txType}
              onChange={(e) => setTxType(e.target.value as any)}
              options={[
                { value: 'expense', label: 'Expense (-)' },
                { value: 'income', label: 'Income (+)' },
              ]}
            />
            <Input
              type="number"
              step="0.01"
              label="Amount (€) *"
              placeholder="0.00"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              autoFocus
              required
            />
          </div>
          <Input
            label="Payee / Merchant"
            placeholder="e.g. Supermarket, Landlord, Coffee shop"
            value={txPayee}
            onChange={(e) => setTxPayee(e.target.value)}
          />
          <Select
            label="Category"
            value={txCategory}
            onChange={(e) => setTxCategory(e.target.value)}
            options={StorageAPI.getCategories()
              .filter((c) => c.type === txType)
              .map((c) => ({ value: c.id, label: c.name }))}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[#202020]">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Record Transaction</Button>
          </div>
        </form>
      )}

      {/* Food Log Form */}
      {activeTab === 'food' && (
        <form onSubmit={handleSaveFood} className="space-y-3.5">
          <Input
            label="Food / Meal Name *"
            placeholder="e.g. Grilled Chicken Salad"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            autoFocus
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <Select
              label="Meal"
              value={foodMeal}
              onChange={(e) => setFoodMeal(e.target.value as any)}
              options={[
                { value: 'breakfast', label: 'Breakfast' },
                { value: 'lunch', label: 'Lunch' },
                { value: 'dinner', label: 'Dinner' },
                { value: 'snack', label: 'Snack' },
              ]}
            />
            <Input
              type="number"
              label="Calories (kcal)"
              placeholder="450"
              value={foodCalories}
              onChange={(e) => setFoodCalories(e.target.value)}
            />
            <Input
              type="number"
              label="Protein (g)"
              placeholder="35"
              value={foodProtein}
              onChange={(e) => setFoodProtein(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#202020]">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Log Food</Button>
          </div>
        </form>
      )}

      {/* Shopping Form */}
      {activeTab === 'shopping' && (
        <form onSubmit={handleSaveShopping} className="space-y-3.5">
          <Input
            label="Item Name *"
            placeholder="e.g. Organic Rolled Oats"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            autoFocus
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Quantity"
              value={shopQty}
              onChange={(e) => setShopQty(e.target.value)}
            />
            <Input
              type="number"
              step="0.01"
              label="Est. Price (€)"
              placeholder="2.50"
              value={shopEstPrice}
              onChange={(e) => setShopEstPrice(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#202020]">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add to Shopping</Button>
          </div>
        </form>
      )}

      {/* Link Form */}
      {activeTab === 'link' && (
        <form onSubmit={handleSaveLink} className="space-y-3.5">
          <Input
            label="URL *"
            placeholder="https://example.com/article"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            autoFocus
            required
          />
          <Input
            label="Title *"
            placeholder="e.g. Distributed Systems Architecture Guide"
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            required
          />
          <Select
            label="Category"
            value={linkCategory}
            onChange={(e) => setLinkCategory(e.target.value as any)}
            options={[
              { value: 'read_later', label: 'Read Later' },
              { value: 'watch_later', label: 'Watch Later' },
              { value: 'learn_later', label: 'Learn Later' },
              { value: 'research', label: 'Research' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[#202020]">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save Link</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
