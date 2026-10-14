'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Truck,
  IndianRupee,
  PackageCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
  Users,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStoreState, subscribeToStore, AppState } from '@/lib/storage/store';
import { formatINR, formatCompactINR, formatDateDDMMYYYY, formatWeight } from '@/lib/utils';

export default function DashboardPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [dateRange, setDateRange] = useState<'7days' | 'month' | 'fy'>('month');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  // Compute calculated metrics directly from actual stored records
  const totalSalesRevenue = state.orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.grandTotal, 0);

  const totalPurchaseCost = state.purchases
    .filter((p) => p.status !== 'cancelled')
    .reduce((acc, p) => acc + p.landedCost, 0);

  const totalExpenses = state.expenses
    .filter((e) => !e.isReversed)
    .reduce((acc, e) => acc + e.amount, 0);

  const totalGrossProfitFromLoads = state.loadProfits.reduce((acc, lp) => acc + lp.grossProfit, 0);
  const totalGrossProfit = totalSalesRevenue - totalPurchaseCost;
  const netProfit = totalGrossProfit - totalExpenses;

  const totalPendingCustomerReceivables = state.customers.reduce((acc, c) => acc + c.outstandingBalance, 0);
  const totalOutstandingSupplierPayables = state.suppliers.reduce((acc, s) => acc + s.outstandingBalance, 0);

  const deliveredTrips = state.lorryTrips.filter((t) => t.status === 'delivered' || t.status === 'settled');
  const deliveredLoadsCount = deliveredTrips.length;
  const totalDeliveredTonnes = deliveredTrips.reduce((acc, t) => acc + t.netWeightMT, 0);
  const avgProfitPerLoad = deliveredLoadsCount > 0 ? totalGrossProfitFromLoads / deliveredLoadsCount : 0;

  // Inventory valuation: sum of (currentStock * standardPurchasePrice)
  const totalInventoryValue = state.materials.reduce(
    (acc, m) => acc + m.currentStock * m.standardPurchasePrice,
    0
  );

  // Low stock materials
  const lowStockMaterials = state.materials.filter((m) => m.currentStock <= m.minStockLevel);

  // Financial Chart Data (Monthly aggregated)
  const monthlyChartData = [
    { month: 'Jun', Sales: 580000, Purchases: 410000, Expenses: 45000 },
    { month: 'Jul', Sales: 720000, Purchases: 510000, Expenses: 58000 },
    { month: 'Aug', Sales: 890000, Purchases: 630000, Expenses: 64000 },
    { month: 'Sep', Sales: 1150000, Purchases: 810000, Expenses: 82000 },
    { month: 'Oct (MTD)', Sales: totalSalesRevenue, Purchases: totalPurchaseCost, Expenses: totalExpenses }
  ];

  // Material-wise sales breakdown
  const materialSalesData = [
    { name: 'Snow White Pebbles', value: 340000, color: '#f97316' },
    { name: '20mm Blue Metal Jalli', value: 180000, color: '#3b82f6' },
    { name: 'Black Basalt Pebbles', value: 152000, color: '#10b981' },
    { name: 'Concrete M-Sand', value: 85000, color: '#8b5cf6' },
    { name: 'Red Jasper Pebbles', value: 45000, color: '#ec4899' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operations & Financial Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time multi-quarry logistics, pebble dispatches, and profitability metrics.
          </p>
        </div>

        {/* Date Range Selector & Mode Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs font-medium shadow-xs">
            <button
              onClick={() => setDateRange('7days')}
              className={`px-2.5 py-1 rounded-md transition ${
                dateRange === '7days' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-2.5 py-1 rounded-md transition ${
                dateRange === 'month' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRange('fy')}
              className={`px-2.5 py-1 rounded-md transition ${
                dateRange === 'fy' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FY 2026-27
            </button>
          </div>

          <Badge variant={state.settings.businessMode === 'quarry' ? 'default' : 'orange'} size="md">
            {state.settings.businessMode.toUpperCase()} MODE
          </Badge>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <Card className="hover:border-slate-300 transition shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Total Sales Revenue</span>
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
              {formatINR(totalSalesRevenue)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center text-emerald-600 font-medium">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> +18.4%
              </span>
              <Link href="/sales" className="text-orange-600 hover:underline font-medium">
                {state.orders.length} Orders →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Costs */}
        <Card className="hover:border-slate-300 transition shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Total Purchases & Landed</span>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <PackageCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
              {formatINR(totalPurchaseCost)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Quarry & Depot Sourcing</span>
              <Link href="/purchases" className="text-orange-600 hover:underline font-medium">
                {state.purchases.length} POs →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Gross & Net Profit */}
        <Card className="hover:border-slate-300 transition shadow-xs border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Gross Profit (Trading)</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-emerald-700 tracking-tight">
              {formatINR(totalGrossProfit)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Net Profit: <strong className="text-slate-900">{formatINR(netProfit)}</strong></span>
              <Link href="/load-profit" className="text-orange-600 hover:underline font-medium">
                Load P&L →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Lorry Deliveries & Avg Profit */}
        <Card className="hover:border-slate-300 transition shadow-xs border-l-4 border-l-orange-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Lorry Loads Delivered</span>
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                <Truck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
              {deliveredLoadsCount} Loads{' '}
              <span className="text-sm font-normal text-slate-500">({formatWeight(totalDeliveredTonnes)})</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Avg Gross Margin/Load:</span>
              <span className="font-semibold text-emerald-600">{formatINR(avgProfitPerLoad)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Quick Metrics Row: Receivables, Payables, Inventory Value, Customers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Customer Receivables</span>
          <div className="text-lg font-bold text-rose-600 mt-1">
            {formatINR(totalPendingCustomerReceivables)}
          </div>
          <Link href="/payments" className="text-[11px] text-orange-600 hover:underline font-medium mt-1 block">
            View overdue invoices →
          </Link>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Supplier Payables</span>
          <div className="text-lg font-bold text-amber-700 mt-1">
            {formatINR(totalOutstandingSupplierPayables)}
          </div>
          <Link href="/payments" className="text-[11px] text-orange-600 hover:underline font-medium mt-1 block">
            View supplier dues →
          </Link>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Stockyard Inventory Value</span>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {formatINR(totalInventoryValue)}
          </div>
          <Link href="/inventory" className="text-[11px] text-orange-600 hover:underline font-medium mt-1 block">
            {state.materials.length} active materials →
          </Link>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Active Trade Network</span>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {state.customers.length} Buyers / {state.suppliers.length} Quarries
          </div>
          <Link href="/customers" className="text-[11px] text-orange-600 hover:underline font-medium mt-1 block">
            Manage directory →
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Purchases Area/Bar Chart */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Revenue vs. Procurement Trend</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly comparison of material sales against quarry purchase costs (INR)
              </p>
            </div>
            <Badge variant="outline" size="sm">Monthly Comparison</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    formatter={(val) => [formatINR(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="Sales" fill="#f97316" radius={[4, 4, 0, 0]} name="Sales Revenue" />
                  <Bar dataKey="Purchases" fill="#475569" radius={[4, 4, 0, 0]} name="Purchase Cost" />
                  <Bar dataKey="Expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Overhead Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Material-wise Sales Performance */}
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle>Top Revenue Materials</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Share of turnover by product line</p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={materialSalesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {materialSalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [formatINR(Number(val)), 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {materialSalesData.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 truncate max-w-[140px]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{formatCompactINR(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-Column Bottom Grid: Recent Transactions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions Table */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Recent Sales Orders & Deliveries</CardTitle>
              <p className="text-xs text-slate-500">Live order status and weighbridge references</p>
            </div>
            <Link href="/sales" className="text-xs font-semibold text-orange-600 hover:underline">
              View All Orders →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Order #</th>
                    <th className="px-4 py-2.5">Customer</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Amount</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.orders.slice(0, 4).map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono font-medium text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium truncate max-w-[150px]">
                        {order.customerName}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDateDDMMYYYY(order.orderDate)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {formatINR(order.grandTotal)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            order.status === 'delivered'
                              ? 'success'
                              : order.status === 'confirmed'
                              ? 'info'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Attention Items: Low Stock & Upcoming Dues */}
        <div className="space-y-4">
          {/* Low Stock Alerts */}
          <Card className="shadow-xs border-amber-200 bg-amber-50/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-base text-slate-900">Stock Reorder Alerts</CardTitle>
              </div>
              <Link href="/inventory" className="text-xs font-semibold text-orange-600 hover:underline">
                Open Stock Ledger →
              </Link>
            </CardHeader>
            <CardContent className="pt-2">
              {lowStockMaterials.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">All stone materials are above minimum reorder threshold.</p>
              ) : (
                <div className="space-y-2">
                  {lowStockMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-amber-200/80 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{mat.name}</div>
                        <div className="text-[11px] text-slate-500">Location: {mat.stockLocation}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-700">
                          {mat.currentStock} {mat.defaultUnit}
                        </div>
                        <div className="text-[10px] text-slate-400">Min: {mat.minStockLevel} {mat.defaultUnit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Fleet in Transit */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-base">Lorries In Transit</CardTitle>
              </div>
              <Link href="/transport" className="text-xs font-semibold text-orange-600 hover:underline">
                Fleet Tracking →
              </Link>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-2">
                {state.lorryTrips
                  .filter((t) => t.status === 'in_transit' || t.status === 'loaded')
                  .slice(0, 2)
                  .map((trip) => (
                    <div
                      key={trip.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 font-mono">{trip.lorryNumber}</div>
                        <div className="text-slate-600 mt-0.5">
                          {trip.materialName} ({trip.netWeightMT} MT)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {trip.sourceQuarry} → {trip.destinationSite}
                        </div>
                      </div>
                      <Badge variant="orange" size="sm">
                        {trip.status === 'in_transit' ? 'On Highway' : 'Loading at Pit'}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
