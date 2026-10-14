'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  Lock,
  UserCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStoreState, subscribeToStore, AppState } from '@/lib/storage/store';
import { formatDateDDMMYYYY } from '@/lib/utils';
import { AuditLogItem } from '@/types';

export default function AuditLogPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const filteredLogs = state.auditLogs.filter((log) => {
    if (selectedModule !== 'all' && log.module !== selectedModule) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Security & Operational Audit Trail
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Immutable log of all order bookings, deliveries, weighbridge slips, stock adjustments, and financial disbursements.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[260px] max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit actions, users, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-4 py-2 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none"
              >
                <option value="all">All Modules</option>
                <option value="Sales Orders">Sales Orders</option>
                <option value="Purchases">Purchases</option>
                <option value="Transport Logistics">Transport Logistics</option>
                <option value="Inventory">Inventory Ledger</option>
                <option value="Payments">Payments</option>
                <option value="Expenses">Expenses</option>
                <option value="Quarry Operations">Quarry Operations</option>
                <option value="Settings">Settings</option>
              </select>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            <strong>{filteredLogs.length}</strong> audited events
          </span>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="px-4 py-3">Timestamp (IST)</th>
                <th className="px-4 py-3">User & Role</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details & Audit Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 text-slate-600 font-mono">
                    {new Date(log.timestamp).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{log.userName}</div>
                    <Badge variant="outline" size="sm" className="font-mono text-[9px] uppercase mt-0.5">
                      {log.userRole}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-700">
                    {log.module}
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-semibold text-orange-600">{log.action}</span>
                  </td>

                  <td className="px-4 py-3 text-slate-700 leading-relaxed max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
