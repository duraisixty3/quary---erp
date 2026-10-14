'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  Clock,
  Fuel,
  CheckCircle2,
  Settings,
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  getStoreState,
  subscribeToStore,
  AppState,
  saveMachinery,
  saveMaintenanceRecord
} from '@/lib/storage/store';
import { formatINR, formatDateDDMMYYYY } from '@/lib/utils';
import { HeavyMachinery, MaintenanceRecord } from '@/types';

export default function MachineryPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // New Machine Form
  const [machineName, setMachineName] = useState('');
  const [type, setType] = useState<any>('Jaw Crusher');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseCost, setPurchaseCost] = useState(6500000);
  const [operatingHours, setOperatingHours] = useState(2500);
  const [fuelRate, setFuelRate] = useState(25.0);
  const [nextServiceDueDate, setNextServiceDueDate] = useState('2026-11-15');

  // New Service Record Form
  const [selectedMachineId, setSelectedMachineId] = useState(state.machinery[0]?.id || '');
  const [serviceType, setServiceType] = useState<any>('Routine Oil & Filter');
  const [hourReading, setHourReading] = useState(3000);
  const [serviceCost, setServiceCost] = useState(25000);
  const [technicianName, setTechnicianName] = useState('Authorized Field Engineer');
  const [spareParts, setSpareParts] = useState('Oil filter, hydraulic seals');
  const [downtimeHours, setDowntimeHours] = useState(4);
  const [notes, setNotes] = useState('Preventive check completed');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const handleSaveMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineName.trim() || !serialNumber.trim()) {
      alert('Equipment name and serial number are required.');
      return;
    }

    const newMachine: HeavyMachinery = {
      id: `mac_${Date.now()}`,
      name: machineName.trim(),
      type,
      serialNumber: serialNumber.trim(),
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost: Number(purchaseCost),
      totalOperatingHours: Number(operatingHours),
      fuelConsumptionRateLph: Number(fuelRate),
      lastServiceDate: new Date().toISOString().split('T')[0],
      nextServiceDueDate,
      status: 'operational',
      totalMaintenanceExpense: 0
    };

    saveMachinery(newMachine);
    setIsMachineModalOpen(false);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const machine = state.machinery.find((m) => m.id === selectedMachineId);
    if (!machine) return;

    const newService: MaintenanceRecord = {
      id: `maint_${Date.now()}`,
      machineId: machine.id,
      machineName: machine.name,
      date: new Date().toISOString().split('T')[0],
      serviceType,
      hourMeterReading: Number(hourReading),
      cost: Number(serviceCost),
      technicianName: technicianName.trim(),
      sparePartsReplaced: spareParts.trim(),
      downtimeHours: Number(downtimeHours),
      notes: notes.trim()
    };

    saveMaintenanceRecord(newService);
    setIsServiceModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Machinery & Preventive Maintenance Register
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track jaw crushers, vibratory screens, excavators, hour-meters, fuel consumption rates, and service intervals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsServiceModalOpen(true)}>
            <Wrench className="h-4 w-4 mr-1.5" />
            Log Service & Repairs
          </Button>
          <Button variant="orange" size="sm" onClick={() => setIsMachineModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Register Equipment
          </Button>
        </div>
      </div>

      {/* Equipment Register Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {state.machinery.map((mac) => {
          const costPerHour =
            mac.totalOperatingHours > 0
              ? mac.totalMaintenanceExpense / mac.totalOperatingHours
              : 0;

          return (
            <Card key={mac.id} className="shadow-xs hover:border-slate-300 transition">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" size="sm" className="font-mono mb-1">
                      {mac.type}
                    </Badge>
                    <CardTitle className="text-base text-slate-900">{mac.name}</CardTitle>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">S/N: {mac.serialNumber}</p>
                  </div>
                  <Badge variant={mac.status === 'operational' ? 'success' : 'warning'} size="sm">
                    {mac.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="py-4 text-xs space-y-3">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Operating Hours:</span>
                    <span className="font-bold text-slate-900 text-sm">{mac.totalOperatingHours} hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Fuel Burn Rate:</span>
                    <span className="font-bold text-slate-900 text-sm">{mac.fuelConsumptionRateLph} L/hr</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Asset Cost:</span>
                    <span className="font-semibold text-slate-800">{formatINR(mac.purchaseCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Maintenance Spent:</span>
                    <span className="font-semibold text-slate-900">{formatINR(mac.totalMaintenanceExpense)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Maintenance Cost / Hour:</span>
                    <span className="font-bold text-emerald-700">{formatINR(costPerHour)} / hr</span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 mt-1.5">
                    <span className="text-slate-500">Next Service Due:</span>
                    <span className="font-bold text-orange-600 font-mono">
                      {formatDateDDMMYYYY(mac.nextServiceDueDate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Maintenance History Table */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle>Historical Maintenance & Service Records</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Machine</th>
                <th className="px-4 py-3">Service Type</th>
                <th className="px-4 py-3 text-right">Hour Meter</th>
                <th className="px-4 py-3">Parts Replaced</th>
                <th className="px-4 py-3 text-right">Cost (INR)</th>
                <th className="px-4 py-3">Technician</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {state.maintenanceRecords.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 text-slate-600 font-mono">{formatDateDDMMYYYY(m.date)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{m.machineName}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" size="sm">{m.serviceType}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">{m.hourMeterReading} hrs</td>
                  <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]">{m.sparePartsReplaced}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{formatINR(m.cost)}</td>
                  <td className="px-4 py-3 text-slate-600">{m.technicianName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Register Machine Modal */}
      <Modal
        isOpen={isMachineModalOpen}
        onClose={() => setIsMachineModalOpen(false)}
        title="Register Heavy Quarry Machinery"
        description="Add crushers, vibratory screen units, or tipper lorries with baseline operating hours."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveMachine} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Equipment Name *</label>
            <input
              type="text"
              required
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              placeholder="e.g. Metso Nordberg C106 Jaw Crusher"
              className="w-full border rounded-lg p-2 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Equipment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full border rounded-lg p-2 font-medium"
              >
                <option value="Jaw Crusher">Jaw Crusher</option>
                <option value="Cone Crusher">Cone Crusher</option>
                <option value="Vibratory Screen">Vibratory Screen</option>
                <option value="Excavator">Excavator</option>
                <option value="Wheel Loader">Wheel Loader</option>
                <option value="Tipper Lorry">Tipper Lorry</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Serial Number *</label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="MET-JC-9921"
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Purchase Cost (₹)</label>
              <input
                type="number"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-semibold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hour Meter (hrs)</label>
              <input
                type="number"
                value={operatingHours}
                onChange={(e) => setOperatingHours(Number(e.target.value))}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Fuel Burn (L/hr)</label>
              <input
                type="number"
                step="0.5"
                value={fuelRate}
                onChange={(e) => setFuelRate(Number(e.target.value))}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Next Service Due Date</label>
            <input
              type="date"
              value={nextServiceDueDate}
              onChange={(e) => setNextServiceDueDate(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setIsMachineModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Register Machine
            </Button>
          </div>
        </form>
      </Modal>

      {/* Log Service Modal */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title="Log Equipment Maintenance or Repair"
        description="Record preventive maintenance, oil change, jaw plate welds, technician cost, and parts replaced."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveService} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Machine *</label>
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="w-full border rounded-lg p-2 font-medium"
            >
              {state.machinery.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full border rounded-lg p-2"
              >
                <option value="Routine Oil & Filter">Routine Oil & Filter</option>
                <option value="Screen Mesh Replacement">Screen Mesh Replacement</option>
                <option value="Jaw Plate Welds">Jaw Plate Manganese Welds</option>
                <option value="Hydraulic Repair">Hydraulic Hose & Pump Repair</option>
                <option value="Breakdown Repair">Emergency Breakdown Repair</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hour Meter Reading</label>
              <input
                type="number"
                value={hourReading}
                onChange={(e) => setHourReading(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Total Service Cost (₹) *</label>
              <input
                type="number"
                required
                value={serviceCost}
                onChange={(e) => setServiceCost(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Technician / Agency</label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Spare Parts Replaced</label>
            <input
              type="text"
              value={spareParts}
              onChange={(e) => setSpareParts(e.target.value)}
              placeholder="e.g. Fixed jaw plates, hydraulic seal kit"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setIsServiceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Log Maintenance Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
