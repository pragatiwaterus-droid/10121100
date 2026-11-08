import React, { useState } from 'react';
import {
  Customer,
  MeterReading,
  BillPayment,
  Loan,
  LoanInstallment,
  BankAccount,
  IncomeEntry,
  ExpenseEntry,
  OrganizationSettings,
} from '../types';
import {
  formatNepaliCurrency,
  toNepaliDigits,
} from '../utils/nepaliUtils';
import {
  FileText,
  Printer,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  PieChart,
  Scale,
  DollarSign,
  Droplets,
  HandCoins,
} from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  readings: MeterReading[];
  payments: BillPayment[];
  loans: Loan[];
  installments: LoanInstallment[];
  banks: BankAccount[];
  incomes: IncomeEntry[];
  expenses: ExpenseEntry[];
}

type ReportType =
  | 'customer_consumption'
  | 'loan_portfolio'
  | 'profit_loss'
  | 'income_expenditure'
  | 'balance_sheet'
  | 'cash_flow'
  | 'trial_balance'
  | 'category_summary';

export const ReportsView: React.FC<Props> = ({
  settings,
  customers,
  readings,
  payments,
  loans,
  installments,
  banks,
  incomes,
  expenses,
}) => {
  const currentBsDate = settings.currentSystemDateBS;

  const [activeReport, setActiveReport] = useState<ReportType>('customer_consumption');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('सबै');
  const [fromDateBS, setFromDateBS] = useState<string>('2081-01-01');
  const [toDateBS, setToDateBS] = useState<string>(currentBsDate);

  const handlePrint = () => {
    window.print();
  };

  // Calculations for Customer Consumption Report
  const filteredReadings = readings.filter((r) => {
    const matchesCustomer =
      selectedCustomerId === 'सबै' || r.customerId === selectedCustomerId;
    const matchesDate = r.entryDateBS >= fromDateBS && r.entryDateBS <= toDateBS;
    return matchesCustomer && matchesDate;
  });

  const totalConsumedUnits = filteredReadings.reduce((sum, r) => sum + r.consumedUnits, 0);
  const totalWaterBillAmount = filteredReadings.reduce((sum, r) => sum + r.baseAmount, 0);
  const totalFines = filteredReadings.reduce((sum, r) => sum + r.fineAmount, 0);
  const totalNetBilled = filteredReadings.reduce((sum, r) => sum + r.totalBillAmount, 0);

  // Financial aggregates
  const totalWaterBillIncome = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalOtherIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalInterestIncome = installments.reduce((sum, i) => sum + i.interestPaid, 0);
  const grossIncome = totalWaterBillIncome + totalOtherIncome + totalInterestIncome;

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netSurplus = grossIncome - totalExpenseAmount;

  // Balance sheet metrics
  const totalBankBalances = banks.reduce((sum, b) => sum + b.balance, 0);
  const totalLoanReceivable = loans.reduce((sum, l) => sum + l.remainingPrincipal, 0);
  const totalUnpaidBillsReceivable = readings
    .filter((r) => r.paidStatus === 'unpaid')
    .reduce((sum, r) => sum + r.totalBillAmount, 0);
  const totalCurrentAssets = totalBankBalances + totalLoanReceivable + totalUnpaidBillsReceivable;
  const fixedAssetsEstimate = 1250000; // Estimated plant, pipe networks, water tanks
  const totalAssets = totalCurrentAssets + fixedAssetsEstimate;

  const capitalReserve = 1500000;
  const netEarningsReserve = totalAssets - capitalReserve;

  return (
    <div className="space-y-6">
      {/* Top Header & Report Tabs (no-print) */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-purple-600 p-3 text-white shadow-md shadow-purple-500/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                प्रतिवेदन तथा वित्तीय विवरणहरू (Financial Reports)
              </h2>
              <p className="text-xs text-slate-500">
                ग्राहक वार्षिक खपत रिपोर्ट, ऋण पोर्टफोलियो, नाफा नोक्सान, वासलात र नगद प्रवाह (A4 प्रिन्ट)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:bg-purple-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>A4 रिपोर्ट प्रिन्ट गर्नुहोस्</span>
            </button>
          </div>
        </div>

        {/* Report Selector Pills */}
        <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => setActiveReport('customer_consumption')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeReport === 'customer_consumption'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            १. ग्राहक युनिट, रकम र जरिवाना रिपोर्ट
          </button>
          <button
            onClick={() => setActiveReport('loan_portfolio')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeReport === 'loan_portfolio'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            २. ऋण लगानी तथा असुली स्टेटमेन्ट
          </button>
          <button
            onClick={() => setActiveReport('profit_loss')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeReport === 'profit_loss'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ३. नाफा नोक्सान हिसाब (P&L)
          </button>
          <button
            onClick={() => setActiveReport('income_expenditure')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeReport === 'income_expenditure'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ४. आय-व्यय विवरण
          </button>
          <button
            onClick={() => setActiveReport('balance_sheet')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeReport === 'balance_sheet'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ५. वासलात (Balance Sheet)
          </button>
          <button
            onClick={() => setActiveReport('cash_flow')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeReport === 'cash_flow'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ६. नगद प्रवाह (Cash Flow)
          </button>
          <button
            onClick={() => setActiveReport('trial_balance')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeReport === 'trial_balance'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ७. सन्तुलन परीक्षण (Trial Balance)
          </button>
        </div>
      </div>

      {/* Printable Report Paper */}
      <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
          <h1 className="text-xl font-bold text-slate-900">{settings.orgName}</h1>
          <p className="text-xs text-slate-700">{settings.orgAddress} | फोन: {settings.orgPhone}</p>
          <p className="text-xs text-slate-500">
            {settings.regNo ? `दर्ता नं: ${settings.regNo}` : ''} {settings.panNo ? `| प्यान नं: ${settings.panNo}` : ''}
          </p>
          <div className="mt-2 inline-block rounded-md bg-slate-100 px-4 py-1 text-xs font-bold text-slate-900 print:border print:border-slate-800">
            {activeReport === 'customer_consumption' && 'ग्राहक वार्षिक तथा आवधिक खपत, रकम र जरिवाना प्रतिवेदन'}
            {activeReport === 'loan_portfolio' && 'ऋण लगानी, किस्ता असुली तथा भाखा नाघेको ऋण प्रतिवेदन'}
            {activeReport === 'profit_loss' && 'नाफा नोक्सान हिसाब विवरण (Profit & Loss Account)'}
            {activeReport === 'income_expenditure' && 'आय-व्यय विवरण (Income & Expenditure Statement)'}
            {activeReport === 'balance_sheet' && 'वासलात (Balance Sheet - सम्पत्ति र दायित्व)'}
            {activeReport === 'cash_flow' && 'नगद प्रवाह विवरण (Cash Flow Statement)'}
            {activeReport === 'trial_balance' && 'सन्तुलन परीक्षण विवरण (Trial Balance)'}
          </div>
        </div>

        {/* REPORT 1: Customer Consumption & Fine Report */}
        {activeReport === 'customer_consumption' && (
          <div className="space-y-4">
            {/* Filter Bar (no-print) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 no-print text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">ग्राहक छान्नुहोस्:</span>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-800"
                >
                  <option value="सबै">सबै ग्राहकहरू (All Customers)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.tapNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500">अवधि:</span>
                <input
                  type="text"
                  value={fromDateBS}
                  onChange={(e) => setFromDateBS(e.target.value)}
                  className="w-24 rounded border border-slate-300 bg-white px-2 py-1 font-mono font-bold"
                />
                <span>देखि</span>
                <input
                  type="text"
                  value={toDateBS}
                  onChange={(e) => setToDateBS(e.target.value)}
                  className="w-24 rounded border border-slate-300 bg-white px-2 py-1 font-mono font-bold"
                />
              </div>
            </div>

            {/* Aggregates Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                <span className="text-slate-500 block">जम्मा खपत युनिट:</span>
                <span className="font-mono text-lg font-bold text-blue-900">
                  {toNepaliDigits(totalConsumedUnits)} युनिट
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-500 block">जम्मा महसुल रकम:</span>
                <span className="font-mono text-lg font-bold text-slate-900">
                  {formatNepaliCurrency(totalWaterBillAmount)}
                </span>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3">
                <span className="text-slate-500 block">जम्मा जरिवाना रकम:</span>
                <span className="font-mono text-lg font-bold text-rose-700">
                  {formatNepaliCurrency(totalFines)}
                </span>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                <span className="text-slate-500 block">कुल बुझाउनुपर्ने रकम:</span>
                <span className="font-mono text-lg font-bold text-emerald-800">
                  {formatNepaliCurrency(totalNetBilled)}
                </span>
              </div>
            </div>

            {/* Consumption Table */}
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 p-2 text-center w-10">क्र.सं.</th>
                  <th className="border border-slate-300 p-2 text-left">ग्राहक आइडी</th>
                  <th className="border border-slate-300 p-2 text-left">धारा नं</th>
                  <th className="border border-slate-300 p-2 text-left">ग्राहकको नाम</th>
                  <th className="border border-slate-300 p-2 text-center">महिना</th>
                  <th className="border border-slate-300 p-2 text-right">साविक</th>
                  <th className="border border-slate-300 p-2 text-right">हाल</th>
                  <th className="border border-slate-300 p-2 text-center font-bold">खपत युनिट</th>
                  <th className="border border-slate-300 p-2 text-right">महसुल (रु)</th>
                  <th className="border border-slate-300 p-2 text-right">जरिवाना (रु)</th>
                  <th className="border border-slate-300 p-2 text-right font-bold">जम्मा रकम</th>
                  <th className="border border-slate-300 p-2 text-center">स्थिति</th>
                </tr>
              </thead>
              <tbody>
                {filteredReadings.map((r, idx) => (
                  <tr key={r.id}>
                    <td className="border border-slate-300 p-2 text-center font-mono">
                      {toNepaliDigits(idx + 1)}
                    </td>
                    <td className="border border-slate-300 p-2 font-mono font-medium">{r.customerId}</td>
                    <td className="border border-slate-300 p-2 font-semibold">{r.tapNo}</td>
                    <td className="border border-slate-300 p-2 font-bold text-slate-900">{r.customerName}</td>
                    <td className="border border-slate-300 p-2 text-center">{r.monthBS} {r.yearBS}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{r.prevReading}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{r.currReading}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono font-bold text-blue-700">
                      {toNepaliDigits(r.consumedUnits)}
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono">
                      {formatNepaliCurrency(r.baseAmount, false)}
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono text-rose-600">
                      {formatNepaliCurrency(r.fineAmount, false)}
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-900">
                      {formatNepaliCurrency(r.totalBillAmount)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      <span className="font-semibold text-[10px]">
                        {r.paidStatus === 'paid' ? 'चुक्ता' : 'बाँकी'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 2: Loan Portfolio & Overdue Report */}
        {activeReport === 'loan_portfolio' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3">
                <span className="text-slate-500 block">कुल ऋण लगानी रकम:</span>
                <span className="font-mono text-lg font-bold text-indigo-900">
                  {formatNepaliCurrency(loans.reduce((s, l) => s + l.principalAmount, 0))}
                </span>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                <span className="text-slate-500 block">कुल असुल सावाँ:</span>
                <span className="font-mono text-lg font-bold text-emerald-800">
                  {formatNepaliCurrency(loans.reduce((s, l) => s + l.repaidPrincipal, 0))}
                </span>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                <span className="text-slate-500 block">उठाउन बाँकी सावाँ:</span>
                <span className="font-mono text-lg font-bold text-amber-900">
                  {formatNepaliCurrency(loans.reduce((s, l) => s + l.remainingPrincipal, 0))}
                </span>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                <span className="text-slate-500 block">कुल प्राप्त ब्याज:</span>
                <span className="font-mono text-lg font-bold text-blue-900">
                  {formatNepaliCurrency(loans.reduce((s, l) => s + l.totalInterestPaid, 0))}
                </span>
              </div>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 p-2 text-left">ऋण नं</th>
                  <th className="border border-slate-300 p-2 text-left">ऋणी सदस्यको नाम</th>
                  <th className="border border-slate-300 p-2 text-left">फोन</th>
                  <th className="border border-slate-300 p-2 text-right">लगानी रकम</th>
                  <th className="border border-slate-300 p-2 text-center">ब्याजदर</th>
                  <th className="border border-slate-300 p-2">लगानी मिति</th>
                  <th className="border border-slate-300 p-2">म्याद मिति</th>
                  <th className="border border-slate-300 p-2 text-right">उठाउन बाँकी सावाँ</th>
                  <th className="border border-slate-300 p-2 text-right">प्राप्त ब्याज</th>
                  <th className="border border-slate-300 p-2 text-center">ऋण स्थिति</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((l) => {
                  const isOverdue =
                    l.remainingPrincipal > 0 &&
                    (l.maturityDateBS < currentBsDate || l.status === 'overdue');
                  return (
                    <tr key={l.id} className={isOverdue ? 'bg-rose-50/40' : ''}>
                      <td className="border border-slate-300 p-2 font-mono font-bold text-indigo-700">{l.id}</td>
                      <td className="border border-slate-300 p-2 font-bold">{l.customerName}</td>
                      <td className="border border-slate-300 p-2 font-mono">{l.phone}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono">
                        {formatNepaliCurrency(l.principalAmount)}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-mono">
                        {l.interestRatePercent}%
                      </td>
                      <td className="border border-slate-300 p-2 font-mono">{toNepaliDigits(l.issueDateBS)}</td>
                      <td className="border border-slate-300 p-2 font-mono">{toNepaliDigits(l.maturityDateBS)}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-900">
                        {formatNepaliCurrency(l.remainingPrincipal)}
                      </td>
                      <td className="border border-slate-300 p-2 text-right font-mono text-blue-700">
                        {formatNepaliCurrency(l.totalInterestPaid)}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {isOverdue ? (
                          <span className="font-bold text-rose-700">भाखा नाघेको</span>
                        ) : l.remainingPrincipal === 0 ? (
                          <span className="font-semibold text-emerald-700">चुक्ता</span>
                        ) : (
                          <span className="font-semibold text-blue-700">नियमित</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 3: Profit & Loss Statement */}
        {activeReport === 'profit_loss' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Income side */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-emerald-100 p-2.5 font-bold text-emerald-900">
                  आम्दानी (Revenues & Incomes)
                </div>
                <div className="divide-y divide-slate-200">
                  <div className="p-2.5 flex justify-between">
                    <span>खानेपानी महसुल संकलन:</span>
                    <span className="font-mono font-bold">{formatNepaliCurrency(totalWaterBillIncome)}</span>
                  </div>
                  {incomes.map((i) => (
                    <div key={i.id} className="p-2.5 flex justify-between">
                      <span>{i.category} ({i.receivedFrom}):</span>
                      <span className="font-mono">{formatNepaliCurrency(i.amount)}</span>
                    </div>
                  ))}
                  <div className="p-2.5 flex justify-between">
                    <span>ऋण लगानीबाट प्राप्त ब्याज आम्दानी:</span>
                    <span className="font-mono font-bold text-blue-700">
                      {formatNepaliCurrency(totalInterestIncome)}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 flex justify-between font-bold text-emerald-950 border-t-2 border-emerald-300">
                    <span>कुल आम्दानी (Total Revenue):</span>
                    <span className="font-mono text-sm">{formatNepaliCurrency(grossIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Expense side */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-rose-100 p-2.5 font-bold text-rose-900">
                  खर्चहरू (Operating Expenses)
                </div>
                <div className="divide-y divide-slate-200">
                  {expenses.map((e) => (
                    <div key={e.id} className="p-2.5 flex justify-between">
                      <span>{e.category} ({e.paidTo}):</span>
                      <span className="font-mono">{formatNepaliCurrency(e.amount)}</span>
                    </div>
                  ))}
                  <div className="p-3 bg-rose-50 flex justify-between font-bold text-rose-950 border-t-2 border-rose-300">
                    <span>कुल खर्च (Total Expenses):</span>
                    <span className="font-mono text-sm">{formatNepaliCurrency(totalExpenseAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Profit / Surplus */}
            <div className="rounded-xl bg-blue-50 border-2 border-blue-300 p-4 flex justify-between items-center text-sm font-bold text-blue-950">
              <span>खुद बचत / सञ्चालन मुनाफा (Net Operating Surplus):</span>
              <span className="text-xl font-mono text-blue-900">{formatNepaliCurrency(netSurplus)}</span>
            </div>
          </div>
        )}

        {/* REPORT 4: Income & Expenditure */}
        {activeReport === 'income_expenditure' && (
          <div className="space-y-4 text-xs">
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 p-2 text-left">आय (Receipts) शीर्षक</th>
                  <th className="border border-slate-300 p-2 text-right">रकम (रु)</th>
                  <th className="border border-slate-300 p-2 text-left">व्यय (Payments) शीर्षक</th>
                  <th className="border border-slate-300 p-2 text-right">रकम (रु)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2">खानेपानी महसुल आम्दानी</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">{formatNepaliCurrency(totalWaterBillIncome)}</td>
                  <td className="border border-slate-300 p-2">विद्युत तथा पम्पिङ महसुल</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">
                    {formatNepaliCurrency(expenses.filter((e) => e.category === 'विद्युत महसुल').reduce((s, e) => s + e.amount, 0))}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">मर्मत तथा सेवा शुल्क आम्दानी</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">
                    {formatNepaliCurrency(incomes.filter((i) => i.category === 'मर्मत आम्दानी').reduce((s, i) => s + i.amount, 0))}
                  </td>
                  <td className="border border-slate-300 p-2">पाइप तथा मुहान मर्मत खर्च</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">
                    {formatNepaliCurrency(expenses.filter((e) => e.category === 'मर्मत खर्च').reduce((s, e) => s + e.amount, 0))}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">नयाँ धारा जडान शुल्क</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">
                    {formatNepaliCurrency(incomes.filter((i) => i.category === 'नयाँ धारा सेवा शुल्क').reduce((s, i) => s + i.amount, 0))}
                  </td>
                  <td className="border border-slate-300 p-2">सामग्री तथा केमिकल खरिद</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">
                    {formatNepaliCurrency(expenses.filter((e) => e.category === 'सामग्री खरिद').reduce((s, e) => s + e.amount, 0))}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">अनुदान तथा चन्दा सहयोग</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">
                    {formatNepaliCurrency(incomes.filter((i) => i.category === 'अनुदान' || i.category === 'सहयोग / चन्दा').reduce((s, i) => s + i.amount, 0))}
                  </td>
                  <td className="border border-slate-300 p-2">प्रशासनिक, खाजा तथा मसलन्द</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">
                    {formatNepaliCurrency(expenses.filter((e) => ['प्रिन्ट तथा मसलन्द खर्च', 'चिया खाना खाजा खर्च', 'रिचार्ज खर्च'].includes(e.category)).reduce((s, e) => s + e.amount, 0))}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                  <td className="border border-slate-300 p-2">कुल आय (Total Receipts):</td>
                  <td className="border border-slate-300 p-2 text-right font-mono text-emerald-800">{formatNepaliCurrency(grossIncome)}</td>
                  <td className="border border-slate-300 p-2">कुल व्यय (Total Payments):</td>
                  <td className="border border-slate-300 p-2 text-right font-mono text-rose-800">{formatNepaliCurrency(totalExpenseAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 5: Balance Sheet */}
        {activeReport === 'balance_sheet' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Liabilities and Equity */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-slate-100 p-2.5 font-bold text-slate-900">
                  पुँजी तथा दायित्व (Liabilities & Capital)
                </div>
                <div className="divide-y divide-slate-200">
                  <div className="p-2.5 flex justify-between">
                    <span>संस्थाको साधारण जगेडा कोष (Capital Reserve):</span>
                    <span className="font-mono">{formatNepaliCurrency(capitalReserve)}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span>संचित बचत / आम्दानी जगेडा (Retained Earnings):</span>
                    <span className="font-mono">{formatNepaliCurrency(netEarningsReserve)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 flex justify-between font-bold border-t-2 border-slate-400">
                    <span>कुल पुँजी तथा दायित्व (Total Liabilities):</span>
                    <span className="font-mono text-sm">{formatNepaliCurrency(totalAssets)}</span>
                  </div>
                </div>
              </div>

              {/* Assets */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-slate-100 p-2.5 font-bold text-slate-900">
                  सम्पत्ति (Assets)
                </div>
                <div className="divide-y divide-slate-200">
                  <div className="p-2.5 flex justify-between">
                    <span>बैंक तथा वित्तीय संस्थामा मौज्दात (Bank Balance):</span>
                    <span className="font-mono font-bold text-emerald-700">{formatNepaliCurrency(totalBankBalances)}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span>लगानीमा रहेको ऋण सावाँ (Loan Receivables):</span>
                    <span className="font-mono font-bold text-indigo-700">{formatNepaliCurrency(totalLoanReceivable)}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span>उठाउन बाँकी पानी महसुल (Bills Receivable):</span>
                    <span className="font-mono font-bold text-amber-700">{formatNepaliCurrency(totalUnpaidBillsReceivable)}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span>स्थिर सम्पत्ति (पाइपलाइन, ट्याङ्की, उपकरण):</span>
                    <span className="font-mono">{formatNepaliCurrency(fixedAssetsEstimate)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 flex justify-between font-bold border-t-2 border-slate-400">
                    <span>कुल सम्पत्ति (Total Assets):</span>
                    <span className="font-mono text-sm">{formatNepaliCurrency(totalAssets)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 6: Cash Flow Statement */}
        {activeReport === 'cash_flow' && (
          <div className="space-y-4 text-xs">
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-slate-100 p-3 font-bold text-slate-900">
                नगद प्रवाह विवरण (Cash Flow Statement)
              </div>
              <div className="divide-y divide-slate-200">
                <div className="p-3 flex justify-between bg-slate-50 font-semibold">
                  <span>१. सञ्चालन गतिविधिबाट नगद प्रवाह (Operating Cash Flow):</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatNepaliCurrency(totalWaterBillIncome + totalOtherIncome - totalExpenseAmount)}
                  </span>
                </div>
                <div className="p-2.5 pl-6 flex justify-between text-slate-600">
                  <span>• ग्राहक महसुल तथा अन्य आम्दानी संकलन:</span>
                  <span className="font-mono">+{formatNepaliCurrency(totalWaterBillIncome + totalOtherIncome)}</span>
                </div>
                <div className="p-2.5 pl-6 flex justify-between text-slate-600">
                  <span>• सञ्चालन तथा प्रशासनिक खर्च भुक्तानी:</span>
                  <span className="font-mono">-{formatNepaliCurrency(totalExpenseAmount)}</span>
                </div>

                <div className="p-3 flex justify-between bg-slate-50 font-semibold">
                  <span>२. ऋण लगानी तथा वित्तीय गतिविधिबाट नगद प्रवाह (Financing Cash Flow):</span>
                  <span className="font-mono font-bold text-blue-700">
                    {formatNepaliCurrency(totalInterestIncome)}
                  </span>
                </div>
                <div className="p-2.5 pl-6 flex justify-between text-slate-600">
                  <span>• ऋणबाट प्राप्त ब्याज आम्दानी:</span>
                  <span className="font-mono">+{formatNepaliCurrency(totalInterestIncome)}</span>
                </div>

                <div className="p-3.5 bg-blue-50/80 flex justify-between font-bold text-sm text-blue-950 border-t-2 border-blue-300">
                  <span>वर्तमान कुल बैंक तथा नगद मौज्दात (Closing Cash & Bank Balance):</span>
                  <span className="font-mono">{formatNepaliCurrency(totalBankBalances)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 7: Trial Balance */}
        {activeReport === 'trial_balance' && (
          <div className="space-y-4 text-xs">
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 p-2 text-left">खाताको नाम (Account Head)</th>
                  <th className="border border-slate-300 p-2 text-right">डेबिट रकम (Debit रु)</th>
                  <th className="border border-slate-300 p-2 text-right">क्रेडिट रकम (Credit रु)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 font-medium">बैंक खाताहरू (मौज्दात)</td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatNepaliCurrency(totalBankBalances)}</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">-</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-medium">ऋण लगानी सावाँ</td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatNepaliCurrency(totalLoanReceivable)}</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">-</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-medium">खानेपानी महसुल आम्दानी</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">-</td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatNepaliCurrency(totalWaterBillIncome)}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-medium">अन्य आम्दानी तथा अनुदान</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">-</td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatNepaliCurrency(totalOtherIncome)}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-medium">ऋण ब्याज आम्दानी</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">-</td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatNepaliCurrency(totalInterestIncome)}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-medium">सञ्चालन तथा मर्मत खर्चहरू</td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatNepaliCurrency(totalExpenseAmount)}</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Report Footer Signatures */}
        <div className="mt-12 pt-6 border-t border-slate-400 flex justify-between text-xs text-slate-800">
          <div className="w-48 text-center">
            <div className="border-b border-dotted border-slate-500 mb-1 h-6"></div>
            <p className="font-semibold">तयार गर्ने (लेखापाल)</p>
          </div>
          <div className="w-48 text-center">
            <div className="border-b border-dotted border-slate-500 mb-1 h-6"></div>
            <p className="font-semibold">प्रमाणित गर्ने (व्यवस्थापक/सचिव)</p>
          </div>
          <div className="w-48 text-center">
            <div className="border-b border-dotted border-slate-500 mb-1 h-6 font-semibold">
              {settings.authorizedPersonName}
            </div>
            <p className="font-semibold">स्वीकृत गर्ने ({settings.authorizedPersonRole || 'अध्यक्ष'})</p>
          </div>
        </div>
      </div>
    </div>
  );
};
