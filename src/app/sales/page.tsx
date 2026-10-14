'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Truck,
  Printer,
  FileCheck,
  Building,
  CreditCard,
  Trash2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  getStoreState,
  subscribeToStore,
  AppState,
  saveSalesOrder,
  confirmOrderDelivery
} from '@/lib/storage/store';
import { formatINR, formatDateDDMMYYYY, formatWeight } from '@/lib/utils';
import { SalesOrder, SalesOrderItem, OrderStatus, PaymentStatus } from '@/types';

export default function SalesPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesOrder | null>(null);

  // Delivery Confirmation Modal
  const [deliveryOrderId, setDeliveryOrderId] = useState<string | null>(null);
  const [weighbridgeSlip, setWeighbridgeSlip] = useState('WB-SITE-');
  const [confirmedByPerson, setConfirmedByPerson] = useState('Site Supervisor');

  // New Order Form State
  const [customerId, setCustomerId] = useState(state.customers[0]?.id || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [destinationCity, setDestinationCity] = useState('Bangalore');
  const [deliveryCharges, setDeliveryCharges] = useState(10000);
  const [advancePaid, setAdvancePaid] = useState(0);

  const [items, setItems] = useState<
    Array<{
      materialId: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
    }>
  >([
    {
      materialId: state.materials[0]?.id || 'mat_01',
      quantity: 25.0,
      unitPrice: state.materials[0]?.standardSellingPrice || 13500,
      taxRate: 5
    }
  ]);

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        materialId: state.materials[0]?.id || 'mat_01',
        quantity: 10.0,
        unitPrice: state.materials[0]?.standardSellingPrice || 13500,
        taxRate: 5
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Compute live totals
  let computedSubtotal = 0;
  let computedTax = 0;

  const computedOrderItems: SalesOrderItem[] = items.map((it, idx) => {
    const mat = state.materials.find((m) => m.id === it.materialId);
    const lineNet = it.unitPrice * it.quantity;
    const taxAmt = Number(((lineNet * it.taxRate) / 100).toFixed(2));
    const lineTot = Number((lineNet + taxAmt).toFixed(2));

    computedSubtotal += lineNet;
    computedTax += taxAmt;

    return {
      id: `soi_${idx}_${Date.now()}`,
      materialId: it.materialId,
      materialName: mat ? mat.name : 'Stone Material',
      quantity: it.quantity,
      unit: mat ? mat.defaultUnit : 'MT',
      unitPrice: it.unitPrice,
      discount: 0,
      taxRatePercent: it.taxRate,
      taxAmount: taxAmt,
      lineTotal: lineTot
    };
  });

  const computedGrandTotal = Number((computedSubtotal + computedTax + Number(deliveryCharges)).toFixed(2));
  const computedBalanceDue = Math.max(0, computedGrandTotal - Number(advancePaid));

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = state.customers.find((c) => c.id === customerId);
    if (!customer) {
      alert('Please select a customer.');
      return;
    }

    const orderNumber = `VS-ORD-${new Date().getFullYear()}-${String(state.orders.length + 1).padStart(4, '0')}`;
    const invoiceNumber = `VS-INV-${new Date().getFullYear()}-${String(state.orders.length + 1).padStart(4, '0')}`;

    const newOrder: SalesOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      customerId: customer.id,
      customerName: customer.companyName,
      customerPhone: customer.phone,
      customerGstin: customer.gstin,
      deliveryAddress: deliveryAddress.trim() || customer.deliveryAddress || customer.billingAddress,
      destinationCity: destinationCity.trim() || customer.district,
      destinationState: customer.state,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      status: 'confirmed',
      paymentStatus: Number(advancePaid) >= computedGrandTotal ? 'paid' : Number(advancePaid) > 0 ? 'partial' : 'pending',
      items: computedOrderItems,
      subtotal: computedSubtotal,
      taxAmount: computedTax,
      deliveryCharges: Number(deliveryCharges),
      grandTotal: computedGrandTotal,
      advancePaid: Number(advancePaid),
      balanceDue: computedBalanceDue,
      invoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    saveSalesOrder(newOrder);
    setIsOrderModalOpen(false);
  };

  const handleConfirmDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryOrderId || !weighbridgeSlip.trim()) {
      alert('Weighbridge slip reference is required.');
      return;
    }

    confirmOrderDelivery(deliveryOrderId, weighbridgeSlip.trim(), confirmedByPerson.trim());
    setDeliveryOrderId(null);
  };

  const filteredOrders = state.orders.filter((o) => {
    if (selectedStatus !== 'all' && o.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sales Orders & Tax Invoices
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch management, weighbridge verification, stock deduction, and GST tax invoice generation.
          </p>
        </div>

        <Button variant="orange" size="sm" onClick={() => setIsOrderModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Sales Order
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[260px] max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders, customers, or invoice numbers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-4 py-2 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none"
              >
                <option value="all">All Order Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            <strong>{filteredOrders.length}</strong> orders logged
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="px-4 py-3">Order / Invoice #</th>
                <th className="px-4 py-3">Customer & Destination</th>
                <th className="px-4 py-3">Order Date</th>
                <th className="px-4 py-3">Items & Quantities</th>
                <th className="px-4 py-3 text-right">Grand Total</th>
                <th className="px-4 py-3 text-right">Balance Due</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No sales orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-orange-600 text-sm">{ord.orderNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ord.invoiceNumber}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {ord.destinationCity} ({ord.deliveryAddress})
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {formatDateDDMMYYYY(ord.orderDate)}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-slate-800 font-medium">
                        {ord.items.map((i) => `${i.materialName} (${i.quantity} ${i.unit})`).join(', ')}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 text-sm">
                      {formatINR(ord.grandTotal)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-semibold">
                      <span className={ord.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {formatINR(ord.balanceDue)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <div className="space-y-1">
                        <Badge
                          variant={
                            ord.status === 'delivered'
                              ? 'success'
                              : ord.status === 'dispatched'
                              ? 'orange'
                              : 'info'
                          }
                          size="sm"
                        >
                          {ord.status.toUpperCase()}
                        </Badge>
                        <div>
                          <Badge
                            variant={ord.paymentStatus === 'paid' ? 'success' : 'warning'}
                            size="sm"
                          >
                            {ord.paymentStatus.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvoice(ord)}
                        >
                          <Printer className="h-3 w-3 mr-1" />
                          Invoice
                        </Button>
                        {ord.status !== 'delivered' && ord.status !== 'closed' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setDeliveryOrderId(ord.id);
                              setWeighbridgeSlip(`WB-${Math.floor(Math.random() * 9000 + 1000)}`);
                            }}
                          >
                            <FileCheck className="h-3 w-3 mr-1" />
                            Confirm Delivery
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

      {/* Create Order Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Create New Confirmed Sales Order"
        description="Book a stone delivery order, configure customer delivery site, advance payment, and materials."
        maxWidth="4xl"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer / Buyer *</label>
              <select
                value={customerId}
                onChange={(e) => {
                  const id = e.target.value;
                  setCustomerId(id);
                  const cust = state.customers.find((c) => c.id === id);
                  if (cust) {
                    setDeliveryAddress(cust.deliveryAddress || cust.billingAddress);
                    setDestinationCity(cust.district);
                  }
                }}
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
              <label className="font-semibold text-slate-700 block mb-1">Destination City / Market</label>
              <input
                type="text"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                placeholder="Bangalore, Chennai, Kochi..."
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Freight / Delivery Fee (₹)</label>
              <input
                type="number"
                value={deliveryCharges}
                onChange={(e) => setDeliveryCharges(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Exact Site Delivery Address</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="e.g. Brigade Utopia Site, Varthur-Gunjur Road, Bangalore"
              className="w-full border rounded-lg p-2 font-medium"
            />
          </div>

          {/* Line Items */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
            <div className="bg-slate-100 p-2.5 flex items-center justify-between font-bold text-slate-700 text-xs">
              <span>Order Materials</span>
              <button
                type="button"
                onClick={handleAddItem}
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
                    <label className="text-[10px] text-slate-500 block mb-0.5">Selling Rate (₹/MT)</label>
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
                      <option value={5}>5% Standard Stone</option>
                      <option value={12}>12% Polished Stone</option>
                      <option value={0}>0% Exempt</option>
                    </select>
                  </div>

                  <div className="col-span-1 text-center pt-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Advance Paid by Customer (₹)
              </label>
              <input
                type="number"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-semibold text-emerald-700"
              />
            </div>

            <div className="rounded-xl bg-slate-50 border p-3 flex flex-col justify-center text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatINR(computedSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (5%):</span>
                <span>{formatINR(computedTax)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t pt-1">
                <span>Total Payable:</span>
                <span className="text-orange-600 font-bold">{formatINR(computedGrandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setIsOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Confirm & Book Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delivery Confirmation Weighbridge Modal */}
      {deliveryOrderId && (
        <Modal
          isOpen={Boolean(deliveryOrderId)}
          onClose={() => setDeliveryOrderId(null)}
          title="Confirm Delivery & Weighbridge Slip Verification"
          description="Marking this order as delivered updates inventory ledger and generates final confirmed invoice."
          maxWidth="md"
        >
          <form onSubmit={handleConfirmDeliverySubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Weighbridge Slip Reference *</label>
              <input
                type="text"
                required
                value={weighbridgeSlip}
                onChange={(e) => setWeighbridgeSlip(e.target.value)}
                placeholder="e.g. WB-ATT-8891"
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Authorized By (Site / Dispatch Incharge) *</label>
              <input
                type="text"
                required
                value={confirmedByPerson}
                onChange={(e) => setConfirmedByPerson(e.target.value)}
                placeholder="Name of site engineer or weighbridge operator"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg flex items-start gap-2 text-[11px]">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Delivery confirmation will automatically record a <strong>sales_out</strong> movement in the Stock Ledger
                and deduct the delivered quantity from active stockyard inventory.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setDeliveryOrderId(null)}>
                Cancel
              </Button>
              <Button variant="orange" type="submit">
                Confirm Site Delivery
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Tax Invoice View / Print Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          title={`GST Tax Invoice: ${selectedInvoice.invoiceNumber || selectedInvoice.orderNumber}`}
          description="Compliant B2B Tax Invoice with Indian GST breakdown and bank payment coordinates."
          maxWidth="2xl"
        >
          <div className="bg-white p-6 border rounded-xl text-xs space-y-4 font-sans print:p-0">
            {/* Header Seller & Buyer Info */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">{state.settings.businessName}</h2>
                <p className="text-slate-600">{state.settings.address}</p>
                <p className="text-slate-600 font-mono">
                  GSTIN: <strong>{state.settings.gstin}</strong> | State: {state.settings.state}
                </p>
                <p className="text-slate-600">Phone: {state.settings.phone}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-orange-600 text-base">
                  TAX INVOICE
                </span>
                <p className="font-mono font-semibold text-slate-900">{selectedInvoice.invoiceNumber}</p>
                <p className="text-slate-500">Date: {formatDateDDMMYYYY(selectedInvoice.invoiceDate || selectedInvoice.orderDate)}</p>
                <p className="text-slate-500">Order Ref: {selectedInvoice.orderNumber}</p>
                {selectedInvoice.weighbridgeRef && (
                  <p className="text-slate-700 font-mono font-semibold">WB Ref: {selectedInvoice.weighbridgeRef}</p>
                )}
              </div>
            </div>

            {/* Bill to & Ship to */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Bill To:</span>
                <h4 className="font-bold text-slate-900 text-xs mt-0.5">{selectedInvoice.customerName}</h4>
                <p className="text-slate-600 text-[11px]">{selectedInvoice.deliveryAddress}</p>
                {selectedInvoice.customerGstin && (
                  <p className="text-slate-700 font-mono font-semibold mt-1">
                    GSTIN: {selectedInvoice.customerGstin}
                  </p>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Destination Site:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{selectedInvoice.destinationCity}</p>
                <p className="text-slate-600 text-[11px]">{selectedInvoice.deliveryAddress}</p>
              </div>
            </div>

            {/* Invoice Table */}
            <table className="w-full text-left border-y">
              <thead>
                <tr className="border-b bg-slate-100 text-slate-700">
                  <th className="py-2 px-2">Description of Goods</th>
                  <th className="py-2 px-2 text-right">Quantity</th>
                  <th className="py-2 px-2 text-right">Rate</th>
                  <th className="py-2 px-2 text-right">Taxable Value</th>
                  <th className="py-2 px-2 text-right">GST (5%)</th>
                  <th className="py-2 px-2 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedInvoice.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-2 px-2 font-medium">{it.materialName}</td>
                    <td className="py-2 px-2 text-right">{it.quantity} {it.unit}</td>
                    <td className="py-2 px-2 text-right">{formatINR(it.unitPrice)}</td>
                    <td className="py-2 px-2 text-right">{formatINR(it.quantity * it.unitPrice)}</td>
                    <td className="py-2 px-2 text-right">{formatINR(it.taxAmount)}</td>
                    <td className="py-2 px-2 text-right font-semibold">{formatINR(it.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Totals */}
            <div className="flex justify-between items-start pt-2">
              <div className="space-y-1 text-[11px] text-slate-600">
                <p className="font-bold text-slate-800">Bank Details for Remittance:</p>
                <p>Bank: {state.settings.bankName}</p>
                <p className="font-mono">Account No: {state.settings.bankAccountNo}</p>
                <p className="font-mono">IFSC Code: {state.settings.bankIfsc}</p>
                <p>Branch: {state.settings.bankBranch}</p>
              </div>

              <div className="w-64 space-y-1 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatINR(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST (2.5%) + SGST (2.5%):</span>
                  <span>{formatINR(selectedInvoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges:</span>
                  <span>{formatINR(selectedInvoice.deliveryCharges)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t pt-1">
                  <span>Invoice Total:</span>
                  <span className="text-orange-600">{formatINR(selectedInvoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Advance Received:</span>
                  <span>{formatINR(selectedInvoice.advancePaid)}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-600 border-t pt-1">
                  <span>Balance Payable:</span>
                  <span>{formatINR(selectedInvoice.balanceDue)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" /> Print Tax Invoice
              </Button>
              <Button variant="orange" size="sm" onClick={() => setSelectedInvoice(null)}>
                Close Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
