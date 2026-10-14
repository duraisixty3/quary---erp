'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  Plus,
  Truck,
  IndianRupee,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getStoreState, subscribeToStore, AppState, saveLorryTrip } from '@/lib/storage/store';
import { formatINR, formatDateDDMMYYYY, formatWeight } from '@/lib/utils';
import { LoadProfitCalculation } from '@/types';

export default function LoadProfitPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Live Calculator Form State
  const [calcTripNumber, setCalcTripNumber] = useState('TRIP-SIM-01');
  const [calcLorryNo, setCalcLorryNo] = useState('KA-01-AF-3921');
  const [calcCustomer, setCalcCustomer] = useState(state.customers[0]?.companyName || '');
  const [calcSupplier, setCalcSupplier] = useState(state.suppliers[0]?.name || '');
  const [calcMaterial, setCalcMaterial] = useState(state.materials[0]?.name || '');
  const [calcQuantityMT, setCalcQuantityMT] = useState(25.0);
  const [calcSellingRate, setCalcSellingRate] = useState(13200);
  const [calcPurchaseRate, setCalcPurchaseRate] = useState(8500);
  const [calcFreightRate, setCalcFreightRate] = useState(850);
  const [calcLoadingCost, setCalcLoadingCost] = useState(2500);
  const [calcUnloadingCost, setCalcUnloadingCost] = useState(2000);
  const [calcTollsPermits, setCalcTollsPermits] = useState(1500);

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  // Filter load profits
  const filteredProfits = state.loadProfits.filter((lp) => {
    if (selectedMaterial !== 'all' && lp.materialName !== selectedMaterial) return false;
    return true;
  });

  // Aggregated totals
  const totalRevenue = filteredProfits.reduce((acc, lp) => acc + lp.totalSalesRevenue, 0);
  const totalDirectCosts = filteredProfits.reduce((acc, lp) => acc + lp.totalDirectCosts, 0);
  const totalGrossProfit = filteredProfits.reduce((acc, lp) => acc + lp.grossProfit, 0);
  const totalDeliveredMT = filteredProfits.reduce((acc, lp) => acc + lp.quantityMT, 0);
  const overallAvgProfitPerMT = totalDeliveredMT > 0 ? totalGrossProfit / totalDeliveredMT : 0;
  const overallGrossMarginPercent = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

  // Real-time calculation within the modal
  const liveRevenue = Number((calcQuantityMT * calcSellingRate).toFixed(2));
  const livePurchaseCost = Number((calcQuantityMT * calcPurchaseRate).toFixed(2));
  const liveFreightCost = Number((calcQuantityMT * calcFreightRate).toFixed(2));
  const liveDirectCosts = livePurchaseCost + liveFreightCost + calcLoadingCost + calcUnloadingCost + calcTollsPermits;
  const liveGrossProfit = Number((liveRevenue - liveDirectCosts).toFixed(2));
  const liveProfitPerMT = calcQuantityMT > 0 ? Number((liveGrossProfit / calcQuantityMT).toFixed(2)) : 0;
  const liveMarginPercent = liveRevenue > 0 ? Number(((liveGrossProfit / liveRevenue) * 100).toFixed(2)) : 0;

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Trip #',
      'Date',
      'Customer',
      'Supplier',
      'Material',
      'Quantity (MT)',
      'Selling Rate (₹/MT)',
      'Sales Revenue (₹)',
      'Purchase Rate (₹/MT)',
      'Purchase Cost (₹)',
      'Freight (₹)',
      'Handling & Tolls (₹)',
      'Total Direct Cost (₹)',
      'Gross Profit (₹)',
      'Profit / MT (₹)',
      'Margin %'
    ];

    const rows = filteredProfits.map((lp) => [
      lp.tripNumber,
      lp.date,
      `"${lp.customerName}"`,
      `"${lp.supplierName}"`,
      `"${lp.materialName}"`,
      lp.quantityMT,
      lp.customerSellingRatePerMT,
      lp.totalSalesRevenue,
      lp.supplierPurchaseRatePerMT,
      lp.totalSupplierCost,
      lp.freightCost,
      lp.loadingUnloadingCost + lp.tollPermitCost,
      lp.totalDirectCosts,
      lp.grossProfit,
      lp.grossProfitPerMT,
      lp.grossMarginPercent
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vajra_Load_Profitability_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSimulatedTrip = () => {
    saveLorryTrip({
      id: `trip_${Date.now()}`,
      tripNumber: calcTripNumber,
      lorryNumber: calcLorryNo,
      transporterName: 'Direct Haulier',
      driverName: 'Assigned Driver',
      driverPhone: '+91 99000 00000',
      vehicleCapacityMT: calcQuantityMT,
      customerName: calcCustomer,
      supplierName: calcSupplier,
      materialName: calcMaterial,
      materialId: state.materials.find((m) => m.name === calcMaterial)?.id || 'mat_01',
      sourceQuarry: 'Direct Pit / Stockyard',
      destinationSite: 'Customer Delivery Site',
      distanceKm: 120,
      orderedQuantityMT: calcQuantityMT,
      netWeightMT: calcQuantityMT,
      weighbridgeSlipNo: `WB-SIM-${Math.floor(Math.random() * 9000 + 1000)}`,
      loadingDate: new Date().toISOString().split('T')[0],
      dispatchDate: new Date().toISOString().split('T')[0],
      actualArrivalDate: new Date().toISOString().split('T')[0],
      freightAgreedRate: calcFreightRate,
      totalFreight: liveFreightCost,
      loadingCharges: calcLoadingCost,
      unloadingCharges: calcUnloadingCost,
      tollsAndPermits: calcTollsPermits,
      driverAdvance: liveFreightCost * 0.7,
      settlementAmount: liveFreightCost * 0.3,
      status: 'delivered',
      isOverloaded: false,
      notes: 'Recorded via live Load Profit Calculator.',
      createdAt: new Date().toISOString()
    });
    setIsCalculatorOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Load-Wise Profitability Calculator & Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Trip-by-trip gross margin, net profit per metric tonne, logistics deduction, and billing settlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button variant="orange" size="sm" onClick={() => setIsCalculatorOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Live Load Calculator
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Loads Revenue
            </span>
            <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
              {formatINR(totalRevenue)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Customer invoiced billable amount</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Direct Costs
            </span>
            <div className="mt-2 text-2xl font-bold text-slate-800 tracking-tight">
              {formatINR(totalDirectCosts)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Sourcing + Freight + Handling + Tolls</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gross Profit Earned
            </span>
            <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
              {formatINR(totalGrossProfit)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-emerald-600">
                {overallGrossMarginPercent.toFixed(2)}% Margin
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-l-4 border-l-orange-500">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Gross Profit / Tonne
            </span>
            <div className="mt-2 text-2xl font-bold text-orange-600 tracking-tight">
              {formatINR(overallAvgProfitPerMT)}{' '}
              <span className="text-sm font-normal text-slate-500">/ MT</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Across {formatWeight(totalDeliveredMT)} delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Filter Material:</span>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 bg-white px-3 py-1.5 focus:border-orange-500 focus:outline-none"
            >
              <option value="all">All Stone & Pebble Materials</option>
              {state.materials.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong>{filteredProfits.length}</strong> recorded loads
          </div>
        </CardContent>
      </Card>

      {/* Detailed Load-wise Profit Table */}
      <Card className="shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="px-4 py-3">Trip / Lorry</th>
                <th className="px-4 py-3">Customer & Quarry</th>
                <th className="px-4 py-3">Material & Qty</th>
                <th className="px-4 py-3 text-right">Selling Value</th>
                <th className="px-4 py-3 text-right">Direct Costs</th>
                <th className="px-4 py-3 text-right">Gross Profit</th>
                <th className="px-4 py-3 text-right">Profit / MT</th>
                <th className="px-4 py-3 text-center">Margin %</th>
                <th className="px-4 py-3 text-center">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredProfits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No load profitability records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredProfits.map((lp) => {
                  const isProfitPositive = lp.grossProfit > 0;
                  return (
                    <tr key={lp.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-slate-900">{lp.tripNumber}</div>
                        <div className="text-[11px] text-slate-500">{formatDateDDMMYYYY(lp.date)}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{lp.customerName}</div>
                        <div className="text-[11px] text-slate-500">From: {lp.supplierName}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{lp.materialName}</div>
                        <div className="font-semibold text-orange-600">
                          {formatWeight(lp.quantityMT)}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium">
                        <div className="text-slate-900 font-semibold">{formatINR(lp.totalSalesRevenue)}</div>
                        <div className="text-[11px] text-slate-400">
                          @ {formatINR(lp.customerSellingRatePerMT)}/MT
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium">
                        <div className="text-slate-800">{formatINR(lp.totalDirectCosts)}</div>
                        <div className="text-[10px] text-slate-500">
                          Purchase: {formatINR(lp.totalSupplierCost)} | Freight: {formatINR(lp.freightCost)}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div
                          className={`font-bold text-sm ${
                            isProfitPositive ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {formatINR(lp.grossProfit)}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-semibold">
                        <span className={isProfitPositive ? 'text-emerald-600' : 'text-rose-600'}>
                          {formatINR(lp.grossProfitPerMT)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <Badge
                          variant={isProfitPositive ? (lp.grossMarginPercent >= 20 ? 'success' : 'info') : 'danger'}
                          size="sm"
                        >
                          {lp.grossMarginPercent.toFixed(1)}%
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <Badge
                          variant={lp.transporterPaymentStatus === 'settled' ? 'default' : 'warning'}
                          size="sm"
                        >
                          {lp.transporterPaymentStatus === 'settled' ? 'Settled' : 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Live Load Profit Calculator Modal */}
      <Modal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        title="Interactive Load Profit Margin Calculator"
        description="Simulate pre-dispatch freight, purchase costs, and target sales margin for a quarry lorry load."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Trip Reference #</label>
              <input
                type="text"
                value={calcTripNumber}
                onChange={(e) => setCalcTripNumber(e.target.value)}
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lorry Registration</label>
              <input
                type="text"
                value={calcLorryNo}
                onChange={(e) => setCalcLorryNo(e.target.value)}
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer / Buyer</label>
              <select
                value={calcCustomer}
                onChange={(e) => setCalcCustomer(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                {state.customers.map((c) => (
                  <option key={c.id} value={c.companyName}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Source Quarry / Supplier</label>
              <select
                value={calcSupplier}
                onChange={(e) => setCalcSupplier(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                {state.suppliers.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Material</label>
              <select
                value={calcMaterial}
                onChange={(e) => setCalcMaterial(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                {state.materials.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Delivered Net Quantity (MT)</label>
              <input
                type="number"
                step="0.1"
                value={calcQuantityMT}
                onChange={(e) => setCalcQuantityMT(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-semibold"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Commercial & Freight Rates (INR)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-medium text-slate-600 block mb-1">Customer Selling Rate (₹/MT)</label>
                <input
                  type="number"
                  value={calcSellingRate}
                  onChange={(e) => setCalcSellingRate(Number(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Supplier Purchase Rate (₹/MT)</label>
                <input
                  type="number"
                  value={calcPurchaseRate}
                  onChange={(e) => setCalcPurchaseRate(Number(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Freight Rate (₹/MT)</label>
                <input
                  type="number"
                  value={calcFreightRate}
                  onChange={(e) => setCalcFreightRate(Number(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Loading Charges (₹)</label>
                <input
                  type="number"
                  value={calcLoadingCost}
                  onChange={(e) => setCalcLoadingCost(Number(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Unloading Charges (₹)</label>
                <input
                  type="number"
                  value={calcUnloadingCost}
                  onChange={(e) => setCalcUnloadingCost(Number(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Tolls & Permits (₹)</label>
                <input
                  type="number"
                  value={calcTollsPermits}
                  onChange={(e) => setCalcTollsPermits(Number(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
          </div>

          {/* Real-time Calculation Summary Box */}
          <div className="rounded-xl bg-slate-900 text-white p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span>Gross Sales Revenue ({calcQuantityMT} MT):</span>
              <span className="font-bold text-white text-sm">{formatINR(liveRevenue)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span>Total Direct Costs (Sourcing + Logistics):</span>
              <span className="font-bold text-slate-300 text-sm">{formatINR(liveDirectCosts)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase text-slate-400 block">Net Gross Profit</span>
                <span className="text-xl font-black text-emerald-400">{formatINR(liveGrossProfit)}</span>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase text-slate-400 block">Gross Margin %</span>
                <span className="text-lg font-bold text-orange-400">{liveMarginPercent.toFixed(1)}%</span>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase text-slate-400 block">Profit per MT</span>
                <span className="text-base font-bold text-white">{formatINR(liveProfitPerMT)}/MT</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsCalculatorOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" onClick={handleSaveSimulatedTrip}>
              Confirm & Save Trip to Ledger
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
