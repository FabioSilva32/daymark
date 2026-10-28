'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { WaterEntry, BodyMeasurement } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Droplets,
  Scale,
  Plus,
  RotateCcw,
  TrendingDown,
  Calendar,
  History,
  Activity,
} from 'lucide-react';

export default function WaterAndBodyPage() {
  const { storageVersion, refreshStorage, addToast, settings } = useDaymark();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);

  // Custom water modal
  const [customWaterModal, setCustomWaterModal] = useState(false);
  const [customWaterAmount, setCustomWaterAmount] = useState('');

  // Body measurement modal
  const [measurementModal, setMeasurementModal] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [bodyFat, setBodyFat] = useState('');

  useEffect(() => {
    setWaterEntries(StorageAPI.getWaterEntries().filter((w) => w.date === selectedDate));
    setMeasurements(StorageAPI.getBodyMeasurements());
  }, [selectedDate, storageVersion]);

  // Water calculation
  const targetWater = StorageAPI.getNutritionGoals().dailyWaterMl || 2500;
  const currentWater = waterEntries.reduce((acc, curr) => acc + curr.amountMl, 0);
  const waterPct = Math.min(100, Math.round((currentWater / targetWater) * 100));

  const addWater = (amount: number) => {
    StorageAPI.addWaterEntry(amount, selectedDate);
    addToast('Hydration Logged', `+${amount} ml recorded`, 'success');
    refreshStorage();
  };

  const handleCustomWater = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customWaterAmount, 10);
    if (!isNaN(val) && val > 0) {
      addWater(val);
      setCustomWaterAmount('');
      setCustomWaterModal(false);
    }
  };

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const wt = parseFloat(weightKg);
    if (isNaN(wt) || wt <= 0) return;

    const newMeasurement: BodyMeasurement = {
      id: 'meas_' + Date.now(),
      date: selectedDate,
      weightKg: wt,
      waistCm: parseFloat(waistCm) || undefined,
      chestCm: parseFloat(chestCm) || undefined,
      bodyFatPct: parseFloat(bodyFat) || undefined,
      createdAt: new Date().toISOString(),
    };

    StorageAPI.saveBodyMeasurement(newMeasurement);
    addToast('Measurement Recorded', `${wt} kg logged on ${selectedDate}`, 'success');
    setMeasurementModal(false);
    refreshStorage();
  };

  // Latest measurement
  const latestMeasurement = measurements[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Hydration & Body Composition
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Monitor daily fluid intake and record body composition changes over time.
          </p>
        </div>

        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-36 text-xs h-9 bg-[#141414] border-[#242424] text-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: HYDRATION TRACKER */}
        <Card className="flex flex-col justify-between space-y-6 bg-[#141414] border border-[#242424] rounded-xl p-6">
          <div>
            <CardHeader className="p-0 pb-4 border-b border-[#1C1C1C]">
              <div className="flex items-center gap-2">
                <Droplets size={18} className="text-[#E50914]" />
                <CardTitle className="font-heading font-bold text-white text-base">Daily Hydration</CardTitle>
              </div>
              <Badge variant="muted">{waterEntries.length} logs today</Badge>
            </CardHeader>

            {/* Circular / Progress indicator */}
            <div className="text-center py-8">
              <span className="text-6xl font-heading font-black tracking-tight text-white">
                {currentWater}
              </span>
              <span className="text-sm text-[#777777] ml-2 font-mono">/ {targetWater} ml</span>

              <div className="w-full max-w-sm mx-auto bg-[#181818] h-3 rounded-full mt-5 overflow-hidden border border-[#242424]">
                <div
                  className="bg-[#E50914] h-full transition-all duration-300"
                  style={{ width: `${waterPct}%` }}
                />
              </div>
              <span className="text-xs text-[#AAAAAA] mt-2.5 block font-medium">
                {waterPct}% of daily target ({targetWater} ml)
              </span>
            </div>
          </div>

          {/* Quick-add buttons */}
          <div className="space-y-3 pt-4 border-t border-[#1C1C1C]">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => addWater(250)}
                className="text-xs font-mono bg-[#181818] border border-[#242424] hover:border-[#E50914] hover:text-white"
              >
                +250 ml (Glass)
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => addWater(500)}
                className="text-xs font-mono bg-[#181818] border border-[#242424] hover:border-[#E50914] hover:text-white"
              >
                +500 ml (Bottle)
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => addWater(750)}
                className="text-xs font-mono bg-[#181818] border border-[#242424] hover:border-[#E50914] hover:text-white"
              >
                +750 ml (Shaker)
              </Button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCustomWaterModal(true)}
                className="text-xs border-[#242424] text-[#AAAAAA] hover:text-white hover:border-[#E50914]"
              >
                + Custom Amount
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  StorageAPI.undoLastWaterEntry(selectedDate);
                  addToast('Last Entry Undone', undefined, 'info');
                  refreshStorage();
                }}
                className="text-xs text-[#777777] hover:text-[#E50914]"
              >
                Undo Last Entry
              </Button>
            </div>
          </div>
        </Card>

        {/* RIGHT: BODY MEASUREMENTS */}
        <Card className="flex flex-col justify-between space-y-4 bg-[#141414] border border-[#242424] rounded-xl p-6">
          <div>
            <CardHeader className="p-0 pb-4 border-b border-[#1C1C1C]">
              <div className="flex items-center gap-2">
                <Scale size={18} className="text-[#E50914]" />
                <CardTitle className="font-heading font-bold text-white text-base">Body Measurements</CardTitle>
              </div>
              <Button size="sm" onClick={() => setMeasurementModal(true)} className="bg-[#E50914] hover:bg-[#C11119] text-white">
                + Record Log
              </Button>
            </CardHeader>

            {latestMeasurement ? (
              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="p-4 bg-[#181818] rounded-xl border border-[#242424]">
                  <p className="text-[10px] text-[#777777] uppercase tracking-wider font-heading font-semibold">Latest Weight</p>
                  <p className="text-2xl font-bold font-mono text-white mt-1">
                    {latestMeasurement.weightKg} kg
                  </p>
                  <span className="text-[10px] text-[#AAAAAA]">{latestMeasurement.date}</span>
                </div>

                <div className="p-4 bg-[#181818] rounded-xl border border-[#242424]">
                  <p className="text-[10px] text-[#777777] uppercase tracking-wider font-heading font-semibold">Body Fat</p>
                  <p className="text-2xl font-bold font-mono text-white mt-1">
                    {latestMeasurement.bodyFatPct ? `${latestMeasurement.bodyFatPct}%` : '—'}
                  </p>
                  <span className="text-[10px] text-[#AAAAAA]">Estimated</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[#777777]">
                No body measurements recorded yet.
              </div>
            )}

            {/* History Table */}
            <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
              {measurements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-[#242424] text-xs"
                >
                  <span className="font-mono text-[#AAAAAA]">{m.date}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-white">{m.weightKg} kg</span>
                    {m.waistCm && <span className="text-[#777777]">Waist: {m.waistCm}cm</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Custom Water Modal */}
      <Modal
        isOpen={customWaterModal}
        onClose={() => setCustomWaterModal(false)}
        title="Log Custom Water Amount"
      >
        <form onSubmit={handleCustomWater} className="space-y-4">
          <Input
            type="number"
            label="Amount in Millilitres (ml) *"
            placeholder="e.g. 330"
            value={customWaterAmount}
            onChange={(e) => setCustomWaterAmount(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[#1C1C1C]">
            <Button type="button" variant="ghost" onClick={() => setCustomWaterModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#E50914] hover:bg-[#C11119] text-white">Log Water</Button>
          </div>
        </form>
      </Modal>

      {/* Body Measurement Modal */}
      <Modal
        isOpen={measurementModal}
        onClose={() => setMeasurementModal(false)}
        title="Log Body Measurements"
        description="Track weight and circumferences on the selected date"
      >
        <form onSubmit={handleSaveMeasurement} className="space-y-4">
          <Input
            type="number"
            step="0.1"
            label="Body Weight (kg) *"
            placeholder="75.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              step="0.1"
              label="Waist Circumference (cm)"
              placeholder="82.0"
              value={waistCm}
              onChange={(e) => setWaistCm(e.target.value)}
            />
            <Input
              type="number"
              step="0.1"
              label="Chest Circumference (cm)"
              placeholder="102.0"
              value={chestCm}
              onChange={(e) => setChestCm(e.target.value)}
            />
          </div>
          <Input
            type="number"
            step="0.1"
            label="Estimated Body Fat (%)"
            placeholder="15.0"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[#1C1C1C]">
            <Button type="button" variant="ghost" onClick={() => setMeasurementModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#E50914] hover:bg-[#C11119] text-white">Save Measurement</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
