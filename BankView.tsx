import React, { useState } from 'react';
import { BankAccount, BankTransaction, OrganizationSettings } from '../types';
import { formatNepaliCurrency, toNepaliDigits } from '../utils/nepaliUtils';
import {
  Landmark,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Wallet,
  Receipt,
} from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  banks: BankAccount[];
  transactions: BankTransaction[];
  onAddTransaction: (txn: BankTransaction) => void;
  onAddBank: (bank: BankAccount) => void;
}

export const BankView: React.FC<Props> = ({
  settings,
  banks,
  transactions,
  onAddTransaction,
  onAddBank,
}) => {
  const currentBsDate = settings.currentSystemDateBS;

  const [activeTab, setActiveTab] = useState<'statement' | 'new_txn' | 'manage_banks'>('statement');
  const [selectedBankId, setSelectedBankId] = useState<string>('सबै');
  const [fromDateBS, setFromDateBS] = useState<string>('2081-01-01');
  const [toDateBS, setToDateBS] = useState<string>(currentBsDate);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Transaction Form State
  const [targetBankId, setTargetBankId] = useState<string>(banks[0]?.id || '');
  const [txnType, setTxnType] = useState<'deposit' | 'withdraw'>('deposit');
  const [txnAmount, setTxnAmount] = useState<number>(10000);
  const [txnDateBS, setTxnDateBS] = useState<string>(currentBsDate);
  const [voucherNo, setVoucherNo] = useState<string>(`BNK-${Date.now().toString().slice(-4)}`);
  const [description, setDescription] = useState<string>('खानेपानी महसुल आम्दानी दाखिला');

  // New Bank Account Form State
  const [newBankName, setNewBankName] = useState<string>('');
  const [newAccNumber, setNewAccNumber] = useState<string>('');
  const [newBranch, setNewBranch] = useState<string>('');
  const [newAccType, setNewAccType] = useState<'बचत (Saving)' | 'चल्ती (Current)'>('चल्ती (Current)');
  const [newOpeningBalance, setNewOpeningBalance] = useState<number>(0);

  // Total Bank Balance
  const totalBalance = banks.reduce((sum, b) => sum + b.balance, 0);

  const handleTxnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bank = banks.find((b) => b.id === targetBankId);
    if (!bank || txnAmount <= 0) return;

    const newTxn: BankTransaction = {
      id: `BTXN-${Date.now()}`,
      bankId: bank.id,
      bankName: bank.bankName,
      type: txnType,
      amount: txnAmount,
      dateBS: txnDateBS,
      voucherNo: voucherNo,
      description: description,
      performedBy: settings.authorizedPersonName || 'लेखापाल',
    };

    onAddTransaction(newTxn);
    setSuccessMessage(
      `${bank.bankName} मा ${txnType === 'deposit' ? 'जम्मा (Deposit)' : 'झिकेको (Withdraw)'} रकम रु ${txnAmount.toLocaleString()} सफलतापूर्वक दाखिला भयो!`
    );
    setActiveTab('statement');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleAddBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName || !newAccNumber) return;

    const newB: BankAccount = {
      id: `BANK-${String(banks.length + 1).padStart(2, '0')}`,
      bankName: newBankName,
      accountNumber: newAccNumber,
      branch: newBranch,
      accountType: newAccType,
      balance: newOpeningBalance,
    };

    onAddBank(newB);
    setSuccessMessage(`नयाँ बैंक खाता ${newBankName} सफलतापूर्वक थपियो!`);
    setNewBankName('');
    setNewAccNumber('');
    setNewBranch('');
    setNewOpeningBalance(0);
    setActiveTab('statement');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesBank = selectedBankId === 'सबै' || t.bankId === selectedBankId;
    const matchesDate = t.dateBS >= fromDateBS && t.dateBS <= toDateBS;
    const matchesSearch =
      t.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBank && matchesDate && matchesSearch;
  });

  const totalDeposited = filteredTransactions
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawn = filteredTransactions
    .filter((t) => t.type === 'withdraw')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-md shadow-emerald-500/20">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">बैंक खाता तथा कारोबार व्यवस्थापन</h2>
              <p className="text-xs text-slate-500">
                डिपोजिट र विड्र इन्ट्री (परिवर्तन गर्न मिल्ने अटो मिति), बैंकवाइज स्टेटमेन्ट र कुल मौज्दात
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
              बैंक स्टेटमेन्ट
            </button>
            <button
              onClick={() => setActiveTab('new_txn')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'new_txn'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + डिपोजिट / विड्र भौचर
            </button>
            <button
              onClick={() => setActiveTab('manage_banks')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'manage_banks'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              बैंक खाताहरू ({toNepaliDigits(banks.length)})
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

        {/* Bank Balances Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-emerald-600 text-white p-4 shadow-sm sm:col-span-1">
            <span className="text-xs text-emerald-100 font-semibold block">सबै बैंकको कुल मौज्दात</span>
            <div className="text-2xl font-bold font-mono mt-1">
              {formatNepaliCurrency(totalBalance)}
            </div>
            <span className="text-[10px] text-emerald-200 mt-1 block">
              {toNepaliDigits(banks.length)} वटा बैंक खातामा जम्मा
            </span>
          </div>

          <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {banks.map((b) => (
              <div
                key={b.id}
                className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{b.bankName}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">खाता: {b.accountNumber}</span>
                </div>
                <div className="mt-2 text-right">
                  <span className="font-mono text-sm font-bold text-emerald-700">
                    {formatNepaliCurrency(b.balance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab 1: Bank-wise Statement & Date Range */}
      {activeTab === 'statement' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">बैंक कारोबार स्टेटमेन्ट</h3>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Bank selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-slate-500 font-semibold">बैंक छान्नुहोस्:</span>
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden"
                >
                  <option value="सबै">सबै बैंकहरू</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filters (मिति देखि - सम्म) */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-500">मिति देखि:</span>
                <input
                  type="text"
                  value={fromDateBS}
                  onChange={(e) => setFromDateBS(e.target.value)}
                  className="w-20 bg-transparent font-mono font-bold text-slate-800 focus:outline-hidden"
                />
                <span className="text-slate-400">सम्म:</span>
                <input
                  type="text"
                  value={toDateBS}
                  onChange={(e) => setToDateBS(e.target.value)}
                  className="w-20 bg-transparent font-mono font-bold text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="भौचर नं वा विवरण खोज्नुहोस्..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Statement Aggregate Chips */}
          <div className="flex items-center gap-6 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500">अवधिभर जम्मा (Deposit): </span>
              <strong className="font-mono text-emerald-700 text-sm">
                + {formatNepaliCurrency(totalDeposited)}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">अवधिभर झिकेको (Withdraw): </span>
              <strong className="font-mono text-rose-700 text-sm">
                - {formatNepaliCurrency(totalWithdrawn)}
              </strong>
            </div>
          </div>

          {/* Statement Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">मिति (वि.सं.)</th>
                  <th className="p-3">भौचर / चेक नं</th>
                  <th className="p-3">बैंकको नाम</th>
                  <th className="p-3">कारोबार विवरण</th>
                  <th className="p-3 text-right">जम्मा रकम (+)</th>
                  <th className="p-3 text-right">झिकेको रकम (-)</th>
                  <th className="p-3">दाखिला गर्ने</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-600">{toNepaliDigits(t.dateBS)}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{t.voucherNo}</td>
                    <td className="p-3 font-semibold text-slate-900">{t.bankName}</td>
                    <td className="p-3 text-slate-700">{t.description}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      {t.type === 'deposit' ? formatNepaliCurrency(t.amount) : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-700">
                      {t.type === 'withdraw' ? formatNepaliCurrency(t.amount) : '-'}
                    </td>
                    <td className="p-3 text-slate-500">{t.performedBy}</td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      यो मिति दायरामा कुनै कारोबार फेला परेन।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: New Deposit / Withdraw Form */}
      {activeTab === 'new_txn' && (
        <form
          onSubmit={handleTxnSubmit}
          className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 max-w-2xl"
        >
          <div className="border-b pb-3 border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">बैंक डिपोजिट वा विड्र भौचर प्रविष्टि</h3>
            <p className="text-xs text-slate-500">
              रकम जम्मा वा झिकेको इन्ट्री गर्नुहोस्, मिति स्वतः नेपाली आउँछ र चाहेको खण्डमा परिवर्तन गर्न सकिन्छ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                कारोबार प्रकार <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTxnType('deposit')}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    txnType === 'deposit'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  <span>रकम जम्मा (Deposit)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTxnType('withdraw')}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    txnType === 'withdraw'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>रकम झिकेको (Withdraw)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                बैंक खाता छान्नुहोस् <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetBankId}
                onChange={(e) => setTargetBankId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                required
              >
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} (मौज्दात: रु {b.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                रकम (रु) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={txnAmount}
                onChange={(e) => setTxnAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-base font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                कारोबार मिति (वि.सं.) <span className="text-emerald-600">(परिवर्तन गर्न मिल्ने अटो मिति)</span>
              </label>
              <input
                type="text"
                value={txnDateBS}
                onChange={(e) => setTxnDateBS(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">भौचर / चेक नम्बर</label>
              <input
                type="text"
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">विवरण / कैफियत</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                required
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
              <span>भौचर दाखिला गर्नुहोस्</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Manage Bank Accounts */}
      {activeTab === 'manage_banks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleAddBankSubmit}
            className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4"
          >
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">नयाँ बैंक खाता थप्नुहोस्</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">बैंकको पूरा नाम</label>
              <input
                type="text"
                placeholder="उदा. कृषि विकास बैंक लि."
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">खाता नम्बर</label>
              <input
                type="text"
                placeholder="०२१०४००१२३४"
                value={newAccNumber}
                onChange={(e) => setNewAccNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-900 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">शाखा</label>
              <input
                type="text"
                placeholder="धुलिखेल शाखा"
                value={newBranch}
                onChange={(e) => setNewBranch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">खाता प्रकार</label>
              <select
                value={newAccType}
                onChange={(e) => setNewAccType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
              >
                <option value="चल्ती (Current)">चल्ती (Current)</option>
                <option value="बचत (Saving)">बचत (Saving)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">सुरुको मौज्दात (Opening Balance)</label>
              <input
                type="number"
                min={0}
                value={newOpeningBalance}
                onChange={(e) => setNewOpeningBalance(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition"
            >
              खाता सुरक्षित गर्नुहोस्
            </button>
          </form>

          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">संस्थाका बैंक खाताहरूको सूची</h3>
            <div className="space-y-3">
              {banks.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{b.bankName}</h4>
                    <p className="text-xs text-slate-500">
                      शाखा: {b.branch || 'मुख्य'} | खाता प्रकार: {b.accountType}
                    </p>
                    <p className="text-xs font-mono font-semibold text-slate-700 mt-1">
                      खाता नं: {b.accountNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">वर्तमान मौज्दात</span>
                    <span className="text-base font-bold text-emerald-700 font-mono">
                      {formatNepaliCurrency(b.balance)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
