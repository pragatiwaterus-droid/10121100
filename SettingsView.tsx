import React, { useState } from 'react';
import {
  OrganizationSettings,
  TariffRateHistory,
  LoanRateHistory,
  TankerClientRate,
} from '../types';
import { toNepaliDigits } from '../utils/nepaliUtils';
import {
  Settings,
  Calendar,
  Droplets,
  HandCoins,
  Truck,
  Building2,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
} from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  onUpdateSettings: (newSettings: OrganizationSettings) => void;
  onOpenDateModal: () => void;
}

export const SettingsView: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onOpenDateModal,
}) => {
  const [formData, setFormData] = useState<OrganizationSettings>(settings);
  const [activeTab, setActiveTab] = useState<'system_date' | 'tariff' | 'loan_rate' | 'tanker_rates' | 'org_profile'>('system_date');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Save handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSuccessMessage('सेटिङहरू सफलतापूर्वक सुरक्षित (Saved) भयो!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Add new tariff history
  const handleAddTariffHistory = () => {
    const newEntry: TariffRateHistory = {
      id: `TAR-${Date.now().toString().slice(-4)}`,
      fromDateBS: '2082-01-01',
      toDateBS: '2082-12-30',
      minAmount: formData.waterTariff.minAmount,
      minUnits: formData.waterTariff.minUnits,
      extraRatePerUnit: formData.waterTariff.extraRatePerUnit,
      fineDaysThreshold: formData.waterTariff.fineDaysThreshold,
      finePercent: formData.waterTariff.finePercent,
      fineFixedAmount: formData.waterTariff.fineFixedAmount,
      note: 'समितिको आगामी निर्णय दर',
    };
    setFormData({
      ...formData,
      waterTariff: {
        ...formData.waterTariff,
        history: [...formData.waterTariff.history, newEntry],
      },
    });
  };

  // Add new loan rate history
  const handleAddLoanRateHistory = () => {
    const newEntry: LoanRateHistory = {
      id: `LR-${Date.now().toString().slice(-4)}`,
      fromDateBS: '2082-01-01',
      toDateBS: '2082-12-30',
      interestRatePercent: formData.loanSettings.annualInterestRatePercent,
      decisionRef: 'समिति निर्णय नं. ५',
    };
    setFormData({
      ...formData,
      loanSettings: {
        ...formData.loanSettings,
        history: [...formData.loanSettings.history, newEntry],
      },
    });
  };

  // Add new tanker client rate
  const handleAddTankerClientRate = () => {
    const newEntry: TankerClientRate = {
      id: `CTR-${Date.now().toString().slice(-4)}`,
      clientName: 'नयाँ ग्राहक / रिसोर्ट',
      phone: '९८५१००००००',
      ratePerLiter: formData.waterTankerSettings.defaultRatePerLiter,
      wagePerLiter: formData.waterTankerSettings.defaultWagePerLiter,
      fromDateBS: '2081-01-01',
      toDateBS: '2081-12-30',
    };
    setFormData({
      ...formData,
      waterTankerSettings: {
        ...formData.waterTankerSettings,
        clientRates: [...formData.waterTankerSettings.clientRates, newEntry],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white shadow-md">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">संस्थागत सेटिङ तथा दर व्यवस्थापन</h2>
              <p className="text-xs text-slate-500">
                चलिरहेको मिति, खानेपानी महसुल दर, ऋण ब्याजदर, गाडी पानी बिक्री दर र समितिको विवरण
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Save className="h-4 w-4" />
            <span>सेटिङ सेभ गर्नुहोस्</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Setting Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('system_date')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'system_date'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>चलिरहेको मिति</span>
          </button>
          <button
            onClick={() => setActiveTab('tariff')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'tariff'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Droplets className="h-3.5 w-3.5" />
            <span>महसुल दर & जरिवाना स्ल्याब</span>
          </button>
          <button
            onClick={() => setActiveTab('loan_rate')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'loan_rate'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <HandCoins className="h-3.5 w-3.5" />
            <span>ऋण लगानी ब्याजदर</span>
          </button>
          <button
            onClick={() => setActiveTab('tanker_rates')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'tanker_rates'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            <span>गाडी पानी बिक्री & ज्याला दर</span>
          </button>
          <button
            onClick={() => setActiveTab('org_profile')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'org_profile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>समितिको विवरण & लोगो</span>
          </button>
        </div>
      </div>

      {/* Tab 1: System Running Date */}
      {activeTab === 'system_date' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 max-w-2xl">
          <h3 className="font-bold text-slate-900 text-sm">
            सफ्टवेयरमा चलिरहेको मिति (System Operating Date BS)
          </h3>
          <p className="text-xs text-slate-500">
            सफ्टवेयरमा सबै रसिद, भौचर, युनिट इन्ट्री र रिपोर्टहरूमा स्वतः लागु हुने मुख्य चालु मिति
          </p>

          <div className="rounded-xl bg-blue-50/70 p-4 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-700 font-semibold block">वर्तमान चलिरहेको मिति</span>
              <span className="text-xl font-bold font-mono text-blue-950 mt-1 block">
                {toNepaliDigits(formData.currentSystemDateBS)}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenDateModal}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
            >
              मिति परिवर्तन गर्नुहोस्
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              सिधै मिति टाइप गरी परिवर्तन गर्नुहोस् (YYYY-MM-DD):
            </label>
            <input
              type="text"
              value={formData.currentSystemDateBS}
              onChange={(e) => setFormData({ ...formData, currentSystemDateBS: e.target.value })}
              className="w-full sm:w-64 rounded-xl border border-slate-300 p-2 font-mono text-sm font-bold text-slate-900 focus:outline-hidden"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Water Tariff & Fine Settings with History */}
      {activeTab === 'tariff' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">खानेपानी महसुल दर तथा जरिवाना नियम</h3>
              <p className="text-xs text-slate-500">
                न्यूनतम रकम, न्यूनतम युनिट सीमा, अतिरिक्त दर र कति दिनमा कति % जरिवाना लाग्ने
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                न्यूनतम रकम (रु) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={formData.waterTariff.minAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    waterTariff: { ...formData.waterTariff, minAmount: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-sm font-bold text-slate-900 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">उदा. रु १५०</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                न्यूनतम युनिट सीमा (Minimum Units) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={formData.waterTariff.minUnits}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    waterTariff: { ...formData.waterTariff, minUnits: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-sm font-bold text-slate-900 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">उदा. १० युनिटसम्म न्यूनतम रकम लाग्ने</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                न्यूनतमभन्दा बढी अतिरिक्त शुल्क (रु प्रति युनिट) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={formData.waterTariff.extraRatePerUnit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    waterTariff: {
                      ...formData.waterTariff,
                      extraRatePerUnit: Number(e.target.value),
                    },
                  })
                }
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-sm font-bold text-slate-900 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">उदा. रु २५ प्रति युनिट</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                रिडिङ भएपछि कति दिनमा जरिवाना लाग्ने (दिन)
              </label>
              <input
                type="number"
                min={0}
                value={formData.waterTariff.fineDaysThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    waterTariff: {
                      ...formData.waterTariff,
                      fineDaysThreshold: Number(e.target.value),
                    },
                  })
                }
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-sm font-bold text-slate-900 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">उदा. ३० दिनपछि जरिवाना लाग्ने</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                जरिवाना दर (प्रतिशत %)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.waterTariff.finePercent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    waterTariff: { ...formData.waterTariff, finePercent: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-sm font-bold text-slate-900 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">उदा. १०%</span>
            </div>
          </div>

          {/* Historical Rate Periods (कुन मितिदेखि कुन मितिसम्म कुन दर) */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  महसुल तथा जरिवाना दर परिवर्तन इतिहास (Rate Validity Periods)
                </h4>
                <p className="text-[11px] text-slate-500">
                  कुन मितिदेखि कुन मितिसम्म कुन दर लागु भएको थियो भन्ने अभिलेख
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTariffHistory}
                className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>नयाँ मिति दायरा दर थप्नुहोस्</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">मिति देखि</th>
                    <th className="p-2.5">मिति सम्म</th>
                    <th className="p-2.5 text-right">न्यूनतम रकम</th>
                    <th className="p-2.5 text-center">न्यूनतम युनिट</th>
                    <th className="p-2.5 text-right">थप दर</th>
                    <th className="p-2.5 text-center">जरिवाना दिन</th>
                    <th className="p-2.5 text-center">जरिवाना %</th>
                    <th className="p-2.5">कैफियत / निर्णय</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {formData.waterTariff.history.map((h, idx) => (
                    <tr key={h.id}>
                      <td className="p-2 font-mono font-medium">{h.fromDateBS}</td>
                      <td className="p-2 font-mono font-medium">{h.toDateBS}</td>
                      <td className="p-2 text-right font-mono">रु {h.minAmount}</td>
                      <td className="p-2 text-center font-mono">{h.minUnits}</td>
                      <td className="p-2 text-right font-mono">रु {h.extraRatePerUnit}</td>
                      <td className="p-2 text-center font-mono">{h.fineDaysThreshold} दिन</td>
                      <td className="p-2 text-center font-mono">{h.finePercent}%</td>
                      <td className="p-2 text-slate-600">{h.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Loan Interest Rate History */}
      {activeTab === 'loan_rate' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">ऋण लगानी ब्याजदर तथा निर्णय अभिलेख</h3>
              <p className="text-xs text-slate-500">
                समितिको निर्णय अनुसार एक वर्षभित्रै ब्याजदर परिवर्तन हुन सक्ने र सो मिति दायरा अनुसार अपडेट गर्ने सुविधा
              </p>
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              हालको सक्रिय ब्याजदर (% वार्षिक)
            </label>
            <input
              type="number"
              min={1}
              max={36}
              value={formData.loanSettings.annualInterestRatePercent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  loanSettings: {
                    ...formData.loanSettings,
                    annualInterestRatePercent: Number(e.target.value),
                  },
                })
              }
              className="w-full rounded-xl border border-slate-300 p-2 font-mono text-base font-bold text-slate-900 focus:outline-hidden"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ब्याजदर परिवर्तन इतिहास (कुन मितिदेखि कुन मितिसम्म कति दर)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddLoanRateHistory}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>नयाँ ब्याजदर निर्णय थप्नुहोस्</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">लागु मिति देखि</th>
                    <th className="p-2.5">मिति सम्म</th>
                    <th className="p-2.5 text-center">ब्याजदर (% वार्षिक)</th>
                    <th className="p-2.5">समितिको निर्णय मिति / निर्णय नं</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {formData.loanSettings.history.map((lr) => (
                    <tr key={lr.id}>
                      <td className="p-2.5 font-mono font-medium">{lr.fromDateBS}</td>
                      <td className="p-2.5 font-mono font-medium">{lr.toDateBS}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-indigo-700">
                        {lr.interestRatePercent}%
                      </td>
                      <td className="p-2.5 text-slate-700">{lr.decisionRef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Tanker Sales Rates per Client & Driver Wages */}
      {activeTab === 'tanker_rates' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b pb-3 border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              गाडीमा पानी बिक्री दर, ज्याला दर र व्यक्ति अनुसारको विशेष दर
            </h3>
            <p className="text-xs text-slate-500">
              कुन व्यक्तिलाई कुन दरमा बेच्ने र कुन मितिदेखि कुन मितिसम्म लागु हुने अप्सन
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                साधारण बिक्री दर (रु प्रति लिटर)
              </label>
              <input
                type="number"
                step={0.01}
                value={formData.waterTankerSettings.defaultRatePerLiter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    waterTankerSettings: {
                      ...formData.waterTankerSettings,
                      defaultRatePerLiter: Number(e.target.value),
                    },
                  })
                }
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">उदा. ०.३५ (रु १७५० प्रति ५००० लिटर)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                चालक / कर्मचारी ज्याला दर (रु प्रति लिटर)
              </label>
              <input
                type="number"
                step={0.01}
                value={formData.waterTankerSettings.defaultWagePerLiter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    waterTankerSettings: {
                      ...formData.waterTankerSettings,
                      defaultWagePerLiter: Number(e.target.value),
                    },
                  })
                }
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">उदा. ०.०६ (रु ३०० प्रति ५००० लिटर)</span>
            </div>
          </div>

          {/* Client-specific rates */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ग्राहक / व्यक्ति विशेष दर (Client-Specific Rates & Dates)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddTankerClientRate}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-100"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>नयाँ ग्राहक दर थप्नुहोस्</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">ग्राहक / संस्थाको नाम</th>
                    <th className="p-2.5">सम्पर्क फोन</th>
                    <th className="p-2.5 text-right">बिक्री दर (रु/लि.)</th>
                    <th className="p-2.5 text-right">ज्याला दर (रु/लि.)</th>
                    <th className="p-2.5">लागु मिति देखि</th>
                    <th className="p-2.5">मिति सम्म</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {formData.waterTankerSettings.clientRates.map((c) => (
                    <tr key={c.id}>
                      <td className="p-2.5 font-bold text-slate-900">{c.clientName}</td>
                      <td className="p-2.5 font-mono text-slate-600">{c.phone}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-cyan-700">
                        रु {c.ratePerLiter.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-amber-700">
                        रु {c.wagePerLiter.toFixed(2)}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">{c.fromDateBS}</td>
                      <td className="p-2.5 font-mono text-slate-600">{c.toDateBS}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Organization Profile & Signatories */}
      {activeTab === 'org_profile' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 max-w-2xl">
          <div className="border-b pb-3 border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">समितिको नाम, ठेगाना, फोन र आधिकारिक व्यक्ति</h3>
            <p className="text-xs text-slate-500">
              यी विवरणहरू सबै रसिद, A4 रिडिङ शीट र वित्तीय प्रतिवेदनको हेडरमा स्वतः छापिन्छन्
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                समितिको पूरा नाम <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.orgName}
                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">ठेगाना</label>
              <input
                type="text"
                value={formData.orgAddress}
                onChange={(e) => setFormData({ ...formData, orgAddress: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">सम्पर्क फोन नम्बर</label>
              <input
                type="text"
                value={formData.orgPhone}
                onChange={(e) => setFormData({ ...formData, orgPhone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">इमेल</label>
              <input
                type="email"
                value={formData.orgEmail}
                onChange={(e) => setFormData({ ...formData, orgEmail: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">दर्ता नम्बर</label>
              <input
                type="text"
                value={formData.regNo}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">स्थायी लेखा नं (PAN)</label>
              <input
                type="text"
                value={formData.panNo}
                onChange={(e) => setFormData({ ...formData, panNo: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                आधिकारिक व्यक्ति (नाम) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.authorizedPersonName}
                onChange={(e) => setFormData({ ...formData, authorizedPersonName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">आधिकारिक पद</label>
              <input
                type="text"
                value={formData.authorizedPersonRole}
                onChange={(e) => setFormData({ ...formData, authorizedPersonRole: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
