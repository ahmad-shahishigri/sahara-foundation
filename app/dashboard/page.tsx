// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import { supabase } from "@/lib/supabaseClient";
import StatCard from "./components/StatCard";
import ActionButtons from "./components/ActionButtons";
import RecentActivity from "./components/RecentActivity";
import DonerForm from "../Doner/DonerForms";
import ExpenseFormModal from "./components/ExpenseFormModal";
import LoanFormModal from "./components/LoanFormModal";
import LoanRecordsModal from "./components/LoanRecordsModal";
import ViewDonors from "../Donerlist/view_doner";

// Import the other components with fallbacks
import { getDashboardStats } from "./utils/calculations";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // State for all modals
  const [showDonorForm, setShowDonorForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showViewDonors, setShowViewDonors] = useState(false);
  const [showLoanRecords, setShowLoanRecords] = useState(false);

  // State for tracking which components are available
  const [componentsAvailable, setComponentsAvailable] = useState({
    expenseForm: true,
    loanForm: false,
    viewDonors: false,
    loanRecords: false,
  });

  // Check if components exist
  useEffect(() => {
    async function checkComponents() {
      try {
        // Try to dynamically import components to see if they exist
        const components = {
          expenseForm: true,
          loanForm: false,
          viewDonors: false,
          loanRecords: false,
        };

        // You can add dynamic imports here if you want
        // For now, we'll set them to false since we know they don't exist yet
        setComponentsAvailable(components);
      } catch (error) {
        console.log("Some components are not available yet");
      }
    }

    checkComponents();
  }, []);

  // Fetch dashboard stats
  // Fetch stats whenever refreshKey changes
  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        if (!mounted) return;
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchStats();

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  // Setup realtime subscriptions once (do not recreate on every refresh)
  useEffect(() => {
    let donorsChannel: any | null = null;
    let expenseChannel: any | null = null;

    try {
      donorsChannel = supabase
        .channel('doner_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'doner' },
          () => setRefreshKey(prev => prev + 1)
        )
        .subscribe();

      expenseChannel = supabase
        .channel('expense_records_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'expense_records' },
          () => setRefreshKey(prev => prev + 1)
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription failed (optional):', err);
    }

    return () => {
      if (donorsChannel && typeof donorsChannel.unsubscribe === 'function') donorsChannel.unsubscribe();
      if (expenseChannel && typeof expenseChannel.unsubscribe === 'function') expenseChannel.unsubscribe();
    };
  }, []);

  // Handle successful actions
  const handleSuccess = async () => {
    // Add a small delay to ensure database is synced
    await new Promise(resolve => setTimeout(resolve, 500));

    // Close all modals
    setShowDonorForm(false);
    setShowExpenseForm(false);
    setShowLoanForm(false);

    // Refresh the dashboard data
    setRefreshKey(prev => prev + 1);
  };

  // ----- Optimistic UI helpers -----
  const applyOptimisticDonor = (donor: any) => {
    setStats((prev: any) => {
      const p = prev || {};
      const totalFunds = (p.totalFunds || 0) + (donor.total_amount || 0);
      const totalDonors = (p.totalDonors || 0) + 1;
      const availableBalance = (p.availableBalance || 0) + (donor.total_amount || 0);
      const recentDonors = [donor, ...(p.recentDonors || [])].slice(0, 5);
      return { ...p, totalFunds, totalDonors, availableBalance, recentDonors };
    });
  };

  const rollbackDonor = (tempId: string) => {
    setStats((prev: any) => {
      if (!prev) return prev;
      const recentDonors = (prev.recentDonors || []).filter((d: any) => d.id !== tempId);
      const removed = (prev.recentDonors || []).find((d: any) => d.id === tempId);
      const totalFunds = removed ? Math.max(0, (prev.totalFunds || 0) - (removed.total_amount || 0)) : (prev.totalFunds || 0);
      const totalDonors = removed ? Math.max(0, (prev.totalDonors || 0) - 1) : (prev.totalDonors || 0);
      const availableBalance = removed ? Math.max(0, (prev.availableBalance || 0) - (removed.total_amount || 0)) : (prev.availableBalance || 0);
      return { ...prev, recentDonors, totalFunds, totalDonors, availableBalance };
    });
  };

  const applyOptimisticRecord = (rec: any) => {
    setStats((prev: any) => {
      const p = prev || {};
      const recentTransactions = [rec, ...(p.recentTransactions || [])].slice(0, 5);
      let totalExpenses = p.totalExpenses || 0;
      let totalLoans = p.totalLoans || 0;
      let totalActiveLoans = p.totalActiveLoans || 0;
      let availableBalance = p.availableBalance || 0;

      if (rec.type === "expense") {
        totalExpenses += rec.total_amount || 0;
        availableBalance -= rec.total_amount || 0;
      } else {
        totalLoans += rec.total_amount || 0;
        totalActiveLoans += (rec.remaining_amount ?? rec.total_amount) || 0;
        availableBalance -= rec.total_amount || 0;
      }

      return { ...p, recentTransactions, totalExpenses, totalLoans, totalActiveLoans, availableBalance };
    });
  };

  const rollbackRecord = (tempId: string) => {
    setStats((prev: any) => {
      if (!prev) return prev;
      const recentTransactions = (prev.recentTransactions || []).filter((r: any) => r.id !== tempId);
      const removed = (prev.recentTransactions || []).find((r: any) => r.id === tempId);
      let totalExpenses = prev.totalExpenses || 0;
      let totalLoans = prev.totalLoans || 0;
      let totalActiveLoans = prev.totalActiveLoans || 0;
      let availableBalance = prev.availableBalance || 0;

      if (removed) {
        if (removed.type === "expense") {
          totalExpenses = Math.max(0, totalExpenses - (removed.total_amount || 0));
          availableBalance = Math.max(0, availableBalance + (removed.total_amount || 0));
        } else {
          totalLoans = Math.max(0, totalLoans - (removed.total_amount || 0));
          totalActiveLoans = Math.max(0, totalActiveLoans - ((removed.remaining_amount ?? removed.total_amount) || 0));
          availableBalance = Math.max(0, availableBalance + (removed.total_amount || 0));
        }
      }

      return { ...prev, recentTransactions, totalExpenses, totalLoans, totalActiveLoans, availableBalance };
    });
  };

  // Default values if stats are null
  const {
    totalFunds = 0,
    totalLoans = 0,
    totalExpenses = 0,
    availableBalance = 0,
    totalActiveLoans = 0,
    totalDonors = 0,
    totalLoansCount = 0,
    totalExpensesCount = 0,
    recentDonors = [],
    recentTransactions = []
  } = stats || {};

  // Derived, dynamic UI values (used for progress bars & descriptions)
  const avgDonation = totalDonors > 0 ? Math.round(totalFunds / totalDonors) : 0;
  const fundsUtilizationPct = totalFunds > 0 ? Math.round(((totalExpenses + totalActiveLoans) / totalFunds) * 100) : 0;
  const availablePct = totalFunds > 0 ? Math.round((availableBalance / totalFunds) * 100) : 0;
  const loansOutstandingPct = totalLoans > 0 ? Math.round((totalActiveLoans / totalLoans) * 100) : 0;
  const expensesPct = totalFunds > 0 ? Math.round((totalExpenses / totalFunds) * 100) : 0;
  const recoveryPct = totalLoans > 0 ? Math.round(((totalLoans - totalActiveLoans) / totalLoans) * 100) : 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Sahara Foundation Dashboard <b>(Admin)</b></h1>
        <p style={{ textAlign: "center" }} >Real-time financial overview and management</p>
      </div>

      {/* Main Stats Row */}
      <div className={styles.mainStatsRow}>
        <StatCard
          title="Total Funds Received"
          amount={formatCurrency(totalFunds)}
          icon="💰"
          trend="positive"
          progress={100}
          description={`${totalDonors} donors • Avg ${formatCurrency(avgDonation)}`}
        />

        <StatCard
          title="Available Balance"
          amount={formatCurrency(availableBalance)}
          icon="💳"
          trend={availableBalance > 0 ? "positive" : "negative"}
          progress={availablePct}
          description={`${availablePct}% available of total funds`}
        />

        <StatCard
          title="Total Loans Given"
          amount={formatCurrency(totalLoans)}
          icon="📝"
          trend="neutral"
          progress={loansOutstandingPct}
          description={`${totalLoansCount} loans • ${loansOutstandingPct}% outstanding`}
        />

        <StatCard
          title="Total Expenses"
          amount={formatCurrency(totalExpenses)}
          icon="💸"
          trend="expense"
          progress={expensesPct}
          description={`${totalExpensesCount} expenses • ${expensesPct}% of funds`}
        />
      </div>

      {/* Secondary Stats Row */}
      <div className={styles.secondaryStatsRow}>
        <StatCard
          title="Active Loans"
          amount={formatCurrency(totalActiveLoans)}
          icon="🔄"
          trend="warning"
          progress={loansOutstandingPct}
          description={`${formatCurrency(totalActiveLoans)} outstanding`}
          variant="secondary"
        />

        <StatCard
          title="Total Donors"
          amount={formatNumber(totalDonors)}
          icon="👥"
          trend="positive"
          progress={100}
          description={`${totalDonors} active contributors • Avg ${formatCurrency(avgDonation)}`}
          variant="secondary"
        />

        <StatCard
          title="Loan Recovery Rate"
          amount={`${recoveryPct}%`}
          icon="📊"
          trend="positive"
          progress={recoveryPct}
          description={`${formatCurrency(totalLoans - totalActiveLoans)} recovered of ${formatCurrency(totalLoans)}`}
          variant="secondary"
        />

        <StatCard
          title="Funds Utilization"
          amount={`${fundsUtilizationPct}%`}
          icon="⚡"
          trend="neutral"
          progress={fundsUtilizationPct}
          description={`${formatCurrency(totalExpenses + totalActiveLoans)} used of ${formatCurrency(totalFunds)}`}
          variant="secondary"
        />
      </div>

      {/* Action Buttons */}
      <ActionButtons
        onAddDonor={() => setShowDonorForm(true)}
        onAddExpense={() => setShowExpenseForm(true)}
        onAddLoan={() => setShowLoanForm(true)}
        onViewDonors={() => setShowViewDonors(true)}
        onViewLoanRecords={() => setShowLoanRecords(true)}
      />

      {/* Recent Activity & Quick Stats */}
      <div className={styles.activitySection}>
        <div className={styles.recentActivity}>
          <h3 className={styles.sectionTitle}>📋 Recent Activity</h3>
          <RecentActivity
            recentDonors={recentDonors}
            recentTransactions={recentTransactions}
          />
        </div>


      </div>

      {/* MODALS */}

      {/* Donor Form - This works */}
      {showDonorForm && (
        <DonerForm
          onClose={() => setShowDonorForm(false)}
          onSuccess={handleSuccess}
          onOptimistic={applyOptimisticDonor}
          onRollback={rollbackDonor}
        />
      )}

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseFormModal
          onClose={() => setShowExpenseForm(false)}
          onSuccess={handleSuccess}
          onOptimistic={applyOptimisticRecord}
          onRollback={rollbackRecord}
        />
      )}

      {/* Loan Form Modal */}
      {showLoanForm && (
        <LoanFormModal
          onClose={() => setShowLoanForm(false)}
          onSuccess={handleSuccess}
          onOptimistic={applyOptimisticRecord}
          onRollback={rollbackRecord}
        />
      )}

      {/* View Donors */}
      {showViewDonors && (
        <ViewDonors isModal={true} onClose={() => setShowViewDonors(false)} refreshKey={refreshKey} />
      )}

      {/* Loan Records Modal */}
      <LoanRecordsModal isOpen={showLoanRecords} onClose={() => setShowLoanRecords(false)} />
    </div>
  );
}