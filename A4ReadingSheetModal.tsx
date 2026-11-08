import React, { useState } from 'react';
import { Customer, OrganizationSettings } from '../types';
import { NEPALI_MONTHS, NEPALI_YEARS, toNepaliDigits } from '../utils/nepaliUtils';
import { Printer, X, FileSpreadsheet, Eye } from 'lucide-react';

interface Props {
  customers: Customer[];
  settings: OrganizationSettings;
  onClose: () => void;
}

export const A4ReadingSheetModal: React.FC<Props> = ({ customers, settings, onClose }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2081);
  const [selectedMonth, setSelectedMonth] = useState<string>('कात्तिक');
  const [selectedWard, setSelectedWard] = useState<string>('सबै');

  const filteredCustomers = customers.filter((c) => {
    if (selectedWard === 'सबै') return true;
    return c.wardNo === selectedWard;
  });

  const handlePrint = () => {
    window.print();
  };

  const wards = Array.from(new Set(customers.map((c) => c.wardNo))).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 my-auto">
        {/* Controls Toolbar (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-100 px-6 py-4 rounded-t-2xl no-print">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600 p-2 text-white">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">मिटर रिडिङ फिल्ड रेकर्ड शीट (A4 प्रिन्ट)</h2>
              <p className="text-xs text-slate-500">
                मिटर रिडिङ गर्न जाँदा हातले भर्नको लागि साविक अङ्क भरिएको र हालको अङ्क खाली भएको आधिकारिक A4 शीट
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs focus:border-blue-500 focus:outline-hidden"
            >
              {NEPALI_YEARS.map((y) => (
                <option key={y} value={y}>
                  वर्ष {toNepaliDigits(y)}
                </option>
              ))}
            </select>

            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs focus:border-blue-500 focus:outline-hidden"
            >
              {NEPALI_MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m} महिना
                </option>
              ))}
            </select>

            {/* Ward Filter */}
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-xs focus:border-blue-500 focus:outline-hidden"
            >
              <option value="सबै">सबै वडा</option>
              {wards.map((w) => (
                <option key={w} value={w}>
                  वडा नं {toNepaliDigits(w)}
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>A4 प्रिन्ट गर्नुहोस्</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* A4 Sheet Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          <div className="bg-white p-6 rounded-lg print:p-0">
            {/* Header */}
            <div className="text-center pb-3 border-b-2 border-slate-900">
              <h1 className="text-xl font-bold text-slate-900">{settings.orgName}</h1>
              <p className="text-xs text-slate-700">{settings.orgAddress} | फोन: {settings.orgPhone}</p>
              <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-800 bg-slate-100 p-2 rounded print:border print:border-slate-800">
                <span>दैनिक मिटर रिडिङ फिल्ड फाराम (A4)</span>
                <span>
                  महिना: <span className="underline">{selectedMonth}</span>, वर्ष: <span className="underline">{toNepaliDigits(selectedYear)}</span>
                </span>
                <span>वडा: {selectedWard}</span>
                <span>कुल ग्राहक संख्या: {toNepaliDigits(filteredCustomers.length)}</span>
              </div>
            </div>

            {/* Field Table with Blank Columns */}
            <table className="mt-4 w-full border-collapse border border-slate-800 text-[11px]">
              <thead>
                <tr className="bg-slate-200 text-slate-900 print:bg-slate-200">
                  <th className="border border-slate-800 p-1.5 text-center w-8">क्र.सं.</th>
                  <th className="border border-slate-800 p-1.5 text-left w-20">ग्राहक आइडी</th>
                  <th className="border border-slate-800 p-1.5 text-left w-16">धारा नं</th>
                  <th className="border border-slate-800 p-1.5 text-left">ग्राहकको नाम</th>
                  <th className="border border-slate-800 p-1.5 text-left">टोल / ठेगाना</th>
                  <th className="border border-slate-800 p-1.5 text-center w-24">फोन नम्बर</th>
                  <th className="border border-slate-800 p-1.5 text-right bg-blue-50 font-bold w-18 print:bg-slate-100">
                    साविक अङ्क (Auto)
                  </th>
                  <th className="border border-slate-800 p-1.5 text-center w-20 text-blue-900 font-bold">
                    हालको अङ्क [खाली]
                  </th>
                  <th className="border border-slate-800 p-1.5 text-center w-16">
                    खपत युनिट [खाली]
                  </th>
                  <th className="border border-slate-800 p-1.5 text-center w-20">
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
                    <td className="border border-slate-800 p-1.5 text-center font-mono">
                      {toNepaliDigits(idx + 1)}
                    </td>
                    <td className="border border-slate-800 p-1.5 font-mono font-medium">
                      {cust.id}
                    </td>
                    <td className="border border-slate-800 p-1.5 font-semibold text-slate-900">
                      {cust.tapNo}
                    </td>
                    <td className="border border-slate-800 p-1.5 font-bold text-slate-900">
                      {cust.fullName}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-slate-600">
                      {cust.tole ? `${cust.tole}, धुलिखेल` : cust.address}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-center font-mono">
                      {cust.phone}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-right font-mono font-bold bg-blue-50/50 text-slate-900 print:bg-white">
                      {cust.previousReading}
                    </td>
                    {/* Blank hand-writing columns */}
                    <td className="border border-slate-800 p-1.5 text-center bg-white h-8">
                      &nbsp;
                    </td>
                    <td className="border border-slate-800 p-1.5 text-center bg-white">
                      &nbsp;
                    </td>
                    <td className="border border-slate-800 p-1.5 text-center bg-white">
                      &nbsp;
                    </td>
                    <td className="border border-slate-800 p-1.5 text-center bg-white">
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
                <p className="font-semibold">प्रमाणित गर्ने सुपरभाइजर / व्यवस्थापक</p>
                <p className="text-[10px] text-slate-500">मिति: २०८१ / .... / ....</p>
              </div>
            </div>
            <div className="mt-4 text-center text-[10px] text-slate-400">
              नोट: यो शीट मिटर रिडरले फिल्डमा लिई हालको अङ्क टिप्न र सफ्टवेयरमा बल्क युनिट इन्ट्री गर्न प्रयोग गरिन्छ।
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
