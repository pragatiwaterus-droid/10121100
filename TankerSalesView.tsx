import React, { useState } from 'react';
import { TankerSale, Staff, OrganizationSettings } from '../types';
import {
  formatNepaliCurrency,
  toNepaliDigits,
  numberToNepaliWords,
} from '../utils/nepaliUtils';
import {
  Truck,
  PlusCircle,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  User,
  Droplets,
  DollarSign,
} from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  tankerSales: TankerSale[];
  staffList: Staff[];
  onAddSale: (sale: TankerSale) => void;
}

export const TankerSalesView: React.FC<Props> = ({
  settings,
  tankerSales,
  staffList,
  onAddSale,
}) => {
  const currentBsDate = settings.currentSystemDateBS;
  const { defaultRatePerLiter, defaultWagePerLiter, clientRates } = settings.waterTankerSettings;

  const [activeTab, setActiveTab] = useState<'statement' | 'add'>('statement');
  const [selectedBuyer, setSelectedBuyer] = useState<string>('सबै');
  const [fromDateBS, setFromDateBS] = useState<string>('2081-01-01');
  const [toDateBS, setToDateBS] = useState<string>(currentBsDate);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [printedSale, setPrintedSale] = useState<TankerSale | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [vehicleNo, setVehicleNo] = useState<string>('बा २ ख ४५१२');
  const [liters, setLiters] = useState<number>(5000);
  const [ratePerLiter, setRatePerLiter] = useState<number>(defaultRatePerLiter);
  const [wagePerLiter, setWagePerLiter] = useState<number>(defaultWagePerLiter);
  const [driverStaffId, setDriverStaffId] = useState<string>(
    staffList.find((s) => s.designation.includes('चालक'))?.id || staffList[0]?.id || ''
  );
  const [saleDateBS, setSaleDateBS] = useState<string>(currentBsDate);
  const [receiptNo, setReceiptNo] = useState<string>(`TS-REC-${Date.now().toString().slice(-4)}`);
  const [remarks, setRemarks] = useState<string>('खानेपानी ट्याङ्कर ढुवानी');

  // When buyer name changes, check if there is a special client rate in settings
  const handleClientSelect = (name: string) => {
    setCustomerName(name);
    const matched = clientRates.find((c) => c.clientName.toLowerCase() === name.toLowerCase());
    if (matched) {
      setRatePerLiter(matched.ratePerLiter);
      setWagePerLiter(matched.wagePerLiter);
      setBuyerPhone(matched.phone);
    } else {
      setRatePerLiter(defaultRatePerLiter);
      setWagePerLiter(defaultWagePerLiter);
    }
  };

  const totalAmount = Math.round(liters * ratePerLiter);
  const driverWage = Math.round(liters * wagePerLiter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || liters <= 0) return;

    const driver = staffList.find((s) => s.id === driverStaffId);

    const newSale: TankerSale = {
      id: `TS-${Date.now()}`,
      dateBS: saleDateBS,
      customerName,
      phone: buyerPhone,
      vehicleNo,
      liters,
      ratePerLiter,
      totalAmount,
      driverStaffId,
      driverStaffName: driver?.name || 'चालक',
      wagePerLiter,
      driverWage,
      receiptNo,
      paymentStatus: 'paid',
      remarks,
    };

    onAddSale(newSale);
    setSuccessMessage(`गाडी पानी बिक्री रसिद नं. ${receiptNo} सुरक्षित भयो!`);
    setPrintedSale(newSale);
    setActiveTab('statement');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Filter sales
  const filteredSales = tankerSales.filter((s) => {
    const matchesBuyer = selectedBuyer === 'सबै' || s.customerName === selectedBuyer;
    const matchesDate = s.dateBS >= fromDateBS && s.dateBS <= toDateBS;
    const matchesSearch =
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiptNo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBuyer && matchesDate && matchesSearch;
  });

  const totalLitersSold = filteredSales.reduce((sum, s) => sum + s.liters, 0);
  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalDriverWages = filteredSales.reduce((sum, s) => sum + s.driverWage, 0);

  const uniqueBuyers = Array.from(new Set(tankerSales.map((s) => s.customerName))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-600 p-3 text-white shadow-md shadow-cyan-500/20">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                गाडीमा पानी बिक्री व्यवस्थापन (Tanker Water Sales)
              </h2>
              <p className="text-xs text-slate-500">
                व्यक्ति अनुसारको दर, लिटर राख्नासाथ बिक्री रकम र चालक ज्याला अटो क्यालकुलेसन, रसिद प्रिन्ट
              </p>
            </div>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('statement')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'statement'
                  ? 'bg-white text-cyan-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              बिक्री स्टेटमेन्ट
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'add'
                  ? 'bg-white text-cyan-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + नयाँ गाडी पानी बिक्री
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

        {/* Aggregates Banner */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-cyan-50 p-4 border border-cyan-100">
            <span className="text-cyan-800 font-semibold block">कुल बिक्री भएको पानी</span>
            <span className="text-2xl font-bold text-cyan-900 font-mono mt-1 block">
              {toNepaliDigits(totalLitersSold)} <span className="text-sm font-normal">लिटर</span>
            </span>
          </div>

          <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
            <span className="text-emerald-800 font-semibold block">कुल पानी बिक्री आम्दानी</span>
            <span className="text-2xl font-bold text-emerald-900 font-mono mt-1 block">
              {formatNepaliCurrency(totalSalesRevenue)}
            </span>
          </div>

          <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
            <span className="text-amber-800 font-semibold block">कुल चालक / कर्मचारी ज्याला</span>
            <span className="text-2xl font-bold text-amber-900 font-mono mt-1 block">
              {formatNepaliCurrency(totalDriverWages)}
            </span>
          </div>
        </div>
      </div>

      {/* View 1: Statement */}
      {activeTab === 'statement' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">पानी बिक्री स्टेटमेन्ट</h3>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedBuyer}
                onChange={(e) => setSelectedBuyer(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="सबै">सबै खरिदकर्ताहरू</option>
                {uniqueBuyers.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

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

              <div className="relative">
                <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="रसिद वा गाडी नं..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">मिति (वि.सं.)</th>
                  <th className="p-3">रसिद नं</th>
                  <th className="p-3">खरिदकर्ता / संस्था</th>
                  <th className="p-3">गाडी नं</th>
                  <th className="p-3 text-right">परिमाण (लिटर)</th>
                  <th className="p-3 text-right">दर (प्रति लि)</th>
                  <th className="p-3 text-right font-bold text-cyan-900 bg-cyan-50/40">बिक्री रकम</th>
                  <th className="p-3">चालक / सहयोगी</th>
                  <th className="p-3 text-right text-amber-700">चालक ज्याला</th>
                  <th className="p-3 text-center">प्रिन्ट</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-600">{toNepaliDigits(s.dateBS)}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{s.receiptNo}</td>
                    <td className="p-3 font-bold text-slate-900">
                      {s.customerName}
                      {s.phone && <span className="block text-[10px] text-slate-400 font-mono">{s.phone}</span>}
                    </td>
                    <td className="p-3 font-mono text-slate-700">{s.vehicleNo}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {toNepaliDigits(s.liters)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      रु {s.ratePerLiter.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-cyan-800 bg-cyan-50/20">
                      {formatNepaliCurrency(s.totalAmount)}
                    </td>
                    <td className="p-3 text-slate-700">{s.driverStaffName}</td>
                    <td className="p-3 text-right font-mono font-semibold text-amber-700">
                      {formatNepaliCurrency(s.driverWage)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setPrintedSale(s)}
                        title="रसिद हेर्नुहोस् र प्रिन्ट गर्नुहोस्"
                        className="rounded-lg p-1 text-cyan-600 hover:bg-cyan-50"
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
      )}

      {/* View 2: Add Tanker Sale Form */}
      {activeTab === 'add' && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 max-w-2xl"
        >
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">नयाँ गाडीमा पानी बिक्री इन्ट्री</h3>
            <span className="text-xs font-mono font-bold text-cyan-700">रसिद: {receiptNo}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                खरिदकर्ता / ग्राहकको नाम <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="client-rates-list"
                value={customerName}
                onChange={(e) => handleClientSelect(e.target.value)}
                placeholder="उदा. हिमालयन रिसोर्ट / काभ्रे अस्पताल"
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-hidden"
                required
              />
              <datalist id="client-rates-list">
                {clientRates.map((c) => (
                  <option key={c.id} value={c.clientName}>
                    {c.clientName} (विशेष दर: रु {c.ratePerLiter})
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">सम्पर्क फोन</label>
              <input
                type="text"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-900 focus:outline-hidden"
                placeholder="९८५१००००००"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                पानीको परिमाण (लिटर) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={500}
                step={500}
                value={liters}
                onChange={(e) => setLiters(Number(e.target.value))}
                className="w-full rounded-xl border border-cyan-400 bg-cyan-50/50 p-2 font-mono text-base font-bold text-cyan-950 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">गाडी / ट्याङ्कर नं</label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                बिक्री दर (रु प्रति लिटर) <span className="text-cyan-700">(अटोमेटिक)</span>
              </label>
              <input
                type="number"
                step={0.01}
                value={ratePerLiter}
                onChange={(e) => setRatePerLiter(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                चालक ज्याला दर (रु प्रति लिटर) <span className="text-amber-700">(अटोमेटिक)</span>
              </label>
              <input
                type="number"
                step={0.01}
                value={wagePerLiter}
                onChange={(e) => setWagePerLiter(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                चालक / कर्मचारी छान्नुहोस्
              </label>
              <select
                value={driverStaffId}
                onChange={(e) => setDriverStaffId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
              >
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                बिक्री मिति (वि.सं.) <span className="text-cyan-700">(अटोमेटिक)</span>
              </label>
              <input
                type="text"
                value={saleDateBS}
                onChange={(e) => setSaleDateBS(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Auto Calculated Summary Banner */}
          <div className="rounded-xl bg-cyan-50 border border-cyan-200 p-4 text-xs space-y-1">
            <div className="flex justify-between items-center text-sm font-bold text-cyan-950">
              <span>कुल बिक्री रकम (Total Amount):</span>
              <span className="font-mono text-base text-cyan-800">{formatNepaliCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-amber-900">
              <span>कर्मचारी / चालक ज्याला (Driver Wage):</span>
              <span className="font-mono font-bold">{formatNepaliCurrency(driverWage)}</span>
            </div>
            <div className="text-[11px] text-slate-600 pt-1">
              रकम अक्षरमा: <strong>{numberToNepaliWords(totalAmount)}</strong>
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
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:bg-cyan-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>बिक्री सेभ गरी रसिद प्रिन्ट गर्नुहोस्</span>
            </button>
          </div>
        </form>
      )}

      {/* Printable Receipt Modal for Tanker Sale */}
      {printedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3 no-print">
              <span className="font-bold text-sm text-slate-800">गाडी पानी बिक्री बिल (A4 / रसिद)</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs"
                >
                  प्रिन्ट गर्नुहोस्
                </button>
                <button onClick={() => setPrintedSale(null)} className="p-1 text-slate-400">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center border-b pb-3">
                <h3 className="font-bold text-base text-slate-900">{settings.orgName}</h3>
                <p className="text-xs text-slate-600">{settings.orgAddress} | फोन: {settings.orgPhone}</p>
                <span className="mt-1 inline-block rounded-full bg-cyan-100 px-3 py-0.5 text-[11px] font-bold text-cyan-800">
                  ट्याङ्कर खानेपानी बिक्री रसिद
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 text-xs gap-1.5">
                <div>रसिद नं: <strong className="font-mono">{printedSale.receiptNo}</strong></div>
                <div className="text-right">मिति: <strong className="font-mono">{toNepaliDigits(printedSale.dateBS)}</strong></div>
                <div>खरिदकर्ता: <strong>{printedSale.customerName}</strong></div>
                <div className="text-right">गाडी नं: <strong className="font-mono">{printedSale.vehicleNo}</strong></div>
                <div>परिमाण: <strong className="font-mono">{toNepaliDigits(printedSale.liters)} लिटर</strong></div>
                <div className="text-right">दर: रु {printedSale.ratePerLiter.toFixed(2)}/लि.</div>
              </div>
              <div className="mt-3 rounded-lg bg-slate-100 p-2.5 text-center">
                <span className="text-xs text-slate-600">कुल भुक्तानी रकम: </span>
                <span className="text-lg font-bold text-cyan-800 font-mono">
                  {formatNepaliCurrency(printedSale.totalAmount)}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  ({numberToNepaliWords(printedSale.totalAmount)})
                </p>
              </div>
              <div className="mt-6 flex justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-300">
                <div>बुझाउनेको सही: ...................</div>
                <div>बुझिलिने (अधिकृत): ...................</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
