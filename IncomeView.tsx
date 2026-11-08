import React, { useState } from 'react';
import { IncomeEntry, IncomeCategory, OrganizationSettings } from '../types';
import { formatNepaliCurrency, toNepaliDigits } from '../utils/nepaliUtils';
import {
  TrendingUp,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  incomes: IncomeEntry[];
  onAddIncome: (income: IncomeEntry) => void;
}

const INCOME_CATEGORIES: IncomeCategory[] = [
  'मर्मत आम्दानी',
  'नयाँ धारा सेवा शुल्क',
  'अनुदान',
  'सहयोग / चन्दा',
  'मिटर नामसारी शुल्क',
  'अन्य आम्दानी',
];

export const IncomeView: React.FC<Props> = ({ settings, incomes, onAddIncome }) => {
  const currentBsDate = settings.currentSystemDateBS;

  const [activeTab, setActiveTab] = useState<'statement' | 'add'>('statement');
  const [selectedCategory, setSelectedCategory] = useState<string>('सबै');
  const [fromDateBS, setFromDateBS] = useState<string>('2081-01-01');
  const [toDateBS, setToDateBS] = useState<string>(currentBsDate);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Form State
  const [category, setCategory] = useState<IncomeCategory>('मर्मत आम्दानी');
  const [amount, setAmount] = useState<number>(5000);
  const [dateBS, setDateBS] = useState<string>(currentBsDate);
  const [receivedFrom, setReceivedFrom] = useState<string>('');
  const [receiptNo, setReceiptNo] = useState<string>(`INC-${Date.now().toString().slice(-4)}`);
  const [description, setDescription] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'नगद' | 'बैंक / QR' | 'चेक'>('नगद');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivedFrom || amount <= 0) return;

    const newInc: IncomeEntry = {
      id: `INC-${Date.now()}`,
      category,
      amount,
      dateBS,
      receivedFrom,
      receiptNo,
      description: description || category,
      paymentMode,
      collectedBy: settings.authorizedPersonName || 'लेखापाल',
    };

    onAddIncome(newInc);
    setSuccessMessage(`आम्दानी रसिद नं ${receiptNo} (रु ${amount.toLocaleString()}) सफलतापूर्वक दाखिला भयो!`);
    setReceivedFrom('');
    setDescription('');
    setReceiptNo(`INC-${Date.now().toString().slice(-4)}`);
    setActiveTab('statement');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Filter
  const filteredIncomes = incomes.filter((i) => {
    const matchesCat = selectedCategory === 'सबै' || i.category === selectedCategory;
    const matchesDate = i.dateBS >= fromDateBS && i.dateBS <= toDateBS;
    const matchesSearch =
      i.receivedFrom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesDate && matchesSearch;
  });

  const totalFilteredIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-md shadow-emerald-500/20">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                आम्दानी व्यवस्थापन (Income / Revenue Ledger)
              </h2>
              <p className="text-xs text-slate-500">
                मर्मत आम्दानी, नयाँ धारा सेवा शुल्क, अनुदान, सहयोग/चन्दा र अन्य आम्दानी (अटो नेपाली मिति)
              </p>
            </div>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('statement')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'statement'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              आम्दानी स्टेटमेन्ट
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'add'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + नयाँ आम्दानी दाखिला
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Category Breakdown Chips */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-6 gap-2">
          {INCOME_CATEGORIES.map((cat) => {
            const catSum = incomes
              .filter((i) => i.category === cat)
              .reduce((sum, i) => sum + i.amount, 0);
            return (
              <div
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer rounded-xl p-2.5 border text-xs transition ${
                  selectedCategory === cat
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <span className="font-semibold text-slate-800 line-clamp-1">{cat}</span>
                <span className="font-mono text-emerald-700 font-bold block mt-1">
                  {formatNepaliCurrency(catSum)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* View 1: Statement */}
      {activeTab === 'statement' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">आम्दानी विवरण तथा भौचर सूची</h3>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="सबै">सबै शीर्षकहरू</option>
                {INCOME_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-500">मिति:</span>
                <input
                  type="text"
                  value={fromDateBS}
                  onChange={(e) => setFromDateBS(e.target.value)}
                  className="w-20 bg-transparent font-mono font-bold text-slate-800"
                />
                <span className="text-slate-400">देखि</span>
                <input
                  type="text"
                  value={toDateBS}
                  onChange={(e) => setToDateBS(e.target.value)}
                  className="w-20 bg-transparent font-mono font-bold text-slate-800"
                />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="आम्दानी रसिद वा व्यक्ति..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs">
            <span className="font-semibold text-emerald-900">
              छानिएको अवधिको कुल संकलित आम्दानी:
            </span>
            <span className="text-base font-bold font-mono text-emerald-700">
              {formatNepaliCurrency(totalFilteredIncome)}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">मिति (वि.सं.)</th>
                  <th className="p-3">रसिद नं</th>
                  <th className="p-3">आम्दानी शीर्षक</th>
                  <th className="p-3">प्राप्त भएको व्यक्ति / निकाय</th>
                  <th className="p-3">विवरण</th>
                  <th className="p-3">माध्यम</th>
                  <th className="p-3 text-right">रकम (रु)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredIncomes.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-600">{toNepaliDigits(i.dateBS)}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{i.receiptNo}</td>
                    <td className="p-3 font-semibold text-emerald-800">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        {i.category}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{i.receivedFrom}</td>
                    <td className="p-3 text-slate-600">{i.description}</td>
                    <td className="p-3 text-slate-500">{i.paymentMode}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      {formatNepaliCurrency(i.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Add Income Form */}
      {activeTab === 'add' && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 max-w-2xl"
        >
          <div className="border-b pb-3 border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">नयाँ आम्दानी दाखिला फाराम</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                आम्दानीको शीर्षक <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncomeCategory)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-hidden"
              >
                {INCOME_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                आम्दानी रकम (रु) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-base font-bold text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                आम्दानी मिति (वि.सं.) <span className="text-emerald-600">(अटोमेटिक)</span>
              </label>
              <input
                type="text"
                value={dateBS}
                onChange={(e) => setDateBS(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">रसिद / भौचर नं</label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                प्राप्त भएको व्यक्ति / संस्था / निकाय <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="उदा. धुलिखेल नगरपालिका / स्थानीय समाजसेवी"
                value={receivedFrom}
                onChange={(e) => setReceivedFrom(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">भुक्तानी माध्यम</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
              >
                <option value="नगद">नगद</option>
                <option value="बैंक / QR">बैंक / QR</option>
                <option value="चेक">चेक</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">कैफियत / विवरण</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('statement')}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>आम्दानी सेभ गर्नुहोस्</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
