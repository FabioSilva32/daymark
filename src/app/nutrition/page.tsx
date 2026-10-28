'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { FoodEntry, NutritionGoals } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Utensils,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Flame,
  PieChart,
  Settings,
} from 'lucide-react';

export default function NutritionPage() {
  const { storageVersion, refreshStorage, addToast } = useDaymark();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [goals, setGoals] = useState<NutritionGoals>(StorageAPI.getNutritionGoals());

  // Modal for new food item
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Goals modal
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [goalCalories, setGoalCalories] = useState(String(goals.dailyCalories));
  const [goalProtein, setGoalProtein] = useState(String(goals.dailyProteinG));
  const [goalCarbs, setGoalCarbs] = useState(String(goals.dailyCarbsG));
  const [goalFat, setGoalFat] = useState(String(goals.dailyFatG));

  useEffect(() => {
    const all = StorageAPI.getFoodEntries();
    setFoodEntries(all.filter((f) => f.date === selectedDate));
    const currentGoals = StorageAPI.getNutritionGoals();
    setGoals(currentGoals);
    setGoalCalories(String(currentGoals.dailyCalories));
    setGoalProtein(String(currentGoals.dailyProteinG));
    setGoalCarbs(String(currentGoals.dailyCarbsG));
    setGoalFat(String(currentGoals.dailyFatG));
  }, [selectedDate, storageVersion]);

  // Derived macros
  const totalCalories = foodEntries.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = foodEntries.reduce((acc, curr) => acc + curr.proteinG, 0);
  const totalCarbs = foodEntries.reduce((acc, curr) => acc + curr.carbsG, 0);
  const totalFat = foodEntries.reduce((acc, curr) => acc + curr.fatG, 0);

  const calPct = Math.min(100, Math.round((totalCalories / goals.dailyCalories) * 100));
  const proteinPct = Math.min(100, Math.round((totalProtein / goals.dailyProteinG) * 100));
  const carbsPct = Math.min(100, Math.round((totalCarbs / goals.dailyCarbsG) * 100));
  const fatPct = Math.min(100, Math.round((totalFat / goals.dailyFatG) * 100));

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    const newFood: FoodEntry = {
      id: 'food_' + Date.now(),
      customName: foodName.trim(),
      date: selectedDate,
      mealType,
      servings: 1,
      calories: parseInt(calories, 10) || 0,
      proteinG: parseFloat(protein) || 0,
      carbsG: parseFloat(carbs) || 0,
      fatG: parseFloat(fat) || 0,
      createdAt: new Date().toISOString(),
    };

    StorageAPI.saveFoodEntry(newFood);
    addToast('Food Logged', `${newFood.customName} (${newFood.calories} kcal)`, 'success');
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setIsAddModalOpen(false);
    refreshStorage();
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedGoals: NutritionGoals = {
      ...goals,
      dailyCalories: parseInt(goalCalories, 10) || 2200,
      dailyProteinG: parseInt(goalProtein, 10) || 150,
      dailyCarbsG: parseInt(goalCarbs, 10) || 200,
      dailyFatG: parseInt(goalFat, 10) || 70,
    };
    StorageAPI.saveNutritionGoals(updatedGoals);
    setGoals(updatedGoals);
    setIsGoalsModalOpen(false);
    addToast('Goals Updated', 'Daily nutrition targets saved', 'success');
    refreshStorage();
  };

  const deleteFood = (id: string) => {
    StorageAPI.deleteFoodEntry(id);
    addToast('Food Entry Removed', undefined, 'info');
    refreshStorage();
  };

  const meals = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snacks' },
  ] as const;

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C] min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white truncate">
            Daily Nutrition & Macros
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Log meals, track macro targets (protein, carbs, fat), and monitor caloric balance.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="h-9 w-9 shrink-0 bg-[#181818] border-[#242424] text-white hover:text-white"
            >
              <ChevronLeft size={16} />
            </Button>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 sm:w-36 text-xs h-9 bg-[#141414] border-[#242424] text-white min-w-0"
            />
            <Button
              size="icon"
              variant="secondary"
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="h-9 w-9 shrink-0 bg-[#181818] border-[#242424] text-white hover:text-white"
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsGoalsModalOpen(true)}
              title="Configure Targets"
              className="flex-1 sm:flex-initial bg-[#181818] border-[#242424] text-[#AAAAAA] hover:text-white hover:border-[#E50914] h-9"
            >
              <Settings size={14} className="mr-1.5" />
              <span>Targets</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-initial gap-1.5 bg-[#E50914] hover:bg-[#C11119] text-white h-9"
            >
              <Plus size={15} />
              <span>Log Food</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Macro Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        {/* Calories */}
        <Card className="p-4 bg-[#141414] border border-[#242424] rounded-xl">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs text-[#AAAAAA] font-heading font-semibold">Calories</span>
            <span className="font-mono text-sm font-bold text-white">
              {totalCalories} / {goals.dailyCalories}
            </span>
          </div>
          <div className="w-full bg-[#181818] h-2 rounded-full overflow-hidden border border-[#242424]">
            <div
              className="bg-[#E50914] h-full transition-all duration-300"
              style={{ width: `${calPct}%` }}
            />
          </div>
          <span className="text-[10px] text-[#777777] mt-2 block font-mono">{calPct}% of daily target</span>
        </Card>

        {/* Protein */}
        <Card className="p-4 bg-[#141414] border border-[#242424] rounded-xl">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs text-[#AAAAAA] font-heading font-semibold">Protein</span>
            <span className="font-mono text-sm font-bold text-white">
              {totalProtein}g / {goals.dailyProteinG}g
            </span>
          </div>
          <div className="w-full bg-[#181818] h-2 rounded-full overflow-hidden border border-[#242424]">
            <div
              className="bg-[#E50914] h-full transition-all duration-300 opacity-90"
              style={{ width: `${proteinPct}%` }}
            />
          </div>
          <span className="text-[10px] text-[#777777] mt-2 block font-mono">{proteinPct}% of daily target</span>
        </Card>

        {/* Carbs */}
        <Card className="p-4 bg-[#141414] border border-[#242424] rounded-xl">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs text-[#AAAAAA] font-heading font-semibold">Carbs</span>
            <span className="font-mono text-sm font-bold text-white">
              {totalCarbs}g / {goals.dailyCarbsG}g
            </span>
          </div>
          <div className="w-full bg-[#181818] h-2 rounded-full overflow-hidden border border-[#242424]">
            <div
              className="bg-[#E50914] h-full transition-all duration-300 opacity-75"
              style={{ width: `${carbsPct}%` }}
            />
          </div>
          <span className="text-[10px] text-[#777777] mt-2 block font-mono">{carbsPct}% of daily target</span>
        </Card>

        {/* Fat */}
        <Card className="p-4 bg-[#141414] border border-[#242424] rounded-xl">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs text-[#AAAAAA] font-heading font-semibold">Fat</span>
            <span className="font-mono text-sm font-bold text-white">
              {totalFat}g / {goals.dailyFatG}g
            </span>
          </div>
          <div className="w-full bg-[#181818] h-2 rounded-full overflow-hidden border border-[#242424]">
            <div
              className="bg-[#E50914] h-full transition-all duration-300 opacity-60"
              style={{ width: `${fatPct}%` }}
            />
          </div>
          <span className="text-[10px] text-[#777777] mt-2 block font-mono">{fatPct}% of daily target</span>
        </Card>
      </div>

      {/* Meals Diary */}
      <div className="space-y-4">
        {meals.map((meal) => {
          const items = foodEntries.filter((f) => f.mealType === meal.id);
          const mealCalories = items.reduce((acc, curr) => acc + curr.calories, 0);

          return (
            <Card key={meal.id} className="p-5 bg-[#141414] border border-[#242424] rounded-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1C1C1C]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-heading text-white">{meal.label}</h3>
                  <Badge variant="muted">{items.length} items</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-white">
                    {mealCalories} kcal
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setMealType(meal.id);
                      setIsAddModalOpen(true);
                    }}
                    className="h-7 text-xs text-[#E50914] hover:text-[#C11119] hover:bg-transparent"
                  >
                    + Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-[#242424] text-xs hover:border-[#333333] transition-colors"
                    >
                      <div>
                        <p className="font-medium text-white">{item.customName}</p>
                        <p className="text-[10px] text-[#AAAAAA] mt-0.5 font-mono">
                          P: {item.proteinG}g • C: {item.carbsG}g • F: {item.fatG}g
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-white">
                          {item.calories} kcal
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteFood(item.id)}
                          className="h-7 w-7 text-[#777777] hover:text-[#E50914] hover:bg-transparent"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#777777] py-3 text-center">
                    No items recorded for {meal.label.toLowerCase()}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Food Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Food Item"
        description="Record food and macronutrient values into your daily diary"
      >
        <form onSubmit={handleAddFood} className="space-y-4">
          <Input
            label="Food / Meal Name *"
            placeholder="e.g. Scrambled Eggs with Sourdough Toast"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            required
            autoFocus
          />
          <Select
            label="Meal Type"
            value={mealType}
            onChange={(e) => setMealType(e.target.value as any)}
            options={[
              { value: 'breakfast', label: 'Breakfast' },
              { value: 'lunch', label: 'Lunch' },
              { value: 'dinner', label: 'Dinner' },
              { value: 'snack', label: 'Snack' },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Calories (kcal) *"
              placeholder="350"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              required
            />
            <Input
              type="number"
              step="0.1"
              label="Protein (g)"
              placeholder="24"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              step="0.1"
              label="Carbohydrates (g)"
              placeholder="30"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
            />
            <Input
              type="number"
              step="0.1"
              label="Fat (g)"
              placeholder="12"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#1C1C1C]">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#E50914] hover:bg-[#C11119] text-white">Log Food</Button>
          </div>
        </form>
      </Modal>

      {/* Goals Modal */}
      <Modal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        title="Configure Daily Nutrition Targets"
        description="Set your caloric ceiling and macronutrient distribution"
      >
        <form onSubmit={handleSaveGoals} className="space-y-4">
          <Input
            type="number"
            label="Daily Calories (kcal)"
            value={goalCalories}
            onChange={(e) => setGoalCalories(e.target.value)}
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              label="Protein (g)"
              value={goalProtein}
              onChange={(e) => setGoalProtein(e.target.value)}
              required
            />
            <Input
              type="number"
              label="Carbs (g)"
              value={goalCarbs}
              onChange={(e) => setGoalCarbs(e.target.value)}
              required
            />
            <Input
              type="number"
              label="Fat (g)"
              value={goalFat}
              onChange={(e) => setGoalFat(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#1C1C1C]">
            <Button type="button" variant="ghost" onClick={() => setIsGoalsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#E50914] hover:bg-[#C11119] text-white">Save Targets</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
