'use client';

import React, { useState, useEffect } from 'react';
import {
  Pickaxe,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Fuel,
  TrendingDown,
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
  saveQuarrySite,
  saveProductionLog
} from '@/lib/storage/store';
import { formatINR, formatDateDDMMYYYY, formatWeight } from '@/lib/utils';
import { QuarrySite, QuarryProductionLog } from '@/types';

export default function QuarryPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [activeTab, setActiveTab] = useState<'sites' | 'production'>('sites');
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // New Site Form
  const [siteName, setSiteName] = useState('');
  const [siteCode, setSiteCode] = useState(`QS-${Math.floor(Math.random() * 900 + 100)}`);
  const [district, setDistrict] = useState('Krishnagiri');
  const [siteState, setSiteState] = useState('Tamil Nadu');
  const [surveyNumbers, setSurveyNumbers] = useState('142/2A, 142/2B');
  const [areaAcres, setAreaAcres] = useState(4.5);
  const [permitNumber, setPermitNumber] = useState('M&G/TN/KGI/2026/QL-');
  const [issuingAuthority, setIssuingAuthority] = useState('Dept of Geology & Mining, Govt of Tamil Nadu');
  const [expiryDate, setExpiryDate] = useState('2029-03-31');
  const [dailyCapacityMT, setDailyCapacityMT] = useState(350);

  // New Production Log Form
  const [quarrySiteId, setQuarrySiteId] = useState(state.quarrySites[0]?.id || '');
  const [shift, setShift] = useState<'Day Shift' | 'Night Shift'>('Day Shift');
  const [materialProduced, setMaterialProduced] = useState('20mm Blue Metal Granite Jalli');
  const [producedQuantityMT, setProducedQuantityMT] = useState(120.0);
  const [rejectedWasteMT, setRejectedWasteMT] = useState(12.0);
  const [operatingHours, setOperatingHours] = useState(8.5);
  const [fuelConsumedLitres, setFuelConsumedLitres] = useState(140);
  const [labourWagesPaid, setLabourWagesPaid] = useState(6500);
  const [crushingExpense, setCrushingExpense] = useState(8000);
  const [supervisorName, setSupervisorName] = useState('R. Perumal');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const handleSaveSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim() || !permitNumber.trim()) {
      alert('Site name and permit number required.');
      return;
    }

    const newSite: QuarrySite = {
      id: `qs_${Date.now()}`,
      name: siteName.trim(),
      siteCode: siteCode.trim(),
      district: district.trim(),
      state: siteState.trim(),
      surveyNumbers: surveyNumbers.trim(),
      areaAcres: Number(areaAcres),
      permitNumber: permitNumber.trim(),
      permitIssuingAuthority: issuingAuthority.trim(),
      permitIssueDate: new Date().toISOString().split('T')[0],
      permitExpiryDate: expiryDate,
      quarryType: 'Granite Aggregates',
      dailyCapacityMT: Number(dailyCapacityMT),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    saveQuarrySite(newSite);
    setIsSiteModalOpen(false);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const site = state.quarrySites.find((s) => s.id === quarrySiteId);

    const newLog: QuarryProductionLog = {
      id: `qpl_${Date.now()}`,
      quarrySiteId,
      quarrySiteName: site ? site.name : 'Primary Quarry Pit',
      date: new Date().toISOString().split('T')[0],
      shift,
      materialProduced,
      producedQuantityMT: Number(producedQuantityMT),
      rejectedWasteMT: Number(rejectedWasteMT),
      operatingHours: Number(operatingHours),
      fuelConsumedLitres: Number(fuelConsumedLitres),
      labourWagesPaid: Number(labourWagesPaid),
      crushingScreeningExpense: Number(crushingExpense),
      calculatedCostPerTon: 0, // auto computed by store
      supervisorName: supervisorName.trim(),
      createdAt: new Date().toISOString()
    };

    saveProductionLog(newLog);
    setIsLogModalOpen(false);
  };

  const totalMTProduced = state.productionLogs.reduce((acc, l) => acc + l.producedQuantityMT, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Own Quarry Operations & Production Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Mining lease permits, survey numbers, statutory renewal tracking, and daily extraction cost per tonne.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsSiteModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Register Quarry Site
          </Button>
          <Button variant="orange" size="sm" onClick={() => setIsLogModalOpen(true)}>
            <Pickaxe className="h-4 w-4 mr-1.5" />
            Log Production Shift
          </Button>
        </div>
      </div>

      {/* Statutory Disclaimer Alert */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 text-xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 block text-xs">
            Statutory Mining Approvals & Legal Compliance Notice
          </span>
          <p className="mt-0.5 text-slate-700 leading-relaxed text-[11px]">
            This software records and monitors verified operational information only. It does not confer or certify statutory mining, environmental clearance (SEIAA), or pollution control board (PCB) permissions. All extraction activities must strictly comply with relevant state Directorate of Geology & Mining guidelines and verified lease deeds.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('sites')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'sites'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Quarry Sites & Lease Permits ({state.quarrySites.length})
        </button>
        <button
          onClick={() => setActiveTab('production')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'production'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Daily Shift Extraction & Crushing Logs ({state.productionLogs.length})
        </button>
      </div>

      {/* Tab 1: Sites */}
      {activeTab === 'sites' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.quarrySites.map((site) => (
            <Card key={site.id} className="shadow-xs border-slate-200">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {site.siteCode}
                    </span>
                    <CardTitle className="text-base text-slate-900 mt-1">{site.name}</CardTitle>
                    <p className="text-xs text-slate-500">{site.district}, {site.state}</p>
                  </div>
                  <Badge variant={site.isActive ? 'success' : 'warning'} size="sm">
                    {site.isActive ? 'Active Lease' : 'Renewal Pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="py-4 text-xs space-y-3">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Survey Numbers:</span>
                    <span className="font-mono font-semibold text-slate-800">{site.surveyNumbers}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Lease Area:</span>
                    <span className="font-semibold text-slate-800">{site.areaAcres} Acres</span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Permit Number:</span>
                    <span className="font-mono font-bold text-slate-900">{site.permitNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Authority:</span>
                    <span className="text-slate-800 text-right truncate max-w-[200px]">{site.permitIssuingAuthority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Permit Valid Till:</span>
                    <span className="font-bold text-orange-600">{formatDateDDMMYYYY(site.permitExpiryDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Daily Crushing Capacity:</span>
                    <span className="font-semibold text-slate-900">{site.dailyCapacityMT} MT/Day</span>
                  </div>
                </div>

                {site.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded">
                    {site.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Production Logs */}
      {activeTab === 'production' && (
        <Card className="shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="px-4 py-3">Date / Shift</th>
                  <th className="px-4 py-3">Quarry Site</th>
                  <th className="px-4 py-3">Material Produced</th>
                  <th className="px-4 py-3 text-right">Output (MT)</th>
                  <th className="px-4 py-3 text-right">Waste Reject</th>
                  <th className="px-4 py-3 text-right">Diesel Fuel (L)</th>
                  <th className="px-4 py-3 text-right">Cost / Tonne (₹)</th>
                  <th className="px-4 py-3">Supervisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {state.productionLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-slate-900 font-bold">{formatDateDDMMYYYY(log.date)}</div>
                      <div className="text-[10px] text-slate-400">{log.shift}</div>
                    </td>

                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {log.quarrySiteName}
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {log.materialProduced}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-orange-600 text-sm">
                      {formatWeight(log.producedQuantityMT)}
                    </td>

                    <td className="px-4 py-3.5 text-right text-slate-500">
                      {log.rejectedWasteMT} MT
                    </td>

                    <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                      {log.fuelConsumedLitres} L
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-emerald-700 text-sm">
                      {formatINR(log.calculatedCostPerTon)}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {log.supervisorName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Register Site Modal */}
      <Modal
        isOpen={isSiteModalOpen}
        onClose={() => setIsSiteModalOpen(false)}
        title="Register Own Quarry Site & Lease Permit"
        description="Record survey numbers, mining department approval reference, and validity expiration."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSite} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Quarry Name *</label>
            <input
              type="text"
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g. Shoolagiri Granite Hill Lease No. 4"
              className="w-full border rounded-lg p-2 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Site Code</label>
              <input
                type="text"
                value={siteCode}
                onChange={(e) => setSiteCode(e.target.value)}
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">District *</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Survey / Khasra Numbers *</label>
              <input
                type="text"
                required
                value={surveyNumbers}
                onChange={(e) => setSurveyNumbers(e.target.value)}
                placeholder="142/2A, 142/2B"
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lease Area (Acres)</label>
              <input
                type="number"
                step="0.1"
                value={areaAcres}
                onChange={(e) => setAreaAcres(Number(e.target.value))}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Permit / Lease Number *</label>
            <input
              type="text"
              required
              value={permitNumber}
              onChange={(e) => setPermitNumber(e.target.value)}
              placeholder="e.g. M&G/TN/KGI/2024/QL-142"
              className="w-full border rounded-lg p-2 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Issuing Authority</label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Permit Expiry Date *</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full border rounded-lg p-2 font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setIsSiteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Register Quarry Lease
            </Button>
          </div>
        </form>
      </Modal>

      {/* Production Log Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Daily Quarry Production Shift"
        description="Record crushed aggregate tonnage, diesel fuel consumed, labour wages, and compute production cost per tonne."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveLog} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Quarry Location *</label>
            <select
              value={quarrySiteId}
              onChange={(e) => setQuarrySiteId(e.target.value)}
              className="w-full border rounded-lg p-2 font-medium"
            >
              {state.quarrySites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.siteCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full border rounded-lg p-2 font-medium"
              >
                <option value="Day Shift">Day Shift (06:00 - 18:00)</option>
                <option value="Night Shift">Night Shift (18:00 - 06:00)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Operating Hours</label>
              <input
                type="number"
                step="0.5"
                value={operatingHours}
                onChange={(e) => setOperatingHours(Number(e.target.value))}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Material Produced</label>
              <input
                type="text"
                value={materialProduced}
                onChange={(e) => setMaterialProduced(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Produced Tonnage (MT) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={producedQuantityMT}
                onChange={(e) => setProducedQuantityMT(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-bold text-sm text-orange-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Diesel Used (Litres)</label>
              <input
                type="number"
                value={fuelConsumedLitres}
                onChange={(e) => setFuelConsumedLitres(Number(e.target.value))}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Labour Wages (₹)</label>
              <input
                type="number"
                value={labourWagesPaid}
                onChange={(e) => setLabourWagesPaid(Number(e.target.value))}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Crushing Exp (₹)</label>
              <input
                type="number"
                value={crushingExpense}
                onChange={(e) => setCrushingExpense(Number(e.target.value))}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Supervisor Name</label>
            <input
              type="text"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setIsLogModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Save Shift Production Log
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
