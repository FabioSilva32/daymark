'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { Transaction, TransactionCategory, Budget, SavingsGoal } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Wallet,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Target,
  Download,
  Calendar,
  PiggyBank,
} from 'lucide-react';

export default function FinancePage() {
  const { storageVersion, refreshStorage, addToast, formatCurrency } = useDaymark();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'transactions' | 'budgets' | 'goals'>('transactions');

  // Filter state
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Transaction Modal
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [payee, setPayee] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Budget Modal
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');

  // Savings Goal Modal
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('0');

  useEffect(() => {
    setTransactions(StorageAPI.getTransactions());
    const cats = StorageAPI.getCategories();
    setCategories(cats);
    if (cats.length > 0 && !categoryId) {
      setCategoryId(cats[0].id);
      setBudgetCategory(cats[0].id);
    }
    setBudgets(StorageAPI.getBudgets());
    setSavingsGoals(StorageAPI.getSavingsGoals());
  }, [storageVersion]);

  // Minor-unit arithmetic (cents)
  const totalIncomeCents = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amountCents, 0);

  const totalExpenseCents = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amountCents, 0);

  const netBalanceCents = totalIncomeCents - totalExpenseCents;

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      categoryId: categoryId || categories[0]?.id || 'cat_default',
      type: txType,
      amountCents: Math.round(val * 100),
      currency: 'EUR',
      date: txDate,
      payeeMerchant: payee.trim() || 'General',
      notes: notes.trim() || undefined,
      tags: [],
      isRecurring: false,
      createdAt: new Date().toISOString(),
    };

    StorageAPI.saveTransaction(newTx);
    addToast(
      'Transaction Saved',
      `${txType === 'expense' ? '-' : '+'}${formatCurrency(newTx.amountCents)}`,
      'success'
    );
    setAmount('');
    setPayee('');
    setNotes('');
    setTxModalOpen(false);
    refreshStorage();
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limitVal = parseFloat(budgetLimit);
    if (isNaN(limitVal) || limitVal <= 0) return;

    const currentMonth = new Date().toISOString().substring(0, 7);
    const newBudget: Budget = {
      id: 'bgt_' + Date.now(),
      categoryId: budgetCategory,
      monthYear: currentMonth,
      limitCents: Math.round(limitVal * 100),
      currency: 'EUR',
    };

    StorageAPI.saveBudget(newBudget);
    addToast('Budget Configured', undefined, 'success');
    setBudgetLimit('');
    setBudgetModalOpen(false);
    refreshStorage();
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(goalTarget);
    const currVal = parseFloat(goalCurrent) || 0;
    if (isNaN(targetVal) || targetVal <= 0) return;

    const newGoal: SavingsGoal = {
      id: 'goal_' + Date.now(),
      name: goalName.trim(),
      targetAmountCents: Math.round(targetVal * 100),
      currentAmountCents: Math.round(currVal * 100),
      currency: 'EUR',
      color: '#EF4444',
      isCompleted: false,
    };

    StorageAPI.saveSavingsGoal(newGoal);
    addToast('Savings Goal Created', newGoal.name, 'success');
    setGoalName('');
    setGoalTarget('');
    setGoalCurrent('0');
    setGoalModalOpen(false);
    refreshStorage();
  };

  const deleteTx = (id: string) => {
    StorageAPI.deleteTransaction(id);
    addToast('Transaction Removed', undefined, 'info');
    refreshStorage();
  };

  const catMap = new Map(categories.map((c) => [c.id, c]));

  // Filter transactions
  const filteredTxs = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Personal Finance & Budgets
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Track expenses, manage category budgets, and monitor savings targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const csv = StorageAPI.exportFinanceCSV();
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `daymark_finances_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              addToast('CSV Exported', 'Finances saved to CSV', 'success');
            }}
            className="gap-1.5"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </Button>

          <Button size="sm" onClick={() => setTxModalOpen(true)} className="gap-1.5">
            <Plus size={15} />
            <span>Record Transaction</span>
          </Button>
        </div>
      </div>

      {/* Hero Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Cash Flow */}
        <Card className="p-4 border border-[#242424] rounded-xl bg-[#141414]">
          <span className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold font-heading">
            Net Cash Flow
          </span>
          <p
            className={`text-2xl font-mono font-bold mt-1 ${
              netBalanceCents >= 0 ? 'text-[#10B981]' : 'text-[#E50914]'
            }`}
          >
            {formatCurrency(netBalanceCents)}
          </p>
          <span className="text-[11px] text-[#777777] mt-1 block">Income minus expenses</span>
        </Card>

        {/* Total Income */}
        <Card className="p-4 border border-[#242424] rounded-xl bg-[#141414]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold font-heading">
                Recorded Income
              </span>
              <p className="text-2xl font-mono font-bold text-[#10B981] mt-1">
                {formatCurrency(totalIncomeCents)}
              </p>
            </div>
            <TrendingUp size={18} className="text-[#10B981]" />
          </div>
          <span className="text-[11px] text-[#777777] mt-1 block">Deposits & salary</span>
        </Card>

        {/* Total Expenses */}
        <Card className="p-4 border border-[#242424] rounded-xl bg-[#141414]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold font-heading">
                Recorded Expenses
              </span>
              <p className="text-2xl font-mono font-bold text-[#E50914] mt-1">
                {formatCurrency(totalExpenseCents)}
              </p>
            </div>
            <TrendingDown size={18} className="text-[#E50914]" />
          </div>
          <span className="text-[11px] text-[#777777] mt-1 block">Outgoing transactions</span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#141414] border border-[#242424] rounded-xl text-xs w-fit">
        {[
          { id: 'transactions', label: 'Transactions' },
          { id: 'budgets', label: 'Category Budgets' },
          { id: 'goals', label: 'Savings Goals' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1.5 rounded-lg transition-colors text-xs ${
              activeTab === t.id
                ? 'bg-[#E50914] text-white font-semibold'
                : 'text-[#AAAAAA] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1">
              {['all', 'expense', 'income'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTypeFilter(tf as any)}
                  className={`px-3 py-1 rounded capitalize transition-colors ${
                    typeFilter === tf
                      ? 'bg-[#1D2128] text-[#F3F4F6] font-semibold border border-[#2A2F38]'
                      : 'text-[#737B89] hover:text-[#F3F4F6]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <span className="text-[#737B89] font-mono">{filteredTxs.length} records</span>
          </div>

          {/* Transactions List */}
          <div className="space-y-2">
            {filteredTxs.length > 0 ? (
              filteredTxs.map((tx) => {
                const cat = catMap.get(tx.categoryId);
                const isExpense = tx.type === 'expense';

                return (
                  <Card key={tx.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${
                          isExpense
                            ? 'bg-[#2D1518] text-[#EF4444] border border-[#EF4444]/30'
                            : 'bg-[#12281E] text-[#10B981] border border-[#10B981]/30'
                        }`}
                      >
                        {isExpense ? '−' : '+'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#F3F4F6]">{tx.payeeMerchant}</p>
                        <div className="flex items-center gap-2 text-[11px] text-[#737B89] mt-0.5">
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span>{cat?.name || 'General'}</span>
                          {tx.notes && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-xs">{tx.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono font-bold text-sm ${
                          isExpense ? 'text-[#EF4444]' : 'text-[#10B981]'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.amountCents)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteTx(tx.id)}
                        className="h-7 w-7 text-[#737B89] hover:text-[#EF4444]"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-14 bg-[#141414] border border-[#242424] rounded-xl">
                <Wallet size={36} className="mx-auto text-[#777777] mb-2 opacity-40" />
                <p className="text-sm font-medium text-[#AAAAAA]">No transactions recorded</p>
                <p className="text-xs text-[#777777] mt-1">
                  Click 'Record Transaction' above to log income or expenses.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. BUDGETS TAB */}
      {activeTab === 'budgets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-[#F3F4F6]">Monthly Category Budgets</h3>
            <Button size="sm" onClick={() => setBudgetModalOpen(true)}>
              + Set Budget
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => {
              const cat = catMap.get(b.categoryId);
              // Calculate spending in this category for current month
              const currentMonth = new Date().toISOString().substring(0, 7);
              const spentCents = transactions
                .filter(
                  (t) =>
                    t.categoryId === b.categoryId &&
                    t.type === 'expense' &&
                    t.date.startsWith(currentMonth)
                )
                .reduce((acc, curr) => acc + curr.amountCents, 0);

              const pct = Math.min(100, Math.round((spentCents / b.limitCents) * 100));
              const remaining = b.limitCents - spentCents;

              return (
                <Card key={b.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-[#F3F4F6]">
                        {cat?.name || 'Category'}
                      </h4>
                      <span className="text-[11px] text-[#737B89]">
                        Limit: {formatCurrency(b.limitCents)}
                      </span>
                    </div>
                    <Badge variant={pct >= 100 ? 'red' : pct >= 80 ? 'warning' : 'muted'}>
                      {pct}%
                    </Badge>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#A0A6B2]">Spent: {formatCurrency(spentCents)}</span>
                      <span className={remaining < 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}>
                        Left: {formatCurrency(remaining)}
                      </span>
                    </div>
                    <div className="w-full bg-[#101216] h-2 rounded overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          pct >= 100 ? 'bg-[#EF4444]' : 'bg-[#3B82F6]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}

            {budgets.length === 0 && (
              <div className="col-span-full text-center py-14 bg-[#141414] border border-[#242424] rounded-xl">
                <Target size={36} className="mx-auto text-[#777777] mb-2 opacity-40" />
                <p className="text-sm font-medium text-[#AAAAAA]">No category budgets configured</p>
                <p className="text-xs text-[#777777] mt-1">
                  Set monthly budgets (e.g. Groceries €300, Dining Out €150) to monitor spending.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SAVINGS GOALS TAB */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white font-heading">Savings & Financial Targets</h3>
            <Button size="sm" onClick={() => setGoalModalOpen(true)}>
              + New Savings Goal
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savingsGoals.map((g) => {
              const pct = Math.min(
                100,
                Math.round((g.currentAmountCents / g.targetAmountCents) * 100)
              );

              return (
                <Card key={g.id} className="p-4 space-y-3 rounded-xl border border-[#242424] bg-[#141414]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-white font-heading">{g.name}</h4>
                      <p className="text-[11px] text-[#777777]">
                        Target: {formatCurrency(g.targetAmountCents)}
                      </p>
                    </div>
                    <Badge variant={pct >= 100 ? 'success' : 'red'}>{pct}%</Badge>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white font-bold">
                        {formatCurrency(g.currentAmountCents)}
                      </span>
                      <span className="text-[#777777]">
                        Remaining: {formatCurrency(g.targetAmountCents - g.currentAmountCents)}
                      </span>
                    </div>
                    <div className="w-full bg-[#181818] border border-[#242424] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#10B981] h-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}

            {savingsGoals.length === 0 && (
              <div className="col-span-full text-center py-14 bg-[#141414] border border-[#242424] rounded-xl">
                <PiggyBank size={36} className="mx-auto text-[#777777] mb-2 opacity-40" />
                <p className="text-sm font-medium text-[#AAAAAA]">No savings goals yet</p>
                <p className="text-xs text-[#777777] mt-1">
                  Create savings targets (e.g. Emergency Fund, New Laptop, Summer Trip).
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      <Modal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        title="Record Financial Transaction"
      >
        <form onSubmit={handleSaveTransaction} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Transaction Type"
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <Input
            label="Payee / Merchant"
            placeholder="e.g. Supermarket, Landlord, Coffee shop"
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categories
                .filter((c) => c.type === txType)
                .map((c) => ({ value: c.id, label: c.name }))}
            />
            <Input
              type="date"
              label="Date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
            />
          </div>

          <Input
            label="Notes"
            placeholder="Optional context or receipt note..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2F38]">
            <Button type="button" variant="ghost" onClick={() => setTxModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Record</Button>
          </div>
        </form>
      </Modal>

      {/* Budget Modal */}
      <Modal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        title="Set Category Budget"
      >
        <form onSubmit={handleSaveBudget} className="space-y-3">
          <Select
            label="Category"
            value={budgetCategory}
            onChange={(e) => setBudgetCategory(e.target.value)}
            options={categories
              .filter((c) => c.type === 'expense')
              .map((c) => ({ value: c.id, label: c.name }))}
          />
          <Input
            type="number"
            step="0.01"
            label="Monthly Limit (€) *"
            placeholder="e.g. 250.00"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2F38]">
            <Button type="button" variant="ghost" onClick={() => setBudgetModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Budget</Button>
          </div>
        </form>
      </Modal>

      {/* Savings Goal Modal */}
      <Modal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title="Create Savings Goal"
      >
        <form onSubmit={handleSaveGoal} className="space-y-3">
          <Input
            label="Goal Name *"
            placeholder="e.g. Emergency Fund, New Workstation"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              step="0.01"
              label="Target Amount (€) *"
              placeholder="1000.00"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              required
            />
            <Input
              type="number"
              step="0.01"
              label="Current Saved (€)"
              placeholder="0.00"
              value={goalCurrent}
              onChange={(e) => setGoalCurrent(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2F38]">
            <Button type="button" variant="ghost" onClick={() => setGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Goal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
