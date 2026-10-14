'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DemoBanner } from './DemoBanner';
import { getStoreState, subscribeToStore, AppState } from '@/lib/storage/store';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [state, setState] = useState<AppState>(getStoreState());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setState(getStoreState());
    const unsubscribe = subscribeToStore((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  // Full-screen pages like login or first-time setup
  const isFullScreenPage = pathname === '/login' || pathname === '/setup';

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading Vajra ERP...</div>;
  }

  if (isFullScreenPage) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        businessMode={state.settings.businessMode}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        businessName={state.settings.businessName}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? 'pl-20' : 'pl-0 md:pl-64'
        }`}
      >
        <DemoBanner demoMode={state.settings.demoMode} />
        <Header
          isSidebarCollapsed={isCollapsed}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
          businessMode={state.settings.businessMode}
          currentUser={state.currentUser}
          notifications={state.notifications}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
