"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-navy border-r border-navy-light">
        <div className="flex h-16 items-center justify-between px-4 border-b border-navy-light">
          <span className="font-semibold text-lg text-white">HireFair</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white">Dashboard</a>
          <a href="/screening" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-navy-light hover:text-white">Resume Screening</a>
          <a href="/insights" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-navy-light hover:text-white">Candidate Insights</a>
          <a href="/fairness" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-navy-light hover:text-white">Fairness Audit</a>
        </nav>
      </aside>
      <div className={cn("transition-all duration-300 lg:ml-64")}>
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b">
          <div className="flex h-full items-center justify-between px-6">
            <h1 className="text-xl font-semibold">HireFair</h1>
          </div>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}