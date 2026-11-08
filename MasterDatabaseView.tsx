import React, { useState } from 'react';
import {
  Customer,
  MeterReading,
  BillPayment,
  Loan,
  LoanInstallment,
  BankAccount,
  BankTransaction,
  IncomeEntry,
  ExpenseEntry,
  StaffPayment,
  TankerSale,
  OrganizationSettings,
  MasterLedgerEntry,
} from '../types';
import { formatNepaliCurrency, toNepaliDigits } from '../utils/nepaliUtils';
import {
  Database,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  User,
} from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  payments: BillPayment[];
  loans: Loan[];
  installments: LoanInstallment[];
  bankTxns: BankTransaction[];
  incomes: IncomeEntry[];
  expenses: ExpenseEntry[];
  staffPayments: StaffPayment[];
  tankerSales: TankerSale[];
}

export const MasterDatabaseView: React.FC<Props> = ({
  settings,
  customers,
  payments,
  loans,
  installments,
  bankTxns,
  incomes,
  expenses,
  staffPayments,
  tankerSales,
}) => {
  const currentBsDate = settings.currentSystemDateBS;

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('सबै');
  const [selectedModule, setSelectedModule] = useState<string>('सबै');
  const [fromDateBS, setFromDateBS] = useState<string>('2080-01-01');
  const [toDateBS, setToDateBS] = useState<string>(currentBsDate);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Unify all transactions into MasterLedgerEntry[]
  const masterEntries: MasterLedgerEntry[] = [];

  // 1. Water Bill Payments (Credit - Income)
  payments.forEach((p) => {
    masterEntries.push({
      id: `LEDGER-PAY-${p.id}`,
      dateBS: p.dateBS,
      module: 'पानी महसुल',
      type: 'आम्दानी (Credit)',
      customerId: p.customerId,
      partyName: p.customerName,
      amount: p.paidAmount,
      referenceNo: p.receiptNo,
      description: `${p.monthBS} ${p.yearBS} महसुल भुक्तानी (धारा: ${p.tapNo}, खपत: ${p.unitsConsumed} युनिट)`,
      paymentMode: p.paymentMethod,
    });
  });

  // 2. Loan Disbursements (Debit - Capital Outflow)
  loans.forEach((l) => {
    masterEntries.push({
      id: `LEDGER-LOAN-${l.id}`,
      dateBS: l.issueDateBS,
      module: 'ऋण लगानी',
      type: 'खर्च (Debit)',
      customerId: l.customerId,
      partyName: l.customerName,
      amount: l.principalAmount,
      referenceNo: l.id,
      description: `ऋण लगानी प्रवाह (${l.purpose}, ब्याजदर ${l.interestRatePercent}%)`,
      paymentMode: 'बैंक / नगद',
    });
  });

  // 3. Loan Installments (Credit - Recovery & Interest)
  installments.forEach((inst) => {
    masterEntries.push({
      id: `LEDGER-LINST-${inst.id}`,
      dateBS: inst.dateBS,
      module: 'किस्ता असुली',
      type: 'आम्दानी (Credit)',
      customerId: inst.customerId,
      partyName: inst.customerName,
      amount: inst.totalPaid,
      referenceNo: inst.receiptNo,
      description: `ऋण किस्ता असुली (सावाँ रु ${inst.principalPaid} + ब्याज रु ${inst.interestPaid})`,
      paymentMode: inst.paymentMethod,
    });
  });

  // 4. Incomes (Credit)
  incomes.forEach((inc) => {
    masterEntries.push({
      id: `LEDGER-INC-${inc.id}`,
      dateBS: inc.dateBS,
      module: 'आम्दानी',
      type: 'आम्दानी (Credit)',
      partyName: inc.receivedFrom,
      amount: inc.amount,
      referenceNo: inc.receiptNo,
      description: `${inc.category}: ${inc.description}`,
      paymentMode: inc.paymentMode,
    });
  });

  // 5. Expenses (Debit)
  expenses.forEach((exp) => {
    masterEntries.push({
      id: `LEDGER-EXP-${exp.id}`,
      dateBS: exp.dateBS,
      module: 'खर्च',
      type: 'खर्च (Debit)',
      partyName: exp.paidTo,
      amount: exp.amount,
      referenceNo: exp.billVoucherNo,
      description: `${exp.category}: ${exp.description}`,
      paymentMode: exp.paymentMode,
    });
  });

  // 6. Tanker Sales (Credit)
  tankerSales.forEach((ts) => {
    masterEntries.push({
      id: `LEDGER-TS-${ts.id}`,
      dateBS: ts.dateBS,
      module: 'गाडी पानी बिक्री',
      type: 'आम्दानी (Credit)',
      partyName: ts.customerName,
      amount: ts.totalAmount,
      referenceNo: ts.receiptNo,
      description: `ट्याङ्कर पानी बिक्री (${toNepaliDigits(ts.liters)} लिटर, गाडी: ${ts.vehicleNo})`,
      paymentMode: 'नगद / भुक्तानी',
    });
  });

  // 7. Staff Payments (Debit)
  staffPayments.forEach((sp) => {
    masterEntries.push({
      id: `LEDGER-SPAY-${sp.id}`,
      dateBS: sp.dateBS,
      module: 'कर्मचारी तलब',
      type: 'खर्च (Debit)',
      partyName: sp.staffName,
      amount: sp.totalPaid,
      referenceNo: sp.receiptNo,
      description: `${sp.monthBS} ${sp.yearBS} तलब तथा सुविधा (ज्याला रु ${sp.tankerWage})`,
      paymentMode: 'बैंक / नगद',
    });
  });

  // Sort by dateBS descending
  masterEntries.sort((a, b) => (b.dateBS > a.dateBS ? 1 : -1));

  // Filter Master Ledger
  const filteredEntries = masterEntries.filter((entry) => {
    const matchesCustomer =
      selectedCustomerId === 'सबै' || entry.customerId === selectedCustomerId;
    const matchesModule = selectedModule === 'सबै' || entry.module === selectedModule;
    const matchesDate = entry.dateBS >= fromDateBS && entry.dateBS <= toDateBS;
    const matchesSearch =
      entry.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCustomer && matchesModule && matchesDate && matchesSearch;
  });

  const totalCredits = filteredEntries
    .filter((e) => e.type === 'आम्दानी (Credit)')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalDebits = filteredEntries
    .filter((e) => e.type === 'खर्च (Debit)')
    .reduce((sum, e) => sum + e.amount, 0);

  // CSV Export Handler
  const handleExportCsv = () => {
    const headers = 'मिति,मोड्युल,प्रकार,ग्राहक_पार्टी,रसिद_भौचर_नं,रकम,माध्यम,विवरण\n';
    const rows = filteredEntries
      .map(
        (e) =>
          `"${e.dateBS}","${e.module}","${e.type}","${e.partyName}","${e.referenceNo}","${e.amount}","${e.paymentMode}","${e.description}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `khanepani_master_ledger_${currentBsDate}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-700 p-3 text-white shadow-md shadow-blue-600/20">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                मेन डाटाबेस तथा केन्द्रीय खाता (Master Central Ledger)
              </h2>
              <p className="text-xs text-slate-500">
                सबै मोड्युलहरू (पानी महसुल, ऋण, किस्ता, पानी बिक्री, बैंक, आम्दानी र खर्च) को एकीकृत ३६०° विवरण
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>लेजर एक्सेल / CSV एक्सपोर्ट</span>
          </button>
        </div>

        {/* Aggregates Banner */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <span className="text-slate-500 block">कुल कारोबार प्रविष्टि संख्या:</span>
            <span className="font-mono text-xl font-bold text-slate-900">
              {toNepaliDigits(filteredEntries.length)} वटा
            </span>
          </div>

          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
            <span className="text-emerald-800 font-semibold block">कुल आम्दानी / दाखिला (Credit):</span>
            <span className="font-mono text-xl font-bold text-emerald-700">
              + {formatNepaliCurrency(totalCredits)}
            </span>
          </div>

          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3">
            <span className="text-rose-800 font-semibold block">कुल भुक्तानी / खर्च (Debit):</span>
            <span className="font-mono text-xl font-bold text-rose-700">
              - {formatNepaliCurrency(totalDebits)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Ledger Table & Multi-Filters */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Member-wise Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <User className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-slate-500 font-semibold">मेम्बरवाइज:</span>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden"
              >
                <option value="सबै">सबै सदस्य / ग्राहकहरू</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Module Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-500 font-semibold">मोड्युल:</span>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden"
              >
                <option value="सबै">सबै मोड्युलहरू</option>
                <option value="पानी महसुल">पानी महसुल</option>
                <option value="ऋण लगानी">ऋण लगानी</option>
                <option value="किस्ता असुली">किस्ता असुली</option>
                <option value="गाडी पानी बिक्री">गाडी पानी बिक्री</option>
                <option value="आम्दानी">आम्दानी</option>
                <option value="खर्च">खर्च</option>
                <option value="कर्मचारी तलब">कर्मचारी तलब</option>
              </select>
            </div>

            {/* Date Range */}
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
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="नाम, रसिद वा विवरण खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Master Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">मिति (वि.सं.)</th>
                <th className="p-3">मोड्युल</th>
                <th className="p-3">रसिद / भौचर नं</th>
                <th className="p-3">ग्राहक / पार्टीको नाम</th>
                <th className="p-3">कारोबार विवरण</th>
                <th className="p-3">माध्यम</th>
                <th className="p-3 text-right">आम्दानी (Credit)</th>
                <th className="p-3 text-right">खर्च (Debit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredEntries.map((e) => {
                const isCredit = e.type === 'आम्दानी (Credit)';
                return (
                  <tr key={e.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono text-slate-600">{toNepaliDigits(e.dateBS)}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                        {e.module}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-600">{e.referenceNo}</td>
                    <td className="p-3 font-bold text-slate-900">{e.partyName}</td>
                    <td className="p-3 text-slate-600 max-w-xs">{e.description}</td>
                    <td className="p-3 text-slate-500">{e.paymentMode}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      {isCredit ? formatNepaliCurrency(e.amount) : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-700">
                      {!isCredit ? formatNepaliCurrency(e.amount) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
