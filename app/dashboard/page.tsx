// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import StatCard from "./components/StatCard";
import ActionButtons from "./components/ActionButtons";
import RecentActivity from "./components/RecentActivity";
import DonerForm from "../Doner/DonerForms";
import ExpenseForm from "../spent/spent-form";
import LoanForm from "../loan/loan-form";

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
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [refreshKey]);

  // Handle successful actions
  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
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
        <p style={{textAlign:"center"}} >Real-time financial overview and management</p>
      </div>

      {/* Main Stats Row */}
      <div className={styles.mainStatsRow}>
        <StatCard 
          title="Total Funds Received" 
          amount={formatCurrency(totalFunds)}
          icon="💰"
          trend="positive"
          description="All-time donations"
        />
        
        <StatCard 
          title="Available Balance" 
          amount={formatCurrency(availableBalance)}
          icon="💳"
          trend={availableBalance > 0 ? "positive" : "negative"}
          description="Current usable funds"
        />
        
        <StatCard 
          title="Total Loans Given" 
          amount={formatCurrency(totalLoans)}
          icon="📝"
          trend="neutral"
          description={`${totalLoansCount} loan records`}
        />
        
        <StatCard 
          title="Total Expenses" 
          amount={formatCurrency(totalExpenses)}
          icon="💸"
          trend="expense"
          description={`${totalExpensesCount} expense records`}
        />
      </div>

      {/* Secondary Stats Row */}
      <div className={styles.secondaryStatsRow}>
        <StatCard 
          title="Active Loans" 
          amount={formatCurrency(totalActiveLoans)}
          icon="🔄"
          trend="warning"
          description="Outstanding loan amount"
          variant="secondary"
        />
        
        <StatCard 
          title="Total Donors" 
          amount={formatNumber(totalDonors)}
          icon="👥"
          trend="positive"
          description="Active contributors"
          variant="secondary"
        />
        
        <StatCard 
          title="Loan Recovery Rate" 
          amount={`${totalLoans > 0 ? Math.round(((totalLoans - totalActiveLoans) / totalLoans) * 100) : 0}%`}
          icon="📊"
          trend="positive"
          description="Amount recovered"
          variant="secondary"
        />
        
        <StatCard 
          title="Funds Utilization" 
          amount={`${totalFunds > 0 ? Math.round(((totalExpenses + totalActiveLoans) / totalFunds) * 100) : 0}%`}
          icon="⚡"
          trend="neutral"
          description="Used vs Available"
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
        
        <div className={styles.quickStats}>
          <h3 className={styles.sectionTitle}>📈 Quick Statistics</h3>
          <div className={styles.quickStatsGrid}>
            <div className={styles.quickStatItem}>
              <div className={styles.quickStatIcon}>💰</div>
              <div className={styles.quickStatContent}>
                <div className={styles.quickStatLabel}>Avg. Donation</div>
                <div className={styles.quickStatValue}>
                  {totalDonors > 0 ? formatCurrency(totalFunds / totalDonors) : formatCurrency(0)}
                </div>
              </div>
            </div>
            
            <div className={styles.quickStatItem}>
              <div className={styles.quickStatIcon}>📅</div>
              <div className={styles.quickStatContent}>
                <div className={styles.quickStatLabel}>This Month</div>
                <div className={styles.quickStatValue}>
                  {formatCurrency(totalFunds * 0.1)}
                </div>
              </div>
            </div>
            
            <div className={styles.quickStatItem}>
              <div className={styles.quickStatIcon}>🎯</div>
              <div className={styles.quickStatContent}>
                <div className={styles.quickStatLabel}>Most Active Category</div>
                <div className={styles.quickStatValue}>Charity</div>
              </div>
            </div>
            
            <div className={styles.quickStatItem}>
              <div className={styles.quickStatIcon}>📱</div>
              <div className={styles.quickStatContent}>
                <div className={styles.quickStatLabel}>Top Payment Method</div>
                <div className={styles.quickStatValue}>Easypaisa</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      
      {/* Donor Form - This works */}
      {showDonorForm && (
        <DonerForm 
          onClose={() => setShowDonorForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Expense Form - Show notification if not available */}
      {showExpenseForm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem",
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "500px",
            width: "100%",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#ff922b",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                margin: "0 auto 1rem",
              }}>
                ⚠️
              </div>
              <h2 style={{ marginBottom: "1rem" }}>Expense Form</h2>
              <p style={{ marginBottom: "1.5rem", color: "#666" }}>
                The Expense Form component is not implemented yet.
              </p>
              <button 
                onClick={() => setShowExpenseForm(false)}
                style={{
                  padding: "0.75rem 2rem",
                  background: "#ff922b",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loan Form - Show notification if not available */}
      {showLoanForm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem",
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "500px",
            width: "100%",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#20c997",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                margin: "0 auto 1rem",
              }}>
                ⚠️
              </div>
              <h2 style={{ marginBottom: "1rem" }}>Loan Form</h2>
              <p style={{ marginBottom: "1.5rem", color: "#666" }}>
                The Loan Form component is not implemented yet.
              </p>
              <button 
                onClick={() => setShowLoanForm(false)}
                style={{
                  padding: "0.75rem 2rem",
                  background: "#20c997",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Donors - Show notification if not available */}
      {showViewDonors && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem",
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "500px",
            width: "100%",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#9775fa",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                margin: "0 auto 1rem",
              }}>
                ⚠️
              </div>
              <h2 style={{ marginBottom: "1rem" }}>View Donors</h2>
              <p style={{ marginBottom: "1.5rem", color: "#666" }}>
                The View Donors component is not implemented yet.
              </p>
              <button 
                onClick={() => setShowViewDonors(false)}
                style={{
                  padding: "0.75rem 2rem",
                  background: "#9775fa",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loan Records - Show notification if not available */}
      {showLoanRecords && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem",
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "500px",
            width: "100%",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#51cf66",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                margin: "0 auto 1rem",
              }}>
                ⚠️
              </div>
              <h2 style={{ marginBottom: "1rem" }}>Loan Records</h2>
              <p style={{ marginBottom: "1.5rem", color: "#666" }}>
                The Loan Records component is not implemented yet.
              </p>
              <button 
                onClick={() => setShowLoanRecords(false)}
                style={{
                  padding: "0.75rem 2rem",
                  background: "#51cf66",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}