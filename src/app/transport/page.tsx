'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Navigation,
  Scale,
  Calendar,
  CreditCard,
  Building
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getStoreState, subscribeToStore, AppState, saveLorryTrip } from '@/lib/storage/store';
import { formatINR, formatDateDDMMYYYY, formatWeight } from '@/lib/utils';
import { LorryTrip, TripStatus } from '@/types';

export default function TransportPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [lorryNumber, setLorryNumber] = useState('KA-01-AF-3921');
  const [transporterName, setTransporterName] = useState('Sri Balaji Roadlines');
  const [driverName, setDriverName] = useState('S. Munusamy');
  const [driverPhone, setDriverPhone] = useState('+91 94431 88902');
  const [vehicleCapacityMT, setVehicleCapacityMT] = useState(25.0);
  const [customerName, setCustomerName] = useState(state.customers[0]?.companyName || '');
  const [supplierName, setSupplierName] = useState(state.suppliers[0]?.name || '');
  const [materialName, setMaterialName] = useState(state.materials[0]?.name || '');
  const [sourceQuarry, setSourceQuarry] = useState('Shoolagiri Quarry Cluster');
  const [destinationSite, setDestinationSite] = useState('Brigade Utopia, Varthur, Bangalore');
  const [distanceKm, setDistanceKm] = useState(65);
  const [orderedQuantityMT, setOrderedQuantityMT] = useState(24.5);
  const [grossWeightMT, setGrossWeightMT] = useState(39.5);
  const [tareWeightMT, setTareWeightMT] = useState(15.0);
  const [weighbridgeSlipNo, setWeighbridgeSlipNo] = useState(`WB-${Math.floor(Math.random() * 9000 + 1000)}`);
  const [freightRate, setFreightRate] = useState(350);
  const [loadingCharges, setLoadingCharges] = useState(1200);
  const [unloadingCharges, setUnloadingCharges] = useState(1000);
  const [tollsAndPermits, setTollsAndPermits] = useState(500);
  const [driverAdvance, setDriverAdvance] = useState(5000);
  const [status, setStatus] = useState<TripStatus>('in_transit');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const netWeightMT = grossWeightMT > tareWeightMT ? Number((grossWeightMT - tareWeightMT).toFixed(2)) : orderedQuantityMT;
  const totalFreight = Number((netWeightMT * freightRate).toFixed(2));
  const isOverloaded = netWeightMT > vehicleCapacityMT;
  const settlementAmount = Math.max(0, totalFreight + loadingCharges + unloadingCharges + tollsAndPermits - driverAdvance);

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lorryNumber.trim() || !driverName.trim()) {
      alert('Lorry number and driver name are required.');
      return;
    }

    const tripNumber = `TRIP-${new Date().getFullYear()}-${String(state.lorryTrips.length + 1).padStart(4, '0')}`;
    const selectedMat = state.materials.find((m) => m.name === materialName);

    const newTrip: LorryTrip = {
      id: `trip_${Date.now()}`,
      tripNumber,
      lorryNumber: lorryNumber.trim().toUpperCase(),
      transporterName: transporterName.trim(),
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      vehicleCapacityMT: Number(vehicleCapacityMT),
      customerName,
      supplierName,
      materialName,
      materialId: selectedMat ? selectedMat.id : 'mat_01',
      sourceQuarry: sourceQuarry.trim(),
      destinationSite: destinationSite.trim(),
      distanceKm: Number(distanceKm),
      orderedQuantityMT: Number(orderedQuantityMT),
      grossWeightMT: Number(grossWeightMT),
      tareWeightMT: Number(tareWeightMT),
      netWeightMT,
      weighbridgeSlipNo: weighbridgeSlipNo.trim(),
      loadingDate: new Date().toISOString().split('T')[0],
      dispatchDate: new Date().toISOString().split('T')[0],
      freightAgreedRate: Number(freightRate),
      totalFreight,
      loadingCharges: Number(loadingCharges),
      unloadingCharges: Number(unloadingCharges),
      tollsAndPermits: Number(tollsAndPermits),
      driverAdvance: Number(driverAdvance),
      settlementAmount,
      status,
      isOverloaded,
      createdAt: new Date().toISOString()
    };

    saveLorryTrip(newTrip);
    setIsModalOpen(false);
  };

  const filteredTrips = state.lorryTrips.filter((t) => {
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.tripNumber.toLowerCase().includes(q) ||
        t.lorryNumber.toLowerCase().includes(q) ||
        t.driverName.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q)
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
            Lorry & Transport Logistics Fleet
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track tipper lorries, weighbridge tare/gross measurements, driver advances, freight settlements, and overload compliance.
          </p>
        </div>

        <Button variant="orange" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Log Lorry Trip
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
                placeholder="Search lorry registration, driver, trip #, or customer..."
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
                <option value="all">All Trip Statuses</option>
                <option value="in_transit">In Transit (Highway)</option>
                <option value="loaded">Loaded at Quarry</option>
                <option value="delivered">Delivered at Site</option>
                <option value="settled">Settled / Closed</option>
              </select>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            <strong>{filteredTrips.length}</strong> logged lorry movements
          </span>
        </CardContent>
      </Card>

      {/* Trips Table */}
      <Card className="shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="px-4 py-3">Trip # / Lorry Reg</th>
                <th className="px-4 py-3">Driver & Transporter</th>
                <th className="px-4 py-3">Route (Quarry → Site)</th>
                <th className="px-4 py-3">Material & Net Weight</th>
                <th className="px-4 py-3 text-right">Freight Charges</th>
                <th className="px-4 py-3 text-right">Driver Advance</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Settlement Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No lorry trips found matching filter.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-orange-600 text-sm">{trip.lorryNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{trip.tripNumber}</div>
                      {trip.isOverloaded && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 mt-0.5">
                          <AlertTriangle className="h-3 w-3" /> Overload
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{trip.driverName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{trip.driverPhone}</div>
                      <div className="text-[10px] text-slate-400">{trip.transporterName}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-slate-800 font-medium truncate max-w-[190px]">
                        {trip.sourceQuarry} → {trip.destinationSite}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {trip.distanceKm} km | Dispatched: {formatDateDDMMYYYY(trip.dispatchDate)}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800">{trip.materialName}</div>
                      <div className="font-bold text-orange-600 text-sm">
                        {formatWeight(trip.netWeightMT)}
                      </div>
                      {trip.weighbridgeSlipNo && (
                        <div className="text-[10px] text-slate-400 font-mono">Slip: {trip.weighbridgeSlipNo}</div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatINR(trip.totalFreight)}
                      <div className="text-[10px] text-slate-400 font-normal">
                        @ {formatINR(trip.freightAgreedRate)}/MT
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-semibold text-emerald-700">
                      {formatINR(trip.driverAdvance)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={
                          trip.status === 'settled'
                            ? 'default'
                            : trip.status === 'delivered'
                            ? 'success'
                            : 'orange'
                        }
                        size="sm"
                      >
                        {trip.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 text-sm">
                      {formatINR(trip.settlementAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Trip Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Quarry Lorry Dispatch & Weighbridge Weight"
        description="Record vehicle details, tare weight, gross weight, verified net weight, and freight terms."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveTrip} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lorry Registration *</label>
              <input
                type="text"
                required
                value={lorryNumber}
                onChange={(e) => setLorryNumber(e.target.value)}
                placeholder="e.g. KA-01-AF-3921"
                className="w-full border rounded-lg p-2 font-mono uppercase font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Driver Name *</label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. S. Munusamy"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Driver Mobile Phone *</label>
              <input
                type="text"
                required
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="+91 94431 88902"
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Transporter / Fleet Owner</label>
              <input
                type="text"
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                placeholder="Sri Balaji Roadlines"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">RTO Legal Capacity (MT) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={vehicleCapacityMT}
                onChange={(e) => setVehicleCapacityMT(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Weighbridge Slip Ref #</label>
              <input
                type="text"
                value={weighbridgeSlipNo}
                onChange={(e) => setWeighbridgeSlipNo(e.target.value)}
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer / Consignee</label>
              <select
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border rounded-lg p-2 font-medium"
              >
                {state.customers.map((c) => (
                  <option key={c.id} value={c.companyName}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Material Carried</label>
              <select
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                className="w-full border rounded-lg p-2 font-medium"
              >
                {state.materials.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Source Quarry / Depot</label>
              <input
                type="text"
                value={sourceQuarry}
                onChange={(e) => setSourceQuarry(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Delivery Destination</label>
              <input
                type="text"
                value={destinationSite}
                onChange={(e) => setDestinationSite(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          {/* Weighbridge Section */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-orange-600" /> Weighbridge Measurements (Metric Tonnes)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Gross Weight (MT)</label>
                <input
                  type="number"
                  step="0.1"
                  value={grossWeightMT}
                  onChange={(e) => setGrossWeightMT(Number(e.target.value))}
                  className="w-full border rounded p-1.5 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Tare (Empty) Weight (MT)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tareWeightMT}
                  onChange={(e) => setTareWeightMT(Number(e.target.value))}
                  className="w-full border rounded p-1.5 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Calculated Net MT</label>
                <div
                  className={`border rounded p-1.5 font-bold text-sm ${
                    isOverloaded ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white text-slate-900'
                  }`}
                >
                  {netWeightMT} MT {isOverloaded && '(OVERLOAD)'}
                </div>
              </div>
            </div>
          </div>

          {/* Freight Commercials */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-medium text-slate-600 block mb-1">Freight Rate (₹/MT)</label>
              <input
                type="number"
                value={freightRate}
                onChange={(e) => setFreightRate(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-semibold"
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Loading Charges (₹)</label>
              <input
                type="number"
                value={loadingCharges}
                onChange={(e) => setLoadingCharges(Number(e.target.value))}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Driver Advance (₹)</label>
              <input
                type="number"
                value={driverAdvance}
                onChange={(e) => setDriverAdvance(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-semibold text-emerald-700"
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Trip Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TripStatus)}
                className="w-full border rounded-lg p-2 font-medium"
              >
                <option value="loaded">Loaded at Quarry</option>
                <option value="in_transit">In Transit (Highway)</option>
                <option value="delivered">Delivered at Site</option>
                <option value="settled">Settled / Closed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Save Lorry Trip & Auto-Calculate P&L
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
