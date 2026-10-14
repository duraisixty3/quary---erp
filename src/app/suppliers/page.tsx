'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Edit2,
  Trash2,
  FileText,
  Clock,
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getStoreState, subscribeToStore, AppState, saveSupplier, deleteSupplier } from '@/lib/storage/store';
import { formatINR } from '@/lib/utils';
import { Supplier } from '@/types';

export default function SuppliersPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [supplierState, setSupplierState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  const [gstin, setGstin] = useState('');
  const [quarryLocation, setQuarryLocation] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState(15);
  const [creditLimit, setCreditLimit] = useState(500000);
  const [loadingAvailability, setLoadingAvailability] = useState('Immediate');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const openCreateModal = () => {
    setEditingSupplier(null);
    setName('');
    setContactPerson('');
    setPhone('+91 ');
    setEmail('');
    setAddress('');
    setDistrict('Krishnagiri');
    setSupplierState('Tamil Nadu');
    setPincode('635117');
    setGstin('');
    setQuarryLocation('');
    setPaymentTermsDays(15);
    setCreditLimit(400000);
    setLoadingAvailability('Immediate');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setContactPerson(sup.contactPerson);
    setPhone(sup.phone);
    setEmail(sup.email || '');
    setAddress(sup.address);
    setDistrict(sup.district);
    setSupplierState(sup.state);
    setPincode(sup.pincode);
    setGstin(sup.gstin || '');
    setQuarryLocation(sup.quarryLocation || '');
    setPaymentTermsDays(sup.paymentTermsDays);
    setCreditLimit(sup.creditLimit);
    setLoadingAvailability(sup.loadingAvailability);
    setNotes(sup.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Supplier name and contact phone are required.');
      return;
    }

    const supplierData: Supplier = {
      id: editingSupplier ? editingSupplier.id : `sup_${Date.now()}`,
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      district: district.trim(),
      state: supplierState.trim(),
      pincode: pincode.trim(),
      gstin: gstin.trim().toUpperCase(),
      quarryLocation: quarryLocation.trim(),
      materialsSupplied: editingSupplier ? editingSupplier.materialsSupplied : ['mat_01', 'mat_04'],
      paymentTermsDays: Number(paymentTermsDays),
      creditLimit: Number(creditLimit),
      totalPurchases: editingSupplier ? editingSupplier.totalPurchases : 0,
      outstandingBalance: editingSupplier ? editingSupplier.outstandingBalance : 0,
      loadingAvailability,
      notes: notes.trim(),
      createdAt: editingSupplier ? editingSupplier.createdAt : new Date().toISOString()
    };

    saveSupplier(supplierData);
    setIsModalOpen(false);
  };

  const filteredSuppliers = state.suppliers.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      s.district.toLowerCase().includes(q) ||
      (s.gstin && s.gstin.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Supplier & Quarry Owner Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage partner quarry pits, crushers, pebble wash depots, payment terms, and outstanding balances.
          </p>
        </div>

        <Button variant="orange" size="sm" onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Supplier / Quarry
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="shadow-xs">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="relative min-w-[280px] max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by quarry name, contact, district, or GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-4 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium">
            <strong>{filteredSuppliers.length}</strong> partner quarries registered
          </span>
        </CardContent>
      </Card>

      {/* Suppliers Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map((sup) => (
          <Card key={sup.id} className="hover:border-slate-300 transition shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" size="sm" className="mb-1 font-mono">
                    {sup.district}, {sup.state}
                  </Badge>
                  <CardTitle className="text-base text-slate-900">{sup.name}</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">{sup.contactPerson}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(sup)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete supplier ${sup.name}?`)) {
                        deleteSupplier(sup.id);
                      }
                    }}
                    className="p-1 rounded text-rose-400 hover:text-rose-700"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="py-3 text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{sup.phone}</span>
              </div>

              {sup.quarryLocation && (
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{sup.quarryLocation}</span>
                </div>
              )}

              {sup.gstin && (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.5 rounded font-semibold">
                    GSTIN: {sup.gstin}
                  </span>
                </div>
              )}

              <div className="rounded-lg bg-slate-50 p-2.5 space-y-1 border border-slate-100 mt-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Total Purchases:</span>
                  <span className="font-semibold text-slate-900">{formatINR(sup.totalPurchases)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Outstanding Payable:</span>
                  <span className="font-bold text-amber-700">{formatINR(sup.outstandingBalance)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Payment Terms:</span>
                  <span className="text-slate-700">{sup.paymentTermsDays} Days credit</span>
                </div>
              </div>
            </CardContent>

            <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate max-w-[180px]">Loading: {sup.loadingAvailability}</span>
              <span className="font-semibold text-orange-600">
                {sup.materialsSupplied.length} Materials
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Register New Quarry / Supplier'}
        description="Add external quarry details, contact persons, GSTIN, loading parameters, and credit limits."
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sri Lakshmi Blue Metal & Crushers"
                className="w-full border rounded-lg p-2 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. K. Senthil Nathan"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 94432 45890"
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="senthil@srilakshmibluemetal.com"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Quarry Location / Pit</label>
              <input
                type="text"
                value={quarryLocation}
                onChange={(e) => setQuarryLocation(e.target.value)}
                placeholder="e.g. Shoolagiri Granite Hill Cluster"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">GSTIN</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="33AABCS8891P1ZV"
                className="w-full border rounded-lg p-2 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Krishnagiri"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">State</label>
              <select
                value={supplierState}
                onChange={(e) => setSupplierState(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Kerala">Kerala</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="635117"
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="font-medium text-slate-600 block mb-1">Payment Terms (Days)</label>
              <input
                type="number"
                value={paymentTermsDays}
                onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-semibold"
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Credit Limit (₹)</label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-semibold"
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Loading Availability</label>
              <input
                type="text"
                value={loadingAvailability}
                onChange={(e) => setLoadingAvailability(e.target.value)}
                placeholder="Immediate (weighbridge ready)"
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              {editingSupplier ? 'Update Supplier' : 'Register Supplier'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
