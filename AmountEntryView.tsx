import React, { useState } from 'react';
import {
  Customer,
  MeterReading,
  BillPayment,
  OrganizationSettings,
} from '../types';
import {
  formatNepaliCurrency,
  toNepaliDigits,
  numberToNepaliWords,
} from '../utils/nepaliUtils';
import {
  Receipt,
  Printer,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
  CheckSquare,
  Square,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  readings: MeterReading[];
  payments: BillPayment[];
  onAddPayment: (payment: BillPayment) => void;
  onUpdatePayment: (payment: BillPayment) => void;
  onDeletePayment: (paymentId: string) => void;
  onBulkPay: (newPayments: BillPayment[]) => void;
  onPrintReceipt: (payment: BillPayment) => void;
}

export const AmountEntryView: React.FC<Props> = ({
  settings,
  customers,
  readings,
  payments,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
  onBulkPay,
  onPrintReceipt,
}) => {
  const currentBsDate = settings.currentSystemDateBS;

  const [activeSubTab, setActiveSubTab] = useState<'single' | 'bulk' | 'history'>('single');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Single Entry Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [selectedReadingId, setSelectedReadingId] = useState<string>('');
  const [paymentDateBS, setPaymentDateBS] = useState<string>(currentBsDate);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'नगद (Cash)' | 'बैंक / QR (Fonepay)' | 'चेक (Cheque)'>('नगद (Cash)');
  const [remarks, setRemarks] = useState<string>('नियमित महसुल भुक्तानी');
  const [editingPayment, setEditingPayment] = useState<BillPayment | null>(null);

  // Bulk Entry Selection
  const [selectedReadingIdsForBulk, setSelectedReadingIdsForBulk] = useState<string[]>([]);
  const [bulkPaymentMethod, setBulkPaymentMethod] = useState<'नगद (Cash)' | 'बैंक / QR (Fonepay)' | 'चेक (Cheque)'>('नगद (Cash)');
  const [bulkDateBS, setBulkDateBS] = useState<string>(currentBsDate);

  // When customer changes, find their latest unpaid reading
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerUnpaidReadings = readings.filter(
    (r) => r.customerId === selectedCustomerId && r.paidStatus === 'unpaid'
  );

  // Auto-generate next receipt number
  const nextReceiptNumber = `RCP-2081-${String(payments.length + 1).padStart(4, '0')}`;

  // Handle single pay submission
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer || paidAmount <= 0) return;

    const matchedReading = readings.find((r) => r.id === selectedReadingId) || customerUnpaidReadings[0];

    if (editingPayment) {
      // Update existing payment
      const updated: BillPayment = {
        ...editingPayment,
        dateBS: paymentDateBS,
        paidAmount: paidAmount,
        netPayable: paidAmount,
        paymentMethod: paymentMethod,
        amountInWordsNepali: numberToNepaliWords(paidAmount),
        remarks: remarks,
      };
      onUpdatePayment(updated);
      setEditingPayment(null);
      setSuccessMessage('रसिद विवरण सफलतापूर्वक सच्याइयो (Modified)!');
      onPrintReceipt(updated);
    } else {
      // Create new payment
      const newPay: BillPayment = {
        id: `PAY-${Date.now()}`,
        receiptNo: nextReceiptNumber,
        readingId: matchedReading?.id,
        customerId: currentCustomer.id,
        customerName: currentCustomer.fullName,
        tapNo: currentCustomer.tapNo,
        phone: currentCustomer.phone,
        dateBS: paymentDateBS,
        monthBS: matchedReading?.monthBS || 'चालु',
        yearBS: matchedReading?.yearBS || 2081,
        unitsConsumed: matchedReading?.consumedUnits || 0,
        billAmount: matchedReading?.baseAmount || paidAmount,
        fineAmount: matchedReading?.fineAmount || 0,
        discountAmount: matchedReading?.discountAmount || 0,
        netPayable: paidAmount,
        paidAmount: paidAmount,
        paymentMethod: paymentMethod,
        amountInWordsNepali: numberToNepaliWords(paidAmount),
        collectedBy: settings.authorizedPersonName || 'अधिकृत कर्मचारी',
        remarks: remarks,
      };

      onAddPayment(newPay);
      setSuccessMessage(`रसिद नं. ${newPay.receiptNo} सफलतापूर्वक जारी भयो!`);
      onPrintReceipt(newPay);
    }

    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Start editing an existing payment
  const handleStartEdit = (pay: BillPayment) => {
    setEditingPayment(pay);
    setSelectedCustomerId(pay.customerId);
    setPaymentDateBS(pay.dateBS);
    setPaidAmount(pay.paidAmount);
    setPaymentMethod(pay.paymentMethod);
    setRemarks(pay.remarks || '');
    setActiveSubTab('single');
  };

  // Bulk Payment Submission
  const handleBulkSubmit = () => {
    if (selectedReadingIdsForBulk.length === 0) return;

    let rcpCounter = payments.length + 1;
    const newPayments: BillPayment[] = [];

    selectedReadingIdsForBulk.forEach((rId) => {
      const rd = readings.find((r) => r.id === rId);
      if (!rd) return;

      const rcpNo = `RCP-2081-${String(rcpCounter).padStart(4, '0')}`;
      rcpCounter++;

      newPayments.push({
        id: `PAY-BULK-${Date.now()}-${rd.customerId}`,
        receiptNo: rcpNo,
        readingId: rd.id,
        customerId: rd.customerId,
        customerName: rd.customerName,
        tapNo: rd.tapNo,
        phone: rd.phone,
        dateBS: bulkDateBS,
        monthBS: rd.monthBS,
        yearBS: rd.yearBS,
        unitsConsumed: rd.consumedUnits,
        billAmount: rd.baseAmount,
        fineAmount: rd.fineAmount,
        discountAmount: rd.discountAmount,
        netPayable: rd.totalBillAmount,
        paidAmount: rd.totalBillAmount,
        paymentMethod: bulkPaymentMethod,
        amountInWordsNepali: numberToNepaliWords(rd.totalBillAmount),
        collectedBy: settings.authorizedPersonName || 'अधिकृत कर्मचारी',
        remarks: 'बल्क महसुल भुक्तानी दाखिला',
      });
    });

    onBulkPay(newPayments);
    setSelectedReadingIdsForBulk([]);
    setSuccessMessage(`${newPayments.length} वटा बिलहरूको बल्क भुक्तानी सम्पन्न भयो!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Toggle reading for bulk
  const toggleReadingForBulk = (id: string) => {
    setSelectedReadingIdsForBulk((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all unpaid readings
  const unpaidReadings = readings.filter((r) => r.paidStatus === 'unpaid');
  const toggleSelectAllBulk = () => {
    if (selectedReadingIdsForBulk.length === unpaidReadings.length) {
      setSelectedReadingIdsForBulk([]);
    } else {
      setSelectedReadingIdsForBulk(unpaidReadings.map((r) => r.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub Tabs */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-md shadow-emerald-500/20">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                अमाउन्ट इन्ट्री / महसुल भुक्तानी र रसिद
              </h2>
              <p className="text-xs text-slate-500">
                सिङ्गल वा बल्क महसुल इन्ट्री, अटो रसिद नम्बर र मिति, रकम अक्षरमा र तत्काल प्रिन्ट
              </p>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => {
                setActiveSubTab('single');
                setEditingPayment(null);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeSubTab === 'single'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              सिङ्गल इन्ट्री (रसिद प्रिन्ट)
            </button>
            <button
              onClick={() => setActiveSubTab('bulk')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeSubTab === 'bulk'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              बल्क अमाउन्ट इन्ट्री ({toNepaliDigits(unpaidReadings.length)})
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeSubTab === 'history'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              भुक्तानी इतिहास ({toNepaliDigits(payments.length)})
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

      {/* SubTab 1: Single Amount Entry & Instant Receipt */}
      {activeSubTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleSingleSubmit}
            className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs lg:col-span-2 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-600" />
                <span>
                  {editingPayment ? 'रसिद संशोधन / मोडिफाई (Edit Receipt)' : 'नयाँ महसुल संकलन इन्ट्री'}
                </span>
              </h3>
              <div className="text-right">
                <span className="text-[11px] text-slate-400">अटोमेटिक रसिद नं: </span>
                <span className="font-mono text-xs font-bold text-emerald-700">
                  {editingPayment ? editingPayment.receiptNo : nextReceiptNumber}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ग्राहक छान्नुहोस् <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    setSelectedCustomerId(cId);
                    const unp = readings.find((r) => r.customerId === cId && r.paidStatus === 'unpaid');
                    if (unp) {
                      setSelectedReadingId(unp.id);
                      setPaidAmount(unp.totalBillAmount);
                    } else {
                      setPaidAmount(settings.waterTariff.minAmount);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} - {c.tapNo} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Entry Date BS (Auto Nepali Date, Editable) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  इन्ट्री मिति (वि.सं.) <span className="text-emerald-600">(अटोमेटिक / सम्पादनयोग्य)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={paymentDateBS}
                    onChange={(e) => setPaymentDateBS(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bill Info if available */}
            {customerUnpaidReadings.length > 0 ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span>बक्यौता महिना: {customerUnpaidReadings[0].monthBS} {customerUnpaidReadings[0].yearBS}</span>
                  <span className="font-mono text-base font-bold text-amber-900">
                    {formatNepaliCurrency(customerUnpaidReadings[0].totalBillAmount)}
                  </span>
                </div>
                <div className="text-[11px] text-amber-800">
                  खपत: {customerUnpaidReadings[0].consumedUnits} युनिट (साविक {customerUnpaidReadings[0].prevReading} देखि हाल {customerUnpaidReadings[0].currReading})
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-600">
                यो ग्राहकको चालु महिनामा कुनै बक्यौता बिल छैन। अग्रिम वा न्यूनतम रकम भुक्तानी गर्न सक्नुहुन्छ।
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Paid Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  भुक्तानी प्राप्त रकम (रु) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={paidAmount || ''}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2 font-mono text-base font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  placeholder="0"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  भुक्तानी माध्यम
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="नगद (Cash)">नगद (Cash)</option>
                  <option value="बैंक / QR (Fonepay)">बैंक / QR (Fonepay)</option>
                  <option value="चेक (Cheque)">चेक (Cheque)</option>
                </select>
              </div>
            </div>

            {/* In Words Preview (Dynamic Nepali) */}
            <div className="rounded-xl bg-emerald-50/80 p-3 text-xs border border-emerald-200 text-emerald-950">
              <span className="font-bold">रकम अक्षरमा (In Words): </span>
              <span className="font-semibold underline decoration-emerald-400">
                {numberToNepaliWords(paidAmount)}
              </span>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">कैफियत (Remarks)</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              {editingPayment && (
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  रद्द गर्नुहोस्
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition"
              >
                <Printer className="h-4 w-4" />
                <span>
                  {editingPayment ? 'संशोधन गरी रसिद प्रिन्ट गर्नुहोस्' : 'रकम सेभ गर्नुहोस् र रसिद प्रिन्ट गर्नुहोस्'}
                </span>
              </button>
            </div>
          </form>

          {/* Quick Help Card */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">रसिद प्रणालीका विशेषताहरू</h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
              <li>
                <strong>अटो रसिद नम्बर:</strong> प्रत्येक भुक्तानीमा क्रमानुसार युनिक रसिद नम्बर जारी हुन्छ।
              </li>
              <li>
                <strong>नेपाली अक्षरमा रकम:</strong> रकम प्रविष्टि गर्नासाथ स्वतः शुद्ध नेपाली अक्षरमा (रकम अक्षरमा) परिवर्तन हुन्छ।
              </li>
              <li>
                <strong>मिस्टेक सच्याउने सुविधा:</strong> यदि कुनै गल्ती भएमा भुक्तानी इतिहासबाट <em>मोडिफाई</em> बटन थिची कुनै पनि बेला सच्याउन र पुनः रसिद छाप्न सकिन्छ।
              </li>
              <li>
                <strong>तत्काल A4 / स्लिप प्रिन्ट:</strong> रसिद प्रिन्ट बटन थिच्दा सिधै सफा आधिकारिक रसिद प्रिन्ट हुन्छ।
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* SubTab 2: Bulk Amount Entry */}
      {activeSubTab === 'bulk' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                बल्क अमाउन्ट इन्ट्री (Bulk Amount Collection)
              </h3>
              <p className="text-xs text-slate-500">
                एकैपटक धेरै ग्राहकहरूको महसुल संकलन इन्ट्री गर्न चेकबक्स छान्नुहोस् र दाखिला गर्नुहोस्
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-slate-500 font-semibold">इन्ट्री मिति:</span>
                <input
                  type="text"
                  value={bulkDateBS}
                  onChange={(e) => setBulkDateBS(e.target.value)}
                  className="w-24 bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-hidden"
                />
              </div>

              <select
                value={bulkPaymentMethod}
                onChange={(e) => setBulkPaymentMethod(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="नगद (Cash)">नगद (Cash)</option>
                <option value="बैंक / QR (Fonepay)">बैंक / QR (Fonepay)</option>
                <option value="चेक (Cheque)">चेक (Cheque)</option>
              </select>

              <button
                onClick={handleBulkSubmit}
                disabled={selectedReadingIdsForBulk.length === 0}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                <Layers className="h-4 w-4" />
                <span>
                  छानिएका {toNepaliDigits(selectedReadingIdsForBulk.length)} वटा बिल दाखिला गर्नुहोस्
                </span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <button onClick={toggleSelectAllBulk} className="text-slate-600">
                      {selectedReadingIdsForBulk.length === unpaidReadings.length && unpaidReadings.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">ग्राहक आइडी</th>
                  <th className="p-3">ग्राहकको नाम</th>
                  <th className="p-3">धारा नं</th>
                  <th className="p-3">महिना</th>
                  <th className="p-3 text-center">खपत युनिट</th>
                  <th className="p-3 text-right">महसुल रकम</th>
                  <th className="p-3 text-right">जरिवाना</th>
                  <th className="p-3 text-right font-bold text-slate-900">कुल बुझाउनुपर्ने</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {unpaidReadings.map((r) => {
                  const isChecked = selectedReadingIdsForBulk.includes(r.id);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => toggleReadingForBulk(r.id)}
                      className={`cursor-pointer hover:bg-slate-50 transition ${
                        isChecked ? 'bg-emerald-50/50' : ''
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleReadingForBulk(r.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-3 font-mono">{r.customerId}</td>
                      <td className="p-3 font-bold text-slate-900">{r.customerName}</td>
                      <td className="p-3 text-slate-700 font-semibold">{r.tapNo}</td>
                      <td className="p-3">{r.monthBS} {r.yearBS}</td>
                      <td className="p-3 text-center font-mono">{toNepaliDigits(r.consumedUnits)}</td>
                      <td className="p-3 text-right font-mono">{formatNepaliCurrency(r.baseAmount)}</td>
                      <td className="p-3 text-right font-mono text-rose-600">{formatNepaliCurrency(r.fineAmount)}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        {formatNepaliCurrency(r.totalBillAmount)}
                      </td>
                    </tr>
                  );
                })}
                {unpaidReadings.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-400">
                      हाल कुनै पनि ग्राहकको बक्यौता बिल छैन। सबै महसुल चुक्ता भइसकेको छ।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: Payment History & Modify/Print */}
      {activeSubTab === 'history' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-900 text-sm">
              जारी गरिएका रसिदहरूको सूची (रसिद प्रिन्ट र संशोधन)
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="रसिद नं, ग्राहक नाम, वा धारा नं..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">रसिद नं</th>
                  <th className="p-3">ग्राहकको नाम</th>
                  <th className="p-3">धारा नं</th>
                  <th className="p-3">मिति (वि.सं.)</th>
                  <th className="p-3 text-right">रकम</th>
                  <th className="p-3">रकम अक्षरमा</th>
                  <th className="p-3">माध्यम</th>
                  <th className="p-3 text-center">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {payments
                  .filter(
                    (p) =>
                      p.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.tapNo.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-600">{p.receiptNo}</td>
                      <td className="p-3 font-bold text-slate-900">{p.customerName}</td>
                      <td className="p-3 text-slate-700 font-semibold">{p.tapNo}</td>
                      <td className="p-3 font-mono text-slate-600">{toNepaliDigits(p.dateBS)}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        {formatNepaliCurrency(p.paidAmount)}
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate" title={p.amountInWordsNepali}>
                        {p.amountInWordsNepali}
                      </td>
                      <td className="p-3 text-slate-500">{p.paymentMethod}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print Receipt */}
                          <button
                            onClick={() => onPrintReceipt(p)}
                            title="रसिद प्रिन्ट गर्नुहोस्"
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Printer className="h-4 w-4" />
                          </button>

                          {/* Modify/Edit */}
                          <button
                            onClick={() => handleStartEdit(p)}
                            title="रसिद विवरण सच्याउनुहोस् (Modify)"
                            className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`के तपाईं रसिद नं ${p.receiptNo} रद्द/डिलिट गर्न निश्चित हुनुहुन्छ?`)) {
                                onDeletePayment(p.id);
                              }
                            }}
                            title="रसिद रद्द गर्नुहोस्"
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
