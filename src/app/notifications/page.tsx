'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  getStoreState,
  subscribeToStore,
  AppState,
  markNotificationRead,
  markAllNotificationsRead
} from '@/lib/storage/store';
import { formatDateDDMMYYYY } from '@/lib/utils';
import { NotificationItem } from '@/types';

export default function NotificationsPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const unreadCount = state.notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = state.notifications.filter((n) => {
    if (filterType === 'unread') return !n.isRead;
    if (filterType !== 'all' && n.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Alerts & Notification Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time triggers for overdue receivables, quarry permit renewals, machinery service dates, and stock thresholds.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllNotificationsRead()}>
            <Check className="h-4 w-4 mr-1.5" />
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Card className="shadow-xs">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'unread', label: `Unread Only (${unreadCount})` },
              { id: 'payment_overdue', label: 'Payment Overdues' },
              { id: 'low_stock', label: 'Low Stock' },
              { id: 'permit_expiry', label: 'Permit Renewals' },
              { id: 'maintenance_due', label: 'Machinery Service' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 text-xs">
            No notifications match this filter. Everything is operating smoothly.
          </Card>
        ) : (
          filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 transition hover:border-slate-300 shadow-xs ${
                notif.isRead ? 'bg-white border-slate-200' : 'bg-orange-50/30 border-orange-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      notif.severity === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : notif.severity === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{notif.title}</h3>
                      <Badge
                        variant={
                          notif.severity === 'critical'
                            ? 'danger'
                            : notif.severity === 'warning'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      >
                        {notif.severity.toUpperCase()}
                      </Badge>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-orange-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                      Timestamp: {formatDateDDMMYYYY(notif.date)} (Asia/Kolkata)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {notif.linkUrl && (
                    <Link
                      href={notif.linkUrl}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
                    >
                      View Record <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                  {!notif.isRead && (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="text-xs text-slate-400 hover:text-slate-700 p-1"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
