'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { ShoppingList, ShoppingListItem } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
  Tag,
  DollarSign,
} from 'lucide-react';

export default function ShoppingPage() {
  const { storageVersion, refreshStorage, addToast, formatCurrency } = useDaymark();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string>('');
  const [items, setItems] = useState<ShoppingListItem[]>([]);

  // Quick item entry form
  const [quickName, setQuickName] = useState('');
  const [quickQty, setQuickQty] = useState('1');
  const [quickPrice, setQuickPrice] = useState('');

  // New list modal
  const [newListModal, setNewListModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListBudget, setNewListBudget] = useState('50');

  useEffect(() => {
    const allLists = StorageAPI.getShoppingLists();
    setLists(allLists);
    if (allLists.length > 0 && !activeListId) {
      setActiveListId(allLists[0].id);
    }
    setItems(StorageAPI.getShoppingItems(activeListId || allLists[0]?.id));
  }, [activeListId, storageVersion]);

  const activeList = lists.find((l) => l.id === activeListId) || lists[0];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || !activeList) return;

    const priceVal = parseFloat(quickPrice) || 0;
    const newItem: ShoppingListItem = {
      id: 'shop_' + Date.now(),
      listId: activeList.id,
      name: quickName.trim(),
      quantity: parseFloat(quickQty) || 1,
      unit: 'item',
      estimatedPriceCents: Math.round(priceVal * 100),
      category: 'General',
      isChecked: false,
      priority: 'normal',
      createdAt: new Date().toISOString(),
    };

    StorageAPI.saveShoppingItem(newItem);
    setQuickName('');
    setQuickQty('1');
    setQuickPrice('');
    refreshStorage();
  };

  const toggleItem = (item: ShoppingListItem) => {
    const updated = { ...item, isChecked: !item.isChecked };
    StorageAPI.saveShoppingItem(updated);
    refreshStorage();
  };

  const deleteItem = (id: string) => {
    StorageAPI.deleteShoppingItem(id);
    refreshStorage();
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    const bgt = parseFloat(newListBudget) || 0;
    const newList: ShoppingList = {
      id: 'list_' + Date.now(),
      title: newListTitle.trim(),
      category: 'General',
      color: '#EF4444',
      budgetCents: Math.round(bgt * 100),
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    StorageAPI.saveShoppingList(newList);
    setActiveListId(newList.id);
    setNewListTitle('');
    setNewListModalOpen(false);
    addToast('Shopping List Created', newList.title, 'success');
    refreshStorage();
  };

  // Calculations
  const uncheckedItems = items.filter((i) => !i.isChecked);
  const checkedItems = items.filter((i) => i.isChecked);
  const totalEstCents = items.reduce((acc, curr) => acc + curr.estimatedPriceCents * curr.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Shopping & Grocery Lists
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Organise supermarket items, calculate estimated cart totals, and check off items.
          </p>
        </div>

        <Button size="sm" onClick={() => setNewListModalOpen(true)} className="gap-1.5">
          <Plus size={15} />
          <span>New List</span>
        </Button>
      </div>

      {/* List Selectors */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
        {lists.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveListId(l.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeList?.id === l.id
                ? 'bg-[#E50914] text-white font-semibold'
                : 'bg-[#141414] text-[#AAAAAA] hover:text-white border border-[#242424]'
            }`}
          >
            <span>{l.title}</span>
          </button>
        ))}
      </div>

      {/* Quick Add Bar */}
      <Card>
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2.5 items-center">
          <Input
            placeholder="Add an item (e.g. Oat milk, Whole wheat pasta)..."
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            className="flex-1"
            required
          />
          <Input
            type="number"
            placeholder="Qty"
            value={quickQty}
            onChange={(e) => setQuickQty(e.target.value)}
            className="w-full sm:w-20"
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Est. €"
            value={quickPrice}
            onChange={(e) => setQuickPrice(e.target.value)}
            className="w-full sm:w-24"
          />
          <Button type="submit" size="md" className="w-full sm:w-auto shrink-0 gap-1.5">
            <Plus size={16} />
            <span>Add Item</span>
          </Button>
        </form>
      </Card>

      {/* Estimated Totals and Status */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141414] border border-[#242424] rounded-xl text-xs font-mono">
        <span className="text-[#AAAAAA]">
          {uncheckedItems.length} items to buy • {checkedItems.length} in cart
        </span>
        <span className="text-white font-bold">
          Estimated Total: {formatCurrency(totalEstCents)}
        </span>
      </div>

      {/* Items Checklist */}
      <div className="space-y-2">
        {/* Unchecked */}
        {uncheckedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#141414] border border-[#242424] hover:border-[#383838] transition-colors"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={item.isChecked}
                onChange={() => toggleItem(item)}
                className="h-5 w-5 rounded border-[#282828] bg-[#0D0D0D] text-[#E50914] cursor-pointer"
              />
              <div>
                <p className="text-sm font-medium text-white">{item.name}</p>
                <span className="text-[11px] text-[#777777]">Qty: {item.quantity}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {item.estimatedPriceCents > 0 && (
                <span className="font-mono text-xs text-[#AAAAAA]">
                  {formatCurrency(item.estimatedPriceCents * item.quantity)}
                </span>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteItem(item.id)}
                className="h-7 w-7 text-[#777777] hover:text-[#E50914]"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}

        {/* Checked */}
        {checkedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D0D0D] border border-[#1C1C1C] opacity-50"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={item.isChecked}
                onChange={() => toggleItem(item)}
                className="h-5 w-5 rounded border-[#282828] bg-[#0D0D0D] text-[#E50914] cursor-pointer"
              />
              <span className="text-sm font-medium text-[#777777] line-through">
                {item.name} ({item.quantity})
              </span>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => deleteItem(item.id)}
              className="h-7 w-7 text-[#777777] hover:text-[#E50914]"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-14 bg-[#141414] border border-[#242424] rounded-xl">
            <ShoppingBag size={36} className="mx-auto text-[#777777] mb-2 opacity-40" />
            <p className="text-sm font-medium text-[#AAAAAA]">This shopping list is empty</p>
            <p className="text-xs text-[#777777] mt-1">
              Add items using the bar above or Quick Add (⌘B).
            </p>
          </div>
        )}
      </div>

      {/* New List Modal */}
      <Modal
        isOpen={newListModal}
        onClose={() => setNewListModalOpen(false)}
        title="Create Shopping List"
      >
        <form onSubmit={handleCreateList} className="space-y-3">
          <Input
            label="List Title *"
            placeholder="e.g. Hardware Store, Tech Wishlist"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            required
            autoFocus
          />
          <Input
            type="number"
            step="0.01"
            label="Budget Target (€)"
            placeholder="50.00"
            value={newListBudget}
            onChange={(e) => setNewListBudget(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2F38]">
            <Button type="button" variant="ghost" onClick={() => setNewListModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create List</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
