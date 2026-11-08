import React, { useState } from 'react';
import { NEPALI_MONTHS, NEPALI_YEARS, toNepaliDigits } from '../utils/nepaliUtils';
import { Calendar, Check, X } from 'lucide-react';

interface Props {
  currentDateBS: string;
  onSave: (newDateBS: string) => void;
  onClose: () => void;
}

export const SystemDateModal: React.FC<Props> = ({ currentDateBS, onSave, onClose }) => {
  const parts = currentDateBS.split('-');
  const initialYear = Number(parts[0]) || 2081;
  const initialMonth = Number(parts[1]) || 7;
  const initialDay = Number(parts[2]) || 22;

  const [year, setYear] = useState<number>(initialYear);
  const [month, setMonth] = useState<number>(initialMonth);
  const [day, setDay] = useState<number>(initialDay);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const newDate = `${year}-${formattedMonth}-${formattedDay}`;
    onSave(newDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>सफ्टवेयरमा चलिरहेको मिति परिवर्तन गर्नुहोस्</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-6 space-y-4">
          <div className="rounded-xl bg-blue-50/70 p-3 text-xs text-blue-800 border border-blue-200">
            <strong>सूचना:</strong> यहाँ सेट गरिएको मिति सम्पूर्ण सफ्टवेयरमा चलिरहेको नेपाली मिति हुनेछ। युनिट इन्ट्री, महसुल, रसिद र बैंक भौचरहरूमा यही मिति स्वतः आउनेछ।
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">वर्ष (वि.सं.)</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
              >
                {NEPALI_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {toNepaliDigits(y)}
                  </option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">महिना</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
              >
                {NEPALI_MONTHS.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {m} ({toNepaliDigits(idx + 1)})
                  </option>
                ))}
              </select>
            </div>

            {/* Day */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">गते</label>
              <input
                type="number"
                min={1}
                max={32}
                value={day}
                onChange={(e) => setDay(Math.min(32, Math.max(1, Number(e.target.value))))}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="rounded-lg bg-slate-100 p-3 text-center">
            <span className="text-xs text-slate-500">परिवर्तित हुने मिति: </span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {toNepaliDigits(year)}/{toNepaliDigits(String(month).padStart(2, '0'))}/{toNepaliDigits(String(day).padStart(2, '0'))}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Check className="h-4 w-4" />
              <span>मिति सेभ गर्नुहोस्</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
