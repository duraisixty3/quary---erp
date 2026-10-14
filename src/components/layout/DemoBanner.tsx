'use client';

import React from 'react';
import Link from 'next/link';
import { Database, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { resetToDemoData } from '@/lib/storage/store';

interface DemoBannerProps {
  demoMode: boolean;
}

export function DemoBanner({ demoMode }: DemoBannerProps) {
  if (isSupabaseConfigured) {
    return (
      <div className="bg-emerald-900 text-emerald-100 px-4 py-1.5 text-xs flex items-center justify-between border-b border-emerald-800">
        <div className="flex items-center gap-2">
          <Database className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-semibold">Connected to Live Supabase PostgreSQL Database</span>
          <span className="text-emerald-300 hidden sm:inline">— Tenant isolation and Row Level Security active</span>
        </div>
        <Link href="/settings" className="underline hover:text-white font-medium">
          View DB Config
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-amber-600 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="bg-black text-amber-400 font-mono font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide">
          DEMO DATA ACTIVE
        </span>
        <span className="font-medium text-slate-900">
          Running in offline-first interactive preview mode with realistic Indian stone trading records.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (confirm('Reset all records to standard realistic demo data?')) {
              resetToDemoData();
            }
          }}
          className="inline-flex items-center gap-1 font-semibold text-slate-950 hover:text-black underline cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          Reset Demo Data
        </button>
        <span className="text-slate-700">|</span>
        <Link href="/setup" className="font-semibold text-slate-950 hover:text-black underline">
          First-Time Setup
        </Link>
      </div>
    </div>
  );
}
