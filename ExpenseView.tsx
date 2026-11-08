import React, { useState } from 'react';
import { ExpenseEntry, ExpenseCategory, OrganizationSettings } from '../types';
import { formatNepaliCurrency, toNepaliDigits } from '../utils/nepaliUtils';
import {
  TrendingDown,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  expenses: ExpenseEntry[];
  onAddExpense: (expense: ExpenseEntry) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'विद्युत महसुल',
  'मर्मत खर्च',
  'सामग्री खरिद',
  'लेखा परीक्षण शुल्क',
  'गाडीभाडा खर्च',
  'चिया खाना खाजा खर्च',
  'साधारण सभा खर्च',
  'प्रिन्ट तथा मसलन्द खर्च',
  'रिचार्ज खर्च',
  'पेट्रोल / इन्धन खर्च',
  'अन्य खर्चहरू',
];

export const ExpenseView: React.FC<Props> = ({ settings, expenses, onAddExpense }) => {
  const currentBsDate = settings.currentSystemDateBS;

  const [activeTab, setActiveTab] = useState<'statement' | 'add'>('statement');
  const [selectedCategory, setSelectedCategory] = useState<string>('सबै');
  const [fromDateBS, setFromDateBS] = useState<string>('2081-01-01');
  const [toDateBS, setToDateBS] = useState<string>(currentBsDate);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('विद्युत महसुल');
  const [amount, setAmount] = useState<number>(3000);
  const [dateBS, setDateBS] = useState<string>(currentBsDate);
  const [paidTo, setPaidTo] = useState<string>('');
  const [billVoucherNo, setBillVoucherNo] = useState<string>(`EXP-${Date.now().toString().slice(-4)}`);
  const [description, setDescription] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'नगद' | 'बैंक / QR' | 'चेक'>('नगद');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paidTo || amount <= 0) return;

    const newExp: ExpenseEntry = {
      id: `EXP-${Date.now()}`,
      category,
      amount,
      dateBS,
      paidTo,
      billVoucherNo,
      description: description || category,
      paymentMode,
      approvedBy: settings.authorizedPersonName || 'अध्यक्ष',
    };

    onAddExpense(newExp);
    setSuccessMessage(`खर्च भौचर नं ${billVoucherNo} (रु ${amount.toLocaleString()}) सफलतापूर्वक सुरक्षित भयो!`);
    setPaidTo('');
    setDescription('');
    setBillVoucherNo(`EXP-${Date.now().toString().slice(-4)}`);
    setActiveTab('statement');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Filter
  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCategory === 'सबै' || e.category === selectedCategory;
    const matchesDate = e.dateBS >= fromDateBS && e.dateBS <= toDateBS;
    const matchesSearch =
      e.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.billVoucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesDate && matchesSearch;
  });

  const totalFilteredExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-600 p-3 text-white shadow-md shadow-rose-500/20">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">खर्च व्यवस्थापन (Expense Ledger)</h2>
              <p className="text-xs text-slate-500">
                विद्युत, मर्मत, सामग्री, लेखा परीक्षण, गाडीभाडा, खाजा, प्रिन्ट, पेट्रोल तथा मसलन्द खर्च (अटो नेपाली मिति)
              </p>
            </div>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('statement')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'statement'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              खर्च स्टेटमेन्ट
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'add'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + नयाँ खर्च भौचर
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
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {EXPENSE_CATEGORIES.map((cat) => {
            const catSum = expenses
              .filter((e) => e.category === cat)
              .reduce((sum, e) => sum + e.amount, 0);
            return (
              <div
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer rounded-xl p-2.5 border text-xs transition ${
                  selectedCategory === cat
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <span className="font-semibold text-slate-800 line-clamp-1">{cat}</span>
                <span className="font-mono text-rose-700 font-bold block mt-1">
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
            <h3 className="font-bold text-slate-900 text-sm">
              शीर्षक तथा मिति अनुसार खर्च स्टेटमेन्ट
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="सबै">सबै खर्च शीर्षकहरू</option>
                {EXPENSE_CATEGORIES.map((c) => (
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
                  placeholder="भौचर नं वा फर्म खोज्नुहोस्..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-rose-50/60 p-3 rounded-xl border border-rose-100 text-xs">
            <span className="font-semibold text-rose-900">
              छानिएको अवधिको कुल खर्च:
            </span>
            <span className="text-base font-bold font-mono text-rose-700">
              {formatNepaliCurrency(totalFilteredExpense)}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">मिति (वि.सं.)</th>
                  <th className="p-3">बिल / भौचर नं</th>
                  <th className="p-3">खर्चको शीर्षक</th>
                  <th className="p-3">भुक्तानी पाउने व्यक्ति / फर्म</th>
                  <th className="p-3">विवरण</th>
                  <th className="p-3">माध्यम</th>
                  <th className="p-3 text-right">रकम (रु)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-600">{toNepaliDigits(e.dateBS)}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{e.billVoucherNo}</td>
                    <td className="p-3 font-semibold text-rose-800">
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 border border-rose-200">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{e.paidTo}</td>
                    <td className="p-3 text-slate-600">{e.description}</td>
                    <td className="p-3 text-slate-500">{e.paymentMode}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-700">
                      {formatNepaliCurrency(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Add Expense Form */}
      {activeTab === 'add' && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 max-w-2xl"
        >
          <div className="border-b pb-3 border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">नयाँ खर्च भौचर प्रविष्टि फाराम</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                खर्चको शीर्षक <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-hidden"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                खर्च रकम (रु) <span className="text-rose-500">*</span>
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
                खर्च मिति (वि.सं.) <span className="text-rose-600">(अटोमेटिक)</span>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">बिल / भौचर नं</label>
              <input
                type="text"
                value={billVoucherNo}
                onChange={(e) => setBillVoucherNo(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                भुक्तानी पाउने व्यक्ति / फर्म / पसल <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="उदा. नेपाल विद्युत प्राधिकरण / काभ्रे सप्लायर्स"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">कैफियत / प्रयोजन</label>
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
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-700 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>खर्च भौचर सेभ गर्नुहोस्</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
