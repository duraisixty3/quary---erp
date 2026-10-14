'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Building,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getStoreState, subscribeToStore, AppState, recordPayment } from '@/lib/storage/store';
import { formatINR, formatDateDDMMYYYY } from '@/lib/utils';
import { PaymentTransaction, PaymentMode, PaymentType } from '@/types';

export default function PaymentsPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [activeTab, setActiveTab] = useState<'receivables' | 'payables' | 'transactions'>('receivables');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Form State
  const [paymentType, setPaymentType] = useState<PaymentType>('customer_receipt');
  const [partyId, setPartyId] = useState(state.customers[0]?.id || '');
  const [amount, setAmount] = useState(50000);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('neft_rtgs');
  const [referenceNumber, setReferenceNumber] = useState(`UTR${Date.now().toString().slice(-8)}`);
  const [allocatedInvoiceId, setAllocatedInvoiceId] = useState('');
  const [notes, setNotes] = useState('Part payment against invoice');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const totalReceivables = state.customers.reduce((acc, c) => acc + c.outstandingBalance, 0);
  const totalPayables = state.suppliers.reduce((acc, s) => acc + s.outstandingBalance, 0);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !referenceNumber.trim()) {
      alert('Amount and transaction reference number are required.');
      return;
    }

    let partyName = '';
    let allocatedInvoiceNo = '';

    if (paymentType === 'customer_receipt') {
      const cust = state.customers.find((c) => c.id === partyId);
      partyName = cust ? cust.companyName : 'Customer';
      if (allocatedInvoiceId) {
        const order = state.orders.find((o) => o.id === allocatedInvoiceId);
        allocatedInvoiceNo = order?.invoiceNumber || order?.orderNumber || '';
      }
    } else {
      const sup = state.suppliers.find((s) => s.id === partyId);
      partyName = sup ? sup.name : 'Supplier';
      if (allocatedInvoiceId) {
        const po = state.purchases.find((p) => p.id === allocatedInvoiceId);
        allocatedInvoiceNo = po?.poNumber || '';
      }
    }

    const newPayment: PaymentTransaction = {
      id: `pmt_${Date.now()}`,
      paymentType,
      date: new Date().toISOString().split('T')[0],
      partyName,
      partyId,
      amount: Number(amount),
      paymentMode,
      referenceNumber: referenceNumber.trim(),
      allocatedInvoiceId: allocatedInvoiceId || undefined,
      allocatedInvoiceNo: allocatedInvoiceNo || undefined,
      isAdvance: !allocatedInvoiceId,
      notes: notes.trim(),
      createdAt: new Date().toISOString()
    };

    recordPayment(newPayment);
    setIsPaymentModalOpen(false);
  };

  // Unpaid invoices for dropdown
  const pendingCustomerInvoices = state.orders.filter(
    (o) => o.balanceDue > 0 && o.customerId === partyId
  );
  const pendingSupplierPOs = state.purchases.filter(
    (p) => p.balancePayable > 0 && p.supplierId === partyId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Payments, Receivables & Payables Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Reconcile customer invoice receipts, supplier quarry payables, bank remittances, and UPI settlements.
          </p>
        </div>

        <Button variant="orange" size="sm" onClick={() => setIsPaymentModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Record Payment Transaction
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="shadow-xs border-l-4 border-l-rose-500">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Customer Receivables
            </span>
            <div className="mt-2 text-2xl font-bold text-rose-600 tracking-tight">
              {formatINR(totalReceivables)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Pending payments due from B2B stone buyers</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Supplier Payables
            </span>
            <div className="mt-2 text-2xl font-bold text-amber-700 tracking-tight">
              {formatINR(totalPayables)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Credit balances owed to partner quarries & crushers</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Liquidity Position
            </span>
            <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
              {formatINR(totalReceivables - totalPayables)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Net receivable surplus over supplier obligations</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('receivables')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'receivables'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Customer Outstanding Invoices
        </button>
        <button
          onClick={() => setActiveTab('payables')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'payables'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Quarry Supplier Dues
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'transactions'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Payment Transaction History
        </button>
      </div>

      {/* Tab 1: Customer Receivables */}
      {activeTab === 'receivables' && (
        <Card className="shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone / District</th>
                  <th className="px-4 py-3 text-right">Credit Limit</th>
                  <th className="px-4 py-3 text-right">Total Billed</th>
                  <th className="px-4 py-3 text-right">Outstanding Due</th>
                  <th className="px-4 py-3 text-center">Payment Terms</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {state.customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 text-sm">{c.companyName}</div>
                      <div className="text-[11px] text-slate-500">{c.contactPerson}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div>{c.phone}</div>
                      <div className="text-[10px] text-slate-400">{c.district}, {c.state}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                      {formatINR(c.creditLimit)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                      {formatINR(c.totalRevenue)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`font-bold text-sm ${c.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatINR(c.outstandingBalance)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant="outline" size="sm">
                        {c.paymentTermsDays} Days
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {c.outstandingBalance > 0 && (
                        <Button
                          variant="orange"
                          size="sm"
                          onClick={() => {
                            setPaymentType('customer_receipt');
                            setPartyId(c.id);
                            setAmount(c.outstandingBalance);
                            setIsPaymentModalOpen(true);
                          }}
                        >
                          Collect Payment
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: Supplier Payables */}
      {activeTab === 'payables' && (
        <Card className="shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="px-4 py-3">Quarry Supplier</th>
                  <th className="px-4 py-3">Location / Contact</th>
                  <th className="px-4 py-3 text-right">Total Purchased</th>
                  <th className="px-4 py-3 text-right">Outstanding Payable</th>
                  <th className="px-4 py-3 text-center">Terms</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {state.suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 text-sm">{s.name}</div>
                      <div className="text-[11px] text-slate-500">{s.contactPerson}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div>{s.district}, {s.state}</div>
                      <div className="text-[10px] text-slate-400">{s.phone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                      {formatINR(s.totalPurchases)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`font-bold text-sm ${s.outstandingBalance > 0 ? 'text-amber-700' : 'text-emerald-600'}`}>
                        {formatINR(s.outstandingBalance)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant="outline" size="sm">
                        {s.paymentTermsDays} Days
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {s.outstandingBalance > 0 && (
                        <Button
                          variant="orange"
                          size="sm"
                          onClick={() => {
                            setPaymentType('supplier_payment');
                            setPartyId(s.id);
                            setAmount(s.outstandingBalance);
                            setIsPaymentModalOpen(true);
                          }}
                        >
                          Disburse Payment
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Transactions Journal */}
      {activeTab === 'transactions' && (
        <Card className="shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Party Name</th>
                  <th className="px-4 py-3">Mode & UTR / Ref</th>
                  <th className="px-4 py-3">Allocated Invoice</th>
                  <th className="px-4 py-3 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {state.payments.map((p) => {
                  const isReceipt = p.paymentType === 'customer_receipt';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3.5 text-slate-600 font-mono">
                        {formatDateDDMMYYYY(p.date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={isReceipt ? 'success' : 'warning'} size="sm">
                          {isReceipt ? 'Customer Receipt' : 'Supplier Payment'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        {p.partyName}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-slate-800">{p.referenceNumber}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{p.paymentMode}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono">
                        {p.allocatedInvoiceNo || 'General Advance'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-sm">
                        <span className={isReceipt ? 'text-emerald-700' : 'text-slate-900'}>
                          {isReceipt ? '+' : '-'}{formatINR(p.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment Remittance or Receipt"
        description="Allocate incoming customer collections or outgoing quarry disbursements with bank UTR reference."
        maxWidth="lg"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payment Category *</label>
              <select
                value={paymentType}
                onChange={(e) => {
                  const t = e.target.value as PaymentType;
                  setPaymentType(t);
                  setPartyId(t === 'customer_receipt' ? state.customers[0]?.id : state.suppliers[0]?.id);
                }}
                className="w-full border rounded-lg p-2 font-medium"
              >
                <option value="customer_receipt">Customer Inward Receipt (+)</option>
                <option value="supplier_payment">Quarry Supplier Payment (-)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Party (Customer / Supplier) *</label>
              <select
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                className="w-full border rounded-lg p-2 font-medium"
              >
                {paymentType === 'customer_receipt'
                  ? state.customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} (Due: ₹{c.outstandingBalance})
                      </option>
                    ))
                  : state.suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Payable: ₹{s.outstandingBalance})
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-bold text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full border rounded-lg p-2 font-medium"
              >
                <option value="neft_rtgs">Bank NEFT / RTGS</option>
                <option value="upi">UPI / IMPS</option>
                <option value="cheque">Bank Cheque</option>
                <option value="cash">Cash Receipt</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Bank Transaction Reference / UTR Number *
            </label>
            <input
              type="text"
              required
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. HDFCR2026101488921 or UPI/328901829031"
              className="w-full border rounded-lg p-2 font-mono uppercase"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Allocate to Specific Invoice (Optional)
            </label>
            <select
              value={allocatedInvoiceId}
              onChange={(e) => setAllocatedInvoiceId(e.target.value)}
              className="w-full border rounded-lg p-2 font-medium"
            >
              <option value="">General On-Account Advance (No Allocation)</option>
              {paymentType === 'customer_receipt'
                ? pendingCustomerInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber || inv.orderNumber} (Balance Due: ₹{inv.balanceDue})
                    </option>
                  ))
                : pendingSupplierPOs.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.poNumber} (Balance: ₹{po.balancePayable})
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Remittance Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Post Payment Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
