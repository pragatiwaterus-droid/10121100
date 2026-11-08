import React from 'react';
import { LoanInstallment, OrganizationSettings } from '../types';
import { formatNepaliCurrency, toNepaliDigits } from '../utils/nepaliUtils';
import { Printer, X, HandCoins, CheckCircle2 } from 'lucide-react';

interface Props {
  installment: LoanInstallment | null;
  settings: OrganizationSettings;
  onClose: () => void;
}

export const LoanReceiptModal: React.FC<Props> = ({ installment, settings, onClose }) => {
  if (!installment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 no-print">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            <span>ऋण किस्ता असुली रसिद (Loan Installment Receipt)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>प्रिन्ट गर्नुहोस्</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper */}
        <div className="p-8 print:p-0 print:m-0">
          <div className="rounded-xl border-2 border-dashed border-indigo-300 p-6 bg-slate-50/50 print:border-solid print:border-slate-800 print:bg-white">
            {/* Header */}
            <div className="text-center border-b pb-4 border-slate-300">
              <div className="flex items-center justify-center gap-2 text-indigo-700 mb-1">
                <HandCoins className="h-7 w-7" />
                <h1 className="text-xl font-bold tracking-tight text-slate-900">{settings.orgName}</h1>
              </div>
              <p className="text-xs text-slate-600 font-medium">{settings.orgAddress}</p>
              <p className="text-xs text-slate-500">
                ऋण लगानी तथा बचत परिचालन शाखा | सम्पर्क: {settings.orgPhone}
              </p>
              <div className="mt-2 inline-block rounded-full bg-indigo-100 px-4 py-0.5 text-xs font-bold text-indigo-800 print:border print:border-slate-600">
                ऋण किस्ता तथा ब्याज भुक्तानी रसिद
              </div>
            </div>

            {/* Receipt Meta */}
            <div className="mt-4 grid grid-cols-2 text-sm gap-2">
              <div>
                <span className="text-slate-500">रसिद नं:</span>{' '}
                <strong className="font-mono text-slate-800">{installment.receiptNo}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500">मिति (वि.सं.):</span>{' '}
                <strong className="text-slate-800">{toNepaliDigits(installment.dateBS)}</strong>
              </div>
              <div>
                <span className="text-slate-500">ऋणी सदस्यको नाम:</span>{' '}
                <strong className="text-slate-900">{installment.customerName}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500">ऋण खाता नं:</span>{' '}
                <strong className="font-mono text-indigo-700">{installment.loanId}</strong>
              </div>
              <div>
                <span className="text-slate-500">सदस्य कोड:</span>{' '}
                <span className="font-mono font-semibold text-slate-700">{installment.customerId}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">भुक्तानी माध्यम:</span>{' '}
                <span className="font-medium text-slate-800">{installment.paymentMethod}</span>
              </div>
            </div>

            {/* Details Table */}
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">शीर्षक</th>
                    <th className="p-2.5 text-right">रकम</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                  <tr>
                    <td className="p-2.5 font-medium">बुझाएको सावाँ रकम (Principal Repaid)</td>
                    <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                      {formatNepaliCurrency(installment.principalPaid)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">बुझाएको ब्याज रकम (Interest Paid)</td>
                    <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                      {formatNepaliCurrency(installment.interestPaid)}
                    </td>
                  </tr>
                  <tr className="bg-indigo-50 font-bold text-slate-900 border-t-2 border-indigo-200">
                    <td className="p-2.5">जम्मा बुझाएको रकम (Total Paid)</td>
                    <td className="p-2.5 text-right text-base text-indigo-700 font-mono">
                      {formatNepaliCurrency(installment.totalPaid)}
                    </td>
                  </tr>
                  <tr className="bg-amber-50/60 text-slate-800 font-medium">
                    <td className="p-2.5 text-amber-900">यो भुक्तानीपछिको बाँकी सावाँ (Remaining Principal):</td>
                    <td className="p-2.5 text-right font-mono text-amber-950 font-bold">
                      {formatNepaliCurrency(installment.remainingPrincipalAfter)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* In Words Section */}
            <div className="mt-3 rounded-lg bg-indigo-50/70 p-3 text-xs border border-indigo-200 text-slate-800">
              <span className="font-semibold text-indigo-900">रकम अक्षरमा: </span>
              <span className="font-medium underline decoration-indigo-300">{installment.amountInWordsNepali}</span>
            </div>

            {installment.remarks && (
              <div className="mt-2 text-xs text-slate-600">
                <span>कैफियत:</span> <em>{installment.remarks}</em>
              </div>
            )}

            {/* Signatures */}
            <div className="mt-10 flex justify-between pt-4 border-t border-slate-300 text-xs text-slate-700">
              <div className="text-center w-40">
                <div className="border-b border-dotted border-slate-400 mb-1 h-6"></div>
                <p>ऋणी / बुझाउनेको सही</p>
              </div>
              <div className="text-center w-48">
                <div className="border-b border-dotted border-slate-400 mb-1 h-6 font-semibold text-slate-800 flex items-end justify-center">
                  {installment.collectedBy}
                </div>
                <p>बुझिलिने (अधिकृत कर्मचारी)</p>
              </div>
            </div>
            <div className="mt-3 text-center text-[10px] text-slate-400">
              सफ्टवेयर प्रणालीद्वारा जारी गरिएको आधिकारिक रसिद | खानेपानी संस्था ईआरपी
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
