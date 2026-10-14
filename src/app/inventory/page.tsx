'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  MapPin,
  Scale,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getStoreState, subscribeToStore, AppState, addStockAdjustment } from '@/lib/storage/store';
import { formatINR, formatDateDDMMYYYY, formatWeight } from '@/lib/utils';
import { StockLedgerEntry, StockMovementType } from '@/types';

export default function InventoryPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  // Form State
  const [adjMaterialId, setAdjMaterialId] = useState(state.materials[0]?.id || '');
  const [adjQuantityChange, setAdjQuantityChange] = useState(5.0);
  const [adjReason, setAdjReason] = useState('Monthly physical weighbridge calibration reconciliation');
  const [adjLocation, setAdjLocation] = useState('Attibele Main Yard');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjMaterialId || !adjReason.trim()) {
      alert('Material and adjustment reason required.');
      return;
    }

    addStockAdjustment(adjMaterialId, Number(adjQuantityChange), adjReason.trim(), adjLocation.trim());
    setIsAdjustmentModalOpen(false);
  };

  const filteredLedger = state.stockLedger.filter((entry) => {
    if (selectedLocation !== 'all' && !entry.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
      return false;
    }
    if (selectedMaterial !== 'all' && entry.materialId !== selectedMaterial) {
      return false;
    }
    return true;
  });

  const totalInventoryValuation = state.materials.reduce(
    (acc, m) => acc + m.currentStock * m.standardPurchasePrice,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Stock Ledger & Multi-Yard Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time material balances, inward receipts, sales consumption, and audited physical reconciliation.
          </p>
        </div>

        <Button variant="orange" size="sm" onClick={() => setIsAdjustmentModalOpen(true)}>
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Stock Reconciliation
        </Button>
      </div>

      {/* Stockyard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="shadow-xs border-l-4 border-l-orange-500">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Stock Valuation
            </span>
            <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
              {formatINR(totalInventoryValuation)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Weighted purchase cost basis across all bays</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-l-4 border-l-slate-900">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Stock Locations
            </span>
            <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
              3 Stockyards / Pits
            </div>
            <p className="text-xs text-slate-400 mt-1">Attibele Yard, Shoolagiri Crusher, Hosur Hub</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Audited Ledger Entries
            </span>
            <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
              {state.stockLedger.length} Records
            </div>
            <p className="text-xs text-slate-400 mt-1">Immutable transaction journal with timestamps</p>
          </CardContent>
        </Card>
      </div>

      {/* Material Stock Balances Overview */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle>Current Material Stock Levels by Bay</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Code / Material</th>
                <th className="px-4 py-2.5">Stockyard Location</th>
                <th className="px-4 py-2.5 text-right">Available Stock</th>
                <th className="px-4 py-2.5 text-right">Min Reorder Level</th>
                <th className="px-4 py-2.5 text-right">Valuation (INR)</th>
                <th className="px-4 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {state.materials.map((mat) => {
                const isLow = mat.currentStock <= mat.minStockLevel;
                const value = mat.currentStock * mat.standardPurchasePrice;
                return (
                  <tr key={mat.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      <span className="font-mono text-orange-600 font-bold">{mat.code}</span>
                      <div className="font-semibold text-slate-900">{mat.name}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {mat.stockLocation}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 text-sm">
                      {mat.currentStock} {mat.defaultUnit}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {mat.minStockLevel} {mat.defaultUnit}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {formatINR(value)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={isLow ? 'danger' : 'success'} size="sm">
                        {isLow ? 'Low Stock Reorder' : 'Adequate'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Movement Ledger Journal */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <CardTitle>Historical Stock Movement Journal</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited in/out movements from purchase orders, sales deliveries, and quarry production.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
            >
              <option value="all">All Materials</option>
              {state.materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Movement Type</th>
                <th className="px-4 py-3 text-right">Quantity Change</th>
                <th className="px-4 py-3 text-right">Balance After</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Performed By</th>
                <th className="px-4 py-3">Reason / Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLedger.map((entry) => {
                const isPositive = entry.quantityChange > 0;
                return (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 text-slate-600 font-mono">
                      {formatDateDDMMYYYY(entry.date)}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {entry.materialName}
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          entry.movementType === 'purchase_in' || entry.movementType === 'quarry_production'
                            ? 'success'
                            : entry.movementType === 'sales_out'
                            ? 'orange'
                            : 'default'
                        }
                        size="sm"
                      >
                        {entry.movementType.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-right font-bold">
                      <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                        {isPositive ? `+${entry.quantityChange}` : entry.quantityChange} {entry.unit}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {entry.balanceAfter} {entry.unit}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {entry.location}
                    </td>

                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {entry.performedBy}
                    </td>

                    <td className="px-4 py-3 text-slate-500 text-[11px] truncate max-w-[200px]">
                      {entry.reason || entry.referenceId}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        title="Physical Stock Reconciliation & Adjustment"
        description="Record physical yard count variances with authorized override justification for audit compliance."
        maxWidth="md"
      >
        <form onSubmit={handleAdjustmentSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Material *</label>
            <select
              value={adjMaterialId}
              onChange={(e) => setAdjMaterialId(e.target.value)}
              className="w-full border rounded-lg p-2 font-medium"
            >
              {state.materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Current: {m.currentStock} {m.defaultUnit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Quantity Change (+/- in default units) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={adjQuantityChange}
              onChange={(e) => setAdjQuantityChange(Number(e.target.value))}
              placeholder="e.g. +5 or -2.5"
              className="w-full border rounded-lg p-2 font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Enter positive value for found stock, negative value for shortage or transit loss.
            </span>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Stockyard Bay / Location *</label>
            <input
              type="text"
              required
              value={adjLocation}
              onChange={(e) => setAdjLocation(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Justification Reason *</label>
            <textarea
              rows={3}
              required
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              placeholder="e.g. Annual physical weighbridge audit variance adjustment"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setIsAdjustmentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Apply Stock Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
