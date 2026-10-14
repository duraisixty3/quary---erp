'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Layers,
  Database
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { updateSettings, resetToDemoData, clearAllData, getStoreState } from '@/lib/storage/store';
import { BusinessMode } from '@/types';

export default function SetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const state = getStoreState();

  // Wizard State
  const [businessName, setBusinessName] = useState(state.settings.businessName);
  const [tradeName, setTradeName] = useState(state.settings.tradeName);
  const [businessMode, setBusinessMode] = useState<BusinessMode>(state.settings.businessMode);
  const [gstin, setGstin] = useState(state.settings.gstin);
  const [city, setCity] = useState(state.settings.city);
  const [businessState, setBusinessState] = useState(state.settings.state);
  const [phone, setPhone] = useState(state.settings.phone);
  const [bankName, setBankName] = useState(state.settings.bankName);
  const [accountNo, setAccountNo] = useState(state.settings.bankAccountNo);
  const [ifsc, setIfsc] = useState(state.settings.bankIfsc);
  const [loadSampleData, setLoadSampleData] = useState(true);

  const handleFinish = () => {
    updateSettings({
      businessName,
      tradeName,
      businessMode,
      gstin: gstin.toUpperCase(),
      city,
      state: businessState,
      phone,
      bankName,
      bankAccountNo: accountNo,
      bankIfsc: ifsc.toUpperCase(),
      demoMode: loadSampleData
    });

    if (loadSampleData) {
      resetToDemoData();
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Step Indicator */}
        <div className="text-center space-y-2">
          <Badge variant="orange" size="md">ONBOARDING WIZARD</Badge>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Initial Business & Operational Setup
          </h1>
          <p className="text-xs text-slate-500">
            Configure your quarry and stone trading parameters for invoicing, dispatch, and taxation.
          </p>
        </div>

        {/* Steps Progress */}
        <div className="flex items-center justify-between px-8 text-xs font-semibold text-slate-500">
          <span className={currentStep >= 1 ? 'text-orange-600 font-bold' : ''}>1. Business Mode</span>
          <span className={currentStep >= 2 ? 'text-orange-600 font-bold' : ''}>2. GSTIN & Location</span>
          <span className={currentStep >= 3 ? 'text-orange-600 font-bold' : ''}>3. Bank & Invoicing</span>
          <span className={currentStep >= 4 ? 'text-orange-600 font-bold' : ''}>4. Data Preference</span>
        </div>

        <Card className="shadow-xl rounded-2xl overflow-hidden border-slate-200">
          <CardContent className="p-6 text-xs space-y-5">
            {/* Step 1: Business Mode */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Step 1: Choose Your Primary Operating Model</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setBusinessMode('trading')}
                      className={`p-3 rounded-xl border text-left transition ${
                        businessMode === 'trading'
                          ? 'border-orange-600 bg-orange-50/40 ring-1 ring-orange-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Badge variant="orange" size="sm" className="mb-2">Trading Mode</Badge>
                      <div className="font-bold text-slate-900">Sourcing & Resale</div>
                      <p className="text-slate-500 text-[11px] mt-1">Buy from quarries, haul via lorries, sell to landscapers & dealers.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBusinessMode('quarry')}
                      className={`p-3 rounded-xl border text-left transition ${
                        businessMode === 'quarry'
                          ? 'border-orange-600 bg-orange-50/40 ring-1 ring-orange-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Badge variant="default" size="sm" className="mb-2">Own Quarry</Badge>
                      <div className="font-bold text-slate-900">Extraction & Crusher</div>
                      <p className="text-slate-500 text-[11px] mt-1">Mining lease permits, crushers, screens, diesel fuel, and production logs.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBusinessMode('combined')}
                      className={`p-3 rounded-xl border text-left transition ${
                        businessMode === 'combined'
                          ? 'border-orange-600 bg-orange-50/40 ring-1 ring-orange-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Badge variant="success" size="sm" className="mb-2">Combined</Badge>
                      <div className="font-bold text-slate-900">Both Models</div>
                      <p className="text-slate-500 text-[11px] mt-1">Unified stone trading and quarry operational modules.</p>
                    </button>
                  </div>

                  <div className="pt-2">
                    <label className="font-semibold text-slate-700 block mb-1">Company / Enterprise Name *</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full border rounded-lg p-2 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & GSTIN */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Step 2: Legal Registration & Market Location</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="w-full border rounded-lg p-2 font-mono uppercase font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Primary Phone *</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">City / Logistics Hub *</label>
                    <input
                      type="text"
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
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="Karnataka">Karnataka (Bangalore)</option>
                      <option value="Tamil Nadu">Tamil Nadu (Krishnagiri / Chennai)</option>
                      <option value="Kerala">Kerala (Kochi / Thrissur)</option>
                      <option value="Telangana">Telangana (Hyderabad)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Banking Coordinates */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Step 3: Bank Remittance Details (for Invoices)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value)}
                      className="w-full border rounded-lg p-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      className="w-full border rounded-lg p-2 font-mono uppercase font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Data Preference */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Step 4: Initial Dataset Preference</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                    <input
                      type="checkbox"
                      checked={loadSampleData}
                      onChange={(e) => setLoadSampleData(e.target.checked)}
                      className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Preload Realistic Indian Stone Trading & Quarry Demo Records
                      </span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Includes materials (White river pebbles, blue metal 20mm jalli, M-sand), Bangalore/Chennai customers, Hosur/Karur quarry suppliers, lorry trips, and load profit calculations.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              {currentStep > 1 ? (
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button variant="orange" size="sm" onClick={() => setCurrentStep(currentStep + 1)}>
                  Next Step <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button variant="orange" size="sm" onClick={handleFinish}>
                  Complete Setup & Launch Dashboard →
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
