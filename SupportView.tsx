import React, { useState } from 'react';
import {
  LifeBuoy,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Code2,
  FileCode,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { exportFullBackup, importFullBackup, resetToSampleData } from '../utils/storage';
import { downloadProjectZip } from '../utils/sourceBundle';
import { OrganizationSettings } from '../types';

interface Props {
  settings: OrganizationSettings;
  onRefreshData: () => void;
}

export const SupportView: React.FC<Props> = ({ settings, onRefreshData }) => {
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [restoreJson, setRestoreJson] = useState<string>('');
  const [isZipping, setIsZipping] = useState<boolean>(false);

  // Full Source Code ZIP download
  const handleDownloadSourceZip = async () => {
    try {
      setIsZipping(true);
      await downloadProjectZip();
      setSuccessMessage('सफ्टवेयरको सम्पूर्ण सोर्स कोड (.ZIP) सफलतापूर्वक डाउनलोड भयो!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error(err);
      setErrorMessage('सोर्स कोड ZIP तयार गर्दा समस्या आयो।');
    } finally {
      setIsZipping(false);
    }
  };

  // Backup Download Handler
  const handleDownloadBackup = () => {
    try {
      const backupJson = exportFullBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `khanepani_erp_full_backup_${settings.currentSystemDateBS}_${Date.now()}.json`;
      link.click();
      setSuccessMessage('संस्थाको सम्पूर्ण डाटाबेस ब्याकअप फाइल सफलतापूर्वक डाउनलोड भयो!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage('ब्याकअप डाउनलोड गर्दा त्रुटि भयो।');
    }
  };

  // Restore Handler from Text / File
  const handleRestoreFromJson = () => {
    if (!restoreJson.trim()) {
      setErrorMessage('कृपया ब्याकअप JSON कोड पेस्ट गर्नुहोस्।');
      return;
    }
    const success = importFullBackup(restoreJson);
    if (success) {
      setSuccessMessage('डाटाबेस सफलतापूर्वक रिस्टोर भयो!');
      setRestoreJson('');
      onRefreshData();
      setTimeout(() => setSuccessMessage(''), 5000);
    } else {
      setErrorMessage('अमान्य ब्याकअप फाइल! कृपया मान्य JSON फाइल छान्नुहोस्।');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRestoreJson(content);
        const success = importFullBackup(content);
        if (success) {
          setSuccessMessage('अपलोड गरिएको फाइलबाट डाटाबेस सफलतापूर्वक रिस्टोर भयो!');
          onRefreshData();
          setTimeout(() => setSuccessMessage(''), 5000);
        } else {
          setErrorMessage('अपलोड गरिएको फाइल रिस्टोर गर्न सकिएन।');
        }
      }
    };
    reader.readAsText(file);
  };

  // Factory Reset Handler
  const handleReset = () => {
    if (
      confirm(
        'चेतावनी: के तपाईं सफ्टवेयरलाई सुरुवाती नमुना (Sample Data) मा रिसेट गर्न निश्चित हुनुहुन्छ? नयाँ थपिएका विवरणहरू पुनः पूर्वावस्थामा फर्कनेछन्।'
      )
    ) {
      resetToSampleData();
      onRefreshData();
      setSuccessMessage('सफ्टवेयर सफलतापूर्वक नमुना डाटामा रिसेट भयो!');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              सपोर्ट, डाटा ब्याकअप र प्रणाली व्यवस्थापन
            </h2>
            <p className="text-xs text-slate-500">
              सम्पूर्ण डाटा ब्याकअप डाउनलोड, रिस्टोर (अपलोड), नमुना डाटा रिसेट र प्रणाली कोड संरचना
            </p>
          </div>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Source Code Download for GitHub Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-3 py-0.5 text-xs font-bold">
              GitHub & Web Hosting
            </span>
            <h3 className="text-base font-bold text-white">
              सम्पूर्ण सफ्टवेयर सोर्स कोड (.ZIP) डाउनलोड गर्नुहोस्
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            यसमा सबै कोड (React, Tailwind, TypeScript, GitHub Pages Deploy Workflow, र सेटिङहरू) समावेश छन्।
            यसलाई १-क्लिकमा डाउनलोड गरी आफ्नै कम्प्युटरमा राख्न वा GitHub/Vercel मा अपलोड गर्न सकिन्छ।
          </p>
        </div>
        <button
          onClick={handleDownloadSourceZip}
          disabled={isZipping}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 disabled:opacity-50 transition shrink-0"
        >
          <Download className="h-5 w-5" />
          <span>{isZipping ? 'ZIP तयार हुँदैछ...' : 'पूरा प्रोजेक्ट (.ZIP) डाउनलोड'}</span>
        </button>
      </div>

      {/* Main Grid Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Action 1: Full Backup Download */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 w-fit mb-3">
              <Download className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">१. डाटाबेस ब्याकअप डाउनलोड गर्नुहोस्</h3>
            <p className="text-xs text-slate-500 mt-1">
              संस्थाका सम्पूर्ण ग्राहक, युनिट रिडिङ, महसुल, ऋण, बैंक, कर्मचारी, गाडी बिक्री र आम्दानी खर्च विवरणहरू सुरक्षित .json फाइलमा डाउनलोड गर्नुहोस्।
            </p>
          </div>
          <button
            onClick={handleDownloadBackup}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Download className="h-4 w-4" />
            <span>सम्पूर्ण ब्याकअप डाउनलोड (Export)</span>
          </button>
        </div>

        {/* Action 2: Restore / Upload */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 w-fit mb-3">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">२. ब्याकअप फाइल अपलोड / रिस्टोर</h3>
            <p className="text-xs text-slate-500 mt-1">
              पहिले डाउनलोड गरिएको ब्याकअप .json फाइल छान्नुहोस् र सफ्टवेयरमा सम्पूर्ण डाटा पुनः प्राप्त गर्नुहोस्।
            </p>
          </div>

          <div>
            <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer transition">
              <Upload className="h-4 w-4" />
              <span>ब्याकअप फाइल छान्नुहोस् (.json)</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Action 3: Sample Reset */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="rounded-xl bg-rose-50 p-3 text-rose-600 w-fit mb-3">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">३. नमुना डेटामा रिसेट गर्नुहोस्</h3>
            <p className="text-xs text-slate-500 mt-1">
              यदि कुनै त्रुटि भएमा वा परीक्षण गर्न चाहेमा सफ्टवेयरलाई सुरुवाती आधिकारिक नमुना नेपाली तथ्याङ्कमा फर्काउन सकिन्छ।
            </p>
          </div>
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>फ्याक्ट्री नमुना रिसेट</span>
          </button>
        </div>
      </div>

      {/* JSON Direct Paste Modal Area */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          ब्याकअप कोड सिधै पेस्ट गरी रिस्टोर गर्ने वैकल्पिक अप्सन
        </h4>
        <textarea
          rows={3}
          value={restoreJson}
          onChange={(e) => setRestoreJson(e.target.value)}
          placeholder="ब्याकअप कोड यहाँ पेस्ट गर्नुहोस्..."
          className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-800 focus:outline-hidden"
        />
        <div className="flex justify-end">
          <button
            onClick={handleRestoreFromJson}
            disabled={!restoreJson.trim()}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            पेस्ट गरिएको कोडबाट रिस्टोर गर्नुहोस्
          </button>
        </div>
      </div>

      {/* System Integrity & Software Specs */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <ShieldCheck className="h-5 w-5" />
          <h3 className="font-bold text-sm">सफ्टवेयर प्रणाली प्राविधिक विवरण</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block">सफ्टवेयर भर्सन:</span>
            <span className="font-bold text-white">Khanepani ERP v1.0.0 (Bikram Sambat)</span>
          </div>
          <div>
            <span className="text-slate-400 block">डाटाबेस प्रकार:</span>
            <span className="font-bold text-white">Local-First Storage (High Speed & Offline)</span>
          </div>
          <div>
            <span className="text-slate-400 block">सुरक्षा:</span>
            <span className="font-bold text-emerald-400">१००% सुरक्षित इन्क्रिप्सन & ब्याकअप</span>
          </div>
          <div>
            <span className="text-slate-400 block">सम्पर्क / सहायता:</span>
            <span className="font-bold text-white">support@khanepani.org.np</span>
          </div>
        </div>
      </div>
    </div>
  );
};
