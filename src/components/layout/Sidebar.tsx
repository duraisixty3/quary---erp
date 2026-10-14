'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Truck,
  TrendingUp,
  Users,
  Building2,
  FileText,
  ShoppingCart,
  PackageCheck,
  Receipt,
  CreditCard,
  BarChart3,
  Pickaxe,
  Wrench,
  Navigation,
  FolderLock,
  Bell,
  Settings,
  History,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BusinessMode } from '@/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

interface NavGroup {
  group: string;
  badge?: string;
  items: NavItem[];
}

interface SidebarProps {
  businessMode: BusinessMode;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  businessName: string;
}

export function Sidebar({
  businessMode,
  isCollapsed,
  businessName
}: SidebarProps) {
  const pathname = usePathname();

  // Navigation structure categorized logically
  const navigationGroups: NavGroup[] = [
    {
      group: 'Overview & Analytics',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Load Profitability', href: '/load-profit', icon: TrendingUp, highlight: true }
      ]
    },
    {
      group: 'Trading Operations',
      items: [
        { name: 'Materials & Aggregates', href: '/materials', icon: Boxes },
        { name: 'Quarries & Suppliers', href: '/suppliers', icon: Building2 },
        { name: 'Customers & CRM', href: '/customers', icon: Users },
        { name: 'Quotations', href: '/quotations', icon: FileText },
        { name: 'Sales Orders', href: '/sales', icon: ShoppingCart },
        { name: 'Purchases & Inbound', href: '/purchases', icon: PackageCheck }
      ]
    },
    {
      group: 'Fleet & Logistics',
      items: [
        { name: 'Lorry Trips & Fleet', href: '/transport', icon: Truck },
        { name: 'Route & Delivery Plan', href: '/delivery-planning', icon: Navigation }
      ]
    },
    {
      group: 'Inventory & Warehousing',
      items: [
        { name: 'Stock Ledger & Yards', href: '/inventory', icon: Compass }
      ]
    },
    {
      group: 'Finance & Accounts',
      items: [
        { name: 'Payments & Receivables', href: '/payments', icon: CreditCard },
        { name: 'Business Expenses', href: '/expenses', icon: Receipt },
        { name: 'Financial Reports', href: '/reports', icon: BarChart3 }
      ]
    },
    ...(businessMode === 'quarry' || businessMode === 'combined'
      ? [
          {
            group: 'Quarry Operations',
            badge: 'QUARRY MODE',
            items: [
              { name: 'Quarry Sites & Leases', href: '/quarry', icon: Pickaxe },
              { name: 'Machinery & Repairs', href: '/machinery', icon: Wrench }
            ]
          }
        ]
      : []),
    {
      group: 'Administration',
      items: [
        { name: 'Document Vault', href: '/documents', icon: FolderLock },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Team & Permissions', href: '/users', icon: ShieldCheck },
        { name: 'Business Settings', href: '/settings', icon: Settings },
        { name: 'Audit Trail', href: '/audit', icon: History }
      ]
    }
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-950 text-slate-300 transition-all duration-300 border-r border-slate-800',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white font-black text-xl shadow-md shadow-orange-600/30">
          V
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-white text-base tracking-wide truncate">
              {businessName || 'Vajra Stone'}
            </span>
            <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider">
              {businessMode === 'combined'
                ? 'Trading & Quarry ERP'
                : businessMode === 'quarry'
                ? 'Quarry Operations'
                : 'Pebble Trading'}
            </span>
          </div>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>{group.group}</span>
                {group.badge && (
                  <span className="text-[9px] bg-orange-950 text-orange-400 border border-orange-800/50 px-1.5 py-0.2 rounded font-mono">
                    {group.badge}
                  </span>
                )}
              </div>
            )}
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                        : item.highlight
                        ? 'text-orange-400 hover:bg-slate-900 hover:text-orange-300'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                        isActive ? 'text-white' : item.highlight ? 'text-orange-500' : 'text-slate-400'
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-500 flex justify-between items-center">
          <span>Asia/Kolkata (IST)</span>
          <span className="font-mono text-emerald-400">v1.2 Online</span>
        </div>
      )}
    </aside>
  );
}
