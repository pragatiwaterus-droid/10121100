import React from 'react';
import {
  Customer,
  MeterReading,
  BillPayment,
  Loan,
  BankAccount,
  IncomeEntry,
  ExpenseEntry,
  OrganizationSettings,
} from '../types';
import { formatNepaliCurrency, toNepaliDigits } from '../utils/nepaliUtils';
import {
  Users,
  Gauge,
  Receipt,
  HandCoins,
  Landmark,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileSpreadsheet,
  Truck,
  PlusCircle,
  Clock,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { TabType } from '../components/Navigation';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  readings: MeterReading[];
  payments: BillPayment[];
  loans: Loan[];
  banks: BankAccount[];
  incomes: IncomeEntry[];
  expenses: ExpenseEntry[];
  onNavigate: (tab: TabType) => void;
  onOpenOverdueModal: () => void;
  onOpenReadingSheetModal: () => void;
  onOpenDownloadModal?: () => void;
}

export const DashboardView: React.FC<Props> = ({
  settings,
  customers,
  readings,
  payments,
  loans,
  banks,
  incomes,
  expenses,
  onNavigate,
  onOpenOverdueModal,
  onOpenReadingSheetModal,
  onOpenDownloadModal,
}) => {
  const currentBsDate = settings.currentSystemDateBS;

  // KPIs
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === 'active').length;

  const unpaidReadings = readings.filter((r) => r.paidStatus === 'unpaid');
  const totalUnpaidAmount = unpaidReadings.reduce((sum, r) => sum + r.totalBillAmount, 0);

  const totalBankBalance = banks.reduce((sum, b) => sum + b.balance, 0);

  const totalLoanInvested = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalLoanRemaining = loans.reduce((sum, l) => sum + l.remainingPrincipal, 0);
  const overdueLoans = loans.filter(
    (l) => l.remainingPrincipal > 0 && (l.maturityDateBS < currentBsDate || l.status === 'overdue')
  );

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBillCollected = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const netSurplus = totalIncome + totalBillCollected - totalExpense;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Overdue Loans exist */}
      {overdueLoans.length > 0 && (
        <div className="rounded-2xl border border-rose-300 bg-gradient-to-r from-rose-500 to-red-600 p-4 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-xs">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                ऋणको म्याद सकिएको सूचना ({toNepaliDigits(overdueLoans.length)} जना सदस्य)
              </h3>
              <p className="text-xs text-rose-100">
                भाखा नाघेको कुल बाँकी सावाँ रकम: {formatNepaliCurrency(
                  overdueLoans.reduce((sum, l) => sum + l.remainingPrincipal, 0)
                )}। मोबाइल वा ह्वाट्सएपमार्फत ताकेता सूचना पठाउनुहोस्।
              </p>
            </div>
          </div>
          <button
            onClick={onOpenOverdueModal}
            className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-rose-700 shadow-md hover:bg-rose-50 transition shrink-0"
          >
            ऋणीहरूको सूची हेर्नुहोस् & सूचना पठाउनुहोस्
          </button>
        </div>
      )}

      {/* Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <button
          onClick={() => onNavigate('unit_entry')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition group text-center"
        >
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
            <Gauge className="h-5 w-5" />
          </div>
          <span className="mt-2 text-xs font-bold text-slate-800">बल्क युनिट इन्ट्री</span>
          <span className="text-[10px] text-slate-400">मासिक रिडिङ</span>
        </button>

        <button
          onClick={() => onNavigate('amount_entry')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition group text-center"
        >
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
            <Receipt className="h-5 w-5" />
          </div>
          <span className="mt-2 text-xs font-bold text-slate-800">महसुल भुक्तानी</span>
          <span className="text-[10px] text-slate-400">रसिद प्रिन्ट</span>
        </button>

        <button
          onClick={onOpenReadingSheetModal}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-400 hover:shadow-md transition group text-center"
        >
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <span className="mt-2 text-xs font-bold text-slate-800">रिडिङ शीट (A4)</span>
          <span className="text-[10px] text-slate-400">फिल्ड फाराम</span>
        </button>

        <button
          onClick={() => onNavigate('loan')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition group text-center"
        >
          <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
            <HandCoins className="h-5 w-5" />
          </div>
          <span className="mt-2 text-xs font-bold text-slate-800">ऋण तथा किस्ता</span>
          <span className="text-[10px] text-slate-400">लगानी & असुली</span>
        </button>

        <button
          onClick={() => onNavigate('tanker_sales')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-cyan-400 hover:shadow-md transition group text-center"
        >
          <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition">
            <Truck className="h-5 w-5" />
          </div>
          <span className="mt-2 text-xs font-bold text-slate-800">गाडी पानी बिक्री</span>
          <span className="text-[10px] text-slate-400">ट्याङ्कर बिक्री</span>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-400 hover:shadow-md transition group text-center"
        >
          <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="mt-2 text-xs font-bold text-slate-800">वित्तीय प्रतिवेदन</span>
          <span className="text-[10px] text-slate-400">नाफा/नोक्सान</span>
        </button>

        <button
          onClick={onOpenDownloadModal || (() => onNavigate('support'))}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition group text-center"
        >
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
            <Download className="h-5 w-5" />
          </div>
          <span className="mt-2 text-xs font-bold text-slate-800">डाउनलोड केन्द्र</span>
          <span className="text-[10px] text-slate-400">ब्याकअप & CSV</span>
        </button>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customers */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">कुल खानेपानी ग्राहक</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {toNepaliDigits(totalCustomers)} <span className="text-sm font-normal text-slate-500">घरधुरी</span>
            </div>
            <div className="mt-1 flex items-center text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              <span>सक्रिय: {toNepaliDigits(activeCustomers)} धारा</span>
            </div>
          </div>
        </div>

        {/* Unpaid Water Bill */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">उठाउन बाँकी पानी महसुल</span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-600 font-mono">
              {formatNepaliCurrency(totalUnpaidAmount)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {toNepaliDigits(unpaidReadings.length)} वटा बिल भुक्तानी हुन बाँकी
            </div>
          </div>
        </div>

        {/* Loan Portfolio */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">कुल बाँकी ऋण लगानी</span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <HandCoins className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-700 font-mono">
              {formatNepaliCurrency(totalLoanRemaining)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              कुल लगानी: {formatNepaliCurrency(totalLoanInvested)}
            </div>
          </div>
        </div>

        {/* Bank Total Balance */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">बैंक मौज्दात रकम</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              {formatNepaliCurrency(totalBankBalance)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {toNepaliDigits(banks.length)} वटा बैंक खाताहरूमा
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income & Expense Summary */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">वित्तीय सारांश (Financial Summary)</h3>
            <span className="text-xs text-slate-400">चालु आर्थिक वर्ष</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-4">
              <span className="text-xs text-emerald-700 font-semibold block">कुल संकलित आम्दानी</span>
              <span className="text-lg font-bold text-emerald-800 font-mono mt-1 block">
                {formatNepaliCurrency(totalIncome + totalBillCollected)}
              </span>
              <span className="text-[11px] text-slate-500">
                (महसुल: {formatNepaliCurrency(totalBillCollected)} + अन्य: {formatNepaliCurrency(totalIncome)})
              </span>
            </div>

            <div className="rounded-xl bg-rose-50/60 border border-rose-100 p-4">
              <span className="text-xs text-rose-700 font-semibold block">कुल संस्थागत खर्च</span>
              <span className="text-lg font-bold text-rose-800 font-mono mt-1 block">
                {formatNepaliCurrency(totalExpense)}
              </span>
              <span className="text-[11px] text-slate-500">विद्युत, मर्मत, मसलन्द, आदि</span>
            </div>

            <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-4">
              <span className="text-xs text-blue-700 font-semibold block">खुद बचत (Surplus)</span>
              <span className="text-lg font-bold text-blue-800 font-mono mt-1 block">
                {formatNepaliCurrency(netSurplus)}
              </span>
              <span className="text-[11px] text-slate-500">सञ्चालन मुनाफा</span>
            </div>
          </div>

          {/* Recent Payments Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                पछिल्लो महसुल भुक्तानीहरू (Recent Bill Receipts)
              </h4>
              <button
                onClick={() => onNavigate('amount_entry')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                सबै हेर्नुहोस् &rarr;
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">रसिद नं</th>
                    <th className="p-2.5">ग्राहकको नाम</th>
                    <th className="p-2.5">धारा नं</th>
                    <th className="p-2.5">मिति (वि.सं.)</th>
                    <th className="p-2.5 text-right">रकम</th>
                    <th className="p-2.5">माध्यम</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {payments.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-medium text-blue-600">{p.receiptNo}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{p.customerName}</td>
                      <td className="p-2.5 text-slate-600">{p.tapNo}</td>
                      <td className="p-2.5 font-mono text-slate-500">{toNepaliDigits(p.dateBS)}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {formatNepaliCurrency(p.paidAmount)}
                      </td>
                      <td className="p-2.5 text-slate-500">{p.paymentMethod}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">
                        कुनै भुक्तानी प्रविष्टि छैन।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bank Balances & Overdue Widget */}
        <div className="space-y-6">
          {/* Bank Accounts Overview */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">बैंक खाता स्थिति</h3>
              <button
                onClick={() => onNavigate('bank')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                व्यवस्थापन &rarr;
              </button>
            </div>
            <div className="space-y-3">
              {banks.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{b.bankName}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">खाता: {b.accountNumber} ({b.accountType})</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    {formatNepaliCurrency(b.balance)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Info Widget */}
          <div className="rounded-2xl bg-slate-900 text-white p-5 shadow-md">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              संस्था प्रणाली विवरण
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">संस्था:</span>
                <span className="font-medium text-white">{settings.orgName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ठेगाना:</span>
                <span>{settings.orgAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">अध्यक्ष:</span>
                <span className="text-white">{settings.authorizedPersonName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">न्यूनतम महसुल:</span>
                <span className="font-mono text-cyan-400">
                  रु {settings.waterTariff.minAmount} ({settings.waterTariff.minUnits} युनिटसम्म)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">अतिरिक्त दर:</span>
                <span className="font-mono text-cyan-400">रु {settings.waterTariff.extraRatePerUnit} / युनिट</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ऋण ब्याजदर:</span>
                <span className="font-mono text-amber-400">{settings.loanSettings.annualInterestRatePercent}% वार्षिक</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
