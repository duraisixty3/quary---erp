'use client';

import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  FileCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  getStoreState,
  subscribeToStore,
  AppState,
  savePurchaseOrder,
  confirmPurchaseReceipt
} from '@/lib/storage/store';
import { formatINR, formatDateDDMMYYYY, formatWeight } from '@/lib/utils';
import { PurchaseOrder, PurchaseOrderItem, PurchaseStatus } from '@/types';

export default function PurchasesPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Goods Receipt Modal State
  const [receiptPO, setReceiptPO] = useState<PurchaseOrder | null>(null);
  const [receivedQtyMap, setReceivedQtyMap] = useState<Record<string, number>>({});
  const [stockLocationReceived, setStockLocationReceived] = useState('Attibele Main Yard');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [confirmedByPerson, setConfirmedByPerson] = useState('Durai Murugan');

  // Form State for New PO
  const [supplierId, setSupplierId] = useState(state.suppliers[0]?.id || '');
  const [materialId, setMaterialId] = useState(state.materials[0]?.id || '');
  const [quantity, setQuantity] = useState(25.0);
  const [negotiatedRate, setNegotiatedRate] = useState(8500);
  const [loadingCharges, setLoadingCharges] = useState(4000);
  const [notes, setNotes] = useState('Immediate dispatch required for Whitefield project order.');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = state.suppliers.find((s) => s.id === supplierId);
    const mat = state.materials.find((m) => m.id === materialId);
    if (!sup || !mat) {
      alert('Supplier and Material selection required.');
      return;
    }

    const subtotal = Number((quantity * negotiatedRate).toFixed(2));
    const taxAmount = Number(((subtotal * 0.05)).toFixed(2)); // 5% GST
    const landedCost = Number((subtotal + taxAmount + Number(loadingCharges)).toFixed(2));
    const poNumber = `VS-PO-${new Date().getFullYear()}-${String(state.purchases.length + 1).padStart(4, '0')}`;

    const newPO: PurchaseOrder = {
      id: `po_${Date.now()}`,
      poNumber,
      supplierId: sup.id,
      supplierName: sup.name,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDispatchDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      status: 'ordered',
      paymentStatus: 'pending',
      items: [
        {
          id: `poi_${Date.now()}`,
          materialId: mat.id,
          materialName: mat.name,
          orderedQuantity: quantity,
          receivedQuantity: 0,
          unit: mat.defaultUnit,
          negotiatedRate,
          taxRatePercent: 5,
          taxAmount,
          lineTotal: subtotal + taxAmount
        }
      ],
      subtotal,
      loadingCharges: Number(loadingCharges),
      taxAmount,
      landedCost,
      amountPaid: 0,
      balancePayable: landedCost,
      notes,
      createdAt: new Date().toISOString()
    };

    savePurchaseOrder(newPO);
    setIsModalOpen(false);
  };

  const openReceiptModal = (po: PurchaseOrder) => {
    setReceiptPO(po);
    const initialMap: Record<string, number> = {};
    po.items.forEach((it) => {
      initialMap[it.materialId] = it.orderedQuantity;
    });
    setReceivedQtyMap(initialMap);
    setSupplierInvoiceNo(`INV-${Math.floor(Math.random() * 9000 + 1000)}`);
  };

  const handleConfirmReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptPO || !supplierInvoiceNo.trim()) {
      alert('Supplier invoice number required.');
      return;
    }

    const receivedItems = Object.entries(receivedQtyMap).map(([matId, qty]) => ({
      materialId: matId,
      receivedQty: Number(qty)
    }));

    confirmPurchaseReceipt(
      receiptPO.id,
      receivedItems,
      confirmedByPerson.trim(),
      stockLocationReceived.trim(),
      supplierInvoiceNo.trim()
    );

    setReceiptPO(null);
  };

  const filteredPurchases = state.purchases.filter((p) => {
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.poNumber.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q) ||
        (p.supplierInvoiceNo && p.supplierInvoiceNo.toLowerCase().includes(q))
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
            Purchase Orders & Goods Receipt
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Procure raw aggregates and pebbles from external quarries with weighbridge discrepancy and shortage tracking.
          </p>
        </div>

        <Button variant="orange" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Create Purchase Order
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[260px] max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search PO #, quarry supplier, or invoice..."
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
                <option value="all">All Statuses</option>
                <option value="ordered">Ordered (In Transit)</option>
                <option value="received">Received into Stock</option>
                <option value="partially_received">Partially Received</option>
              </select>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            <strong>{filteredPurchases.length}</strong> purchase orders
          </span>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card className="shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="px-4 py-3">PO #</th>
                <th className="px-4 py-3">Supplier Quarry</th>
                <th className="px-4 py-3">Order Date</th>
                <th className="px-4 py-3">Material & Ordered Qty</th>
                <th className="px-4 py-3 text-right">Landed Cost</th>
                <th className="px-4 py-3 text-right">Balance Payable</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-orange-600 text-sm">{po.poNumber}</div>
                      {po.supplierInvoiceNo && (
                        <div className="text-[10px] text-slate-400 font-mono">Inv: {po.supplierInvoiceNo}</div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{po.supplierName}</div>
                      {po.stockLocationReceived && (
                        <div className="text-[11px] text-slate-500">Recv at: {po.stockLocationReceived}</div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {formatDateDDMMYYYY(po.orderDate)}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-slate-800 font-medium">
                        {po.items.map((i) => `${i.materialName} (${i.orderedQuantity} ${i.unit})`).join(', ')}
                      </div>
                      {po.shortageDamageQty && po.shortageDamageQty > 0 ? (
                        <span className="text-[10px] text-rose-600 font-semibold">
                          Shortage: {po.shortageDamageQty} MT noted
                        </span>
                      ) : null}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 text-sm">
                      {formatINR(po.landedCost)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-semibold">
                      <span className={po.balancePayable > 0 ? 'text-amber-700' : 'text-emerald-600'}>
                        {formatINR(po.balancePayable)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <div className="space-y-1">
                        <Badge
                          variant={po.status === 'received' ? 'success' : 'orange'}
                          size="sm"
                        >
                          {po.status === 'received' ? 'Stock Received' : 'Dispatched / In Transit'}
                        </Badge>
                        <div>
                          <Badge
                            variant={po.paymentStatus === 'paid' ? 'success' : 'warning'}
                            size="sm"
                          >
                            {po.paymentStatus.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {po.status !== 'received' ? (
                        <Button
                          variant="orange"
                          size="sm"
                          onClick={() => openReceiptModal(po)}
                        >
                          <FileCheck className="h-3.5 w-3.5 mr-1" />
                          Receive Stock
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create PO Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Purchase Order to Quarry / Supplier"
        description="Book aggregate or pebble load, negotiate purchase rate, and record expected dispatch."
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Quarry / Supplier *</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full border rounded-lg p-2 font-medium"
            >
              {state.suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.district}, {s.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Material *</label>
            <select
              value={materialId}
              onChange={(e) => {
                const id = e.target.value;
                setMaterialId(id);
                const mat = state.materials.find((m) => m.id === id);
                if (mat) setNegotiatedRate(mat.standardPurchasePrice);
              }}
              className="w-full border rounded-lg p-2 font-medium"
            >
              {state.materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.size || 'Standard'}) - Standard Cost: ₹{m.standardPurchasePrice}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ordered Quantity (MT) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Negotiated Rate (₹/MT) *</label>
              <input
                type="number"
                required
                value={negotiatedRate}
                onChange={(e) => setNegotiatedRate(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-semibold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Loading Charges (₹)</label>
              <input
                type="number"
                value={loadingCharges}
                onChange={(e) => setLoadingCharges(Number(e.target.value))}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Internal Procurement Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="rounded-xl bg-slate-50 border p-3 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Material Cost ({quantity} MT):</span>
              <span className="font-semibold text-slate-900">{formatINR(quantity * negotiatedRate)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST Tax (5%):</span>
              <span className="font-semibold text-slate-900">{formatINR(quantity * negotiatedRate * 0.05)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t pt-1">
              <span>Total Landed Sourcing Cost:</span>
              <span className="text-orange-600">
                {formatINR(quantity * negotiatedRate * 1.05 + Number(loadingCharges))}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Confirm Purchase Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* Goods Receipt Modal */}
      {receiptPO && (
        <Modal
          isOpen={Boolean(receiptPO)}
          onClose={() => setReceiptPO(null)}
          title={`Confirm Inward Stock Receipt: ${receiptPO.poNumber}`}
          description="Verify weighbridge delivered quantities, record shortages or transit spillage, and inward into stockyard."
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmReceipt} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
              <div className="font-bold text-slate-800 text-xs">Supplier: {receiptPO.supplierName}</div>
              {receiptPO.items.map((item) => (
                <div key={item.materialId} className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    {item.materialName} (Ordered: {item.orderedQuantity} {item.unit})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px]">Actual Recv:</span>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={receivedQtyMap[item.materialId] ?? item.orderedQuantity}
                      onChange={(e) =>
                        setReceivedQtyMap({
                          ...receivedQtyMap,
                          [item.materialId]: Number(e.target.value)
                        })
                      }
                      className="w-24 border rounded p-1 font-bold text-right"
                    />
                    <span className="font-semibold text-slate-700">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Supplier Invoice # *</label>
                <input
                  type="text"
                  required
                  value={supplierInvoiceNo}
                  onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                  placeholder="e.g. SLBM-2026-4402"
                  className="w-full border rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Stockyard Receiving Bay *</label>
                <input
                  type="text"
                  required
                  value={stockLocationReceived}
                  onChange={(e) => setStockLocationReceived(e.target.value)}
                  placeholder="e.g. Attibele Main Yard - Bay 1"
                  className="w-full border rounded-lg p-2 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Authorizing Incharge *</label>
              <input
                type="text"
                required
                value={confirmedByPerson}
                onChange={(e) => setConfirmedByPerson(e.target.value)}
                className="w-full border rounded-lg p-2 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" type="button" onClick={() => setReceiptPO(null)}>
                Cancel
              </Button>
              <Button variant="orange" type="submit">
                Inward Stock to Ledger
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
