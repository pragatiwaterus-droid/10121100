import React, { useState } from 'react';
import {
  Loan,
  LoanInstallment,
  Customer,
  OrganizationSettings,
} from '../types';
import {
  formatNepaliCurrency,
  toNepaliDigits,
  numberToNepaliWords,
  calculateSimpleInterest,
  calculateBsDaysDiff,
} from '../utils/nepaliUtils';
import {
  HandCoins,
  PlusCircle,
  Receipt,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  FileText,
  User,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  loans: Loan[];
  installments: LoanInstallment[];
  customers: Customer[];
  onAddLoan: (loan: Loan) => void;
  onAddInstallment: (installment: LoanInstallment, updatedLoan: Loan) => void;
  onPrintInstallmentReceipt: (installment: LoanInstallment) => void;
  onOpenOverdueModal: () => void;
}

export const LoanView: React.FC<Props> = ({
  settings,
  loans,
  installments,
  customers,
  onAddLoan,
  onAddInstallment,
  onPrintInstallmentReceipt,
  onOpenOverdueModal,
}) => {
  const currentBsDate = settings.currentSystemDateBS;

  const [activeTab, setActiveTab] = useState<'statement' | 'disburse' | 'installment'>('statement');
  const [selectedCustomerIdForStatement, setSelectedCustomerIdForStatement] = useState<string>('सबै');
  const [fromDateBS, setFromDateBS] = useState<string>('2080-01-01');
  const [toDateBS, setToDateBS] = useState<string>(currentBsDate);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Disbursement Form State
  const [disburseCustomerId, setDisburseCustomerId] = useState<string>(customers[0]?.id || '');
  const [principalAmount, setPrincipalAmount] = useState<number>(50000);
  const [interestRatePercent, setInterestRatePercent] = useState<number>(
    settings.loanSettings.annualInterestRatePercent || 12
  );
  const [issueDateBS, setIssueDateBS] = useState<string>(currentBsDate);
  const [maturityDateBS, setMaturityDateBS] = useState<string>('2082-07-22');
  const [purpose, setPurpose] = useState<string>('खानेपानी पाइप तथा सरसफाइ पूर्वाधार निर्माण');
  const [collateral, setCollateral] = useState<string>('जग्गाधनी प्रमाणपुर्जा तथा व्यक्तिगत जमानी');

  // Installment Collection Form State
  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    loans.find((l) => l.remainingPrincipal > 0)?.id || ''
  );
  const [installmentDateBS, setInstallmentDateBS] = useState<string>(currentBsDate);
  const [paidPrincipal, setPaidPrincipal] = useState<number>(10000);
  const [autoInterest, setAutoInterest] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'नगद (Cash)' | 'बैंक / QR' | 'चेक'>('नगद (Cash)');
  const [installmentRemarks, setInstallmentRemarks] = useState<string>('किस्ता तथा ब्याज भुक्तानी');

  const selectedLoan = loans.find((l) => l.id === selectedLoanId);

  // Auto calculate interest whenever selected loan or installment date changes
  React.useEffect(() => {
    if (selectedLoan) {
      // Find last installment date or issue date
      const loanInsts = installments.filter((i) => i.loanId === selectedLoan.id);
      const lastDate =
        loanInsts.length > 0 ? loanInsts[loanInsts.length - 1].dateBS : selectedLoan.issueDateBS;

      const calculated = calculateSimpleInterest(
        selectedLoan.remainingPrincipal,
        selectedLoan.interestRatePercent,
        lastDate,
        installmentDateBS
      );
      setAutoInterest(calculated);
    }
  }, [selectedLoan, installmentDateBS, installments]);

  // Next Loan and Receipt Numbers
  const nextLoanId = `LOAN-2081-${String(loans.length + 1).padStart(3, '0')}`;
  const nextInstallmentReceiptNo = `LRCP-2081-${String(installments.length + 1).padStart(4, '0')}`;

  // Handle Loan Disbursement Submission
  const handleDisburseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === disburseCustomerId);
    if (!cust || principalAmount <= 0) return;

    const newLoan: Loan = {
      id: nextLoanId,
      customerId: cust.id,
      customerName: cust.fullName,
      phone: cust.phone,
      principalAmount: principalAmount,
      interestRatePercent: interestRatePercent,
      issueDateBS: issueDateBS,
      maturityDateBS: maturityDateBS,
      purpose: purpose,
      collateral: collateral,
      repaidPrincipal: 0,
      totalInterestPaid: 0,
      remainingPrincipal: principalAmount,
      status: 'active',
      notes: 'समितिको निर्णयानुसार स्वीकृत ऋण लगानी',
    };

    onAddLoan(newLoan);
    setSuccessMessage(`ऋण खाता ${newLoan.id} (${cust.fullName}) सफलतापूर्वक लगानी गरियो!`);
    setActiveTab('statement');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Handle Installment Collection Submission
  const handleInstallmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || (paidPrincipal <= 0 && autoInterest <= 0)) return;

    const totalPaid = paidPrincipal + autoInterest;
    const remainingAfter = Math.max(0, selectedLoan.remainingPrincipal - paidPrincipal);

    const newInst: LoanInstallment = {
      id: `LINST-${Date.now()}`,
      receiptNo: nextInstallmentReceiptNo,
      loanId: selectedLoan.id,
      customerId: selectedLoan.customerId,
      customerName: selectedLoan.customerName,
      dateBS: installmentDateBS,
      principalPaid: paidPrincipal,
      interestPaid: autoInterest,
      totalPaid: totalPaid,
      remainingPrincipalAfter: remainingAfter,
      paymentMethod: paymentMethod,
      amountInWordsNepali: numberToNepaliWords(totalPaid),
      collectedBy: settings.authorizedPersonName || 'अधिकृत कर्मचारी',
      remarks: installmentRemarks,
    };

    const updatedLoan: Loan = {
      ...selectedLoan,
      repaidPrincipal: selectedLoan.repaidPrincipal + paidPrincipal,
      totalInterestPaid: selectedLoan.totalInterestPaid + autoInterest,
      remainingPrincipal: remainingAfter,
      status: remainingAfter === 0 ? 'closed' : selectedLoan.status,
    };

    onAddInstallment(newInst, updatedLoan);
    setSuccessMessage(`किस्ता रसिद नं. ${newInst.receiptNo} जारी भयो!`);
    onPrintInstallmentReceipt(newInst);
    setActiveTab('statement');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Summary Metrics
  const totalPrincipalInvested = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalPrincipalRecovered = loans.reduce((sum, l) => sum + l.repaidPrincipal, 0);
  const totalPrincipalRemaining = loans.reduce((sum, l) => sum + l.remainingPrincipal, 0);
  const totalInterestEarned = loans.reduce((sum, l) => sum + l.totalInterestPaid, 0);
  const overdueLoansList = loans.filter(
    (l) => l.remainingPrincipal > 0 && (l.maturityDateBS < currentBsDate || l.status === 'overdue')
  );

  // Filtered Loans for Statement
  const filteredLoans = loans.filter((l) => {
    const matchesCustomer =
      selectedCustomerIdForStatement === 'सबै' || l.customerId === selectedCustomerIdForStatement;
    const matchesSearch =
      l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm);
    return matchesCustomer && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-md shadow-indigo-500/20">
              <HandCoins className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  ऋण लगानी तथा किस्ता व्यवस्थापन
                </h2>
                {overdueLoansList.length > 0 && (
                  <button
                    onClick={onOpenOverdueModal}
                    className="rounded-full bg-rose-100 text-rose-700 text-xs px-2.5 py-0.5 font-bold border border-rose-300 flex items-center gap-1 hover:bg-rose-200 transition"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>{toNepaliDigits(overdueLoansList.length)} भाखा नाघेको</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500">
                ऋण लगानी, अटो ब्याज जेनेरेट सहित किस्ता असुली, रसिद प्रिन्ट र मेम्बरवाइज स्टेटमेन्ट
              </p>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('statement')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'statement'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ऋण स्टेटमेन्ट ({toNepaliDigits(loans.length)})
            </button>
            <button
              onClick={() => setActiveTab('disburse')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'disburse'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + नयाँ ऋण लगानी
            </button>
            <button
              onClick={() => setActiveTab('installment')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'installment'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              किस्ता असुली (रसिद प्रिन्ट)
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

        {/* Portfolio Summary Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="rounded-xl bg-indigo-50/60 p-3 border border-indigo-100">
            <span className="text-slate-500 block">ऋणी सदस्य संख्या:</span>
            <span className="text-base font-bold text-indigo-900 font-mono">
              {toNepaliDigits(loans.length)} जना
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
            <span className="text-slate-500 block">कुल ऋण लगानी:</span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {formatNepaliCurrency(totalPrincipalInvested)}
            </span>
          </div>
          <div className="rounded-xl bg-emerald-50/60 p-3 border border-emerald-100">
            <span className="text-slate-500 block">कुल सावाँ असुली:</span>
            <span className="text-base font-bold text-emerald-800 font-mono">
              {formatNepaliCurrency(totalPrincipalRecovered)}
            </span>
          </div>
          <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-100">
            <span className="text-slate-500 block">कुल बाँकी सावाँ:</span>
            <span className="text-base font-bold text-amber-900 font-mono">
              {formatNepaliCurrency(totalPrincipalRemaining)}
            </span>
          </div>
          <div className="rounded-xl bg-blue-50/60 p-3 border border-blue-100 col-span-2 sm:col-span-1">
            <span className="text-slate-500 block">प्राप्त कुल ब्याज:</span>
            <span className="text-base font-bold text-blue-900 font-mono">
              {formatNepaliCurrency(totalInterestEarned)}
            </span>
          </div>
        </div>
      </div>

      {/* View 1: Loan Portfolio & Member-wise Statement */}
      {activeTab === 'statement' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              मेम्बरवाइज तथा मिति अनुसार ऋण स्टेटमेन्ट
            </h3>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Member select */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-slate-500 font-semibold">ऋणी सदस्य:</span>
                <select
                  value={selectedCustomerIdForStatement}
                  onChange={(e) => setSelectedCustomerIdForStatement(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden"
                >
                  <option value="सबै">सबै सदस्यहरू</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filters */}
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
                  placeholder="ऋणीको नाम वा खाता खोज्नुहोस्..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Loans Statement Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">ऋण खाता नं</th>
                  <th className="p-3">सदस्यको नाम</th>
                  <th className="p-3">लगानी मिति</th>
                  <th className="p-3">म्याद मिति</th>
                  <th className="p-3 text-right">कुल लगानी</th>
                  <th className="p-3 text-center">ब्याजदर</th>
                  <th className="p-3 text-right">फिर्ता सावाँ</th>
                  <th className="p-3 text-right">प्राप्त ब्याज</th>
                  <th className="p-3 text-right font-bold text-indigo-900 bg-indigo-50/40">
                    बाँकी सावाँ
                  </th>
                  <th className="p-3 text-center">स्थिति</th>
                  <th className="p-3 text-center">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLoans.map((l) => {
                  const isOverdue =
                    l.remainingPrincipal > 0 &&
                    (l.maturityDateBS < currentBsDate || l.status === 'overdue');

                  return (
                    <tr key={l.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-700">{l.id}</td>
                      <td className="p-3 font-bold text-slate-900">
                        {l.customerName}
                        <span className="block text-[10px] text-slate-400 font-mono">{l.phone}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{toNepaliDigits(l.issueDateBS)}</td>
                      <td className="p-3 font-mono text-slate-600">
                        {toNepaliDigits(l.maturityDateBS)}
                        {isOverdue && (
                          <span className="block text-[10px] text-rose-600 font-bold">म्याद सकियो</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {formatNepaliCurrency(l.principalAmount)}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-700">
                        {toNepaliDigits(l.interestRatePercent)}%
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-700 font-semibold">
                        {formatNepaliCurrency(l.repaidPrincipal)}
                      </td>
                      <td className="p-3 text-right font-mono text-blue-700 font-semibold">
                        {formatNepaliCurrency(l.totalInterestPaid)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-indigo-950 bg-indigo-50/20">
                        {formatNepaliCurrency(l.remainingPrincipal)}
                      </td>
                      <td className="p-3 text-center">
                        {isOverdue ? (
                          <span className="rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-[10px] font-bold">
                            भाखा नाघेको
                          </span>
                        ) : l.remainingPrincipal === 0 ? (
                          <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                            चुक्ता
                          </span>
                        ) : (
                          <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                            सक्रिय
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedLoanId(l.id);
                            setActiveTab('installment');
                          }}
                          className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          किस्ता लिनुहोस्
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Recent Installments Table */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              पछिल्लो किस्ता तथा ब्याज भुक्तानी रसिदहरू (Installment Receipts)
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">रसिद नं</th>
                    <th className="p-2.5">ऋणी सदस्य</th>
                    <th className="p-2.5">मिति (वि.सं.)</th>
                    <th className="p-2.5 text-right">बुझाएको सावाँ</th>
                    <th className="p-2.5 text-right">बुझाएको ब्याज</th>
                    <th className="p-2.5 text-right font-bold text-indigo-900">कुल भुक्तानी</th>
                    <th className="p-2.5 text-right">बाँकी सावाँ</th>
                    <th className="p-2.5 text-center">प्रिन्ट</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {installments.slice(0, 8).map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-indigo-600">{inst.receiptNo}</td>
                      <td className="p-2.5 font-bold text-slate-900">{inst.customerName}</td>
                      <td className="p-2.5 font-mono text-slate-500">{toNepaliDigits(inst.dateBS)}</td>
                      <td className="p-2.5 text-right font-mono">{formatNepaliCurrency(inst.principalPaid)}</td>
                      <td className="p-2.5 text-right font-mono text-blue-600">
                        {formatNepaliCurrency(inst.interestPaid)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-indigo-700">
                        {formatNepaliCurrency(inst.totalPaid)}
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-700">
                        {formatNepaliCurrency(inst.remainingPrincipalAfter)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => onPrintInstallmentReceipt(inst)}
                          title="किस्ता रसिद प्रिन्ट गर्नुहोस्"
                          className="rounded-lg p-1 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Loan Disbursement Form */}
      {activeTab === 'disburse' && (
        <form
          onSubmit={handleDisburseSubmit}
          className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 max-w-3xl"
        >
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">नयाँ ऋण लगानी प्रविष्टि (New Loan Disbursement)</h3>
            <span className="text-xs font-mono font-bold text-indigo-700">खाता: {nextLoanId}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ऋणी सदस्य छान्नुहोस् <span className="text-rose-500">*</span>
              </label>
              <select
                value={disburseCustomerId}
                onChange={(e) => setDisburseCustomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} - {c.tapNo} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ऋण लगानी रकम (रु) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1000}
                step={500}
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-base font-bold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ब्याजदर (% वार्षिक)
              </label>
              <input
                type="number"
                min={1}
                max={36}
                value={interestRatePercent}
                onChange={(e) => setInterestRatePercent(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                लगानी मिति (वि.सं.) <span className="text-indigo-600">(अटोमेटिक)</span>
              </label>
              <input
                type="text"
                value={issueDateBS}
                onChange={(e) => setIssueDateBS(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                म्याद सकिने मिति (वि.सं.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={maturityDateBS}
                onChange={(e) => setMaturityDateBS(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ऋणको उद्देश्य</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">धितो / जमानी विवरण</label>
              <input
                type="text"
                value={collateral}
                onChange={(e) => setCollateral(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="rounded-xl bg-indigo-50/70 p-3 text-xs text-indigo-900 border border-indigo-200">
            <strong>रकम अक्षरमा: </strong>
            <span className="font-semibold">{numberToNepaliWords(principalAmount)}</span>
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
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>ऋण लगानी सेभ गर्नुहोस्</span>
            </button>
          </div>
        </form>
      )}

      {/* View 3: Installment Collection & Auto Interest */}
      {activeTab === 'installment' && (
        <form
          onSubmit={handleInstallmentSubmit}
          className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 max-w-3xl"
        >
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              ऋण किस्ता तथा ब्याज असुली (Installment Collection)
            </h3>
            <span className="text-xs font-mono font-bold text-indigo-700">
              अटो रसिद: {nextInstallmentReceiptNo}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ऋणी खाता छान्नुहोस् <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                required
              >
                {loans
                  .filter((l) => l.remainingPrincipal > 0)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.customerName} - {l.id} (बाँकी सावाँ: रु {l.remainingPrincipal.toLocaleString()})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                भुक्तानी मिति (वि.सं.) <span className="text-indigo-600">(अटोमेटिक)</span>
              </label>
              <input
                type="text"
                value={installmentDateBS}
                onChange={(e) => setInstallmentDateBS(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Current Loan Snapshot */}
          {selectedLoan && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-500">कुल स्वीकृत लगानी:</span>
                <span className="font-mono font-bold block">{formatNepaliCurrency(selectedLoan.principalAmount)}</span>
              </div>
              <div>
                <span className="text-slate-500">हाल बाँकी सावाँ:</span>
                <span className="font-mono font-bold text-indigo-700 block">
                  {formatNepaliCurrency(selectedLoan.remainingPrincipal)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">वार्षिक ब्याजदर:</span>
                <span className="font-mono font-bold block">{selectedLoan.interestRatePercent}%</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                बुझाउने सावाँ रकम (Principal Repaid)
              </label>
              <input
                type="number"
                min={0}
                max={selectedLoan?.remainingPrincipal || 1000000}
                value={paidPrincipal}
                onChange={(e) => setPaidPrincipal(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-base font-bold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                अटोमेटिक जेनेरेट ब्याज (Auto Calculated Interest)
              </label>
              <input
                type="number"
                min={0}
                value={autoInterest}
                onChange={(e) => setAutoInterest(Number(e.target.value))}
                className="w-full rounded-xl border border-indigo-300 bg-indigo-50/50 p-2 font-mono text-base font-bold text-indigo-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">भुक्तानी माध्यम</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="नगद (Cash)">नगद (Cash)</option>
                <option value="बैंक / QR">बैंक / QR</option>
                <option value="चेक">चेक</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">कैफियत</label>
              <input
                type="text"
                value={installmentRemarks}
                onChange={(e) => setInstallmentRemarks(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* In Words & Total Paid */}
          <div className="rounded-xl bg-indigo-50/70 p-3 text-xs border border-indigo-200 text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold">जम्मा बुझाउने रकम: </span>
              <span className="font-mono font-bold text-base text-indigo-700">
                {formatNepaliCurrency(paidPrincipal + autoInterest)}
              </span>
            </div>
            <div>
              <span className="font-bold">रकम अक्षरमा: </span>
              <span className="font-medium underline decoration-indigo-300">
                {numberToNepaliWords(paidPrincipal + autoInterest)}
              </span>
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
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>किस्ता बुझी रसिद प्रिन्ट गर्नुहोस्</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
