'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Send,
  ArrowRight,
  Printer,
  Trash2,
  Calendar,
  Building
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getStoreState, subscribeToStore, AppState, saveQuotation, convertQuotationToOrder } from '@/lib/storage/store';
import { formatINR, formatDateDDMMYYYY, formatWeight } from '@/lib/utils';
import { Quotation, QuotationItem, QuotationStatus } from '@/types';

export default function QuotationsPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);

  // New Quotation Form State
  const [customerId, setCustomerId] = useState(state.customers[0]?.id || '');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [deliveryCharges, setDeliveryCharges] = useState(12000);
  const [terms, setTerms] = useState(
    'Payment 50% advance with confirmed order, balance within 30 days of site delivery. Unloading at destination by buyer.'
  );

  // Multi-item rows
  const [items, setItems] = useState<
    Array<{
      materialId: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      taxRate: number;
    }>
  >([
    {
      materialId: state.materials[0]?.id || 'mat_01',
      quantity: 20.0,
      unitPrice: state.materials[0]?.standardSellingPrice || 13500,
      discount: 0,
      taxRate: 5
    }
  ]);

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const handleAddItemRow = () => {
    setItems([
      ...items,
      {
        materialId: state.materials[0]?.id || 'mat_01',
        quantity: 10.0,
        unitPrice: state.materials[0]?.standardSellingPrice || 13500,
        discount: 0,
        taxRate: 5
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Compute live totals
  let computedSubtotal = 0;
  let computedTotalTax = 0;

  const computedItems: QuotationItem[] = items.map((it, idx) => {
    const mat = state.materials.find((m) => m.id === it.materialId);
    const lineNet = Math.max(0, it.unitPrice - it.discount) * it.quantity;
    const taxAmt = Number(((lineNet * it.taxRate) / 100).toFixed(2));
    const lineTot = Number((lineNet + taxAmt).toFixed(2));

    computedSubtotal += lineNet;
    computedTotalTax += taxAmt;

    return {
      id: `qti_${idx}_${Date.now()}`,
      materialId: it.materialId,
      materialName: mat ? mat.name : 'Stone Material',
      quantity: it.quantity,
      unit: mat ? mat.defaultUnit : 'MT',
      unitPrice: it.unitPrice,
      discount: it.discount,
      taxRatePercent: it.taxRate,
      taxAmount: taxAmt,
      lineTotal: lineTot
    };
  });

  const computedGrandTotal = Number((computedSubtotal + computedTotalTax + Number(deliveryCharges)).toFixed(2));

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = state.customers.find((c) => c.id === customerId);
    if (!customer) {
      alert('Please select a customer.');
      return;
    }

    const quotationNumber = `VS-QT-${new Date().getFullYear()}-${String(state.quotations.length + 1).padStart(4, '0')}`;

    const newQuotation: Quotation = {
      id: `qt_${Date.now()}`,
      quotationNumber,
      customerId: customer.id,
      customerName: customer.companyName,
      date: new Date().toISOString().split('T')[0],
      validUntil,
      items: computedItems,
      subtotal: computedSubtotal,
      totalTax: computedTotalTax,
      deliveryCharges: Number(deliveryCharges),
      grandTotal: computedGrandTotal,
      terms,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    saveQuotation(newQuotation);
    setIsModalOpen(false);
  };

  const handleConvert = (quotationId: string) => {
    if (confirm('Convert this quotation into an active Sales Order?')) {
      const order = convertQuotationToOrder(quotationId);
      if (order) {
        alert(`Successfully generated Sales Order: ${order.orderNumber}`);
      }
    }
  };

  const filteredQuotations = state.quotations.filter((q) => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return q.quotationNumber.toLowerCase().includes(s) || q.customerName.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quotations & Estimates
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate formal stone & pebble price proposals with GST breakdown and convert directly to confirmed orders.
          </p>
        </div>

        <Button variant="orange" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Create Quotation
        </Button>
      </div>

      {/* Search / Filter */}
      <Card className="shadow-xs">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="relative min-w-[280px] max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by quote number or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-4 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium">
            <strong>{filteredQuotations.length}</strong> quotations created
          </span>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <Card className="shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="px-4 py-3">Quote #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date / Valid Until</th>
                <th className="px-4 py-3">Items Quoted</th>
                <th className="px-4 py-3 text-right">Grand Total</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No quotations found. Click &quot;Create Quotation&quot; to build a new quote.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-orange-600 text-sm">
                        {quote.quotationNumber}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{quote.customerName}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-slate-800 font-medium">{formatDateDDMMYYYY(quote.date)}</div>
                      <div className="text-[11px] text-slate-400">Valid: {formatDateDDMMYYYY(quote.validUntil)}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-slate-700 font-medium">
                        {quote.items.map((i) => `${i.materialName} (${i.quantity} ${i.unit})`).join(', ')}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 text-sm">
                      {formatINR(quote.grandTotal)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={
                          quote.status === 'converted'
                            ? 'success'
                            : quote.status === 'sent'
                            ? 'info'
                            : 'default'
                        }
                        size="sm"
                      >
                        {quote.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewQuotation(quote)}
                        >
                          <Printer className="h-3 w-3 mr-1" />
                          Print / View
                        </Button>
                        {quote.status !== 'converted' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleConvert(quote.id)}
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Convert to Order
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Quotation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Formal Quotation"
        description="Select customer, add multi-line stone materials, tax rates, and delivery charges."
        maxWidth="4xl"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer / Buyer *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full border rounded-lg p-2 font-medium"
              >
                {state.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({c.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Valid Until Date</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Delivery / Logistics Charges (₹)</label>
              <input
                type="number"
                value={deliveryCharges}
                onChange={(e) => setDeliveryCharges(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-semibold"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
            <div className="bg-slate-100 p-2.5 flex items-center justify-between font-bold text-slate-700 text-xs">
              <span>Quoted Stone Materials & Specifications</span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Material Line
              </button>
            </div>

            <div className="divide-y divide-slate-100 p-3 space-y-3 bg-white">
              {items.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-5">
                    <label className="text-[10px] text-slate-500 block mb-0.5">Material</label>
                    <select
                      value={row.materialId}
                      onChange={(e) => {
                        const newMatId = e.target.value;
                        const mat = state.materials.find((m) => m.id === newMatId);
                        const updated = [...items];
                        updated[idx].materialId = newMatId;
                        if (mat) updated[idx].unitPrice = mat.standardSellingPrice;
                        setItems(updated);
                      }}
                      className="w-full border rounded-lg p-1.5"
                    >
                      {state.materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.size || 'Standard'}) - ₹{m.standardSellingPrice}/{m.defaultUnit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 block mb-0.5">Quantity (MT)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={row.quantity}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].quantity = Number(e.target.value);
                        setItems(updated);
                      }}
                      className="w-full border rounded-lg p-1.5 font-bold"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 block mb-0.5">Rate (₹/Unit)</label>
                    <input
                      type="number"
                      value={row.unitPrice}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].unitPrice = Number(e.target.value);
                        setItems(updated);
                      }}
                      className="w-full border rounded-lg p-1.5"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 block mb-0.5">GST Rate %</label>
                    <select
                      value={row.taxRate}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].taxRate = Number(e.target.value);
                        setItems(updated);
                      }}
                      className="w-full border rounded-lg p-1.5"
                    >
                      <option value={0}>0% Exempt</option>
                      <option value={5}>5% Standard Stone</option>
                      <option value={12}>12% Polished Stone</option>
                      <option value={18}>18% Processing</option>
                    </select>
                  </div>

                  <div className="col-span-1 text-center pt-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Remove Row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Commercial Terms & Conditions</label>
            <textarea
              rows={2}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Quotation Summary Box */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Material Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatINR(computedSubtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST Taxes:</span>
              <span className="font-semibold text-slate-900">{formatINR(computedTotalTax)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Freight / Delivery:</span>
              <span className="font-semibold text-slate-900">{formatINR(deliveryCharges)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2 mt-1">
              <span>Grand Payable Total:</span>
              <span className="text-orange-600 text-base">{formatINR(computedGrandTotal)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Save & Issue Quotation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quotation Print / View Modal */}
      {previewQuotation && (
        <Modal
          isOpen={Boolean(previewQuotation)}
          onClose={() => setPreviewQuotation(null)}
          title={`Quotation: ${previewQuotation.quotationNumber}`}
          description="Official quotation format suitable for emailing or printing for the client."
          maxWidth="2xl"
        >
          <div className="bg-white p-6 border rounded-xl text-xs space-y-4 font-sans">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">{state.settings.businessName}</h2>
                <p className="text-slate-500">{state.settings.address}</p>
                <p className="text-slate-500">GSTIN: {state.settings.gstin} | Phone: {state.settings.phone}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-orange-600 text-base">
                  {previewQuotation.quotationNumber}
                </span>
                <p className="text-slate-500">Date: {formatDateDDMMYYYY(previewQuotation.date)}</p>
                <p className="text-slate-500">Valid Until: {formatDateDDMMYYYY(previewQuotation.validUntil)}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold">To Customer:</span>
              <h3 className="text-sm font-bold text-slate-900">{previewQuotation.customerName}</h3>
            </div>

            <table className="w-full text-left border-y">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-600">
                  <th className="py-2 px-2">Material Description</th>
                  <th className="py-2 px-2 text-right">Quantity</th>
                  <th className="py-2 px-2 text-right">Rate</th>
                  <th className="py-2 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {previewQuotation.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-2 px-2 font-medium">{it.materialName}</td>
                    <td className="py-2 px-2 text-right">{it.quantity} {it.unit}</td>
                    <td className="py-2 px-2 text-right">{formatINR(it.unitPrice)}</td>
                    <td className="py-2 px-2 text-right font-semibold">{formatINR(it.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64 space-y-1 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatINR(previewQuotation.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes:</span>
                  <span>{formatINR(previewQuotation.totalTax)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges:</span>
                  <span>{formatINR(previewQuotation.deliveryCharges)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t pt-1">
                  <span>Grand Total:</span>
                  <span className="text-orange-600">{formatINR(previewQuotation.grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 text-[11px] text-slate-500">
              <strong>Terms:</strong> {previewQuotation.terms}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" /> Print / Save PDF
              </Button>
              <Button variant="orange" size="sm" onClick={() => setPreviewQuotation(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
