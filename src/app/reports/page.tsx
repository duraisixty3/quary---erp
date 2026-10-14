'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  FileSpreadsheet,
  Building,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getStoreState, subscribeToStore, AppState } from '@/lib/storage/store';
import { formatINR, formatDateDDMMYYYY, formatWeight } from '@/lib/utils';

type ReportType =
  | 'pnl'
  | 'sales'
  | 'purchases'
  | 'load_profit'
  | 'receivables'
  | 'payables'
  | 'stock_valuation'
  | 'transport';

export default function ReportsPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [selectedReport, setSelectedReport] = useState<ReportType>('pnl');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  // Financial aggregates
  const totalSales = state.orders.reduce((acc, o) => acc + o.grandTotal, 0);
  const totalPurchases = state.purchases.reduce((acc, p) => acc + p.landedCost, 0);
  const totalExpenses = state.expenses.reduce((acc, e) => acc + (e.isReversed ? 0 : e.amount), 0);
  const grossProfit = totalSales - totalPurchases;
  const netIncome = grossProfit - totalExpenses;

  const totalReceivables = state.customers.reduce((acc, c) => acc + c.outstandingBalance, 0);
  const totalPayables = state.suppliers.reduce((acc, s) => acc + s.outstandingBalance, 0);

  const exportCurrentReportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];

    if (selectedReport === 'pnl') {
      headers = ['Account / Line Item', 'Amount (INR)', 'Percentage of Revenue'];
      rows = [
        ['Gross Sales Revenue', totalSales, '100.0%'],
        ['Cost of Goods Sourced (Purchases)', totalPurchases, `${((totalPurchases / totalSales) * 100).toFixed(1)}%`],
        ['Gross Trading Margin', grossProfit, `${((grossProfit / totalSales) * 100).toFixed(1)}%`],
        ['Total Operating Overheads (Fuel, Power, Labour, Rent)', totalExpenses, `${((totalExpenses / totalSales) * 100).toFixed(1)}%`],
        ['Net Operating Business Profit', netIncome, `${((netIncome / totalSales) * 100).toFixed(1)}%`]
      ];
    } else if (selectedReport === 'sales') {
      headers = ['Order #', 'Customer', 'Date', 'Delivery Destination', 'Items', 'Amount (₹)', 'Payment Status'];
      rows = state.orders.map((o) => [
        o.orderNumber,
        `"${o.customerName}"`,
        o.orderDate,
        `"${o.destinationCity}"`,
        `"${o.items.map((i) => i.materialName).join('; ')}"`,
        o.grandTotal,
        o.paymentStatus
      ]);
    } else if (selectedReport === 'receivables') {
      headers = ['Customer', 'Contact', 'District', 'Total Billed', 'Outstanding Due (₹)', 'Terms (Days)'];
      rows = state.customers.map((c) => [
        `"${c.companyName}"`,
        `"${c.contactPerson}"`,
        c.district,
        c.totalRevenue,
        c.outstandingBalance,
        c.paymentTermsDays
      ]);
    } else {
      headers = ['Item', 'Metric'];
      rows = [['Generated Report', selectedReport]];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Vajra_Report_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Financial & Operational Intelligence Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Exportable P&L statements, customer aging analysis, supplier payables, and material profit margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1.5" />
            Print Report
          </Button>
          <Button variant="orange" size="sm" onClick={exportCurrentReportCSV}>
            <Download className="h-4 w-4 mr-1.5" />
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <Card className="shadow-xs">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {[
              { id: 'pnl', label: 'Income & Expense (P&L)' },
              { id: 'sales', label: 'Sales Orders Register' },
              { id: 'purchases', label: 'Quarry Purchase Register' },
              { id: 'load_profit', label: 'Load Profitability Analysis' },
              { id: 'receivables', label: 'Customer Aging & Receivables' },
              { id: 'payables', label: 'Supplier Payable Aging' },
              { id: 'stock_valuation', label: 'Stock Valuation Report' },
              { id: 'transport', label: 'Transport Logistics Freight' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id as ReportType)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  selectedReport === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Render Selected Report Content */}
      {selectedReport === 'pnl' && (
        <Card className="shadow-xs overflow-hidden">
          <CardHeader className="border-b bg-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Income & Expense Statement (P&L)</CardTitle>
              <p className="text-xs text-slate-500">
                Period: Current Financial Year 2026-27 (Asia/Kolkata)
              </p>
            </div>
            <Badge variant="orange" size="md">Accrual Basis</Badge>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-w-3xl mx-auto space-y-6 text-xs">
              {/* Revenue Section */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b pb-1">
                  1. Operating Revenue (Sales Turnover)
                </h3>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Gross Material Sales & Aggregates</span>
                  <span className="font-semibold text-slate-900">{formatINR(totalSales)}</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-slate-900 bg-slate-100 p-2 rounded">
                  <span>Total Sales Revenue (A)</span>
                  <span className="text-sm">{formatINR(totalSales)}</span>
                </div>
              </div>

              {/* Cost of Goods Sold */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b pb-1">
                  2. Cost of Materials & Landed Procurement
                </h3>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Purchases from Partner Quarries & Depots</span>
                  <span className="font-semibold text-slate-900">{formatINR(totalPurchases)}</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-slate-900 bg-slate-100 p-2 rounded">
                  <span>Total Landed Material Cost (B)</span>
                  <span className="text-sm">{formatINR(totalPurchases)}</span>
                </div>
              </div>

              {/* Gross Margin */}
              <div className="flex justify-between p-3 rounded-xl bg-orange-50 border border-orange-200 text-slate-900 font-bold text-sm">
                <span>GROSS TRADING PROFIT (A - B)</span>
                <span className="text-orange-600 text-base">{formatINR(grossProfit)}</span>
              </div>

              {/* Overhead Expenses */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b pb-1">
                  3. Operational & Quarry Overheads
                </h3>
                {state.expenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between py-1 text-slate-600">
                    <span className="capitalize">{exp.category.replace('_', ' ')} - {exp.description}</span>
                    <span className="font-medium text-slate-800">{formatINR(exp.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 font-bold text-slate-900 bg-slate-100 p-2 rounded">
                  <span>Total Operating Expenses (C)</span>
                  <span className="text-sm">{formatINR(totalExpenses)}</span>
                </div>
              </div>

              {/* Net Profit */}
              <div className="flex justify-between p-4 rounded-xl bg-slate-900 text-white font-bold text-base">
                <span>NET BUSINESS PROFIT (Gross Profit - C)</span>
                <span className="text-emerald-400 text-lg">{formatINR(netIncome)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport === 'receivables' && (
        <Card className="shadow-xs overflow-hidden">
          <CardHeader className="border-b bg-slate-50 flex flex-row items-center justify-between">
            <CardTitle>Customer Outstanding & Aging Summary</CardTitle>
            <span className="text-xs font-bold text-rose-600">Total Due: {formatINR(totalReceivables)}</span>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Customer Name</th>
                  <th className="px-4 py-2.5">Location</th>
                  <th className="px-4 py-2.5 text-right">Total Revenue Billed</th>
                  <th className="px-4 py-2.5 text-right">Outstanding Due</th>
                  <th className="px-4 py-2.5 text-center">Credit Terms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {state.customers.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{c.companyName}</td>
                    <td className="px-4 py-3 text-slate-600">{c.district}, {c.state}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatINR(c.totalRevenue)}</td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">{formatINR(c.outstandingBalance)}</td>
                    <td className="px-4 py-3 text-center">{c.paymentTermsDays} Days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selectedReport === 'stock_valuation' && (
        <Card className="shadow-xs overflow-hidden">
          <CardHeader className="border-b bg-slate-50 flex flex-row items-center justify-between">
            <CardTitle>Material Stock Valuation & Asset Register</CardTitle>
            <span className="text-xs font-bold text-slate-900">
              Total Value: {formatINR(state.materials.reduce((a, m) => a + m.currentStock * m.standardPurchasePrice, 0))}
            </span>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Material Name</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5 text-right">Current Stock</th>
                  <th className="px-4 py-2.5 text-right">Standard Cost</th>
                  <th className="px-4 py-2.5 text-right">Total Asset Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {state.materials.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{m.name}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">{m.category.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-right font-bold">{m.currentStock} {m.defaultUnit}</td>
                    <td className="px-4 py-3 text-right">{formatINR(m.standardPurchasePrice)}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatINR(m.currentStock * m.standardPurchasePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selectedReport !== 'pnl' && selectedReport !== 'receivables' && selectedReport !== 'stock_valuation' && (
        <Card className="shadow-xs p-6 text-center text-xs text-slate-500">
          Showing summary records for <strong>{selectedReport.toUpperCase()}</strong>. Use &quot;Export to CSV&quot; above to download the raw dataset.
        </Card>
      )}
    </div>
  );
}
