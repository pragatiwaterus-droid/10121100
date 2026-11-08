import React, { useState } from 'react';
import { Customer, MeterReading, OrganizationSettings } from '../types';
import {
  NEPALI_MONTHS,
  NEPALI_YEARS,
  toNepaliDigits,
  formatNepaliCurrency,
} from '../utils/nepaliUtils';
import { FileSpreadsheet, Printer, Search, Filter, Droplets } from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  readings: MeterReading[];
}

export const MeterSheetView: React.FC<Props> = ({ settings, customers, readings }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2081);
  const [selectedMonth, setSelectedMonth] = useState<string>('कात्तिक');
  const [selectedWard, setSelectedWard] = useState<string>('सबै');
  const [sheetType, setSheetType] = useState<'field_sheet' | 'bulk_bill_slips'>('field_sheet');

  const filteredCustomers = customers.filter((c) => {
    if (selectedWard === 'सबै') return true;
    return c.wardNo === selectedWard;
  });

  const wards = Array.from(new Set(customers.map((c) => c.wardNo))).filter(Boolean);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Settings (no-print) */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                मिटर रिडिङ फिल्ड शीट तथा बिल प्रिन्ट (A4 Sheet & Slips)
              </h2>
              <p className="text-xs text-slate-500">
                साविक अङ्क स्वतः भरिएको, हालको अङ्क, युनिट र रकम खाली कोलम भएको A4 फिल्ड शीट
              </p>
            </div>
          </div>

          {/* Action & Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sheet Type */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setSheetType('field_sheet')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  sheetType === 'field_sheet'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 फिल्ड रिडिङ शीट
              </button>
              <button
                onClick={() => setSheetType('bulk_bill_slips')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  sheetType === 'bulk_bill_slips'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                बल्क रिडिङ बिल स्लिप्स
              </button>
            </div>

            {/* Year */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800"
            >
              {NEPALI_YEARS.map((y) => (
                <option key={y} value={y}>
                  वर्ष {toNepaliDigits(y)}
                </option>
              ))}
            </select>

            {/* Month */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-blue-700"
            >
              {NEPALI_MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m} महिना
                </option>
              ))}
            </select>

            {/* Ward */}
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800"
            >
              <option value="सबै">सबै वडा</option>
              {wards.map((w) => (
                <option key={w} value={w}>
                  वडा नं {toNepaliDigits(w)}
                </option>
              ))}
            </select>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>A4 प्रिन्ट गर्नुहोस्</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Paper Preview */}
      <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
        {sheetType === 'field_sheet' ? (
          <div>
            {/* Header for Field Sheet */}
            <div className="text-center pb-3 border-b-2 border-slate-900">
              <h1 className="text-xl font-bold text-slate-900">{settings.orgName}</h1>
              <p className="text-xs text-slate-700">{settings.orgAddress} | फोन: {settings.orgPhone}</p>
              <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-900 bg-slate-100 p-2 rounded print:border print:border-slate-800">
                <span>दैनिक मिटर रिडिङ फिल्ड फाराम (A4 Paper)</span>
                <span>
                  महिना: <span className="underline">{selectedMonth}</span>, वर्ष: <span className="underline">{toNepaliDigits(selectedYear)}</span>
                </span>
                <span>वडा: {selectedWard}</span>
                <span>ग्राहक संख्या: {toNepaliDigits(filteredCustomers.length)}</span>
              </div>
            </div>

            {/* Table */}
            <table className="mt-4 w-full border-collapse border border-slate-800 text-[11px]">
              <thead>
                <tr className="bg-slate-200 text-slate-900">
                  <th className="border border-slate-800 p-1.5 text-center w-8">क्र.सं.</th>
                  <th className="border border-slate-800 p-1.5 text-left w-20">ग्राहक आइडी</th>
                  <th className="border border-slate-800 p-1.5 text-left w-16">धारा नं</th>
                  <th className="border border-slate-800 p-1.5 text-left">ग्राहकको नाम</th>
                  <th className="border border-slate-800 p-1.5 text-left">टोल / ठेगाना</th>
                  <th className="border border-slate-800 p-1.5 text-center w-24">फोन नम्बर</th>
                  <th className="border border-slate-800 p-1.5 text-right bg-blue-50 font-bold w-20">
                    साविक अङ्क (Auto)
                  </th>
                  <th className="border border-slate-800 p-1.5 text-center w-24 text-blue-900 font-bold">
                    हालको अङ्क [खाली]
                  </th>
                  <th className="border border-slate-800 p-1.5 text-center w-20">
                    खपत युनिट [खाली]
                  </th>
                  <th className="border border-slate-800 p-1.5 text-center w-24">
                    रकम (रु) [खाली]
                  </th>
                  <th className="border border-slate-800 p-1.5 text-center w-24">
                    ग्राहक सही / कैफियत
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust, idx) => (
                  <tr key={cust.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 p-2 text-center font-mono">
                      {toNepaliDigits(idx + 1)}
                    </td>
                    <td className="border border-slate-800 p-2 font-mono font-medium">
                      {cust.id}
                    </td>
                    <td className="border border-slate-800 p-2 font-semibold text-slate-900">
                      {cust.tapNo}
                    </td>
                    <td className="border border-slate-800 p-2 font-bold text-slate-900">
                      {cust.fullName}
                    </td>
                    <td className="border border-slate-800 p-2 text-slate-600">
                      {cust.tole ? `${cust.tole}, वडा ${cust.wardNo}` : cust.address}
                    </td>
                    <td className="border border-slate-800 p-2 text-center font-mono">
                      {cust.phone}
                    </td>
                    <td className="border border-slate-800 p-2 text-right font-mono font-bold bg-blue-50/50 text-slate-900">
                      {cust.previousReading}
                    </td>
                    {/* Blank Columns for manual entry */}
                    <td className="border border-slate-800 p-2 text-center bg-white h-9">
                      &nbsp;
                    </td>
                    <td className="border border-slate-800 p-2 text-center bg-white">
                      &nbsp;
                    </td>
                    <td className="border border-slate-800 p-2 text-center bg-white">
                      &nbsp;
                    </td>
                    <td className="border border-slate-800 p-2 text-center bg-white">
                      &nbsp;
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer Signatures */}
            <div className="mt-8 pt-4 border-t border-slate-400 flex justify-between text-xs text-slate-800">
              <div className="w-56 text-center">
                <div className="border-b border-dotted border-slate-600 mb-1 h-6"></div>
                <p className="font-semibold">मिटर रिडरको नाम र सही</p>
                <p className="text-[10px] text-slate-500">रिडिङ मिति: २०८१ / .... / ....</p>
              </div>
              <div className="w-56 text-center">
                <div className="border-b border-dotted border-slate-600 mb-1 h-6"></div>
                <p className="font-semibold">प्रमाणित गर्ने अधिकृत / व्यवस्थापक</p>
                <p className="text-[10px] text-slate-500">मिति: २०८१ / .... / ....</p>
              </div>
            </div>
          </div>
        ) : (
          /* Bulk Individual Customer Reading Bill Slips (4 slips per A4 page) */
          <div>
            <div className="text-center pb-3 border-b mb-6 no-print">
              <h3 className="font-bold text-slate-900">
                {selectedMonth} {toNepaliDigits(selectedYear)} को बल्क ग्राहक रिडिङ बिल स्लिप्स
              </h3>
              <p className="text-xs text-slate-500">यी स्लिपहरू काटेर ग्राहकलाई दिन सकिन्छ</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCustomers.map((cust) => {
                const reading = readings.find(
                  (r) => r.customerId === cust.id && r.yearBS === selectedYear && r.monthBS === selectedMonth
                );
                return (
                  <div
                    key={cust.id}
                    className="rounded-xl border-2 border-dashed border-slate-400 p-4 bg-slate-50/50 text-xs print:border-solid print:border-slate-800 print:bg-white"
                  >
                    <div className="text-center border-b pb-2">
                      <span className="font-bold text-slate-900 text-sm block">{settings.orgName}</span>
                      <span className="text-[10px] text-slate-500">{settings.orgAddress} | फोन: {settings.orgPhone}</span>
                      <div className="mt-1 font-bold text-blue-800">
                        मिटर रिडिङ बिल - {selectedMonth} {toNepaliDigits(selectedYear)}
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                      <div>ग्राहक आइडी: <strong className="font-mono">{cust.id}</strong></div>
                      <div className="text-right">धारा नं: <strong className="font-semibold">{cust.tapNo}</strong></div>
                      <div className="col-span-2">नाम: <strong className="text-slate-900">{cust.fullName}</strong></div>
                      <div>साविक अङ्क: <strong className="font-mono">{reading ? reading.prevReading : cust.previousReading}</strong></div>
                      <div className="text-right">हालको अङ्क: <strong className="font-mono">{reading ? reading.currReading : '-'}</strong></div>
                      <div>खपत युनिट: <strong className="font-mono text-blue-700">{reading ? reading.consumedUnits : '-'}</strong></div>
                      <div className="text-right">
                        महसुल: <strong className="font-mono text-blue-800 font-bold">{reading ? formatNepaliCurrency(reading.totalBillAmount) : '-'}</strong>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                      <span>भुक्तानी स्थिति: <strong>{reading?.paidStatus === 'paid' ? 'चुक्ता' : 'बाँकी'}</strong></span>
                      <span>रिडर सही: ...............</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
