'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { Recipe, MealPlan, RecipeIngredient } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  ChefHat,
  Plus,
  Trash2,
  Calendar,
  ShoppingBag,
  Clock,
  Flame,
  Utensils,
} from 'lucide-react';

export default function MealPlannerPage() {
  const { storageVersion, refreshStorage, addToast } = useDaymark();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'planner' | 'recipes'>('planner');

  // Recipe Modal
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState('2');
  const [prepTime, setPrepTime] = useState('15');
  const [cookTime, setCookTime] = useState('20');
  const [calories, setCalories] = useState('450');
  const [protein, setProtein] = useState('35');
  const [ingredientList, setIngredientList] = useState<{ name: string; amount: string; unit: string }[]>([
    { name: '', amount: '1', unit: 'item' },
  ]);
  const [instructionsText, setInstructionsText] = useState('');

  // Assign Meal Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignMealType, setAssignMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [assignRecipeId, setAssignRecipeId] = useState('');
  const [assignCustomTitle, setAssignCustomTitle] = useState('');

  useEffect(() => {
    const r = StorageAPI.getRecipes();
    setRecipes(r);
    if (r.length > 0 && !assignRecipeId) {
      setAssignRecipeId(r[0].id);
    }
    setMealPlans(StorageAPI.getMealPlans());
  }, [storageVersion]);

  // Next 7 days for weekly meal planner
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: i === 0,
    };
  });

  const handleAddIngredientRow = () => {
    setIngredientList([...ingredientList, { name: '', amount: '1', unit: 'item' }]);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validIngredients = ingredientList.filter((ing) => ing.name.trim());
    const instructions = instructionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newRecipe: Recipe = {
      id: 'rec_' + Date.now(),
      title: title.trim(),
      description: description.trim() || undefined,
      servings: parseInt(servings, 10) || 2,
      prepTimeMin: parseInt(prepTime, 10) || 15,
      cookTimeMin: parseInt(cookTime, 10) || 20,
      ingredients: validIngredients,
      instructions,
      caloriesPerServing: parseInt(calories, 10) || undefined,
      proteinPerServing: parseFloat(protein) || undefined,
      isFavorite: false,
      tags: [],
      createdAt: new Date().toISOString(),
    };

    StorageAPI.saveRecipe(newRecipe);
    addToast('Recipe Saved', newRecipe.title, 'success');
    setTitle('');
    setDescription('');
    setRecipeModalOpen(false);
    refreshStorage();
  };

  const handleAssignMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const recipeObj = recipes.find((r) => r.id === assignRecipeId);
    const mealTitle = assignCustomTitle.trim() || recipeObj?.title || 'Planned Meal';

    const newPlan: MealPlan = {
      id: 'plan_' + Date.now(),
      recipeId: assignRecipeId || undefined,
      customMealTitle: mealTitle,
      planDate: assignDate,
      mealType: assignMealType,
    };

    StorageAPI.saveMealPlan(newPlan);
    addToast('Meal Scheduled', `${mealTitle} on ${assignDate}`, 'success');
    setAssignModalOpen(false);
    refreshStorage();
  };

  const deletePlan = (id: string) => {
    StorageAPI.deleteMealPlan(id);
    refreshStorage();
  };

  const addIngredientsToGroceryList = (recipe: Recipe) => {
    const lists = StorageAPI.getShoppingLists();
    const targetListId = lists[0]?.id || 'list_groceries';

    recipe.ingredients.forEach((ing) => {
      StorageAPI.saveShoppingItem({
        id: 'shop_' + Math.random().toString(36).substring(2, 9),
        listId: targetListId,
        name: ing.name,
        quantity: parseFloat(ing.amount) || 1,
        unit: ing.unit || 'item',
        estimatedPriceCents: 0,
        category: 'Groceries',
        isChecked: false,
        priority: 'normal',
        createdAt: new Date().toISOString(),
      });
    });

    addToast(
      'Ingredients Added to Shopping List',
      `${recipe.ingredients.length} items added to ${lists[0]?.title || 'Groceries'}`,
      'success'
    );
    refreshStorage();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Meal Planner & Recipe Book
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Plan weekly menus, store nutritious recipes, and generate shopping lists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setRecipeModalOpen(true)}>
            + New Recipe
          </Button>
          <Button size="sm" onClick={() => setAssignModalOpen(true)} className="gap-1.5">
            <Plus size={15} />
            <span>Plan Meal</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#141414] border border-[#242424] rounded-xl text-xs w-fit">
        <button
          onClick={() => setActiveTab('planner')}
          className={`px-3 py-1.5 rounded-lg transition-colors text-xs ${
            activeTab === 'planner'
              ? 'bg-[#E50914] text-white font-semibold'
              : 'text-[#AAAAAA] hover:text-white'
          }`}
        >
          Weekly Planner
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={`px-3 py-1.5 rounded-lg transition-colors text-xs ${
            activeTab === 'recipes'
              ? 'bg-[#E50914] text-white font-semibold'
              : 'text-[#AAAAAA] hover:text-white'
          }`}
        >
          Recipe Catalogue ({recipes.length})
        </button>
      </div>

      {/* 1. WEEKLY PLANNER */}
      {activeTab === 'planner' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((d) => {
            const dayPlans = mealPlans.filter((p) => p.planDate === d.date);

            return (
              <Card
                key={d.date}
                className={`p-3 min-h-[160px] flex flex-col justify-between rounded-xl border ${
                  d.isToday ? 'border-[#E50914]/60 bg-[#170C0D]' : 'border-[#242424] bg-[#141414]'
                }`}
              >
                <div>
                  <div className="flex items-baseline justify-between mb-2 pb-1.5 border-b border-[#242424]">
                    <span
                      className={`text-xs font-bold font-heading ${
                        d.isToday ? 'text-[#E50914]' : 'text-white'
                      }`}
                    >
                      {d.dayName}
                    </span>
                    <span className="text-[11px] font-mono text-[#777777]">{d.dayNumber}</span>
                  </div>

                  <div className="space-y-1.5">
                    {dayPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="p-2 bg-[#181818] border border-[#242424] rounded-lg text-[11px] flex items-center justify-between group"
                      >
                        <div className="truncate">
                          <span className="text-[9px] uppercase font-bold text-[#E50914] block font-heading">
                            {plan.mealType}
                          </span>
                          <span className="truncate text-white font-medium block">
                            {plan.customMealTitle}
                          </span>
                        </div>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="hidden group-hover:inline text-[#777777] hover:text-[#E50914] ml-1"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {dayPlans.length === 0 && (
                      <span className="text-[10px] text-[#737B89] italic block text-center py-4">
                        Unplanned
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAssignDate(d.date);
                    setAssignModalOpen(true);
                  }}
                  className="w-full text-[11px] h-7 text-[#737B89] hover:text-[#EF4444] mt-2"
                >
                  + Add
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* 2. RECIPES */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((rec) => (
            <Card key={rec.id} className="p-4 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#F3F4F6]">{rec.title}</h4>
                    <p className="text-[11px] text-[#737B89] mt-0.5">{rec.description}</p>
                  </div>
                  <Badge variant="muted">{rec.servings} servings</Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#A0A6B2] mt-2">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock size={12} /> {rec.prepTimeMin + rec.cookTimeMin}m
                  </span>
                  {rec.caloriesPerServing && (
                    <span className="font-mono text-[#EF4444]">
                      {rec.caloriesPerServing} kcal
                    </span>
                  )}
                  {rec.proteinPerServing && (
                    <span className="font-mono text-[#3B82F6]">
                      {rec.proteinPerServing}g P
                    </span>
                  )}
                </div>

                {/* Ingredients snippet */}
                <div className="mt-3 pt-3 border-t border-[#2A2F38]">
                  <p className="text-[11px] font-semibold text-[#A0A6B2] mb-1">
                    Ingredients ({rec.ingredients.length}):
                  </p>
                  <ul className="text-xs text-[#737B89] space-y-0.5 list-disc pl-4">
                    {rec.ingredients.slice(0, 4).map((ing, i) => (
                      <li key={i}>
                        {ing.name} ({ing.amount} {ing.unit})
                      </li>
                    ))}
                    {rec.ingredients.length > 4 && (
                      <li className="italic">+{rec.ingredients.length - 4} more</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2A2F38]">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    StorageAPI.deleteRecipe(rec.id);
                    refreshStorage();
                  }}
                  className="h-8 w-8 text-[#737B89] hover:text-[#EF4444]"
                >
                  <Trash2 size={14} />
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => addIngredientsToGroceryList(rec)}
                  className="gap-1.5 text-xs"
                >
                  <ShoppingBag size={13} />
                  <span>Send to Groceries</span>
                </Button>
              </div>
            </Card>
          ))}

          {recipes.length === 0 && (
            <div className="col-span-full text-center py-14 bg-[#141414] border border-[#242424] rounded-xl">
              <ChefHat size={36} className="mx-auto text-[#777777] mb-2 opacity-40" />
              <p className="text-sm font-medium text-[#AAAAAA]">No recipes added yet</p>
              <p className="text-xs text-[#777777] mt-1">
                Add your favorite meals to plan weekly and generate ingredient lists.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Plan Meal Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Schedule Planned Meal"
      >
        <form onSubmit={handleAssignMeal} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Date"
              value={assignDate}
              onChange={(e) => setAssignDate(e.target.value)}
              required
            />
            <Select
              label="Meal"
              value={assignMealType}
              onChange={(e) => setAssignMealType(e.target.value as any)}
              options={[
                { value: 'breakfast', label: 'Breakfast' },
                { value: 'lunch', label: 'Lunch' },
                { value: 'dinner', label: 'Dinner' },
                { value: 'snack', label: 'Snack' },
              ]}
            />
          </div>

          <Input
            label="Custom Meal Title (optional)"
            placeholder="e.g. Salmon Bowl or select from saved recipes below"
            value={assignCustomTitle}
            onChange={(e) => setAssignCustomTitle(e.target.value)}
          />

          {recipes.length > 0 && (
            <Select
              label="Or choose from Saved Recipes"
              value={assignRecipeId}
              onChange={(e) => setAssignRecipeId(e.target.value)}
              options={[
                { value: '', label: '-- None (Use custom title) --' },
                ...recipes.map((r) => ({ value: r.id, label: r.title })),
              ]}
            />
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2F38]">
            <Button type="button" variant="ghost" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add to Meal Plan</Button>
          </div>
        </form>
      </Modal>

      {/* Recipe Creation Modal */}
      <Modal
        isOpen={recipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        title="Add New Recipe"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveRecipe} className="space-y-4">
          <Input
            label="Recipe Title *"
            placeholder="e.g. High-Protein Chicken Burrito Bowl"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Short Description"
            placeholder="e.g. Quick 20-minute meal prep bowl with black beans and avocado"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-4 gap-2">
            <Input
              type="number"
              label="Servings"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
            <Input
              type="number"
              label="Prep (min)"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
            />
            <Input
              type="number"
              label="Calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
            <Input
              type="number"
              label="Protein (g)"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#A0A6B2]">Ingredients</label>
              <button
                type="button"
                onClick={handleAddIngredientRow}
                className="text-xs text-[#EF4444] hover:underline"
              >
                + Add Ingredient
              </button>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {ingredientList.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="Ingredient name (e.g. Chicken breast)"
                    value={ing.name}
                    onChange={(e) => {
                      const updated = [...ingredientList];
                      updated[idx].name = e.target.value;
                      setIngredientList(updated);
                    }}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Qty"
                    value={ing.amount}
                    onChange={(e) => {
                      const updated = [...ingredientList];
                      updated[idx].amount = e.target.value;
                      setIngredientList(updated);
                    }}
                    className="w-20"
                  />
                  <Input
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) => {
                      const updated = [...ingredientList];
                      updated[idx].unit = e.target.value;
                      setIngredientList(updated);
                    }}
                    className="w-24"
                  />
                </div>
              ))}
            </div>
          </div>

          <Textarea
            label="Instructions (one step per line)"
            placeholder="1. Season chicken with salt and cumin.&#10;2. Pan sear on medium-high heat for 6 mins per side."
            value={instructionsText}
            onChange={(e) => setInstructionsText(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2F38]">
            <Button type="button" variant="ghost" onClick={() => setRecipeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Recipe</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
