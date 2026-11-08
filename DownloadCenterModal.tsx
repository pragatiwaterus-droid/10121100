import React from 'react';
import { Download, FileSpreadsheet, Database, Printer, Smartphone, Laptop, X, FileText, CheckCircle2 } from 'lucide-react';
import { Customer, OrganizationSettings, BillPayment, Loan, MeterReading } from '../types';
import { exportFullBackup } from '../utils/storage';

import { downloadProjectZip } from '../utils/sourceBundle';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  payments: BillPayment[];
  loans: Loan[];
  readings: MeterReading[];
  onClose: () => void;
  onOpenReadingSheet: () => void;
  onNavigateToReports: () => void;
}

export const DownloadCenterModal: React.FC<Props> = ({
  settings,
  customers,
  payments,
  loans,
  readings,
  onClose,
  onOpenReadingSheet,
  onNavigateToReports,
}) => {
  const [isZipping, setIsZipping] = React.useState<boolean>(false);
  const [zipSuccess, setZipSuccess] = React.useState<string>('');

  // Download entire source code ZIP for GitHub
  const handleDownloadSourceZip = async () => {
    try {
      setIsZipping(true);
      await downloadProjectZip();
      setZipSuccess('सफ्टवेयरको सम्पूर्ण कोड (.ZIP) सफलतापूर्वक डाउनलोड भयो!');
      setTimeout(() => setZipSuccess(''), 5000);
    } catch (err) {
      console.error(err);
      alert('ZIP तयार गर्दा समस्या आयो।');
    } finally {
      setIsZipping(false);
    }
  };
  // 1. Download Full JSON Backup
  const handleDownloadBackup = () => {
    const backupJson = exportFullBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `khanepani_full_backup_${settings.currentSystemDateBS}_${Date.now()}.json`;
    link.click();
  };

  // 2. Download Customers CSV
  const handleDownloadCustomersCsv = () => {
    const headers = 'ग्राहक_आइडी,धारा_नं,मिटर_नं,ग्राहकको_नाम,फोन_नम्बर,ठेगाना,वडा_नं,टोल,बुवाको_नाम,बाजेको_नाम,नागरिकता_नं,कित्ता_नं,साविक_रिडिङ,स्थिति\n';
    const rows = customers
      .map(
        (c) =>
          `"${c.id}","${c.tapNo}","${c.meterNo}","${c.fullName}","${c.phone}","${c.address}","${c.wardNo}","${c.tole}","${c.fatherName}","${c.grandfatherName}","${c.citizenshipNo}","${c.plotNo}","${c.previousReading}","${c.status}"`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `khanepani_customers_${settings.currentSystemDateBS}.csv`;
    link.click();
  };

  // 3. Download Loans Statement CSV
  const handleDownloadLoansCsv = () => {
    const headers = 'ऋण_खाता_नं,सदस्यको_नाम,सम्पर्क_फोन,कुल_ऋण_लगानी,वार्षिक_ब्याजदर,लगानी_मिति,म्याद_मिति,फिर्ता_सावाँ,बाँकी_सावाँ,प्राप्त_ब्याज,स्थिति\n';
    const rows = loans
      .map(
        (l) =>
          `"${l.id}","${l.customerName}","${l.phone}","${l.principalAmount}","${l.interestRatePercent}%","${l.issueDateBS}","${l.maturityDateBS}","${l.repaidPrincipal}","${l.remainingPrincipal}","${l.totalInterestPaid}","${l.status}"`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `khanepani_loans_${settings.currentSystemDateBS}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2 text-white">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">डाउनलोड केन्द्र (Download & Export Center)</h2>
              <p className="text-xs text-slate-500">
                तथ्याङ्क ब्याकअप, एक्सेल (CSV), A4 फाराम तथा सफ्टवेयर डाउनलोड गर्ने विधि
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* GitHub Source Code ZIP Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold">
                  GitHub & Hosting Ready
                </span>
                <h3 className="font-bold text-sm text-white">
                  सफ्टवेयरको सम्पूर्ण कोड (.ZIP) डाउनलोड गर्नुहोस्
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                यस .ZIP फाइललाई खोलेर तपाईंले सिधै GitHub मा राख्न र Vercel वा Netlify मा अनलाइन चलाउन सक्नुहुन्छ।
              </p>
            </div>
            <button
              onClick={handleDownloadSourceZip}
              disabled={isZipping}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 disabled:opacity-50 transition shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>{isZipping ? 'तयार हुँदैछ...' : 'पूरा कोड (ZIP) डाउनलोड'}</span>
            </button>
          </div>

          {zipSuccess && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{zipSuccess}</span>
            </div>
          )}

          {/* Section 1: Data Downloads */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              १. तथ्याङ्क तथा एक्सेल फाइल डाउनलोड गर्नुहोस्
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Full Backup */}
              <button
                onClick={handleDownloadBackup}
                className="flex flex-col items-start p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 hover:bg-blue-100 transition text-left group"
              >
                <div className="rounded-xl bg-blue-600 p-2 text-white mb-2 group-hover:scale-105 transition-transform">
                  <Database className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-blue-950">पूर्ण डाटाबेस ब्याकअप</span>
                <span className="text-[10px] text-blue-700 mt-0.5">सबै विवरण सुरक्षित .JSON फाइल</span>
                <span className="mt-2 text-[11px] font-semibold text-blue-800 flex items-center gap-1">
                  <Download className="h-3 w-3" /> डाउनलोड गर्नुहोस्
                </span>
              </button>

              {/* Customers CSV */}
              <button
                onClick={handleDownloadCustomersCsv}
                className="flex flex-col items-start p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-100 transition text-left group"
              >
                <div className="rounded-xl bg-emerald-600 p-2 text-white mb-2 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-emerald-950">ग्राहक सूची (Excel/CSV)</span>
                <span className="text-[10px] text-emerald-700 mt-0.5">नाम, फोन, कित्ता, धारा नं</span>
                <span className="mt-2 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                  <Download className="h-3 w-3" /> डाउनलोड गर्नुहोस्
                </span>
              </button>

              {/* Loans CSV */}
              <button
                onClick={handleDownloadLoansCsv}
                className="flex flex-col items-start p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 hover:bg-indigo-100 transition text-left group"
              >
                <div className="rounded-xl bg-indigo-600 p-2 text-white mb-2 group-hover:scale-105 transition-transform">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-indigo-950">ऋण स्टेटमेन्ट (CSV)</span>
                <span className="text-[10px] text-indigo-700 mt-0.5">लगानी, असुली, बाँकी सावाँ</span>
                <span className="mt-2 text-[11px] font-semibold text-indigo-800 flex items-center gap-1">
                  <Download className="h-3 w-3" /> डाउनलोड गर्नुहोस्
                </span>
              </button>
            </div>
          </div>

          {/* Section 2: Printable PDF / A4 Documents */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              २. A4 प्रिन्ट तथा PDF डाउनलोड (Print & Save as PDF)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onClose();
                  onOpenReadingSheet();
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition text-left"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">फिल्ड मिटर रिडिङ शीट (A4)</span>
                  <span className="text-[10px] text-slate-500">साविक अङ्क भरिएको, हालको अङ्क खाली फाराम</span>
                </div>
                <span className="rounded-lg bg-blue-100 text-blue-700 p-2 shrink-0">
                  <Printer className="h-4 w-4" />
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigateToReports();
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition text-left"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">वित्तीय प्रतिवेदन (P&L, वासलात)</span>
                  <span className="text-[10px] text-slate-500">A4 साइजमा PDF सेभ वा सिधै प्रिन्ट</span>
                </div>
                <span className="rounded-lg bg-purple-100 text-purple-700 p-2 shrink-0">
                  <Printer className="h-4 w-4" />
                </span>
              </button>
            </div>
          </div>

          {/* Section 3: How to Install / Download software on Mobile / PC */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              ३. सफ्टवेयरलाई मोबाइल वा कम्प्युटरमा एप (App) बनाएर राख्ने तरिका
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                  <span>मोबाइलमा इन्स्टल गर्ने (Android / iPhone):</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  १. मोबाइलको <strong>Chrome</strong> वा <strong>Safari</strong> मा यो लिङ्क खोल्नुहोस्।<br />
                  २. माथि दाहिने कुनाको <strong>तीन थोप्ला (⋮)</strong> वा <strong>Share</strong> बटन थिच्नुहोस्।<br />
                  ३. <strong>&ldquo;Add to Home screen&rdquo;</strong> (होम स्क्रिनमा थप्नुहोस्) मा थिच्नुहोस्। यसपछि मोबाइलमा सिधै एप जस्तै खुल्नेछ।
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Laptop className="h-4 w-4 text-blue-600" />
                  <span>कम्प्युटर / ल्यापटपमा इन्स्टल गर्ने:</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  १. <strong>Google Chrome</strong> वा <strong>Edge</strong> ब्राउजरमा खोल्नुहोस्।<br />
                  २. एड्रेस बारको दाहिनेपट्टि रहेको <strong>इन्स्टल आइकन (Install icon)</strong> मा थिच्नुहोस्।<br />
                  ३. कम्प्युटरको डेस्कटपमा सर्टकट बस्नेछ र बिना ब्राउजर सिधै सफ्टवेयर चल्नेछ।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300 transition"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
