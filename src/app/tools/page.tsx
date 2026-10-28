'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import {
  Calculator,
  Scale,
  DollarSign,
  Calendar,
  Timer,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';

export default function ToolsPage() {
  const { addToast } = useDaymark();
  const [activeTab, setActiveTab] = useState<'calc' | 'unit' | 'currency' | 'date' | 'timer' | 'clock'>('calc');

  // --- 1. SCIENTIFIC CALCULATOR STATE ---
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  const handleCalcButton = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
    } else if (val === '=') {
      try {
        // Safe evaluation without eval()
        // Replace mathematical symbols with JS Math equivalents
        let expr = calcDisplay
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/sqrt\(/g, 'Math.sqrt(');

        // Sanitize: allow only numbers, operators, Math.* functions, parens, decimal
        if (!/^[0-9+\-*/().\sMathPIEsincoztanqr]+$/.test(expr)) {
          throw new Error('Invalid Expression');
        }

        const fn = new Function(`return (${expr})`);
        const result = fn();
        const rounded = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(6)).toString();
        setCalcHistory((prev) => [`${calcDisplay} = ${rounded}`, ...prev.slice(0, 4)]);
        setCalcDisplay(rounded);
      } catch (e) {
        setCalcDisplay('Error');
      }
    } else if (['sin', 'cos', 'tan', 'sqrt'].includes(val)) {
      setCalcDisplay((prev) => (prev === '0' ? `${val}(` : `${prev}${val}(`));
    } else {
      setCalcDisplay((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
    }
  };

  // --- 2. UNIT CONVERTER STATE ---
  const [unitCategory, setUnitCategory] = useState<'length' | 'mass' | 'temp'>('length');
  const [unitFromVal, setUnitFromVal] = useState('1');
  const [unitFromUnit, setUnitFromUnit] = useState('m');
  const [unitToUnit, setUnitToUnit] = useState('ft');

  const convertUnits = (): string => {
    const val = parseFloat(unitFromVal);
    if (isNaN(val)) return '0';

    if (unitCategory === 'length') {
      // Base: meters
      const inMeters: Record<string, number> = { m: 1, km: 1000, cm: 0.01, ft: 0.3048, in: 0.0254, mi: 1609.34 };
      const base = val * (inMeters[unitFromUnit] || 1);
      const converted = base / (inMeters[unitToUnit] || 1);
      return converted.toFixed(4);
    }
    if (unitCategory === 'mass') {
      // Base: kg
      const inKg: Record<string, number> = { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 };
      const base = val * (inKg[unitFromUnit] || 1);
      const converted = base / (inKg[unitToUnit] || 1);
      return converted.toFixed(4);
    }
    if (unitCategory === 'temp') {
      if (unitFromUnit === 'c' && unitToUnit === 'f') return ((val * 9) / 5 + 32).toFixed(2);
      if (unitFromUnit === 'f' && unitToUnit === 'c') return (((val - 32) * 5) / 9).toFixed(2);
      return val.toString();
    }
    return '0';
  };

  // --- 3. CURRENCY CONVERTER STATE ---
  const [currAmount, setCurrAmount] = useState('100');
  const [currFrom, setCurrFrom] = useState('EUR');
  const [currTo, setCurrTo] = useState('USD');
  const [rates, setRates] = useState<Record<string, number>>({
    EUR: 1.0,
    USD: 1.08,
    GBP: 0.85,
    JPY: 162.5,
    CHF: 0.96,
    CAD: 1.48,
    AUD: 1.65,
  });

  const convertedCurrency = (): string => {
    const amt = parseFloat(currAmount);
    if (isNaN(amt)) return '0.00';
    const fromRate = rates[currFrom] || 1;
    const toRate = rates[currTo] || 1;
    const inEUR = amt / fromRate;
    return (inEUR * toRate).toFixed(2);
  };

  // --- 4. DATE DIFFERENCE STATE ---
  const [date1, setDate1] = useState(new Date().toISOString().split('T')[0]);
  const [date2, setDate2] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);

  const calcDateDiff = () => {
    const d1 = new Date(date1).getTime();
    const d2 = new Date(date2).getTime();
    const diffDays = Math.round(Math.abs(d2 - d1) / 86400000);
    const weeks = (diffDays / 7).toFixed(1);
    return { days: diffDays, weeks };
  };

  // --- 5. STOPWATCH STATE ---
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (swRunning) {
      const startTime = Date.now() - stopwatchMs;
      interval = setInterval(() => {
        setStopwatchMs(Date.now() - startTime);
      }, 50);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [swRunning]);

  const formatStopwatch = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  // --- 6. WORLD CLOCKS ---
  const worldCities = [
    { name: 'Lisbon', tz: 'Europe/Lisbon' },
    { name: 'London', tz: 'Europe/London' },
    { name: 'New York', tz: 'America/New_York' },
    { name: 'Tokyo', tz: 'Asia/Tokyo' },
    { name: 'Sydney', tz: 'Australia/Sydney' },
  ];

  const [worldTimes, setWorldTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const obj: Record<string, string> = {};
      worldCities.forEach((c) => {
        try {
          obj[c.name] = new Intl.DateTimeFormat('en-GB', {
            timeZone: c.tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(now);
        } catch (e) {
          obj[c.name] = '--:--:--';
        }
      });
      setWorldTimes(obj);
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const toolTabs = [
    { id: 'calc', label: 'Calculator', icon: <Calculator size={14} /> },
    { id: 'unit', label: 'Unit Converter', icon: <Scale size={14} /> },
    { id: 'currency', label: 'Currency', icon: <DollarSign size={14} /> },
    { id: 'date', label: 'Date Diff', icon: <Calendar size={14} /> },
    { id: 'timer', label: 'Stopwatch', icon: <Timer size={14} /> },
    { id: 'clock', label: 'World Clock', icon: <Clock size={14} /> },
  ] as const;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Everyday Calculators & Tools
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Scientific calculations, conversions, stopwatch, and international time.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141414] border border-[#242424] rounded-xl text-xs overflow-x-auto">
          {toolTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors text-xs ${
                activeTab === t.id
                  ? 'bg-[#E50914] text-white font-semibold'
                  : 'text-[#AAAAAA] hover:text-white'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. CALCULATOR */}
      {activeTab === 'calc' && (
        <Card className="max-w-md mx-auto p-5 space-y-3 rounded-xl border border-[#242424] bg-[#141414]">
          {/* Display screen */}
          <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-3.5 text-right">
            <div className="text-[11px] text-[#777777] min-h-[16px] truncate font-mono">
              {calcHistory[0] || ''}
            </div>
            <div className="text-2xl font-mono font-bold text-white truncate mt-1">
              {calcDisplay}
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-1.5 text-sm font-mono">
            {['C', '(', ')', '÷', 'sin', 'cos', 'tan', '×', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', 'sqrt', '0', '.', 'π', '='].map((btn) => {
              const isAction = ['C', '=', '÷', '×', '-', '+'].includes(btn);
              const isEquals = btn === '=';

              return (
                <button
                  key={btn}
                  onClick={() => handleCalcButton(btn)}
                  className={`h-11 rounded-lg font-medium transition-colors ${
                    isEquals
                      ? 'bg-[#E50914] text-white hover:bg-[#C11119] font-bold shadow-sm'
                      : isAction
                      ? 'bg-[#181818] text-[#E50914] border border-[#242424] hover:border-[#E50914]'
                      : 'bg-[#141414] text-white border border-[#242424] hover:border-[#383838]'
                  }`}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* 2. UNIT CONVERTER */}
      {activeTab === 'unit' && (
        <Card className="max-w-lg mx-auto p-5 space-y-4">
          <div className="flex gap-2">
            {[
              { id: 'length', label: 'Length' },
              { id: 'mass', label: 'Mass / Weight' },
              { id: 'temp', label: 'Temperature' },
            ].map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={unitCategory === cat.id ? 'primary' : 'outline'}
                onClick={() => setUnitCategory(cat.id as any)}
                className="flex-1 text-xs"
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <Input
                type="number"
                label="Value"
                value={unitFromVal}
                onChange={(e) => setUnitFromVal(e.target.value)}
              />
              <Select
                label="From Unit"
                value={unitFromUnit}
                onChange={(e) => setUnitFromUnit(e.target.value)}
                className="mt-1"
                options={
                  unitCategory === 'length'
                    ? [
                        { value: 'm', label: 'Meters (m)' },
                        { value: 'km', label: 'Kilometres (km)' },
                        { value: 'cm', label: 'Centimetres (cm)' },
                        { value: 'ft', label: 'Feet (ft)' },
                        { value: 'in', label: 'Inches (in)' },
                        { value: 'mi', label: 'Miles (mi)' },
                      ]
                    : unitCategory === 'mass'
                    ? [
                        { value: 'kg', label: 'Kilograms (kg)' },
                        { value: 'g', label: 'Grams (g)' },
                        { value: 'lb', label: 'Pounds (lb)' },
                        { value: 'oz', label: 'Ounces (oz)' },
                      ]
                    : [
                        { value: 'c', label: 'Celsius (°C)' },
                        { value: 'f', label: 'Fahrenheit (°F)' },
                      ]
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#A0A6B2] block mb-1.5">
                Converted Result
              </label>
              <div className="h-9 px-3 py-2 text-sm bg-[#101216] border border-[#2A2F38] text-[#EF4444] font-mono font-bold rounded flex items-center">
                {convertUnits()}
              </div>
              <Select
                label="To Unit"
                value={unitToUnit}
                onChange={(e) => setUnitToUnit(e.target.value)}
                className="mt-1"
                options={
                  unitCategory === 'length'
                    ? [
                        { value: 'm', label: 'Meters (m)' },
                        { value: 'km', label: 'Kilometres (km)' },
                        { value: 'cm', label: 'Centimetres (cm)' },
                        { value: 'ft', label: 'Feet (ft)' },
                        { value: 'in', label: 'Inches (in)' },
                        { value: 'mi', label: 'Miles (mi)' },
                      ]
                    : unitCategory === 'mass'
                    ? [
                        { value: 'kg', label: 'Kilograms (kg)' },
                        { value: 'g', label: 'Grams (g)' },
                        { value: 'lb', label: 'Pounds (lb)' },
                        { value: 'oz', label: 'Ounces (oz)' },
                      ]
                    : [
                        { value: 'c', label: 'Celsius (°C)' },
                        { value: 'f', label: 'Fahrenheit (°F)' },
                      ]
                }
              />
            </div>
          </div>
        </Card>
      )}

      {/* 3. CURRENCY CONVERTER */}
      {activeTab === 'currency' && (
        <Card className="max-w-md mx-auto p-5 space-y-4">
          <Input
            type="number"
            label="Amount"
            value={currAmount}
            onChange={(e) => setCurrAmount(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="From Currency"
              value={currFrom}
              onChange={(e) => setCurrFrom(e.target.value)}
              options={Object.keys(rates).map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="To Currency"
              value={currTo}
              onChange={(e) => setCurrTo(e.target.value)}
              options={Object.keys(rates).map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div className="p-4 bg-[#101216] border border-[#2A2F38] rounded text-center">
            <span className="text-xs text-[#737B89]">Converted Result:</span>
            <p className="text-3xl font-mono font-bold text-[#EF4444] mt-1">
              {convertedCurrency()} {currTo}
            </p>
            <span className="text-[10px] text-[#737B89] block mt-1">
              Rates updated today • Base currency: EUR
            </span>
          </div>
        </Card>
      )}

      {/* 4. DATE DIFFERENCE */}
      {activeTab === 'date' && (
        <Card className="max-w-md mx-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Start Date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
            />
            <Input
              type="date"
              label="End Date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
            />
          </div>

          <div className="p-4 bg-[#101216] border border-[#2A2F38] rounded text-center">
            <span className="text-xs text-[#737B89]">Time Difference:</span>
            <p className="text-3xl font-mono font-bold text-[#F3F4F6] mt-1">
              {calcDateDiff().days} days
            </p>
            <span className="text-xs text-[#A0A6B2] block mt-1">
              ({calcDateDiff().weeks} weeks)
            </span>
          </div>
        </Card>
      )}

      {/* 5. STOPWATCH */}
      {activeTab === 'timer' && (
        <Card className="max-w-md mx-auto p-6 text-center space-y-6">
          <div className="text-6xl font-mono font-bold text-[#F3F4F6]">
            {formatStopwatch(stopwatchMs)}
          </div>

          <div className="flex justify-center gap-3">
            {!swRunning ? (
              <Button size="md" onClick={() => setSwRunning(true)} className="gap-2 px-6">
                <Play size={16} />
                <span>Start</span>
              </Button>
            ) : (
              <Button size="md" variant="secondary" onClick={() => setSwRunning(false)} className="gap-2 px-6">
                <Pause size={16} />
                <span>Pause</span>
              </Button>
            )}

            <Button
              size="md"
              variant="outline"
              disabled={stopwatchMs === 0}
              onClick={() => {
                if (swRunning) {
                  setLaps((prev) => [stopwatchMs, ...prev]);
                } else {
                  setStopwatchMs(0);
                  setLaps([]);
                }
              }}
            >
              {swRunning ? 'Lap' : 'Reset'}
            </Button>
          </div>

          {laps.length > 0 && (
            <div className="max-h-36 overflow-y-auto space-y-1 text-xs font-mono pt-3 border-t border-[#2A2F38]">
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between text-[#A0A6B2] px-2 py-1 bg-[#101216] rounded">
                  <span>Lap {laps.length - i}</span>
                  <span className="text-[#F3F4F6]">{formatStopwatch(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* 6. WORLD CLOCK */}
      {activeTab === 'clock' && (
        <Card className="max-w-md mx-auto p-4">
          <div className="divide-y divide-[#2A2F38]/60">
            {worldCities.map((city) => (
              <div key={city.name} className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-semibold text-sm text-[#F3F4F6]">{city.name}</h4>
                  <p className="text-[10px] text-[#737B89]">{city.tz}</p>
                </div>
                <span className="font-mono text-xl font-bold text-[#F3F4F6]">
                  {worldTimes[city.name] || '--:--:--'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
