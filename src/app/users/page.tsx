'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  UserCheck,
  Check,
  X,
  Lock,
  Mail,
  Phone
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getStoreState, subscribeToStore, AppState, setCurrentUser } from '@/lib/storage/store';
import { UserRole, UserProfile } from '@/types';

export default function UsersPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Invite Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [role, setRole] = useState<UserRole>('operations');

  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([
    { id: 'usr_01', name: 'Durai Murugan', email: 'durai@vajrastone.in', role: 'owner', phone: '+91 98450 12345' },
    { id: 'usr_02', name: 'S. Karthi', email: 'karthi@vajrastone.in', role: 'manager', phone: '+91 98450 67890' },
    { id: 'usr_03', name: 'R. Perumal', email: 'perumal@vajrastone.in', role: 'operations', phone: '+91 94432 11099' },
    { id: 'usr_04', name: 'P. Lakshmi', email: 'lakshmi@vajrastone.in', role: 'accountant', phone: '+91 99001 22345' },
    { id: 'usr_05', name: 'V. Prakash', email: 'prakash@vajrastone.in', role: 'sales', phone: '+91 98801 33411' }
  ]);

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Name and email required.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role
    };

    setTeamMembers([...teamMembers, newUser]);
    setIsInviteModalOpen(false);
  };

  // Module permission matrix
  const permissions = [
    { module: 'Dashboard & Executive KPIs', owner: true, manager: true, accountant: true, sales: false, operations: false },
    { module: 'Load Profitability Calculator', owner: true, manager: true, accountant: true, sales: false, operations: false },
    { module: 'Materials & Pricing Matrix', owner: true, manager: true, accountant: false, sales: true, operations: false },
    { module: 'Customer & Buyer CRM', owner: true, manager: true, accountant: true, sales: true, operations: false },
    { module: 'Sales Orders & Invoicing', owner: true, manager: true, accountant: true, sales: true, operations: false },
    { module: 'Quarry Purchases & Landed Cost', owner: true, manager: true, accountant: true, sales: false, operations: true },
    { module: 'Lorry Weighbridge Confirmation', owner: true, manager: true, accountant: false, sales: false, operations: true },
    { module: 'Own Quarry Production & Blasting', owner: true, manager: true, accountant: false, sales: false, operations: true },
    { module: 'Machinery Repairs & Hour Meters', owner: true, manager: true, accountant: false, sales: false, operations: true },
    { module: 'Payments, Banking & Reversals', owner: true, manager: false, accountant: true, sales: false, operations: false },
    { module: 'Company Settings & RLS Governance', owner: true, manager: false, accountant: false, sales: false, operations: false }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Team Accounts & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure permissions for business owners, quarry managers, site accountants, and weighbridge incharge staff.
          </p>
        </div>

        <Button variant="orange" size="sm" onClick={() => setIsInviteModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Invite Team Member
        </Button>
      </div>

      {/* Active User Switcher Banner */}
      <Card className="shadow-xs bg-slate-900 text-white">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-600 text-white">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Currently Active Session:</span>
              <span className="font-bold text-white text-sm">
                {state.currentUser.name} ({state.currentUser.role.toUpperCase()})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs hidden sm:inline">Simulate Role:</span>
            <div className="flex gap-1.5">
              {teamMembers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setCurrentUser(u)}
                  className={`px-2.5 py-1 rounded text-xs transition font-semibold ${
                    state.currentUser.id === u.id
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {u.role.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team List */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <CardTitle>Registered Personnel & Accounts</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold">
              <tr>
                <th className="px-4 py-2.5">User</th>
                <th className="px-4 py-2.5">Email / Phone</th>
                <th className="px-4 py-2.5">Assigned Role</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {teamMembers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900 text-sm">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{u.email}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{u.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        u.role === 'owner'
                          ? 'orange'
                          : u.role === 'accountant'
                          ? 'success'
                          : u.role === 'operations'
                          ? 'info'
                          : 'default'
                      }
                      size="sm"
                      className="font-mono"
                    >
                      {u.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="success" size="sm">Active</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setCurrentUser(u)}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                    >
                      Login as this user →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Module Permissions Matrix */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <CardTitle>Role-Based Module Permissions Matrix (RLS Security)</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict isolation prevents unauthorized site staff or sales personnel from viewing sensitive banking records or load profit calculations.
          </p>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="px-4 py-3">Application Module</th>
                <th className="px-4 py-3 text-center">Owner</th>
                <th className="px-4 py-3 text-center">Quarry Manager</th>
                <th className="px-4 py-3 text-center">Accountant</th>
                <th className="px-4 py-3 text-center">Sales Executive</th>
                <th className="px-4 py-3 text-center">Site Incharge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{p.module}</td>
                  <td className="px-4 py-2.5 text-center">
                    {p.owner ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {p.manager ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {p.accountant ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {p.sales ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {p.operations ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Team Member"
        description="Assign authorized role and permissions for operational access."
        maxWidth="md"
      >
        <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. S. Vignesh"
              className="w-full border rounded-lg p-2 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vignesh@vajrastone.in"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Mobile Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg p-2 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Security Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full border rounded-lg p-2 font-medium"
            >
              <option value="owner">Business Owner (Full Superadmin Access)</option>
              <option value="manager">Operations Manager (Quarry & Logistics)</option>
              <option value="accountant">Accountant (Invoices, GST & Payments)</option>
              <option value="sales">Sales Executive (Quotations & Customer CRM)</option>
              <option value="operations">Site / Weighbridge Incharge (Trips & Production)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Send Invitation & Access Key
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
