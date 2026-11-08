import React, { useState } from 'react';
import { Customer, OrganizationSettings } from '../types';
import { toNepaliDigits } from '../utils/nepaliUtils';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onBulkImportCustomers: (customers: Customer[]) => void;
}

export const CustomerKYCView: React.FC<Props> = ({
  settings,
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onBulkImportCustomers,
}) => {
  const currentBsDate = settings.currentSystemDateBS;

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'import'>('list');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Auto Customer ID
  const generateNextId = () => {
    const maxNum = customers.reduce((max, c) => {
      const match = c.id.match(/CUST-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `CUST-${String(maxNum + 1).padStart(3, '0')}`;
  };

  // Form Fields
  const [formData, setFormData] = useState<Partial<Customer>>({
    id: generateNextId(),
    tapNo: `धारा-${customers.length + 101}`,
    meterNo: `MTR-${8800 + customers.length + 1}`,
    fullName: '',
    fatherName: '',
    grandfatherName: '',
    dobBS: '२०३५-०१-०१',
    phone: '',
    wardNo: '४',
    tole: '',
    address: 'धुलिखेल-४',
    citizenshipNo: '',
    citizenshipIssueDateBS: '२०५५-०१-०१',
    plotNo: '',
    membershipDateBS: currentBsDate, // Auto current Nepali date!
    previousReading: 0,
    status: 'active',
  });

  const resetForm = () => {
    setFormData({
      id: generateNextId(),
      tapNo: `धारा-${customers.length + 101}`,
      meterNo: `MTR-${8800 + customers.length + 1}`,
      fullName: '',
      fatherName: '',
      grandfatherName: '',
      dobBS: '२०३५-०१-०१',
      phone: '',
      wardNo: '४',
      tole: '',
      address: 'धुलिखेल-४',
      citizenshipNo: '',
      citizenshipIssueDateBS: '२०५५-०१-०१',
      plotNo: '',
      membershipDateBS: currentBsDate,
      previousReading: 0,
      status: 'active',
    });
    setEditingCustomer(null);
  };

  const handleEditClick = (c: Customer) => {
    setEditingCustomer(c);
    setFormData(c);
    setActiveTab('add');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      setErrorMessage('कृपया ग्राहकको नाम र फोन नम्बर अनिवार्य भर्नुहोस्!');
      return;
    }

    if (editingCustomer) {
      onUpdateCustomer(formData as Customer);
      setSuccessMessage('ग्राहकको KYC विवरण सफलतापूर्वक अद्यावधिक (Updated) भयो!');
    } else {
      onAddCustomer(formData as Customer);
      setSuccessMessage(`नयाँ ग्राहक ${formData.fullName} (आइडी: ${formData.id}) सफलतापूर्वक दर्ता भयो!`);
    }

    resetForm();
    setActiveTab('list');
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 4000);
  };

  // CSV Import Parser
  const [csvText, setCsvText] = useState<string>('');
  const handleCsvImport = () => {
    try {
      if (!csvText.trim()) return;
      const lines = csvText.trim().split('\n');
      const imported: Customer[] = [];

      lines.forEach((line, idx) => {
        // Skip header if line contains 'नाम' or 'Name'
        if (idx === 0 && (line.includes('नाम') || line.includes('Name') || line.includes('Phone'))) return;
        const cols = line.split(',').map((item) => item.trim());
        if (cols.length >= 2 && cols[0]) {
          const autoId = `CUST-${String(customers.length + imported.length + 1).padStart(3, '0')}`;
          imported.push({
            id: cols[0].startsWith('CUST-') ? cols[0] : autoId,
            fullName: cols[1] || cols[0],
            phone: cols[2] || '9800000000',
            tapNo: cols[3] || `धारा-${customers.length + imported.length + 101}`,
            meterNo: cols[4] || `MTR-${8800 + customers.length + imported.length + 1}`,
            fatherName: cols[5] || '',
            grandfatherName: cols[6] || '',
            dobBS: cols[7] || '२०३५-०१-०१',
            wardNo: cols[8] || '४',
            tole: cols[9] || '',
            address: cols[10] || 'धुलिखेल-४',
            citizenshipNo: cols[11] || '',
            citizenshipIssueDateBS: cols[12] || '',
            plotNo: cols[13] || '',
            membershipDateBS: cols[14] || currentBsDate,
            previousReading: Number(cols[15]) || 0,
            status: 'active',
          });
        }
      });

      if (imported.length > 0) {
        onBulkImportCustomers(imported);
        setSuccessMessage(`${imported.length} जना नयाँ ग्राहकहरू एक्सेल/CSV बाट सफलतापूर्वक आयात (Import) भए!`);
        setCsvText('');
        setActiveTab('list');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage('कुनै मान्य ग्राहक डेटा फेला परेन। कृपया ढाँचा जाँच्नुहोस्।');
      }
    } catch (err) {
      setErrorMessage('CSV आयात गर्दा समस्या आयो। कृपया ढाँचा जाँच्नुहोस्।');
    }
  };

  // Download Sample CSV template
  const handleDownloadSampleCsv = () => {
    const sample =
      'ग्राहक_आइडी,ग्राहकको_नाम,फोन_नम्बर,धारा_नं,मिटर_नं,बुवाको_नाम,बाजेको_नाम,जन्ममिति_BS,वडा_नं,टोल,ठेगाना,नागरिकता_नं,जारी_मिति_BS,कित्ता_नं,सदस्य_मिति_BS,साविक_रिडिङ\n' +
      'CUST-010,प्रेम कुमार लामा,9851123456,धारा-११०,MTR-8810,सुकमान लामा,दोर्जे लामा,२०३८-०५-१०,४,लामा टोल,धुलिखेल-४,२६-०१-७५-१२३४५,२०५६-०६-१२,२८५,2081-07-22,120\n' +
      'CUST-011,अनिता श्रेष्ठ,9841887766,धारा-१११,MTR-8811,राम श्रेष्ठ,हरि श्रेष्ठ,२०४२-०८-१५,४,चौतारा टोल,धुलिखेल-४,२६-०१-७७-५४३२१,२०६०-१०-०५,१४०,2081-07-22,85';

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'khanepani_customer_sample_template.csv';
    link.click();
  };

  // Filter customers
  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.tapNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.citizenshipNo.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                ग्राहक केवाईसी तथा दर्ता व्यवस्थापन (Customer KYC)
              </h2>
              <p className="text-xs text-slate-500">
                अटो ग्राहक आइडी, तीनपुस्ते विवरण, नागरिकता, कित्ता नं र एक्सेल/CSV बल्क इम्पोर्ट
              </p>
            </div>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => {
                setActiveTab('list');
                resetForm();
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'list'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ग्राहक सूची ({toNepaliDigits(customers.length)})
            </button>
            <button
              onClick={() => {
                resetForm();
                setActiveTab('add');
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'add'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {editingCustomer ? 'केवाईसी सच्याउनुहोस्' : '+ नयाँ ग्राहक दर्ता'}
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'import'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              एक्सेल / CSV इम्पोर्ट
            </button>
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
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* View 1: Customer List */}
      {activeTab === 'list' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="ग्राहकको नाम, धारा नं, फोन वा नागरिकता नं खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
            <div className="text-xs text-slate-500">
              जम्मा ग्राहक: <strong className="font-mono text-slate-900">{toNepaliDigits(filteredCustomers.length)}</strong> जना
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">ग्राहक आइडी</th>
                  <th className="p-3">धारा नं</th>
                  <th className="p-3">ग्राहकको नाम</th>
                  <th className="p-3">बुवा / बाजेको नाम</th>
                  <th className="p-3">फोन नं</th>
                  <th className="p-3">ठेगाना / टोल</th>
                  <th className="p-3">नागरिकता नं</th>
                  <th className="p-3">कित्ता नं</th>
                  <th className="p-3 text-right">साविक रिडिङ</th>
                  <th className="p-3 text-center">स्थिति</th>
                  <th className="p-3 text-center">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-blue-600">{c.id}</td>
                    <td className="p-3 font-semibold text-slate-900">{c.tapNo}</td>
                    <td className="p-3 font-bold text-slate-900">{c.fullName}</td>
                    <td className="p-3 text-slate-600">
                      {c.fatherName ? `${c.fatherName} / ${c.grandfatherName}` : '-'}
                    </td>
                    <td className="p-3 font-mono text-slate-600">{c.phone}</td>
                    <td className="p-3 text-slate-600">
                      {c.tole ? `${c.tole}, वडा ${c.wardNo}` : c.address}
                    </td>
                    <td className="p-3 font-mono text-slate-500">{c.citizenshipNo || '-'}</td>
                    <td className="p-3 font-mono text-slate-500">{c.plotNo || '-'}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {toNepaliDigits(c.previousReading)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          c.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.status === 'active' ? 'सक्रिय' : 'निष्कृय'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditClick(c)}
                          title="विवरण सम्पादन गर्नुहोस्"
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`के तपाईं ग्राहक ${c.fullName} लाई हटाउन निश्चित हुनुहुन्छ?`)) {
                              onDeleteCustomer(c.id);
                            }
                          }}
                          title="हटाउनुहोस्"
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

      {/* View 2: Add / Edit KYC Form */}
      {activeTab === 'add' && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-6"
        >
          <div className="border-b pb-4 border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              {editingCustomer ? 'ग्राहक KYC विवरण अद्यावधिक' : 'नयाँ ग्राहक दर्ता फाराम'}
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              ग्राहक आइडी (अटोमेटिक): <strong className="font-mono text-blue-700 text-sm">{formData.id}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Customer ID (Auto) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ग्राहक आइडी (Auto Generated)
              </label>
              <input
                type="text"
                value={formData.id}
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2 font-mono text-xs font-bold text-slate-700 cursor-not-allowed"
              />
            </div>

            {/* Tap No */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                धारा नं <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.tapNo}
                onChange={(e) => setFormData({ ...formData, tapNo: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                placeholder="धारा-१०१"
                required
              />
            </div>

            {/* Meter No */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">मिटर नं</label>
              <input
                type="text"
                value={formData.meterNo}
                onChange={(e) => setFormData({ ...formData, meterNo: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                placeholder="MTR-8801"
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="border-t pt-4 border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              व्यक्तिगत तथा तीनपुस्ते विवरण
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ग्राहकको पूरा नाम <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  placeholder="उदा. रामप्रसाद न्यौपाने"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">बुवाको नाम</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  placeholder="उदा. केशव राज न्यौपाने"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">बाजेको नाम</label>
                <input
                  type="text"
                  value={formData.grandfatherName}
                  onChange={(e) => setFormData({ ...formData, grandfatherName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  placeholder="उदा. हरिलाल न्यौपाने"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  जन्ममिति (वि.सं.)
                </label>
                <input
                  type="text"
                  value={formData.dobBS}
                  onChange={(e) => setFormData({ ...formData, dobBS: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  placeholder="२०३५-०१-०१"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  मोबाइल / फोन नम्बर <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  placeholder="9851000000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ग्राहक बनेको मिति (अटोमेटिक नेपाली मिति)
                </label>
                <input
                  type="text"
                  value={formData.membershipDateBS}
                  onChange={(e) => setFormData({ ...formData, membershipDateBS: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono font-bold text-blue-700 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>
          </div>

          {/* Legal and Location Details */}
          <div className="border-t pt-4 border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              नागरिकता, जग्गा कित्ता र ठेगाना विवरण
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  नागरिकता नम्बर
                </label>
                <input
                  type="text"
                  value={formData.citizenshipNo}
                  onChange={(e) => setFormData({ ...formData, citizenshipNo: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  placeholder="२६-०१-७०-०१२३४"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  नागरिकता जारी मिति (वि.सं.)
                </label>
                <input
                  type="text"
                  value={formData.citizenshipIssueDateBS}
                  onChange={(e) => setFormData({ ...formData, citizenshipIssueDateBS: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  placeholder="२०५०-०५-१०"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  जग्गा कित्ता नम्बर
                </label>
                <input
                  type="text"
                  value={formData.plotNo}
                  onChange={(e) => setFormData({ ...formData, plotNo: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  placeholder="उदा. २४५/क"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  सुरुको मिटर साविक अङ्क (Initial Reading)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.previousReading}
                  onChange={(e) => setFormData({ ...formData, previousReading: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">वडा नं</label>
                <input
                  type="text"
                  value={formData.wardNo}
                  onChange={(e) => setFormData({ ...formData, wardNo: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  placeholder="४"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">टोल</label>
                <input
                  type="text"
                  value={formData.tole}
                  onChange={(e) => setFormData({ ...formData, tole: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  placeholder="चौतारा टोल"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">पूरा ठेगाना</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  placeholder="धुलिखेल नगरपालिका-४, काभ्रे"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab('list');
              }}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{editingCustomer ? 'अद्यावधिक सेभ गर्नुहोस्' : 'ग्राहक दर्ता गर्नुहोस्'}</span>
            </button>
          </div>
        </form>
      )}

      {/* View 3: Excel / CSV Bulk Import */}
      {activeTab === 'import' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>एक्सेल वा CSV फाइलबाट एकैपटक ग्राहक तान्नुहोस् (Bulk Customer Import)</span>
              </h3>
              <p className="text-xs text-slate-500">
                सुरुवाती समयमा संस्थाका सयौँ ग्राहकहरू एकै क्लिकमा सफ्टवेयरमा चढाउनको लागि
              </p>
            </div>

            <button
              onClick={handleDownloadSampleCsv}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>नमुना एक्सेल / CSV ढाँचा डाउनलोड गर्नुहोस्</span>
            </button>
          </div>

          <div className="rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900 border border-blue-200">
            <strong>प्रयोग विधि:</strong> तपाईंको कम्प्युटरको Excel फाइलबाट डाटा कपी गरी तलको बाकसमा सिधै पेस्ट गर्न सक्नुहुन्छ, अथवा नमुना CSV ढाँचा अनुसार डाटा राखी <em>आयात गर्नुहोस्</em> बटन थिच्नुहोस्।
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              CSV डाटा पेस्ट गर्नुहोस् (Comma Separated Data):
            </label>
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="ग्राहक_आइडी,नाम,फोन,धारा_नं,मिटर_नं,बुवाको_नाम,बाजेको_नाम,जन्ममिति,वडा,टोल,ठेगाना,नागरिकता,जारी_मिति,कित्ता_नं,सदस्य_मिति,साविक_अङ्क&#10;CUST-008,सुमन तामाङ,9851098765,धारा-१०८,MTR-8808,सोम तामाङ,दोर्जे तामाङ,२०३८-०२-११,४,टोल,धुलिखेल,२६-०१-७५,२०५५-०२-१०,११०,2081-07-22,50"
              className="w-full rounded-xl border border-slate-300 p-3 font-mono text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleCsvImport}
              disabled={!csvText.trim()}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <Upload className="h-4 w-4" />
              <span>ग्राहक डाटा आयात (Import) गर्नुहोस्</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
