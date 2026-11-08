import React from 'react';
import {
  LayoutDashboard,
  Gauge,
  Receipt,
  Users,
  HandCoins,
  Landmark,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Truck,
  FileSpreadsheet,
  FileText,
  Settings,
  Database,
  LifeBuoy,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'unit_entry'
  | 'amount_entry'
  | 'kyc_customer'
  | 'loan'
  | 'bank'
  | 'income'
  | 'expense'
  | 'staff'
  | 'tanker_sales'
  | 'meter_sheet'
  | 'reports'
  | 'settings'
  | 'master_db'
  | 'support';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  color?: string;
}

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  overdueLoansCount?: number;
}

export const Navigation: React.FC<Props> = ({ activeTab, onTabChange, overdueLoansCount = 0 }) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'ड्यासबोर्ड', icon: LayoutDashboard },
    { id: 'unit_entry', label: 'युनिट इन्ट्री', icon: Gauge },
    { id: 'amount_entry', label: 'अमाउन्ट इन्ट्री', icon: Receipt },
    { id: 'kyc_customer', label: 'केवाईसी / ग्राहक', icon: Users },
    {
      id: 'loan',
      label: 'ऋण लगानी',
      icon: HandCoins,
      badge: overdueLoansCount > 0 ? overdueLoansCount : undefined,
    },
    { id: 'bank', label: 'बैंक', icon: Landmark },
    { id: 'income', label: 'आम्दानी', icon: TrendingUp },
    { id: 'expense', label: 'खर्च', icon: TrendingDown },
    { id: 'staff', label: 'कर्मचारी', icon: UserCheck },
    { id: 'tanker_sales', label: 'गाडी पानी बिक्री', icon: Truck },
    { id: 'meter_sheet', label: 'रिडिङ शीट प्रिन्ट', icon: FileSpreadsheet },
    { id: 'reports', label: 'रिपोर्टहरू', icon: FileText },
    { id: 'settings', label: 'सेटिङ', icon: Settings },
    { id: 'master_db', label: 'मेन डाटाबेस', icon: Database },
    { id: 'support', label: 'सपोर्ट', icon: LifeBuoy },
  ];

  return (
    <nav className="bg-slate-900 text-slate-300 shadow-md border-b border-slate-800 sticky top-16 sm:top-20 z-30 no-print">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
