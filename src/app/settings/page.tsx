'use client';

import React, { useState } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { MODULE_REGISTRY } from '@/lib/modules';
import { StorageAPI } from '@/lib/storage';
import { ModuleId } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import {
  Settings,
  User,
  Globe,
  Sliders,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, addToast, refreshStorage, syncStatus } = useDaymark();

  // Local form state
  const [name, setName] = useState(settings.name);
  const [email, setEmail] = useState(settings.email);
  const [currency, setCurrency] = useState(settings.currency);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [unitSystem, setUnitSystem] = useState(settings.unitSystem);
  const [timeFormat, setTimeFormat] = useState(settings.timeFormat);
  const [homeCity, setHomeCity] = useState(settings.homeCity || settings.weatherCity || 'Porto');

  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const currencySymbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      GBP: '£',
      JPY: '¥',
      CAD: 'CA$',
      AUD: 'A$',
    };

    updateSettings({
      name,
      email,
      currency,
      currencySymbol: currencySymbols[currency] || '€',
      timezone,
      unitSystem,
      timeFormat,
      weatherCity: homeCity,
      homeCity,
    });

    addToast('Settings Saved', 'User preferences updated successfully', 'success');
  };

  const toggleModule = (modId: ModuleId) => {
    const currentEnabled = settings.enabledModules?.[modId] ?? true;
    const updated = {
      ...settings.enabledModules,
      [modId]: !currentEnabled,
    };
    updateSettings({ enabledModules: updated });
    addToast('Module Visibility Updated', undefined, 'info');
    refreshStorage();
  };

  const handleExportBackup = () => {
    const jsonStr = StorageAPI.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daymark_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addToast('Backup Exported', 'Full JSON database backup downloaded', 'success');
  };

  const handleImportBackup = () => {
    if (!importJsonText.trim()) return;
    const res = StorageAPI.importAllData(importJsonText);
    if (res.success) {
      addToast('Backup Restored', 'All records restored successfully', 'success');
      setImportJsonText('');
      setImportError(null);
      refreshStorage();
    } else {
      setImportError(res.error || 'Failed to restore backup');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Application Settings
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Configure profile, currency, timezone, module visibility, and database backups.
          </p>
        </div>

        <Badge variant={syncStatus === 'synced' ? 'success' : 'muted'} className="text-xs">
          Storage: {syncStatus === 'synced' ? 'Cloud Supabase' : 'Local-First Resilient'}
        </Badge>
      </div>

      {/* 1. Profile & Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={16} className="text-[#E50914]" />
            <CardTitle>User Profile & Regional Defaults</CardTitle>
          </div>
        </CardHeader>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select
              label="Default Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'USD', label: 'USD ($)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'JPY', label: 'JPY (¥)' },
                { value: 'CAD', label: 'CAD ($)' },
                { value: 'AUD', label: 'AUD ($)' },
              ]}
            />

            <Select
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={[
                { value: 'Europe/Lisbon', label: 'Europe/Lisbon' },
                { value: 'Europe/London', label: 'Europe/London' },
                { value: 'Europe/Paris', label: 'Europe/Paris' },
                { value: 'Europe/Berlin', label: 'Europe/Berlin' },
                { value: 'America/New_York', label: 'America/New_York' },
                { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
                { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
              ]}
            />

            <Select
              label="Measurement Units"
              value={unitSystem}
              onChange={(e) => setUnitSystem(e.target.value as any)}
              options={[
                { value: 'metric', label: 'Metric (kg, cm, ml)' },
                { value: 'imperial', label: 'Imperial (lb, in, oz)' },
              ]}
            />

            <Select
              label="Time Format"
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value as any)}
              options={[
                { value: '24h', label: '24-hour (14:30)' },
                { value: '12h', label: '12-hour (2:30 PM)' },
              ]}
            />
          </div>

          <Input
            label="Pinned Home Location (Weather, Travel & System Clocks)"
            value={homeCity}
            onChange={(e) => setHomeCity(e.target.value)}
            placeholder="e.g. Porto, Lisbon, London"
          />

          <div className="flex justify-end pt-3 border-t border-[#1C1C1C]">
            <Button type="submit">Save Preferences</Button>
          </div>
        </form>
      </Card>

      {/* 2. Module Registry Visibility */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-[#E50914]" />
            <CardTitle>Module Registry & Navigation Toggles</CardTitle>
          </div>
          <span className="text-xs text-[#777777]">Customize active modules</span>
        </CardHeader>

        <p className="text-xs text-[#AAAAAA] mb-4">
          Disable features you do not need. Disabled modules are hidden from your sidebar and
          navigation without deleting your saved data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {MODULE_REGISTRY.filter((m) => m.id !== 'dashboard' && m.id !== 'settings').map((mod) => {
            const isEnabled = settings.enabledModules?.[mod.id] ?? true;

            return (
              <div
                key={mod.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-[#242424] text-xs"
              >
                <div>
                  <span className="font-semibold text-white font-heading block">{mod.label}</span>
                  <span className="text-[10px] text-[#777777]">{mod.category}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                    isEnabled ? 'bg-[#E50914]' : 'bg-[#0D0D0D] border border-[#242424]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Data Backup, Export & Restore */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database size={16} className="text-[#E50914]" />
            <CardTitle>Data Management & Full JSON Backups</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#181818] border border-[#242424] rounded-xl">
            <div>
              <h4 className="text-xs font-bold text-white font-heading">Export Full Database Backup</h4>
              <p className="text-[11px] text-[#777777] mt-0.5">
                Download all tasks, workouts, food logs, notes, transactions, and preferences as JSON.
              </p>
            </div>
            <Button size="sm" onClick={handleExportBackup} className="gap-1.5 shrink-0">
              <Download size={14} />
              <span>Export JSON</span>
            </Button>
          </div>

          <div className="p-3 bg-[#1D2128] border border-[#2A2F38] rounded space-y-2">
            <h4 className="text-xs font-bold text-[#F3F4F6]">Restore Backup from JSON</h4>
            <p className="text-[11px] text-[#737B89]">
              Paste a previously exported JSON backup below to restore your records.
            </p>
            <textarea
              placeholder="Paste backup JSON string here..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full text-xs font-mono p-2 bg-[#101216] border border-[#2A2F38] rounded text-[#F3F4F6] placeholder-[#737B89] outline-none h-20"
            />
            {importError && <p className="text-xs text-[#EF4444]">{importError}</p>}
            <Button size="sm" variant="secondary" onClick={handleImportBackup} className="gap-1.5">
              <Upload size={14} />
              <span>Validate & Restore Data</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
