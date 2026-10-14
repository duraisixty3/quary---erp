'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building,
  RotateCcw,
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getStoreState, subscribeToStore, AppState, saveExpense } from '@/lib/storage/store';
import { formatINR, formatDateDDMMYYYY } from '@/lib/utils';
import { BusinessExpense, ExpenseCategory } from '@/types';

export default function ExpensesPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('fuel_diesel');
  const [amount, setAmount] = useState(25000);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'upi' | 'cheque'>('bank_transfer');
  const [description, setDescription] = useState('Diesel for excavators and site generators');
  const [vendorSupplierName, setVendorSupplierName] = useState('Bharat Petroleum Shoolagiri');
  const [receiptNote, setReceiptNote] = useState('Cash memo # 8812');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description.trim()) {
      alert('Amount and description required.');
      return;
    }

    const newExpense: BusinessExpense = {
      id: `exp_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category,
      amount: Number(amount),
      paymentMethod,
      description: description.trim(),
      vendorSupplierName: vendorSupplierName.trim(),
      receiptAttachmentNote: receiptNote.trim(),
      isApproved: true,
      approvedBy: state.currentUser.name,
      createdAt: new Date().toISOString()
    };

    saveExpense(newExpense);
    setIsModalOpen(false);
  };

  const filteredExpenses = state.expenses.filter((exp) => {
    if (selectedCategory !== 'all' && exp.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        exp.description.toLowerCase().includes(q) ||
        (exp.vendorSupplierName && exp.vendorSupplierName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + (e.isReversed ? 0 : e.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operating & Quarry Expense Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track diesel fuel, crusher electricity bills, labour wages, explosives, yard leases, and administrative overheads.
          </p>
        </div>

        <Button variant="orange" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Record Expense
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="shadow-xs border-l-4 border-l-rose-500">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Expenses Logged
            </span>
            <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
              {formatINR(totalExpenses)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Approved operating costs for current period</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-l-4 border-l-orange-500">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Top Expense Cost Centers
            </span>
            <div className="mt-2 text-base font-bold text-slate-900">
              Fuel Diesel & Crusher HT Power
            </div>
            <p className="text-xs text-slate-400 mt-1">Direct quarry extraction & crushing energy</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Audited Entries
            </span>
            <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
              {state.expenses.length} Receipts
            </div>
            <p className="text-xs text-slate-400 mt-1">Validated with receipt vouchers & memos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[240px] max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendor, description, or memo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-4 py-2 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="fuel_diesel">Diesel & Fuel</option>
                <option value="crusher_electricity">Crusher Electricity</option>
                <option value="labour_wages">Labour Wages</option>
                <option value="stockyard_rent">Stockyard Rent / Lease</option>
                <option value="freight_transport">Freight & Transport</option>
                <option value="machinery_repairs">Machinery Repairs</option>
                <option value="office_admin">Office & Admin</option>
              </select>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            <strong>{filteredExpenses.length}</strong> expense records
          </span>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Vendor / Recipient</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-center">Payment Method</th>
                <th className="px-4 py-3 text-right">Amount (INR)</th>
                <th className="px-4 py-3 text-center">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5 text-slate-600 font-mono">
                      {formatDateDDMMYYYY(exp.date)}
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge variant="outline" size="sm" className="capitalize">
                        {exp.category.replace('_', ' ')}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {exp.vendorSupplierName || 'Direct'}
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      <div>{exp.description}</div>
                      {exp.receiptAttachmentNote && (
                        <span className="text-[10px] text-slate-400">Memo: {exp.receiptAttachmentNote}</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="font-mono text-slate-600 uppercase text-[11px]">
                        {exp.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 text-sm">
                      {formatINR(exp.amount)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Badge variant="success" size="sm">
                        Approved
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Operating or Quarry Expense"
        description="Log operational costs for diesel, electricity, labour, or machinery maintenance."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Expense Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full border rounded-lg p-2 font-medium"
            >
              <option value="fuel_diesel">Diesel & Fuel</option>
              <option value="crusher_electricity">Crusher Electricity (TANGEDCO / BESCOM)</option>
              <option value="labour_wages">Labour Wages & Loading Crew</option>
              <option value="machinery_repairs">Machinery Repairs & Spares</option>
              <option value="stockyard_rent">Stockyard Lease / Yard Rent</option>
              <option value="freight_transport">Freight & Transporter Top-up</option>
              <option value="explosives_blasting">Explosives & Blasting Contractor</option>
              <option value="quarry_royalty">Govt Mining Royalty / Seigniorage</option>
              <option value="office_admin">Office Administration</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-bold text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full border rounded-lg p-2 font-medium"
              >
                <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="upi">UPI / QR Code</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Petty Cash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Vendor / Payee Name</label>
            <input
              type="text"
              value={vendorSupplierName}
              onChange={(e) => setVendorSupplierName(e.target.value)}
              placeholder="e.g. Bharat Petroleum Shoolagiri Outlet"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 500 Litres diesel for excavator and generator"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Receipt / Voucher Reference</label>
            <input
              type="text"
              value={receiptNote}
              onChange={(e) => setReceiptNote(e.target.value)}
              placeholder="e.g. Bill No. BP-9921 / UTR: 32091823901"
              className="w-full border rounded-lg p-2 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Save Expense Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
