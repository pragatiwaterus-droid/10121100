import React, { useState } from 'react';
import { Staff, StaffPayment, TankerSale, OrganizationSettings } from '../types';
import {
  NEPALI_MONTHS,
  NEPALI_YEARS,
  formatNepaliCurrency,
  toNepaliDigits,
  numberToNepaliWords,
} from '../utils/nepaliUtils';
import {
  UserCheck,
  PlusCircle,
  Printer,
  Search,
  CheckCircle2,
  Calendar,
  Wallet,
  Truck,
  Award,
} from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  staffList: Staff[];
  staffPayments: StaffPayment[];
  tankerSales: TankerSale[];
  onAddStaff: (staff: Staff) => void;
  onAddPayment: (payment: StaffPayment) => void;
}

export const StaffView: React.FC<Props> = ({
  settings,
  staffList,
  staffPayments,
  tankerSales,
  onAddStaff,
  onAddPayment,
}) => {
  const currentBsDate = settings.currentSystemDateBS;

  const [activeTab, setActiveTab] = useState<'payroll' | 'pay_salary' | 'manage_staff'>('payroll');
  const [selectedYear, setSelectedYear] = useState<number>(2081);
  const [selectedMonth, setSelectedMonth] = useState<string>('असोज');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [printedPayment, setPrintedPayment] = useState<StaffPayment | null>(null);

  // New Staff Registration State
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newDesignation, setNewDesignation] = useState<string>('प्राविधिक');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newMonthlySalary, setNewMonthlySalary] = useState<number>(20000);
  const [newJoinedDateBS, setNewJoinedDateBS] = useState<string>(currentBsDate);

  // Salary Payment Form State
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || '');
  const [payDateBS, setPayDateBS] = useState<string>(currentBsDate);
  const [baseSalary, setBaseSalary] = useState<number>(staffList[0]?.monthlySalary || 20000);
  const [allowance, setAllowance] = useState<number>(1500); // सेवा सुविधा तथा भत्ता
  const [dressAllowance, setDressAllowance] = useState<number>(0); // पोशाक खर्च
  const [festivalBonus, setFestivalBonus] = useState<number>(0); // चाडपर्व खर्च
  const [remarks, setRemarks] = useState<string>('नियमित मासिक तलब तथा सुविधा भुक्तानी');

  // Selected staff member
  const currentStaff = staffList.find((s) => s.id === selectedStaffId);

  // When staff or month changes, update base salary and automatically calculate tanker wage for this staff in this month
  const calculateMonthTankerWage = (staffId: string, month: string, year: number): number => {
    // In our system, tanker sales dateBS has year and month (e.g. "2081-07-04" -> month index or string)
    // Map month string to 2-digit representation (e.g. बैशाख -> 01, असोज -> 06, कात्तिक -> 07)
    const monthIndex = NEPALI_MONTHS.indexOf(month as any) + 1;
    const monthPrefix = `${year}-${String(monthIndex).padStart(2, '0')}`;

    const monthSales = tankerSales.filter(
      (s) => s.driverStaffId === staffId && s.dateBS.startsWith(monthPrefix)
    );

    return monthSales.reduce((sum, s) => sum + s.driverWage, 0);
  };

  const calculatedTankerWage = calculateMonthTankerWage(selectedStaffId, selectedMonth, selectedYear);

  // When staff selection changes
  const handleStaffSelect = (staffId: string) => {
    setSelectedStaffId(staffId);
    const stf = staffList.find((s) => s.id === staffId);
    if (stf) {
      setBaseSalary(stf.monthlySalary);
    }
  };

  const totalPayable = baseSalary + allowance + dressAllowance + festivalBonus + calculatedTankerWage;

  // Handle Salary Submit
  const handleSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStaff) return;

    const receiptNo = `SAL-${selectedYear}-${String(NEPALI_MONTHS.indexOf(selectedMonth as any) + 1).padStart(2, '0')}-${currentStaff.id}`;

    const payment: StaffPayment = {
      id: `SPAY-${Date.now()}`,
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      designation: currentStaff.designation,
      yearBS: selectedYear,
      monthBS: selectedMonth,
      dateBS: payDateBS,
      baseSalary,
      allowance,
      dressAllowance,
      festivalBonus,
      tankerWage: calculatedTankerWage,
      totalPaid: totalPayable,
      receiptNo,
      remarks,
    };

    onAddPayment(payment);
    setSuccessMessage(`${currentStaff.name} को ${selectedMonth} महिनाको तलब भुक्तानी भौचर सुरक्षित भयो!`);
    setPrintedPayment(payment);
    setActiveTab('payroll');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Handle New Staff Submit
  const handleNewStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;

    const newStaff: Staff = {
      id: `STF-${String(staffList.length + 1).padStart(2, '0')}`,
      name: newStaffName,
      designation: newDesignation,
      phone: newPhone,
      monthlySalary: newMonthlySalary,
      joinedDateBS: newJoinedDateBS,
      status: 'active',
    };

    onAddStaff(newStaff);
    setSuccessMessage(`नयाँ कर्मचारी ${newStaffName} सफलतापूर्वक दर्ता भयो!`);
    setNewStaffName('');
    setNewPhone('');
    setActiveTab('payroll');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Filter staff payments by selected year and month
  const monthlyPayments = staffPayments.filter(
    (p) => p.yearBS === selectedYear && p.monthBS === selectedMonth
  );

  const totalMonthlyDisbursed = monthlyPayments.reduce((sum, p) => sum + p.totalPaid, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-md shadow-indigo-500/20">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                कर्मचारी तलब तथा ज्याला व्यवस्थापन
              </h2>
              <p className="text-xs text-slate-500">
                मासिक तलब, भत्ता, पोशाक, चाडपर्व खर्च र गाडी पानी बिक्रीको अटोमेटिक ज्याला विवरण
              </p>
            </div>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('payroll')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'payroll'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              मासिक पेरोल विवरण
            </button>
            <button
              onClick={() => setActiveTab('pay_salary')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'pay_salary'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + तलब भुक्तानी भौचर
            </button>
            <button
              onClick={() => setActiveTab('manage_staff')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'manage_staff'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              कर्मचारी सूची ({toNepaliDigits(staffList.length)})
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
      </div>

      {/* Tab 1: Monthly Payroll & Tanker Wage Aggregation */}
      {activeTab === 'payroll' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              मासिक तलब तथा गाडी पानी बिक्री ज्याला विवरण
            </h3>

            {/* Year & Month Selection */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-500 font-semibold">वर्ष:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent font-bold text-slate-800 focus:outline-hidden"
                >
                  {NEPALI_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {toNepaliDigits(y)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-500 font-semibold">महिना:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent font-bold text-indigo-700 focus:outline-hidden"
                >
                  {NEPALI_MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m} महिना
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Month Summary Card */}
          <div className="rounded-xl bg-indigo-50/70 p-4 border border-indigo-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
            <div>
              <span className="text-indigo-900 font-bold block text-sm">
                {selectedMonth} {toNepaliDigits(selectedYear)} को कुल कर्मचारी खर्च
              </span>
              <span className="text-slate-500">
                भुक्तानी भइसकेको भौचर संख्या: {toNepaliDigits(monthlyPayments.length)} जना
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-xl font-bold text-indigo-950">
                {formatNepaliCurrency(totalMonthlyDisbursed)}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">रसिद नं</th>
                  <th className="p-3">कर्मचारीको नाम</th>
                  <th className="p-3">पद</th>
                  <th className="p-3">भुक्तानी मिति</th>
                  <th className="p-3 text-right">आधारभूत तलब</th>
                  <th className="p-3 text-right">भत्ता / सुविधा</th>
                  <th className="p-3 text-right">पोशाक / चाडपर्व</th>
                  <th className="p-3 text-right bg-amber-50 font-bold text-amber-900">
                    गाडी पानी बिक्री ज्याला (Auto)
                  </th>
                  <th className="p-3 text-right font-bold text-indigo-950 bg-indigo-50/40">
                    कुल भुक्तानी
                  </th>
                  <th className="p-3 text-center">प्रिन्ट</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {monthlyPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-indigo-600">{p.receiptNo}</td>
                    <td className="p-3 font-bold text-slate-900">{p.staffName}</td>
                    <td className="p-3 text-slate-600">{p.designation}</td>
                    <td className="p-3 font-mono text-slate-500">{toNepaliDigits(p.dateBS)}</td>
                    <td className="p-3 text-right font-mono">{formatNepaliCurrency(p.baseSalary)}</td>
                    <td className="p-3 text-right font-mono">{formatNepaliCurrency(p.allowance)}</td>
                    <td className="p-3 text-right font-mono">
                      {formatNepaliCurrency(p.dressAllowance + p.festivalBonus)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-amber-800 bg-amber-50/30">
                      {formatNepaliCurrency(p.tankerWage)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-indigo-800 bg-indigo-50/20">
                      {formatNepaliCurrency(p.totalPaid)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setPrintedPayment(p)}
                        title="तलब स्लिप प्रिन्ट गर्नुहोस्"
                        className="rounded-lg p-1 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {monthlyPayments.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-slate-400">
                      यो महिनाको लागि कुनै तलब भुक्तानी रेकर्ड गरिएको छैन।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Pay Salary Form with Auto Tanker Wage Link */}
      {activeTab === 'pay_salary' && (
        <form
          onSubmit={handleSalarySubmit}
          className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 max-w-2xl"
        >
          <div className="border-b pb-3 border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">मासिक तलब तथा ज्याला भुक्तानी भौचर</h3>
            <p className="text-xs text-slate-500">
              महिना छान्दा त्यो महिनाभरिको गाडी पानी बिक्री ज्याला स्वतः हिसाब भई देखिन्छ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                कर्मचारी छान्नुहोस् <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => handleStaffSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
                required
              >
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.designation}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">वर्ष</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-hidden"
                >
                  {NEPALI_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {toNepaliDigits(y)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">महिना</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-indigo-700 focus:outline-hidden"
                >
                  {NEPALI_MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                इन्ट्री मिति (वि.सं.) <span className="text-indigo-600">(अटोमेटिक)</span>
              </label>
              <input
                type="text"
                value={payDateBS}
                onChange={(e) => setPayDateBS(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                आधारभूत तलब (Base Salary)
              </label>
              <input
                type="number"
                min={0}
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                सेवा सुविधा तथा भत्ता (Allowances)
              </label>
              <input
                type="number"
                min={0}
                value={allowance}
                onChange={(e) => setAllowance(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                पोशाक खर्च (Dress Allowance)
              </label>
              <input
                type="number"
                min={0}
                value={dressAllowance}
                onChange={(e) => setDressAllowance(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                चाडपर्व खर्च / बोनस (Dashain/Festival)
              </label>
              <input
                type="number"
                min={0}
                value={festivalBonus}
                onChange={(e) => setFestivalBonus(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            {/* Automatically Aggregated Tanker Wage */}
            <div>
              <label className="block text-xs font-semibold text-amber-900 mb-1 flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" />
                <span>गाडीमा पानी बिक्री गरेको ज्याला (महिनाभरिको अटो)</span>
              </label>
              <input
                type="number"
                value={calculatedTankerWage}
                readOnly
                className="w-full rounded-xl border border-amber-300 bg-amber-50 p-2 font-mono text-xs font-bold text-amber-950 cursor-not-allowed"
                title="यो महिनामा गाडी पानी बिक्रीबाट चालकले पाएको कुल ज्याला स्वतः जोडिएको छ"
              />
            </div>
          </div>

          {/* Total Payable Summary */}
          <div className="rounded-xl bg-indigo-50/70 p-4 border border-indigo-200 text-xs space-y-1">
            <div className="flex justify-between items-center text-sm font-bold text-indigo-950">
              <span>कुल भुक्तानी रकम (Total Salary & Wage):</span>
              <span className="font-mono text-base text-indigo-700">
                {formatNepaliCurrency(totalPayable)}
              </span>
            </div>
            <div className="text-slate-600 text-[11px] pt-1">
              रकम अक्षरमा: <strong>{numberToNepaliWords(totalPayable)}</strong>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('payroll')}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>तलब सेभ गरी स्लिप प्रिन्ट गर्नुहोस्</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Manage Staff Members */}
      {activeTab === 'manage_staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleNewStaffSubmit}
            className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4"
          >
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">नयाँ कर्मचारी थप्नुहोस्</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">कर्मचारीको नाम</label>
              <input
                type="text"
                placeholder="उदा. रामकुमार तामाङ"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">पद (Designation)</label>
              <input
                type="text"
                placeholder="उदा. प्लम्बर / ट्याङ्कर चालक"
                value={newDesignation}
                onChange={(e) => setNewDesignation(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">फोन नम्बर</label>
              <input
                type="text"
                placeholder="९८४१००००००"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">मासिक आधारभूत तलब (रु)</label>
              <input
                type="number"
                min={0}
                value={newMonthlySalary}
                onChange={(e) => setNewMonthlySalary(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition"
            >
              कर्मचारी दर्ता गर्नुहोस्
            </button>
          </form>

          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">संस्थाका कर्मचारीहरूको सूची</h3>
            <div className="space-y-3">
              {staffList.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                    <p className="text-xs text-indigo-700 font-semibold">{s.designation}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">सम्पर्क: {s.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">मासिक आधारभूत तलब</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {formatNepaliCurrency(s.monthlySalary)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Salary Slip Print Modal */}
      {printedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3 no-print">
              <span className="font-bold text-sm text-slate-800">तलब भुक्तानी स्लिप</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs"
                >
                  प्रिन्ट गर्नुहोस्
                </button>
                <button onClick={() => setPrintedPayment(null)} className="p-1 text-slate-400">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center border-b pb-3">
                <h3 className="font-bold text-base text-slate-900">{settings.orgName}</h3>
                <p className="text-xs text-slate-600">{settings.orgAddress}</p>
                <span className="mt-1 inline-block rounded-full bg-indigo-100 px-3 py-0.5 text-[11px] font-bold text-indigo-800">
                  मासिक तलब तथा ज्याला भुक्तानी भौचर
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 text-xs gap-1.5">
                <div>भौचर नं: <strong className="font-mono">{printedPayment.receiptNo}</strong></div>
                <div className="text-right">मिति: <strong className="font-mono">{toNepaliDigits(printedPayment.dateBS)}</strong></div>
                <div>कर्मचारी: <strong>{printedPayment.staffName}</strong></div>
                <div className="text-right">पद: <strong>{printedPayment.designation}</strong></div>
                <div>महिना: <strong>{printedPayment.monthBS} {toNepaliDigits(printedPayment.yearBS)}</strong></div>
              </div>
              <div className="mt-3 divide-y divide-slate-100 border border-slate-200 rounded-lg text-xs">
                <div className="p-2 flex justify-between">
                  <span>आधारभूत तलब:</span>
                  <span className="font-mono">{formatNepaliCurrency(printedPayment.baseSalary)}</span>
                </div>
                <div className="p-2 flex justify-between">
                  <span>सेवा सुविधा तथा भत्ता:</span>
                  <span className="font-mono">{formatNepaliCurrency(printedPayment.allowance)}</span>
                </div>
                {printedPayment.dressAllowance > 0 && (
                  <div className="p-2 flex justify-between">
                    <span>पोशाक खर्च:</span>
                    <span className="font-mono">{formatNepaliCurrency(printedPayment.dressAllowance)}</span>
                  </div>
                )}
                {printedPayment.festivalBonus > 0 && (
                  <div className="p-2 flex justify-between">
                    <span>चाडपर्व खर्च / बोनस:</span>
                    <span className="font-mono">{formatNepaliCurrency(printedPayment.festivalBonus)}</span>
                  </div>
                )}
                {printedPayment.tankerWage > 0 && (
                  <div className="p-2 flex justify-between text-amber-800 font-bold bg-amber-50/50">
                    <span>गाडी पानी बिक्री ज्याला:</span>
                    <span className="font-mono">{formatNepaliCurrency(printedPayment.tankerWage)}</span>
                  </div>
                )}
                <div className="p-2.5 flex justify-between font-bold text-indigo-900 bg-indigo-50/70 border-t border-indigo-200">
                  <span>कुल भुक्तानी रकम:</span>
                  <span className="font-mono text-sm">{formatNepaliCurrency(printedPayment.totalPaid)}</span>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                रकम अक्षरमा: <strong>{numberToNepaliWords(printedPayment.totalPaid)}</strong>
              </div>
              <div className="mt-8 flex justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-300">
                <div>बुझिलिने कर्मचारीको सही</div>
                <div>स्वीकृत गर्ने (अध्यक्ष/व्यवस्थापक)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
