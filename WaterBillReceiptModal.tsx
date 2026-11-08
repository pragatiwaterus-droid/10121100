import React from 'react';
import { BillPayment, OrganizationSettings } from '../types';
import { formatNepaliCurrency, toNepaliDigits } from '../utils/nepaliUtils';
import { Printer, X, Droplets, CheckCircle2 } from 'lucide-react';

interface Props {
  payment: BillPayment | null;
  settings: OrganizationSettings;
  onClose: () => void;
}

export const WaterBillReceiptModal: React.FC<Props> = ({ payment, settings, onClose }) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 no-print">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>खानेपानी महसुल भुक्तानी रसिद (Payment Receipt)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>प्रिन्ट गर्नुहोस् (A4 / रसिद)</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 print:p-0 print:m-0" id="printable-receipt">
          <div className="rounded-xl border-2 border-dashed border-blue-300 p-6 bg-slate-50/50 print:border-solid print:border-slate-800 print:bg-white">
            {/* Header */}
            <div className="text-center border-b pb-4 border-slate-300">
              <div className="flex items-center justify-center gap-2 text-blue-700 mb-1">
                <Droplets className="h-7 w-7" />
                <h1 className="text-xl font-bold tracking-tight text-slate-900">{settings.orgName}</h1>
              </div>
              <p className="text-xs text-slate-600 font-medium">{settings.orgAddress}</p>
              <p className="text-xs text-slate-500">
                फोन: {settings.orgPhone} {settings.panNo ? `| स्थायी लेखा नं (PAN): ${settings.panNo}` : ''}
              </p>
              <div className="mt-2 inline-block rounded-full bg-blue-100 px-4 py-0.5 text-xs font-bold text-blue-800 print:border print:border-slate-600">
                खानेपानी महसुल संकलन रसिद
              </div>
            </div>

            {/* Receipt Meta */}
            <div className="mt-4 grid grid-cols-2 text-sm gap-2">
              <div>
                <span className="text-slate-500">रसिद नं:</span>{' '}
                <strong className="font-mono text-slate-800">{payment.receiptNo}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500">मिति (वि.सं.):</span>{' '}
                <strong className="text-slate-800">{toNepaliDigits(payment.dateBS)}</strong>
              </div>
              <div>
                <span className="text-slate-500">ग्राहकको नाम:</span>{' '}
                <strong className="text-slate-900">{payment.customerName}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500">धारा नं:</span>{' '}
                <strong className="text-slate-900">{payment.tapNo}</strong>
              </div>
              <div>
                <span className="text-slate-500">ग्राहक नं:</span>{' '}
                <span className="font-mono font-semibold text-slate-700">{payment.customerId}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">सम्पर्क:</span>{' '}
                <span className="text-slate-700">{payment.phone}</span>
              </div>
            </div>

            {/* Billing Breakdown Table */}
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">विवरण</th>
                    <th className="p-2.5 text-center">महिना / वर्ष</th>
                    <th className="p-2.5 text-center">खपत युनिट</th>
                    <th className="p-2.5 text-right">रकम</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                  <tr>
                    <td className="p-2.5 font-medium">खानेपानी महसुल शुल्क</td>
                    <td className="p-2.5 text-center">{payment.monthBS} {toNepaliDigits(payment.yearBS)}</td>
                    <td className="p-2.5 text-center font-mono">{toNepaliDigits(payment.unitsConsumed)}</td>
                    <td className="p-2.5 text-right font-mono">{formatNepaliCurrency(payment.billAmount)}</td>
                  </tr>
                  {payment.fineAmount > 0 && (
                    <tr className="text-rose-600">
                      <td className="p-2.5">विलम्ब जरिवाना शुल्क</td>
                      <td className="p-2.5 text-center">-</td>
                      <td className="p-2.5 text-center">-</td>
                      <td className="p-2.5 text-right font-mono">{formatNepaliCurrency(payment.fineAmount)}</td>
                    </tr>
                  )}
                  {payment.discountAmount > 0 && (
                    <tr className="text-emerald-600">
                      <td className="p-2.5">छुट / समायोजन</td>
                      <td className="p-2.5 text-center">-</td>
                      <td className="p-2.5 text-center">-</td>
                      <td className="p-2.5 text-right font-mono">- {formatNepaliCurrency(payment.discountAmount)}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={3} className="p-2.5 text-right">कुल भुक्तानी प्राप्त रकम:</td>
                    <td className="p-2.5 text-right text-base text-blue-700 font-mono">
                      {formatNepaliCurrency(payment.paidAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* In Words Section */}
            <div className="mt-3 rounded-lg bg-blue-50/70 p-3 text-xs border border-blue-200 text-slate-800">
              <span className="font-semibold text-blue-900">रकम अक्षरमा: </span>
              <span className="font-medium underline decoration-blue-300">{payment.amountInWordsNepali}</span>
            </div>

            {/* Payment Method & Collector */}
            <div className="mt-3 flex justify-between text-xs text-slate-600">
              <div>
                <span>भुक्तानी माध्यम:</span> <strong className="text-slate-800">{payment.paymentMethod}</strong>
              </div>
              {payment.remarks && (
                <div>
                  <span>कैफियत:</span> <em>{payment.remarks}</em>
                </div>
              )}
            </div>

            {/* Signatures */}
            <div className="mt-10 flex justify-between pt-4 border-t border-slate-300 text-xs text-slate-700">
              <div className="text-center w-40">
                <div className="border-b border-dotted border-slate-400 mb-1 h-6"></div>
                <p>बुझाउने ग्राहकको सही</p>
              </div>
              <div className="text-center w-48">
                <div className="border-b border-dotted border-slate-400 mb-1 h-6 font-semibold text-slate-800 flex items-end justify-center">
                  {payment.collectedBy}
                </div>
                <p>बुझिलिने (आधिकारिक हस्ताक्षर)</p>
              </div>
            </div>
            <div className="mt-3 text-center text-[10px] text-slate-400">
              सफ्टवेयर प्रणालीद्वारा जारी गरिएको आधिकारिक रसिद | खानेपानी सफ्टवेयर ईआरपी
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
