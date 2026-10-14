'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Save,
  RefreshCw,
  Database,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  getStoreState,
  subscribeToStore,
  AppState,
  updateSettings,
  resetToDemoData,
  clearAllData
} from '@/lib/storage/store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { BusinessMode } from '@/types';

export default function SettingsPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Form State
  const [businessName, setBusinessName] = useState(state.settings.businessName);
  const [tradeName, setTradeName] = useState(state.settings.tradeName);
  const [businessMode, setBusinessMode] = useState<BusinessMode>(state.settings.businessMode);
  const [gstin, setGstin] = useState(state.settings.gstin);
  const [pan, setPan] = useState(state.settings.pan);
  const [phone, setPhone] = useState(state.settings.phone);
  const [email, setEmail] = useState(state.settings.email);
  const [address, setAddress] = useState(state.settings.address);
  const [city, setCity] = useState(state.settings.city);
  const [businessState, setBusinessState] = useState(state.settings.state);
  const [pincode, setPincode] = useState(state.settings.pincode);
  const [bankName, setBankName] = useState(state.settings.bankName);
  const [bankAccountNo, setBankAccountNo] = useState(state.settings.bankAccountNo);
  const [bankIfsc, setBankIfsc] = useState(state.settings.bankIfsc);
  const [bankBranch, setBankBranch] = useState(state.settings.bankBranch);
  const [invoicePrefix, setInvoicePrefix] = useState(state.settings.invoicePrefix);
  const [quotationPrefix, setQuotationPrefix] = useState(state.settings.quotationPrefix);
  const [defaultGstRate, setDefaultGstRate] = useState(state.settings.defaultGstRate);

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName,
      tradeName,
      businessMode,
      gstin: gstin.toUpperCase(),
      pan: pan.toUpperCase(),
      phone,
      email,
      address,
      city,
      state: businessState,
      pincode,
      bankName,
      bankAccountNo,
      bankIfsc: bankIfsc.toUpperCase(),
      bankBranch,
      invoicePrefix: invoicePrefix.toUpperCase(),
      quotationPrefix: quotationPrefix.toUpperCase(),
      defaultGstRate: Number(defaultGstRate)
    });

    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Business Settings & System Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure company legal entity, GSTIN, bank coordinates, operational mode, and database connection.
          </p>
        </div>

        {isSavedNotice && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Settings updated successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Mode Configuration */}
        <Card className="shadow-xs border-orange-200 bg-orange-50/20">
          <CardHeader className="pb-3 border-b border-orange-100">
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-orange-600" />
              Operational Business Mode
            </CardTitle>
            <p className="text-xs text-slate-500">
              Switch seamlessly between reselling stone from partner quarries and operating your own mining lease.
            </p>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <label
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  businessMode === 'trading'
                    ? 'border-orange-500 bg-white ring-2 ring-orange-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="radio"
                    name="businessMode"
                    value="trading"
                    checked={businessMode === 'trading'}
                    onChange={() => setBusinessMode('trading')}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <Badge variant="orange" size="sm">TRADING</Badge>
                </div>
                <div className="font-bold text-slate-900 text-sm">Trading Mode</div>
                <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">
                  Source from external quarries, haul with lorries, and resell to landscaping & construction clients. Hides mining production modules.
                </p>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  businessMode === 'quarry'
                    ? 'border-orange-500 bg-white ring-2 ring-orange-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="radio"
                    name="businessMode"
                    value="quarry"
                    checked={businessMode === 'quarry'}
                    onChange={() => setBusinessMode('quarry')}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <Badge variant="default" size="sm">QUARRY</Badge>
                </div>
                <div className="font-bold text-slate-900 text-sm">Own Quarry Mode</div>
                <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">
                  Extraction pit operations, jaw crushers, vibratory screens, diesel fuel tracking, and daily shift production cost per tonne.
                </p>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  businessMode === 'combined'
                    ? 'border-orange-500 bg-white ring-2 ring-orange-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="radio"
                    name="businessMode"
                    value="combined"
                    checked={businessMode === 'combined'}
                    onChange={() => setBusinessMode('combined')}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <Badge variant="success" size="sm">COMBINED</Badge>
                </div>
                <div className="font-bold text-slate-900 text-sm">Combined Operations ERP</div>
                <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">
                  Both trading purchases and quarry extraction enabled with unified customer accounts, separate inventory ledgers, and load profit calculations.
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Company Profile & Statutory Details */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b">
            <CardTitle>Company Legal Profile & GSTIN</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Registered Business Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full border rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Trade / Brand Name</label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">GSTIN (15 Digits) *</label>
                <input
                  type="text"
                  required
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full border rounded-lg p-2 font-mono uppercase font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company PAN</label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  className="w-full border rounded-lg p-2 font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Primary Business Phone *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Registered Yard & Office Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">City / Hub *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">State *</label>
                <select
                  value={businessState}
                  onChange={(e) => setBusinessState(e.target.value)}
                  className="w-full border rounded-lg p-2 font-medium"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full border rounded-lg p-2 font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Coordinates for Invoices */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b">
            <CardTitle>Bank Account Remittance Details (Printed on Invoices)</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full border rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Current Account Number *</label>
                <input
                  type="text"
                  required
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  className="w-full border rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">IFSC Code *</label>
                <input
                  type="text"
                  required
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  className="w-full border rounded-lg p-2 font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Branch Name</label>
                <input
                  type="text"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Series & Tax Settings */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b">
            <CardTitle>Tax Rates & Document Numbering Series</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full border rounded-lg p-2 font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Quotation Number Prefix</label>
                <input
                  type="text"
                  value={quotationPrefix}
                  onChange={(e) => setQuotationPrefix(e.target.value)}
                  className="w-full border rounded-lg p-2 font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Default Mineral GST Rate (%)</label>
                <input
                  type="number"
                  value={defaultGstRate}
                  onChange={(e) => setDefaultGstRate(Number(e.target.value))}
                  className="w-full border rounded-lg p-2 font-semibold"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="orange" size="lg" type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Business Settings
          </Button>
        </div>
      </form>

      {/* Database & Data Management Section */}
      <Card className="shadow-xs border-slate-300">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-700" />
            Database Storage & Reset Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border">
            <div>
              <div className="font-bold text-slate-900">
                Connection Status: {isSupabaseConfigured ? 'Connected to Cloud PostgreSQL' : 'Local Offline Demo Storage'}
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {isSupabaseConfigured
                  ? 'All records are isolated by tenant organisation using PostgreSQL Row Level Security.'
                  : 'Operating in client-side storage. Data is preserved in your local browser across page refreshes.'}
              </p>
            </div>
            <Badge variant={isSupabaseConfigured ? 'success' : 'warning'} size="md">
              {isSupabaseConfigured ? 'ONLINE POSTGRES' : 'DEMO MODE'}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                if (confirm('Reset all transaction records to the original sample dataset?')) {
                  resetToDemoData();
                  alert('Reset successfully to standard demo records.');
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Reset to Sample Demo Dataset
            </Button>

            <Button
              variant="danger"
              size="sm"
              type="button"
              onClick={() => {
                if (confirm('Warning: This will clear all transactions, materials, and orders for production setup. Proceed?')) {
                  clearAllData();
                  alert('All records cleared. System ready for live production entry.');
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Clear All Records (Production Clean Slate)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
