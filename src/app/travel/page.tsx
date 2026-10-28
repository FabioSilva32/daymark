'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { Trip, TripItineraryItem, TripPackingItem } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Compass,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  CheckSquare,
  Luggage,
  Clock,
  DollarSign,
} from 'lucide-react';

export default function TravelPage() {
  const { storageVersion, refreshStorage, addToast, formatCurrency } = useDaymark();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [itinerary, setItinerary] = useState<TripItineraryItem[]>([]);
  const [packing, setPacking] = useState<TripPackingItem[]>([]);

  // Modals
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [tripTitle, setTripTitle] = useState('');
  const [tripDestination, setTripDestination] = useState('');
  const [tripStart, setTripStart] = useState('');
  const [tripEnd, setTripEnd] = useState('');
  const [tripBudget, setTripBudget] = useState('800');

  const [itineraryModalOpen, setItineraryModalOpen] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actDate, setActDate] = useState('');
  const [actTime, setActTime] = useState('10:00');
  const [actLocation, setActLocation] = useState('');
  const [actCost, setActCost] = useState('0');

  const [packName, setPackName] = useState('');
  const [packCategory, setPackCategory] = useState('Clothing');

  useEffect(() => {
    const allTrips = StorageAPI.getTrips();
    setTrips(allTrips);
    if (allTrips.length > 0 && !selectedTripId) {
      setSelectedTripId(allTrips[0].id);
    }
  }, [storageVersion]);

  useEffect(() => {
    if (selectedTripId) {
      setItinerary(StorageAPI.getTripItinerary(selectedTripId));
      setPacking(StorageAPI.getTripPacking(selectedTripId));
    }
  }, [selectedTripId, storageVersion]);

  const activeTrip = trips.find((t) => t.id === selectedTripId) || trips[0];

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripTitle.trim() || !tripDestination.trim()) return;

    const bgtVal = parseFloat(tripBudget) || 0;
    const newTrip: Trip = {
      id: 'trip_' + Date.now(),
      title: tripTitle.trim(),
      destination: tripDestination.trim(),
      startDate: tripStart || new Date().toISOString().split('T')[0],
      endDate: tripEnd || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      budgetCents: Math.round(bgtVal * 100),
      currency: 'EUR',
      createdAt: new Date().toISOString(),
    };

    StorageAPI.saveTrip(newTrip);
    setSelectedTripId(newTrip.id);
    setTripTitle('');
    setTripDestination('');
    setTripModalOpen(false);
    addToast('Trip Created', newTrip.title, 'success');
    refreshStorage();
  };

  const handleAddItinerary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim() || !activeTrip) return;

    const costVal = parseFloat(actCost) || 0;
    const newItem: TripItineraryItem = {
      id: 'itin_' + Date.now(),
      tripId: activeTrip.id,
      title: actTitle.trim(),
      activityDate: actDate || activeTrip.startDate,
      startTime: actTime,
      location: actLocation.trim() || undefined,
      estimatedCostCents: Math.round(costVal * 100),
      createdAt: new Date().toISOString(),
    };

    StorageAPI.saveTripItineraryItem(newItem);
    setActTitle('');
    setItineraryModalOpen(false);
    refreshStorage();
  };

  const handleAddPacking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packName.trim() || !activeTrip) return;

    const newItem: TripPackingItem = {
      id: 'pack_' + Date.now(),
      tripId: activeTrip.id,
      itemName: packName.trim(),
      category: packCategory,
      isPacked: false,
      quantity: 1,
    };

    StorageAPI.saveTripPackingItem(newItem);
    setPackName('');
    refreshStorage();
  };

  const togglePacking = (item: TripPackingItem) => {
    const updated = { ...item, isPacked: !item.isPacked };
    StorageAPI.saveTripPackingItem(updated);
    refreshStorage();
  };

  const packedCount = packing.filter((p) => p.isPacked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Travel Planner & Itineraries
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Organise travel dates, daily schedules, destinations, and packing lists.
          </p>
        </div>

        <Button size="sm" onClick={() => setTripModalOpen(true)} className="gap-1.5 bg-[#E50914] hover:bg-[#C11119] text-white">
          <Plus size={15} />
          <span>New Trip</span>
        </Button>
      </div>

      {/* Trips list selector */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        {trips.map((tr) => (
          <button
            key={tr.id}
            onClick={() => setSelectedTripId(tr.id)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all font-heading font-semibold flex items-center gap-2 ${
              activeTrip?.id === tr.id
                ? 'bg-[#E50914] text-white'
                : 'bg-[#141414] text-[#AAAAAA] hover:text-white border border-[#242424]'
            }`}
          >
            <span>{tr.destination}</span>
            <span className="text-[10px] opacity-75 font-mono">({tr.startDate.substring(5)})</span>
          </button>
        ))}
      </div>

      {activeTrip ? (
        <div className="space-y-6">
          {/* Trip Hero Card */}
          <Card className="p-6 border border-[#242424] rounded-xl bg-[#141414]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider flex items-center gap-1.5 font-heading">
                  <MapPin size={14} /> {activeTrip.destination}
                </span>
                <h3 className="text-2xl font-bold text-white font-heading mt-1">{activeTrip.title}</h3>
                <p className="text-xs text-[#777777] mt-1.5 font-mono">
                  {activeTrip.startDate} → {activeTrip.endDate}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="p-3.5 bg-[#181818] border border-[#242424] rounded-xl text-center min-w-[90px]">
                  <span className="text-[10px] text-[#777777] uppercase block">Budget</span>
                  <p className="font-bold text-sm text-white mt-0.5">
                    {formatCurrency(activeTrip.budgetCents)}
                  </p>
                </div>
                <div className="p-3.5 bg-[#181818] border border-[#242424] rounded-xl text-center min-w-[90px]">
                  <span className="text-[10px] text-[#777777] uppercase block">Packed</span>
                  <p className="font-bold text-sm text-[#10B981] mt-0.5">
                    {packedCount} / {packing.length}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Itinerary & Packing Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ITINERARY */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold font-heading text-white">Daily Schedule & Itinerary</h4>
                <Button size="sm" variant="secondary" onClick={() => setItineraryModalOpen(true)} className="bg-[#181818] border-[#242424] text-[#AAAAAA] hover:text-white hover:border-[#E50914] text-xs">
                  + Add Activity
                </Button>
              </div>

              <div className="space-y-2">
                {itinerary.length > 0 ? (
                  itinerary.map((item) => (
                    <Card key={item.id} className="p-4 bg-[#141414] border border-[#242424] rounded-xl flex items-center justify-between gap-3 hover:border-[#333333] transition-colors">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-bold text-[#E50914]">
                            {item.startTime}
                          </span>
                          <h5 className="text-xs font-semibold text-white">{item.title}</h5>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#777777] mt-1 font-mono">
                          <span>{item.activityDate}</span>
                          {item.location && <span>• {item.location}</span>}
                          {item.estimatedCostCents > 0 && (
                            <span className="text-[#AAAAAA]">• {formatCurrency(item.estimatedCostCents)}</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-xs text-[#777777] text-center py-8">
                    No itinerary activities planned yet.
                  </p>
                )}
              </div>
            </div>

            {/* PACKING LIST */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold font-heading text-white">Packing Checklist</h4>
                <span className="text-xs text-[#777777] font-mono">
                  {packedCount} / {packing.length}
                </span>
              </div>

              <Card className="p-4 space-y-4 bg-[#141414] border border-[#242424] rounded-xl">
                <form onSubmit={handleAddPacking} className="flex gap-2">
                  <Input
                    placeholder="Add packing item..."
                    value={packName}
                    onChange={(e) => setPackName(e.target.value)}
                    className="flex-1 text-xs h-9 bg-[#181818] border-[#242424] text-white"
                  />
                  <Button type="submit" size="sm" className="h-9 px-4 bg-[#E50914] hover:bg-[#C11119] text-white">
                    Add
                  </Button>
                </form>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {packing.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-3 bg-[#181818] border border-[#242424] rounded-xl text-xs hover:border-[#333333] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={p.isPacked}
                        onChange={() => togglePacking(p)}
                        className="h-4 w-4 rounded border-[#282828] bg-[#0D0D0D] text-[#E50914] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span
                        className={`flex-1 ${
                          p.isPacked ? 'line-through text-[#777777]' : 'text-white'
                        }`}
                      >
                        {p.itemName}
                      </span>
                      <span className="text-[10px] text-[#777777] font-mono">{p.category}</span>
                    </div>
                  ))}
                  {packing.length === 0 && (
                    <p className="text-xs text-[#777777] text-center py-6">
                      No packing items added yet.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-[#141414] border border-[#242424] rounded-xl">
          <Compass size={40} className="mx-auto text-[#777777] mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-white font-heading">No Trips Planned</h3>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Create a trip to organise destinations, daily itineraries, and packing lists.
          </p>
          <Button onClick={() => setTripModalOpen(true)} size="sm" className="mt-4 gap-1.5 bg-[#E50914] hover:bg-[#C11119] text-white">
            <Plus size={15} />
            <span>Create New Trip</span>
          </Button>
        </div>
      )}

      {/* New Trip Modal */}
      <Modal
        isOpen={tripModalOpen}
        onClose={() => setTripModalOpen(false)}
        title="Create New Trip"
      >
        <form onSubmit={handleCreateTrip} className="space-y-4">
          <Input
            label="Trip Title *"
            placeholder="e.g. Summer Vacation, Tech Conference"
            value={tripTitle}
            onChange={(e) => setTripTitle(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Destination *"
            placeholder="e.g. Kyoto, Japan or Florence, Italy"
            value={tripDestination}
            onChange={(e) => setTripDestination(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Start Date"
              value={tripStart}
              onChange={(e) => setTripStart(e.target.value)}
            />
            <Input
              type="date"
              label="End Date"
              value={tripEnd}
              onChange={(e) => setTripEnd(e.target.value)}
            />
          </div>
          <Input
            type="number"
            label="Trip Budget (€)"
            value={tripBudget}
            onChange={(e) => setTripBudget(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[#1C1C1C]">
            <Button type="button" variant="ghost" onClick={() => setTripModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#E50914] hover:bg-[#C11119] text-white">Create Trip</Button>
          </div>
        </form>
      </Modal>

      {/* New Activity Modal */}
      <Modal
        isOpen={itineraryModalOpen}
        onClose={() => setItineraryModalOpen(false)}
        title="Add Activity to Itinerary"
      >
        <form onSubmit={handleAddItinerary} className="space-y-4">
          <Input
            label="Activity Title *"
            placeholder="e.g. Visit Museum, Dinner reservation"
            value={actTitle}
            onChange={(e) => setActTitle(e.target.value)}
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Date"
              value={actDate}
              onChange={(e) => setActDate(e.target.value)}
            />
            <Input
              type="time"
              label="Time"
              value={actTime}
              onChange={(e) => setActTime(e.target.value)}
            />
          </div>
          <Input
            label="Location / Address"
            placeholder="e.g. Downtown Plaza"
            value={actLocation}
            onChange={(e) => setActLocation(e.target.value)}
          />
          <Input
            type="number"
            step="0.01"
            label="Estimated Cost (€)"
            placeholder="25.00"
            value={actCost}
            onChange={(e) => setActCost(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[#1C1C1C]">
            <Button type="button" variant="ghost" onClick={() => setItineraryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#E50914] hover:bg-[#C11119] text-white">Add Activity</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
