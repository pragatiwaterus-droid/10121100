import React, { useState } from 'react';
import { OrganizationSettings, Loan } from '../types';
import { toNepaliDigits } from '../utils/nepaliUtils';
import {
  Droplets,
  Calendar,
  Bell,
  UserCheck,
  LogOut,
  ShieldAlert,
  Sparkles,
  Download,
} from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  loans: Loan[];
  currentUsername: string;
  userRole: string;
  onOpenDateModal: () => void;
  onOpenOverdueModal: () => void;
  onOpenDownloadModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<Props> = ({
  settings,
  loans,
  currentUsername,
  userRole,
  onOpenDateModal,
  onOpenOverdueModal,
  onOpenDownloadModal,
  onLogout,
}) => {
  const currentBsDate = settings.currentSystemDateBS;

  // Calculate overdue loans
  const overdueCount = loans.filter((l) => {
    return l.remainingPrincipal > 0 && (l.maturityDateBS < currentBsDate || l.status === 'overdue');
  }).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Org Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 text-white shadow-md shadow-blue-500/20">
              <Droplets className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight">
                  {settings.orgName}
                </h1>
                <span className="hidden md:inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                  खानेपानी ईआरपी
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {settings.orgAddress} • फोन: {settings.orgPhone}
              </p>
            </div>
          </div>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Running System Date Pill */}
            <button
              onClick={onOpenDateModal}
              title="चलिरहेको मिति परिवर्तन गर्न यहाँ थिच्नुहोस्"
              className="flex items-center gap-2 rounded-xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-blue-900 transition shadow-xs group"
            >
              <Calendar className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="text-[10px] text-blue-600 font-medium block leading-none">
                  चलिरहेको मिति
                </span>
                <span className="font-mono text-xs font-bold text-blue-950">
                  {toNepaliDigits(settings.currentSystemDateBS)}
                </span>
              </div>
            </button>

            {/* Download Center Button */}
            <button
              onClick={onOpenDownloadModal}
              title="डाटाबेस ब्याकअप, एक्सेल फाइल र A4 रिपोर्ट डाउनलोड गर्नुहोस्"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition shadow-xs"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              <span className="hidden sm:inline">डाउनलोड</span>
            </button>

            {/* Overdue Loan Notification Alert Button */}
            <button
              onClick={onOpenOverdueModal}
              title={
                overdueCount > 0
                  ? `${overdueCount} जना ऋणीको म्याद सकियो! मोबाइलमा सूचना पठाउनुहोस्`
                  : 'कुनै पनि ऋणीको म्याद सकिएको छैन'
              }
              className={`relative flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition shadow-xs ${
                overdueCount > 0
                  ? 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 animate-pulse'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Bell className={`h-4 w-4 ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">ऋण म्याद सूचना</span>
              {overdueCount > 0 ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                  {toNepaliDigits(overdueCount)}
                </span>
              ) : (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 text-[9px] font-bold text-slate-700">
                  ०
                </span>
              )}
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-bold text-slate-800 leading-none">{currentUsername}</div>
                <div className="text-[10px] text-slate-500 font-medium">{userRole}</div>
              </div>
              <button
                onClick={onLogout}
                title="लगआउट गर्नुहोस्"
                className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-200 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
