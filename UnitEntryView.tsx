import React, { useState, useEffect } from 'react';
import { Customer, MeterReading, OrganizationSettings } from '../types';
import {
  NEPALI_MONTHS,
  NEPALI_YEARS,
  toNepaliDigits,
  calculateWaterBill,
  formatNepaliCurrency,
  generateBillWhatsAppText,
  createWhatsAppUrl,
} from '../utils/nepaliUtils';
import {
  Gauge,
  Save,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Send,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  readings: MeterReading[];
  onSaveReadings: (newReadings: MeterReading[], updatedCustomers: Customer[]) => void;
}

interface RowState {
  customerId: string;
  customerName: string;
  tapNo: string;
  phone: string;
  prevReading: number;
  currReading: number | '';
  consumedUnits: number;
  baseAmount: number;
  fineAmount: number;
  discountAmount: number;
  totalBillAmount: number;
  isExisting: boolean;
  readingId?: string;
  isPaid: boolean;
}

export const UnitEntryView: React.FC<Props> = ({
  settings,
  customers,
  readings,
  onSaveReadings,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2081);
  const [selectedMonth, setSelectedMonth] = useState<string>('कात्तिक');
  const [entryDateBS, setEntryDateBS] = useState<string>(settings.currentSystemDateBS);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('सबै');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Bulk WhatsApp queue state
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<boolean>(false);
  const [currentSendIndex, setCurrentSendIndex] = useState<number>(0);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState<boolean>(false);

  // Active Tariff Rates
  const { minAmount, minUnits, extraRatePerUnit } = settings.waterTariff;

  // Build grid data for selected year and month
  const [rows, setRows] = useState<RowState[]>([]);

  useEffect(() => {
    // Populate rows based on active customers and existing readings
    const newRows: RowState[] = customers.map((c) => {
      const existing = readings.find(
        (r) => r.customerId === c.id && r.yearBS === selectedYear && r.monthBS === selectedMonth
      );

      if (existing) {
        return {
          customerId: c.id,
          customerName: c.fullName,
          tapNo: c.tapNo,
          phone: c.phone,
          prevReading: existing.prevReading,
          currReading: existing.currReading,
          consumedUnits: existing.consumedUnits,
          baseAmount: existing.baseAmount,
          fineAmount: existing.fineAmount,
          discountAmount: existing.discountAmount,
          totalBillAmount: existing.totalBillAmount,
          isExisting: true,
          readingId: existing.id,
          isPaid: existing.paidStatus === 'paid',
        };
      }

      // Default new entry
      const prev = c.previousReading || 0;
      return {
        customerId: c.id,
        customerName: c.fullName,
        tapNo: c.tapNo,
        phone: c.phone,
        prevReading: prev,
        currReading: '',
        consumedUnits: 0,
        baseAmount: minAmount,
        fineAmount: 0,
        discountAmount: 0,
        totalBillAmount: minAmount,
        isExisting: false,
        isPaid: false,
      };
    });

    setRows(newRows);
  }, [selectedYear, selectedMonth, customers, readings, minAmount, minUnits, extraRatePerUnit]);

  // Handle current reading change
  const handleCurrentReadingChange = (customerId: string, valStr: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.customerId !== customerId) return r;
        if (valStr === '') {
          return {
            ...r,
            currReading: '',
            consumedUnits: 0,
            baseAmount: minAmount,
            totalBillAmount: minAmount,
          };
        }

        const curr = Number(valStr);
        const consumed = Math.max(0, curr - r.prevReading);
        const bill = calculateWaterBill(consumed, minAmount, minUnits, extraRatePerUnit);
        const net = Math.max(0, bill + r.fineAmount - r.discountAmount);

        return {
          ...r,
          currReading: curr,
          consumedUnits: consumed,
          baseAmount: bill,
          totalBillAmount: net,
        };
      })
    );
  };

  // Handle Fine change
  const handleFineChange = (customerId: string, fineVal: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.customerId !== customerId) return r;
        const net = Math.max(0, r.baseAmount + fineVal - r.discountAmount);
        return {
          ...r,
          fineAmount: fineVal,
          totalBillAmount: net,
        };
      })
    );
  };

  // Save all readings
  const handleSaveAll = () => {
    const readingsToSave: MeterReading[] = [];
    const updatedCustomerList: Customer[] = [...customers];

    rows.forEach((r) => {
      if (r.currReading === '' && !r.isExisting) {
        return; // Skip blank unentered rows
      }

      const curr = r.currReading === '' ? r.prevReading : Number(r.currReading);

      const readingObj: MeterReading = {
        id: r.readingId || `MR-${selectedYear}-${selectedMonth}-${r.customerId}`,
        customerId: r.customerId,
        customerName: r.customerName,
        tapNo: r.tapNo,
        phone: r.phone,
        yearBS: selectedYear,
        monthBS: selectedMonth,
        entryDateBS: entryDateBS,
        prevReading: r.prevReading,
        currReading: curr,
        consumedUnits: r.consumedUnits,
        baseAmount: r.baseAmount,
        fineAmount: r.fineAmount,
        discountAmount: r.discountAmount,
        totalBillAmount: r.totalBillAmount,
        paidStatus: r.isPaid ? 'paid' : 'unpaid',
        paidAmount: r.isPaid ? r.totalBillAmount : 0,
      };

      readingsToSave.push(readingObj);

      // Update customer's previousReading
      const cIndex = updatedCustomerList.findIndex((c) => c.id === r.customerId);
      if (cIndex !== -1 && curr > updatedCustomerList[cIndex].previousReading) {
        updatedCustomerList[cIndex] = {
          ...updatedCustomerList[cIndex],
          previousReading: curr,
        };
      }
    });

    onSaveReadings(readingsToSave, updatedCustomerList);
    setSuccessMessage(`${selectedMonth} महिनाको बल्क युनिट इन्ट्री सफलतापूर्वक सुरक्षित भयो!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Filter rows
  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tapNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm);

    if (selectedWard === 'सबै') return matchesSearch;
    const cust = customers.find((c) => c.id === r.customerId);
    return matchesSearch && cust?.wardNo === selectedWard;
  });

  const totalUnitsEntered = rows.reduce((sum, r) => sum + r.consumedUnits, 0);
  const totalAmountCalculated = rows.reduce((sum, r) => sum + r.totalBillAmount, 0);

  // Single WhatsApp Send
  const handleSendSingleWhatsApp = (row: RowState) => {
    const text = generateBillWhatsAppText(
      settings.orgName,
      row.customerName,
      row.tapNo,
      selectedMonth,
      selectedYear,
      row.prevReading,
      row.currReading === '' ? row.prevReading : Number(row.currReading),
      row.consumedUnits,
      row.baseAmount,
      row.fineAmount,
      row.totalBillAmount,
      row.phone
    );
    const url = createWhatsAppUrl(row.phone, text);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Month Selection Bar */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                बल्क युनिट इन्ट्री (Monthly Bulk Meter Reading)
              </h2>
              <p className="text-xs text-slate-500">
                महिना छान्नुहोस् र ग्राहकहरूको हालको मिटर अङ्क इन्ट्री गरी एकैपटक सेभ र WhatsApp सूचना पठाउनुहोस्
              </p>
            </div>
          </div>

          {/* Controls: Year, Month, Entry Date */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Year */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-slate-500 font-semibold">वर्ष:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden"
              >
                {NEPALI_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {toNepaliDigits(y)}
                  </option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-slate-500 font-semibold">महिना:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-blue-700 focus:outline-hidden"
              >
                {NEPALI_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m} महिना
                  </option>
                ))}
              </select>
            </div>

            {/* Entry Date BS (Auto filled, editable) */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs text-slate-500 font-semibold">इन्ट्री मिति:</span>
              <input
                type="text"
                value={entryDateBS}
                onChange={(e) => setEntryDateBS(e.target.value)}
                className="w-24 bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-hidden"
                title="इन्ट्री मिति सच्याउन यहाँ लेख्नुहोस्"
              />
            </div>

            {/* Save All Button */}
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <Save className="h-4 w-4" />
              <span>बल्क सेभ गर्नुहोस्</span>
            </button>

            {/* Bulk WhatsApp Trigger Button */}
            <button
              onClick={() => setWhatsAppModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp बल्क सूचना</span>
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

        {/* Current Active Tariff Summary Banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between rounded-xl bg-blue-50/60 p-3 text-xs border border-blue-100 text-blue-900">
          <div>
            <span className="font-semibold">लागु महसुल दर:</span> न्यूनतम रु {minAmount} (पहिलो {minUnits} युनिटसम्म), त्यसपछि प्रति युनिट रु {extraRatePerUnit} थप।
          </div>
          <div className="flex gap-4 font-mono font-bold">
            <span>कुल खपत: {toNepaliDigits(totalUnitsEntered)} युनिट</span>
            <span>कुल महसुल रकम: {formatNepaliCurrency(totalAmountCalculated)}</span>
          </div>
        </div>
      </div>

      {/* Table Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ग्राहक नाम, धारा नं, वा फोन खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>देखाउन खोजिएको: </span>
          <span className="font-bold text-slate-800 font-mono">{toNepaliDigits(filteredRows.length)} जना</span>
        </div>
      </div>

      {/* Bulk Reading Entry Table */}
      <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3 w-12 text-center">क्र.सं.</th>
              <th className="p-3">ग्राहक आइडी</th>
              <th className="p-3">धारा नं</th>
              <th className="p-3">ग्राहकको नाम</th>
              <th className="p-3">फोन नं</th>
              <th className="p-3 text-right bg-blue-50/50">साविक अङ्क</th>
              <th className="p-3 text-center bg-blue-100/70 text-blue-900 w-32">
                हालको अङ्क (इन्ट्री)
              </th>
              <th className="p-3 text-center bg-slate-100">खपत युनिट</th>
              <th className="p-3 text-right">महसुल (रु)</th>
              <th className="p-3 text-right w-24">जरिवाना</th>
              <th className="p-3 text-right font-bold text-blue-900 bg-blue-50/30">कुल रकम</th>
              <th className="p-3 text-center">स्थिति</th>
              <th className="p-3 text-center">कार्य</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRows.map((row, idx) => (
              <tr key={row.customerId} className="hover:bg-slate-50/80 transition">
                <td className="p-3 text-center font-mono text-slate-400">
                  {toNepaliDigits(idx + 1)}
                </td>
                <td className="p-3 font-mono font-medium text-slate-600">
                  {row.customerId}
                </td>
                <td className="p-3 font-semibold text-slate-900">
                  {row.tapNo}
                </td>
                <td className="p-3 font-bold text-slate-900">
                  {row.customerName}
                </td>
                <td className="p-3 font-mono text-slate-500">
                  {row.phone}
                </td>
                <td className="p-3 text-right font-mono font-bold text-slate-700 bg-blue-50/30">
                  {row.prevReading}
                </td>

                {/* Current Reading Input Field */}
                <td className="p-2 text-center bg-blue-50/60">
                  <input
                    type="number"
                    min={row.prevReading}
                    placeholder={`${row.prevReading}`}
                    value={row.currReading}
                    onChange={(e) => handleCurrentReadingChange(row.customerId, e.target.value)}
                    className="w-24 rounded-lg border border-blue-300 bg-white px-2 py-1.5 text-center font-mono text-xs font-bold text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </td>

                {/* Consumed Units Auto */}
                <td className="p-3 text-center font-mono font-bold text-slate-800 bg-slate-50">
                  {toNepaliDigits(row.consumedUnits)}
                </td>

                {/* Base Amount */}
                <td className="p-3 text-right font-mono text-slate-700">
                  {formatNepaliCurrency(row.baseAmount, false)}
                </td>

                {/* Fine Input */}
                <td className="p-2 text-right">
                  <input
                    type="number"
                    min={0}
                    value={row.fineAmount}
                    onChange={(e) => handleFineChange(row.customerId, Number(e.target.value))}
                    className="w-16 rounded-md border border-slate-200 px-1 py-1 text-right font-mono text-xs text-rose-600 focus:outline-hidden"
                  />
                </td>

                {/* Total Bill Amount */}
                <td className="p-3 text-right font-mono font-bold text-blue-700 bg-blue-50/30">
                  {formatNepaliCurrency(row.totalBillAmount)}
                </td>

                {/* Paid Status */}
                <td className="p-3 text-center">
                  {row.isPaid ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      चुक्ता
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      बाँकी
                    </span>
                  )}
                </td>

                {/* WhatsApp Action per customer */}
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleSendSingleWhatsApp(row)}
                    title="यो ग्राहकलाई व्यक्तिगत WhatsApp सन्देश पठाउनुहोस्"
                    className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WhatsApp Bulk Dispatch Modal with Anti-Ban Protection */}
      {whatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-6 py-4">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <span>सुरक्षित WhatsApp बल्क मेसेज प्रणाली (Anti-Block System)</span>
              </div>
              <button
                onClick={() => setWhatsAppModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
                <strong>WhatsApp ब्लक नहुने सुरक्षा प्रविधि:</strong> मेटा (WhatsApp) ले एकै सेकेन्डमा सयौँ मेसेज पठाउँदा नम्बर ब्लक गर्न सक्छ। त्यसैले हाम्रो प्रणालीले २ तरिका प्रदान गर्दछ:
                <ul className="list-disc pl-4 mt-1.5 space-y-1">
                  <li><strong>तरिका १ (सिफारिस):</strong> तलको सूचीबाट १-क्लिकमा पालैपालो सुरक्षित तवरले सन्देश पठाउने।</li>
                  <li><strong>तरिका २:</strong> सन्देश कपी गरी समूह वा ब्रोडकास्टमा पठाउने।</li>
                </ul>
              </div>

              <div className="text-xs font-semibold text-slate-700">
                पठाउन तयार भएका ग्राहक संख्या: {toNepaliDigits(rows.filter((r) => r.currReading !== '').length)} जना
              </div>

              {/* Sample Message Preview */}
              <div className="rounded-xl bg-slate-100 p-3 text-xs font-mono text-slate-700 border border-slate-200 whitespace-pre-line max-h-36 overflow-y-auto">
                <span className="font-bold text-slate-900">नमुना सन्देश (Message Preview):</span>
                {'\n'}
                {generateBillWhatsAppText(
                  settings.orgName,
                  'रामप्रसाद न्यौपाने',
                  'धारा-१०१',
                  selectedMonth,
                  selectedYear,
                  142,
                  160,
                  18,
                  350,
                  0,
                  350,
                  '9851023456'
                )}
              </div>

              {/* Interactive List of customers for 1-click WhatsApp Dispatch */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {rows
                  .filter((r) => r.currReading !== '')
                  .map((row) => (
                    <div key={row.customerId} className="flex items-center justify-between p-2.5 text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-800">{row.customerName}</span> ({row.tapNo})
                        <span className="text-slate-400 font-mono ml-2">{row.phone}</span>
                        <span className="ml-2 font-mono font-semibold text-blue-600">
                          {formatNepaliCurrency(row.totalBillAmount)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSendSingleWhatsApp(row)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                      >
                        <Send className="h-3 w-3" />
                        <span>पठाउनुहोस्</span>
                      </button>
                    </div>
                  ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setWhatsAppModalOpen(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  बन्द गर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
