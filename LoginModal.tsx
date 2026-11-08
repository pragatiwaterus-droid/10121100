import React, { useState } from 'react';
import { UserSession } from '../types';
import { Droplets, Lock, User, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Props {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginModal: React.FC<Props> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin123');
  const [role, setRole] = useState<'व्यवस्थापक (Admin)' | 'कर्मचारी (Staff)' | 'अध्यक्ष / पदाधिकारी'>('व्यवस्थापक (Admin)');
  const [error, setError] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('कृपया प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्।');
      return;
    }

    onLoginSuccess({
      username: username.trim(),
      fullName: role === 'व्यवस्थापक (Admin)' ? 'सुनिता कार्की' : 'ईन्द्र प्रसाद ढकाल',
      role: role,
      isLoggedIn: true,
    });
  };

  const handleQuickDemoLogin = (selectedRole: 'व्यवस्थापक (Admin)' | 'कर्मचारी (Staff)') => {
    onLoginSuccess({
      username: selectedRole === 'व्यवस्थापक (Admin)' ? 'admin' : 'staff',
      fullName: selectedRole === 'व्यवस्थापक (Admin)' ? 'सुनिता कार्की (व्यवस्थापक)' : 'राजेश लामा (कर्मचारी)',
      role: selectedRole,
      isLoggedIn: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Branding */}
        <div className="bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 p-8 text-center text-white relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg mb-3">
            <Droplets className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">खानेपानी तथा सरसफाइ उपभोक्ता संस्था</h1>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            व्यवस्थापन तथा वित्तीय ईआरपी प्रणाली (Khanepani ERP)
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              प्रयोगकर्ताको नाम (Username)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              गोप्य कोड / पासवर्ड (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">पद / भूमिका (Role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="व्यवस्थापक (Admin)">व्यवस्थापक (Admin)</option>
              <option value="कर्मचारी (Staff)">कर्मचारी (Staff / Operator)</option>
              <option value="अध्यक्ष / पदाधिकारी">अध्यक्ष / पदाधिकारी</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            लगइन गर्नुहोस् (Sign In)
          </button>

          {/* Quick Demo Login Buttons */}
          <div className="pt-3 border-t border-slate-200">
            <span className="text-[11px] text-slate-400 block text-center mb-2">
              द्रुत परीक्षण लगइन (Quick Demo Login):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('व्यवस्थापक (Admin)')}
                className="rounded-xl border border-blue-200 bg-blue-50/70 p-2 text-[11px] font-bold text-blue-800 hover:bg-blue-100 transition"
              >
                व्यवस्थापक (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('कर्मचारी (Staff)')}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                कर्मचारी (Staff)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
