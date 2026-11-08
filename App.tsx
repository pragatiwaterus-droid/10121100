import React, { useState, useEffect } from 'react';
import {
  OrganizationSettings,
  Customer,
  MeterReading,
  BillPayment,
  Loan,
  LoanInstallment,
  BankAccount,
  BankTransaction,
  IncomeEntry,
  ExpenseEntry,
  Staff,
  StaffPayment,
  TankerSale,
  UserSession,
} from './types';
import {
  loadAllKhanepaniData,
  setStorageData,
  defaultSettings,
} from './utils/storage';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { WaterBillReceiptModal } from './components/WaterBillReceiptModal';
import { LoanReceiptModal } from './components/LoanReceiptModal';
import { A4ReadingSheetModal } from './components/A4ReadingSheetModal';
import { OverdueLoansModal } from './components/OverdueLoansModal';
import { SystemDateModal } from './components/SystemDateModal';
import { DownloadCenterModal } from './components/DownloadCenterModal';
import { LoginModal } from './views/LoginModal';

// Views
import { DashboardView } from './views/DashboardView';
import { UnitEntryView } from './views/UnitEntryView';
import { AmountEntryView } from './views/AmountEntryView';
import { CustomerKYCView } from './views/CustomerKYCView';
import { LoanView } from './views/LoanView';
import { BankView } from './views/BankView';
import { IncomeView } from './views/IncomeView';
import { ExpenseView } from './views/ExpenseView';
import { StaffView } from './views/StaffView';
import { TankerSalesView } from './views/TankerSalesView';
import { MeterSheetView } from './views/MeterSheetView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { MasterDatabaseView } from './views/MasterDatabaseView';
import { SupportView } from './views/SupportView';

export default function App() {
  // Master State loaded from localStorage
  const [data, setData] = useState(() => loadAllKhanepaniData());

  // User Session
  const [userSession, setUserSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem('khanepani_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      username: 'admin',
      fullName: 'सुनिता कार्की (व्यवस्थापक)',
      role: 'व्यवस्थापक (Admin)',
      isLoggedIn: true,
    };
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Modal States
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState<boolean>(false);
  const [isReadingSheetModalOpen, setIsReadingSheetModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [activeBillReceipt, setActiveBillReceipt] = useState<BillPayment | null>(null);
  const [activeLoanReceipt, setActiveLoanReceipt] = useState<LoanInstallment | null>(null);

  // Sync to localStorage
  const refreshAllData = () => {
    setData(loadAllKhanepaniData());
  };

  // Helper update setters
  const updateSettings = (newSettings: OrganizationSettings) => {
    setData((prev) => ({ ...prev, settings: newSettings }));
    setStorageData('khanepani_settings', newSettings);
  };

  const updateCustomers = (newCustomers: Customer[]) => {
    setData((prev) => ({ ...prev, customers: newCustomers }));
    setStorageData('khanepani_customers', newCustomers);
  };

  const updateReadings = (newReadings: MeterReading[]) => {
    setData((prev) => ({ ...prev, readings: newReadings }));
    setStorageData('khanepani_readings', newReadings);
  };

  const updatePayments = (newPayments: BillPayment[]) => {
    setData((prev) => ({ ...prev, payments: newPayments }));
    setStorageData('khanepani_payments', newPayments);
  };

  const updateLoans = (newL: Loan[]) => {
    setData((prev) => ({ ...prev, loans: newL }));
    setStorageData('khanepani_loans', newL);
  };

  const updateInstallments = (newInst: LoanInstallment[]) => {
    setData((prev) => ({ ...prev, loanInstallments: newInst }));
    setStorageData('khanepani_loan_installments', newInst);
  };

  const updateBanks = (newBanks: BankAccount[]) => {
    setData((prev) => ({ ...prev, banks: newBanks }));
    setStorageData('khanepani_banks', newBanks);
  };

  const updateBankTxns = (newTxns: BankTransaction[]) => {
    setData((prev) => ({ ...prev, bankTransactions: newTxns }));
    setStorageData('khanepani_bank_txns', newTxns);
  };

  const updateIncomes = (newIncomes: IncomeEntry[]) => {
    setData((prev) => ({ ...prev, incomes: newIncomes }));
    setStorageData('khanepani_incomes', newIncomes);
  };

  const updateExpenses = (newExpenses: ExpenseEntry[]) => {
    setData((prev) => ({ ...prev, expenses: newExpenses }));
    setStorageData('khanepani_expenses', newExpenses);
  };

  const updateStaff = (newStaff: Staff[]) => {
    setData((prev) => ({ ...prev, staff: newStaff }));
    setStorageData('khanepani_staff', newStaff);
  };

  const updateStaffPayments = (newPayments: StaffPayment[]) => {
    setData((prev) => ({ ...prev, staffPayments: newPayments }));
    setStorageData('khanepani_staff_payments', newPayments);
  };

  const updateTankerSales = (newSales: TankerSale[]) => {
    setData((prev) => ({ ...prev, tankerSales: newSales }));
    setStorageData('khanepani_tanker_sales', newSales);
  };

  // Change running system date
  const handleSaveSystemDate = (newDateBS: string) => {
    const updated: OrganizationSettings = {
      ...data.settings,
      currentSystemDateBS: newDateBS,
    };
    updateSettings(updated);
    setIsDateModalOpen(false);
  };

  // Unit Entry Save Handler
  const handleSaveReadingsFromUnitEntry = (
    savedReadings: MeterReading[],
    updatedCustomers: Customer[]
  ) => {
    // Merge readings
    const readingMap = new Map(data.readings.map((r) => [r.id, r]));
    savedReadings.forEach((r) => readingMap.set(r.id, r));
    const mergedReadings = Array.from(readingMap.values());

    updateReadings(mergedReadings);
    updateCustomers(updatedCustomers);
  };

  // Single Amount Payment Add
  const handleAddPayment = (newPayment: BillPayment) => {
    const updatedPayments = [newPayment, ...data.payments];
    updatePayments(updatedPayments);

    // Update reading paid status if readingId matches
    if (newPayment.readingId) {
      const updatedReadings = data.readings.map((r) => {
        if (r.id === newPayment.readingId) {
          return {
            ...r,
            paidStatus: 'paid' as const,
            paidAmount: newPayment.paidAmount,
            receiptNo: newPayment.receiptNo,
            paymentDateBS: newPayment.dateBS,
            paymentMethod: newPayment.paymentMethod,
          };
        }
        return r;
      });
      updateReadings(updatedReadings);
    }
  };

  // Update existing payment
  const handleUpdatePayment = (editedPayment: BillPayment) => {
    const updated = data.payments.map((p) => (p.id === editedPayment.id ? editedPayment : p));
    updatePayments(updated);
  };

  // Delete payment
  const handleDeletePayment = (paymentId: string) => {
    const deleted = data.payments.find((p) => p.id === paymentId);
    const updated = data.payments.filter((p) => p.id !== paymentId);
    updatePayments(updated);

    if (deleted?.readingId) {
      const updatedReadings = data.readings.map((r) => {
        if (r.id === deleted.readingId) {
          return {
            ...r,
            paidStatus: 'unpaid' as const,
            paidAmount: 0,
            receiptNo: undefined,
          };
        }
        return r;
      });
      updateReadings(updatedReadings);
    }
  };

  // Bulk Payments
  const handleBulkPay = (newPayments: BillPayment[]) => {
    const updatedPayments = [...newPayments, ...data.payments];
    updatePayments(updatedPayments);

    const paidReadingIds = new Set(newPayments.map((p) => p.readingId).filter(Boolean));
    const updatedReadings = data.readings.map((r) => {
      if (paidReadingIds.has(r.id)) {
        const matchingPay = newPayments.find((p) => p.readingId === r.id);
        return {
          ...r,
          paidStatus: 'paid' as const,
          paidAmount: matchingPay ? matchingPay.paidAmount : r.totalBillAmount,
          receiptNo: matchingPay?.receiptNo,
          paymentDateBS: matchingPay?.dateBS,
        };
      }
      return r;
    });
    updateReadings(updatedReadings);
  };

  // Loan Add
  const handleAddLoan = (newLoan: Loan) => {
    updateLoans([newLoan, ...data.loans]);
  };

  // Installment Add
  const handleAddInstallment = (installment: LoanInstallment, updatedLoan: Loan) => {
    updateInstallments([installment, ...data.loanInstallments]);
    const updatedLoans = data.loans.map((l) => (l.id === updatedLoan.id ? updatedLoan : l));
    updateLoans(updatedLoans);
  };

  // Bank Transaction Add
  const handleAddBankTxn = (txn: BankTransaction) => {
    const updatedTxns = [txn, ...data.bankTransactions];
    updateBankTxns(updatedTxns);

    // Update bank account balance
    const updatedBanks = data.banks.map((b) => {
      if (b.id === txn.bankId) {
        return {
          ...b,
          balance: txn.type === 'deposit' ? b.balance + txn.amount : b.balance - txn.amount,
        };
      }
      return b;
    });
    updateBanks(updatedBanks);
  };

  // Incomes & Expenses
  const handleAddIncome = (income: IncomeEntry) => {
    updateIncomes([income, ...data.incomes]);
  };

  const handleAddExpense = (expense: ExpenseEntry) => {
    updateExpenses([expense, ...data.expenses]);
  };

  // Staff & Payroll
  const handleAddStaff = (newStaff: Staff) => {
    updateStaff([...data.staff, newStaff]);
  };

  const handleAddStaffPayment = (newPay: StaffPayment) => {
    updateStaffPayments([newPay, ...data.staffPayments]);
  };

  // Tanker Sales
  const handleAddTankerSale = (sale: TankerSale) => {
    updateTankerSales([sale, ...data.tankerSales]);
  };

  // Customer KYC CRUD
  const handleAddCustomer = (c: Customer) => {
    updateCustomers([...data.customers, c]);
  };

  const handleUpdateCustomer = (c: Customer) => {
    const updated = data.customers.map((cust) => (cust.id === c.id ? c : cust));
    updateCustomers(updated);
  };

  const handleDeleteCustomer = (cId: string) => {
    updateCustomers(data.customers.filter((c) => c.id !== cId));
  };

  const handleBulkImportCustomers = (imported: Customer[]) => {
    updateCustomers([...data.customers, ...imported]);
  };

  // Logout handler
  const handleLogout = () => {
    setUserSession({
      username: '',
      fullName: '',
      role: 'व्यवस्थापक (Admin)',
      isLoggedIn: false,
    });
    localStorage.removeItem('khanepani_current_user');
  };

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    localStorage.setItem('khanepani_current_user', JSON.stringify(session));
  };

  // Calculate Overdue loans count
  const overdueLoansCount = data.loans.filter(
    (l) => l.remainingPrincipal > 0 && (l.maturityDateBS < data.settings.currentSystemDateBS || l.status === 'overdue')
  ).length;

  // If user is not logged in, show Login Screen
  if (!userSession.isLoggedIn) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* 1. System Header with Date pill, Overdue alert, and user info */}
      <Header
        settings={data.settings}
        loans={data.loans}
        currentUsername={userSession.fullName}
        userRole={userSession.role}
        onOpenDateModal={() => setIsDateModalOpen(true)}
        onOpenOverdueModal={() => setIsOverdueModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Navigation Tab Menu */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        overdueLoansCount={overdueLoansCount}
      />

      {/* 3. Main Views Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            settings={data.settings}
            customers={data.customers}
            readings={data.readings}
            payments={data.payments}
            loans={data.loans}
            banks={data.banks}
            incomes={data.incomes}
            expenses={data.expenses}
            onNavigate={setActiveTab}
            onOpenOverdueModal={() => setIsOverdueModalOpen(true)}
            onOpenReadingSheetModal={() => setIsReadingSheetModalOpen(true)}
            onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          />
        )}

        {activeTab === 'unit_entry' && (
          <UnitEntryView
            settings={data.settings}
            customers={data.customers}
            readings={data.readings}
            onSaveReadings={handleSaveReadingsFromUnitEntry}
          />
        )}

        {activeTab === 'amount_entry' && (
          <AmountEntryView
            settings={data.settings}
            customers={data.customers}
            readings={data.readings}
            payments={data.payments}
            onAddPayment={handleAddPayment}
            onUpdatePayment={handleUpdatePayment}
            onDeletePayment={handleDeletePayment}
            onBulkPay={handleBulkPay}
            onPrintReceipt={(p) => setActiveBillReceipt(p)}
          />
        )}

        {activeTab === 'kyc_customer' && (
          <CustomerKYCView
            settings={data.settings}
            customers={data.customers}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onBulkImportCustomers={handleBulkImportCustomers}
          />
        )}

        {activeTab === 'loan' && (
          <LoanView
            settings={data.settings}
            loans={data.loans}
            installments={data.loanInstallments}
            customers={data.customers}
            onAddLoan={handleAddLoan}
            onAddInstallment={handleAddInstallment}
            onPrintInstallmentReceipt={(inst) => setActiveLoanReceipt(inst)}
            onOpenOverdueModal={() => setIsOverdueModalOpen(true)}
          />
        )}

        {activeTab === 'bank' && (
          <BankView
            settings={data.settings}
            banks={data.banks}
            transactions={data.bankTransactions}
            onAddTransaction={handleAddBankTxn}
            onAddBank={(b) => updateBanks([...data.banks, b])}
          />
        )}

        {activeTab === 'income' && (
          <IncomeView
            settings={data.settings}
            incomes={data.incomes}
            onAddIncome={handleAddIncome}
          />
        )}

        {activeTab === 'expense' && (
          <ExpenseView
            settings={data.settings}
            expenses={data.expenses}
            onAddExpense={handleAddExpense}
          />
        )}

        {activeTab === 'staff' && (
          <StaffView
            settings={data.settings}
            staffList={data.staff}
            staffPayments={data.staffPayments}
            tankerSales={data.tankerSales}
            onAddStaff={handleAddStaff}
            onAddPayment={handleAddStaffPayment}
          />
        )}

        {activeTab === 'tanker_sales' && (
          <TankerSalesView
            settings={data.settings}
            tankerSales={data.tankerSales}
            staffList={data.staff}
            onAddSale={handleAddTankerSale}
          />
        )}

        {activeTab === 'meter_sheet' && (
          <MeterSheetView
            settings={data.settings}
            customers={data.customers}
            readings={data.readings}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            settings={data.settings}
            customers={data.customers}
            readings={data.readings}
            payments={data.payments}
            loans={data.loans}
            installments={data.loanInstallments}
            banks={data.banks}
            incomes={data.incomes}
            expenses={data.expenses}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={data.settings}
            onUpdateSettings={updateSettings}
            onOpenDateModal={() => setIsDateModalOpen(true)}
          />
        )}

        {activeTab === 'master_db' && (
          <MasterDatabaseView
            settings={data.settings}
            customers={data.customers}
            payments={data.payments}
            loans={data.loans}
            installments={data.loanInstallments}
            bankTxns={data.bankTransactions}
            incomes={data.incomes}
            expenses={data.expenses}
            staffPayments={data.staffPayments}
            tankerSales={data.tankerSales}
          />
        )}

        {activeTab === 'support' && (
          <SupportView
            settings={data.settings}
            onRefreshData={refreshAllData}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      {/* 1. Running System Date Change Modal */}
      {isDateModalOpen && (
        <SystemDateModal
          currentDateBS={data.settings.currentSystemDateBS}
          onSave={handleSaveSystemDate}
          onClose={() => setIsDateModalOpen(false)}
        />
      )}

      {/* 2. Overdue Loans Notification & WhatsApp Alert Modal */}
      {isOverdueModalOpen && (
        <OverdueLoansModal
          loans={data.loans}
          settings={data.settings}
          onClose={() => setIsOverdueModalOpen(false)}
          onSelectLoan={(lId) => {
            setActiveTab('loan');
            setIsOverdueModalOpen(false);
          }}
        />
      )}

      {/* 3. A4 Meter Reading Field Record Sheet Modal */}
      {isReadingSheetModalOpen && (
        <A4ReadingSheetModal
          customers={data.customers}
          settings={data.settings}
          onClose={() => setIsReadingSheetModalOpen(false)}
        />
      )}

      {/* 4. Official Water Bill Payment Receipt Print Modal */}
      {activeBillReceipt && (
        <WaterBillReceiptModal
          payment={activeBillReceipt}
          settings={data.settings}
          onClose={() => setActiveBillReceipt(null)}
        />
      )}

      {/* 5. Loan Installment Payment Receipt Print Modal */}
      {activeLoanReceipt && (
        <LoanReceiptModal
          installment={activeLoanReceipt}
          settings={data.settings}
          onClose={() => setActiveLoanReceipt(null)}
        />
      )}

      {/* 6. Download Center Modal */}
      {isDownloadModalOpen && (
        <DownloadCenterModal
          settings={data.settings}
          customers={data.customers}
          payments={data.payments}
          loans={data.loans}
          readings={data.readings}
          onClose={() => setIsDownloadModalOpen(false)}
          onOpenReadingSheet={() => setIsReadingSheetModalOpen(true)}
          onNavigateToReports={() => setActiveTab('reports')}
        />
      )}
    </div>
  );
}
