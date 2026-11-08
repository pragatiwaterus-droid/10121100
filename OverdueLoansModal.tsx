import React from 'react';
import { Loan, OrganizationSettings } from '../types';
import {
  formatNepaliCurrency,
  toNepaliDigits,
  calculateBsDaysDiff,
  generateLoanOverdueWhatsAppText,
  createWhatsAppUrl,
} from '../utils/nepaliUtils';
import { AlertTriangle, Phone, MessageSquare, X, Calendar, User, ShieldAlert } from 'lucide-react';

interface Props {
  loans: Loan[];
  settings: OrganizationSettings;
  onClose: () => void;
  onSelectLoan?: (loanId: string) => void;
}

export const OverdueLoansModal: React.FC<Props> = ({ loans, settings, onClose, onSelectLoan }) => {
  const currentBsDate = settings.currentSystemDateBS;

  // Filter overdue loans
  const overdueLoans = loans.filter((loan) => {
    if (loan.remainingPrincipal <= 0) return false;
    return loan.maturityDateBS < currentBsDate || loan.status === 'overdue';
  });

  const totalOverduePrincipal = overdueLoans.reduce((sum, l) => sum + l.remainingPrincipal, 0);

  const handleSendWhatsApp = (loan: Loan) => {
    const text = generateLoanOverdueWhatsAppText(
      settings.orgName,
      loan.customerName,
      loan.id,
      loan.remainingPrincipal,
      loan.maturityDateBS,
      settings.orgPhone
    );
    const url = createWhatsAppUrl(loan.phone, text);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-rose-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-600 p-2.5 text-white shadow-xs">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  ऋणको म्याद सकिएको (भाखा नाघेको) सूचना तथा नोटिफिकेसन
                </h2>
                <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  {toNepaliDigits(overdueLoans.length)} जना
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5">
                चलिरहेको मिति {toNepaliDigits(currentBsDate)} सम्ममा म्याद नाघेका ऋणहरू (मोबाइलमा तुरुन्तै सन्देश पठाउनुहोस्)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-rose-50/40 border-b border-rose-100 text-sm">
          <div className="rounded-xl bg-white p-3 border border-rose-200">
            <span className="text-xs text-slate-500">भाखा नाघेका कुल ऋणी:</span>
            <div className="text-xl font-bold text-rose-700 font-mono">
              {toNepaliDigits(overdueLoans.length)} जना
            </div>
          </div>
          <div className="rounded-xl bg-white p-3 border border-rose-200">
            <span className="text-xs text-slate-500">उठाउन बाँकी जोखिम सावाँ:</span>
            <div className="text-xl font-bold text-rose-700 font-mono">
              {formatNepaliCurrency(totalOverduePrincipal)}
            </div>
          </div>
          <div className="rounded-xl bg-white p-3 border border-rose-200 flex flex-col justify-center">
            <span className="text-xs text-slate-500">कारबाही / सुझाव:</span>
            <span className="text-xs font-semibold text-slate-800">
              WhatsApp वा फोनमार्फत तत्काल ताकेता सूचना पठाउनुहोस्
            </span>
          </div>
        </div>

        {/* List of Overdue Loans */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {overdueLoans.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-base font-semibold text-slate-700">कुनै पनि ऋणीको म्याद सकिएको छैन।</p>
              <p className="text-xs mt-1">सबै ऋणहरू नियमित छन्।</p>
            </div>
          ) : (
            overdueLoans.map((loan) => {
              const daysOverdue = Math.max(0, calculateBsDaysDiff(loan.maturityDateBS, currentBsDate));
              return (
                <div
                  key={loan.id}
                  className="rounded-xl border border-rose-200 bg-white p-4 shadow-xs hover:border-rose-300 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {loan.id}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">{loan.customerName}</h3>
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-300 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {toNepaliDigits(daysOverdue)} दिन नाघ्यो
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400">फोन:</span>{' '}
                        <strong className="text-slate-700 font-mono">{loan.phone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">कुल लगानी:</span>{' '}
                        <span className="font-mono font-semibold">{formatNepaliCurrency(loan.principalAmount)}</span>
                      </div>
                      <div>
                        <span className="text-rose-600 font-semibold">बाँकी सावाँ:</span>{' '}
                        <strong className="font-mono text-rose-700">{formatNepaliCurrency(loan.remainingPrincipal)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">म्याद मिति:</span>{' '}
                        <strong className="text-slate-800">{toNepaliDigits(loan.maturityDateBS)}</strong>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-600">धितो/जमानी:</span> {loan.collateral || 'साधारण जमानी'}
                      {loan.notes && ` | कैफियत: ${loan.notes}`}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSendWhatsApp(loan)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
                      title="WhatsApp मा ताकेता सन्देश पठाउनुहोस्"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>WhatsApp सूचना</span>
                    </button>

                    <a
                      href={`tel:${loan.phone}`}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      title="सिधै फोन गर्नुहोस्"
                    >
                      <Phone className="h-3.5 w-3.5 text-blue-600" />
                      <span>फोन कल</span>
                    </a>

                    {onSelectLoan && (
                      <button
                        onClick={() => {
                          onSelectLoan(loan.id);
                          onClose();
                        }}
                        className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                      >
                        किस्ता असुली
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            मोबाइलमा सूचना पठाउन सम्बन्धित ऋणीको *WhatsApp सूचना* बटन थिच्नुहोस्।
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-300 transition"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
