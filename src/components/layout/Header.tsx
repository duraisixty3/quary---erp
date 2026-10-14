'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  PlusCircle,
  Truck,
  CreditCard,
  Building,
  CheckCircle2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { BusinessMode, UserProfile, NotificationItem } from '@/types';
import { setBusinessMode, setCurrentUser, markNotificationRead } from '@/lib/storage/store';
import { formatDateDDMMYYYY } from '@/lib/utils';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  businessMode: BusinessMode;
  currentUser: UserProfile;
  notifications: NotificationItem[];
}

export function Header({
  isSidebarCollapsed,
  onToggleSidebar,
  businessMode,
  currentUser,
  notifications
}: HeaderProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleModeChange = (mode: BusinessMode) => {
    setBusinessMode(mode);
  };

  const availableRoles: UserProfile[] = [
    { id: 'usr_01', name: 'Durai Murugan', email: 'durai@vajrastone.in', role: 'owner' },
    { id: 'usr_02', name: 'S. Karthi', email: 'karthi@vajrastone.in', role: 'manager' },
    { id: 'usr_03', name: 'R. Perumal', email: 'perumal@vajrastone.in', role: 'operations' },
    { id: 'usr_04', name: 'P. Lakshmi', email: 'lakshmi@vajrastone.in', role: 'accountant' }
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Hamburger & Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, lorries, materials, customers, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-4 py-1.5 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
          />
        </form>
      </div>

      {/* Right: Mode Switcher, Quick Actions, Notifications, User */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Business Mode Toggle Buttons */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => handleModeChange('trading')}
            className={`px-3 py-1 rounded-lg transition ${
              businessMode === 'trading'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Trading Mode
          </button>
          <button
            onClick={() => handleModeChange('quarry')}
            className={`px-3 py-1 rounded-lg transition ${
              businessMode === 'quarry'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Quarry Mode
          </button>
          <button
            onClick={() => handleModeChange('combined')}
            className={`px-3 py-1 rounded-lg transition ${
              businessMode === 'combined'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Combined ERP
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="hidden md:flex items-center gap-1.5">
          <Link
            href="/sales"
            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New Order</span>
          </Link>
          <Link
            href="/transport"
            className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 transition"
          >
            <Truck className="h-3.5 w-3.5" />
            <span>Log Lorry</span>
          </Link>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-semibold text-slate-900 text-sm">Notifications & Reminders</span>
                <span className="text-xs text-slate-500 font-medium">
                  {unreadNotifications.length} unread
                </span>
              </div>
              <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No alerts at this moment</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                        notif.isRead
                          ? 'bg-slate-50/60 border-slate-100 text-slate-500'
                          : 'bg-orange-50/40 border-orange-200/60 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className={notif.severity === 'critical' ? 'text-rose-600' : 'text-slate-900'}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateDDMMYYYY(notif.date)}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 border-t border-slate-100 mt-3 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white shadow-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden text-left xl:block">
              <div className="text-xs font-semibold text-slate-800 truncate max-w-[100px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                {currentUser.role}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-200 p-3 z-50">
              <div className="px-2 py-1.5 border-b border-slate-100">
                <div className="font-semibold text-xs text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono uppercase">
                  Role: {currentUser.role}
                </div>
              </div>

              {/* Fast Role Switcher */}
              <div className="py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Switch Active Role (RBAC):
                </span>
                <div className="mt-1 space-y-0.5">
                  {availableRoles.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setCurrentUser(r);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition ${
                        currentUser.id === r.id
                          ? 'bg-orange-50 text-orange-800 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{r.name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{r.role}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  Business Settings
                </Link>
                <Link
                  href="/audit"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  Audit Trail
                </Link>
                <Link
                  href="/setup"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-2 py-1.5 text-xs text-orange-600 hover:bg-orange-50 rounded-lg font-medium"
                >
                  Guided Setup Wizard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
