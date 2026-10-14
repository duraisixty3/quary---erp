'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { setCurrentUser, getStoreState } from '@/lib/storage/store';
import { UserProfile, UserRole } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [email, setEmail] = useState('durai@vajrastone.in');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);

  const sampleUsers: Record<UserRole, UserProfile> = {
    owner: {
      id: 'usr_01',
      name: 'Durai Murugan',
      email: 'durai@vajrastone.in',
      role: 'owner',
      phone: '+91 98450 12345'
    },
    manager: {
      id: 'usr_02',
      name: 'S. Karthi',
      email: 'karthi@vajrastone.in',
      role: 'manager',
      phone: '+91 98450 67890'
    },
    operations: {
      id: 'usr_03',
      name: 'R. Perumal',
      email: 'perumal@vajrastone.in',
      role: 'operations',
      phone: '+91 94432 11099'
    },
    accountant: {
      id: 'usr_04',
      name: 'P. Lakshmi',
      email: 'lakshmi@vajrastone.in',
      role: 'accountant',
      phone: '+91 99001 22345'
    },
    sales: {
      id: 'usr_05',
      name: 'V. Prakash',
      email: 'prakash@vajrastone.in',
      role: 'sales',
      phone: '+91 98801 33411'
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(sampleUsers[role].email);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const user = sampleUsers[selectedRole];
    setCurrentUser(user);

    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white font-black text-2xl shadow-xl shadow-orange-600/30">
            V
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Vajra Stone & Pebble ERP
          </h1>
          <p className="text-xs text-slate-400">
            Quarry Operations & Pebble Trading Management Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-800 bg-slate-900 text-white shadow-2xl p-6 rounded-2xl">
          <form onSubmit={handleLogin} className="space-y-5 text-xs">
            <div>
              <span className="font-semibold text-slate-300 block mb-2">
                Select Active Personnel Role (RBAC Simulation):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'owner', label: 'Business Owner', desc: 'Full Superadmin' },
                  { id: 'manager', label: 'Quarry Manager', desc: 'Ops & Fleet' },
                  { id: 'accountant', label: 'Accountant', desc: 'Billing & GST' },
                  { id: 'operations', label: 'Site Incharge', desc: 'Trips & Stock' }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id as UserRole)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedRole === r.id
                        ? 'border-orange-500 bg-orange-950/40 text-orange-200 ring-1 ring-orange-500'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{r.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-orange-500 focus:outline-none font-mono"
              />
            </div>

            <Button
              variant="orange"
              size="lg"
              className="w-full text-sm font-bold"
              type="submit"
              isLoading={loading}
            >
              Sign In to Dashboard <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
            Running with client-side mock authentication. In production, connects directly to Supabase Auth.
          </div>
        </Card>
      </div>
    </div>
  );
}
