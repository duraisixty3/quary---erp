'use client';

import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Truck,
  MapPin,
  Calendar,
  AlertTriangle,
  Scale,
  CreditCard,
  Building,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getStoreState, subscribeToStore, AppState } from '@/lib/storage/store';
import { formatINR, formatWeight } from '@/lib/utils';

export default function DeliveryPlanningPage() {
  const [state, setState] = useState<AppState>(getStoreState());

  // Interactive Route Estimator State
  const [origin, setOrigin] = useState('Krishnagiri Granite Cluster, Tamil Nadu');
  const [destination, setDestination] = useState('Brigade Utopia, Varthur, Bangalore');
  const [distanceKm, setDistanceKm] = useState(85);
  const [loadTonnage, setLoadTonnage] = useState(25.0);
  const [vehicleCapacity, setVehicleCapacity] = useState(25.0);
  const [rateModel, setRateModel] = useState<'per_km' | 'per_tonne'>('per_tonne');
  const [rateValue, setRateValue] = useState(380); // ₹380/MT or ₹110/KM
  const [tollExpenses, setTollExpenses] = useState(850);
  const [unloadingExpense, setUnloadingExpense] = useState(1500);

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const isOverweight = loadTonnage > vehicleCapacity;
  const estimatedFreight =
    rateModel === 'per_tonne'
      ? loadTonnage * rateValue
      : distanceKm * rateValue;

  const totalTripCost = estimatedFreight + tollExpenses + unloadingExpense;
  const costPerTonne = loadTonnage > 0 ? totalTripCost / loadTonnage : 0;

  // Preset Indian quarry freight corridors
  const presetCorridors = [
    { name: 'Shoolagiri Quarry → Whitefield / Sarjapur (Bangalore)', km: 55, typicalRateMT: 220 },
    { name: 'Krishnagiri Mines → Electronic City (Bangalore)', km: 75, typicalRateMT: 320 },
    { name: 'Karur River Pebble Depot → Bangalore Outer Ring Road', km: 285, typicalRateMT: 850 },
    { name: 'Karur River Pebble Depot → Kochi / Thrissur (Kerala)', km: 260, typicalRateMT: 880 },
    { name: 'Ballari Aggregates → Hyderabad Gachibowli', km: 360, typicalRateMT: 950 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Delivery Route Planning & Freight Cost Estimator
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Calculate multi-axle tipper freight rates, road distances across South Indian corridors, and legal axle weight compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Planner Form */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="border-b">
            <CardTitle>Trip Logistics & Route Parameters</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Source Quarry / Stockyard</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full border rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer Delivery Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full border rounded-lg p-2 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Highway Distance (KM)</label>
                <input
                  type="number"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full border rounded-lg p-2 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Load Quantity (MT)</label>
                <input
                  type="number"
                  step="0.5"
                  value={loadTonnage}
                  onChange={(e) => setLoadTonnage(Number(e.target.value))}
                  className="w-full border rounded-lg p-2 font-bold text-orange-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lorry Permitted Capacity (MT)</label>
                <input
                  type="number"
                  step="0.5"
                  value={vehicleCapacity}
                  onChange={(e) => setVehicleCapacity(Number(e.target.value))}
                  className="w-full border rounded-lg p-2 font-bold"
                />
              </div>
            </div>

            {isOverweight && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-[11px] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Overload Warning:</strong> Load of {loadTonnage} MT exceeds the vehicle legal RTO capacity of {vehicleCapacity} MT. RTO checkpost penalties may apply.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Freight Pricing Model</label>
                <select
                  value={rateModel}
                  onChange={(e) => setRateModel(e.target.value as any)}
                  className="w-full border rounded-lg p-2 font-medium"
                >
                  <option value="per_tonne">Per Metric Tonne (₹/MT)</option>
                  <option value="per_km">Per Kilometre (₹/KM)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Agreed Rate ({rateModel === 'per_tonne' ? '₹/MT' : '₹/KM'})
                </label>
                <input
                  type="number"
                  value={rateValue}
                  onChange={(e) => setRateValue(Number(e.target.value))}
                  className="w-full border rounded-lg p-2 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">NHAI Toll Charges (₹)</label>
                <input
                  type="number"
                  value={tollExpenses}
                  onChange={(e) => setTollExpenses(Number(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>

            {/* Quick Preset Corridors */}
            <div className="pt-2 border-t">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Select Standard Indian Highway Quarry Corridors:
              </span>
              <div className="space-y-1.5">
                {presetCorridors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setDistanceKm(c.km);
                      setRateModel('per_tonne');
                      setRateValue(c.typicalRateMT);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-orange-50/70 border border-slate-200 flex items-center justify-between text-xs transition"
                  >
                    <span className="font-medium text-slate-800">{c.name}</span>
                    <span className="text-slate-500 font-mono">
                      {c.km} km | ₹{c.typicalRateMT}/MT
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculation Result Summary Card */}
        <div className="space-y-4">
          <Card className="shadow-xs bg-slate-900 text-white">
            <CardHeader className="border-b border-slate-800 pb-3">
              <CardTitle className="text-white text-base">Estimated Freight Economics</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Route Distance:</span>
                <span className="font-mono font-bold text-white text-sm">{distanceKm} KM</span>
              </div>

              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Base Freight Amount:</span>
                <span className="font-mono font-bold text-white">{formatINR(estimatedFreight)}</span>
              </div>

              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Tolls & Site Unloading:</span>
                <span className="font-mono text-slate-300">{formatINR(tollExpenses + unloadingExpense)}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-[11px] text-orange-400 uppercase font-bold block">
                  Total Landed Logistics Cost
                </span>
                <div className="text-2xl font-black text-white mt-1">
                  {formatINR(totalTripCost)}
                </div>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Effective Freight Cost / Tonne:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {formatINR(costPerTonne)} / MT
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs border-slate-200">
            <CardContent className="p-4 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Dispatch Verification Checklist
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                <li>Verify empty tare weight on authenticated weighbridge before pit loading.</li>
                <li>Check driver commercial DL and valid vehicle fitness certificate.</li>
                <li>Ensure GST E-Way Bill is generated for inter-state granite/aggregate transit.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
