"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./spent.module.css";

type ExpenseRecordType = {
  type: "loan" | "expense";
  recipient_name: string;
  mobile_no: string;
  total_amount: number;
  purpose: string;
  category: string;
  payment_method: string;
  remarks?: string;
  expense_date: string;
  // Loan specific fields
  loan_type?: "installment" | "one_time";
  return_date?: string;
  interest_rate?: number;
  installment_amount?: number;
  total_installments?: number;
  remaining_amount?: number;
  collateral?: string;
};

type ExpenseFormProps = {
  onClose?: () => void;
  onSuccess?: () => void;
  onOptimistic?: (record: any) => void;
  onRollback?: (tempId: string) => void;
  expenseType?: "loan" | "expense";
  hideHeader?: boolean;
};

export default function ExpenseForm({
  onClose = () => { },
  onSuccess,
  onOptimistic,
  onRollback,
  expenseType: initialType,
  hideHeader = false
}: ExpenseFormProps = {}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expenseType, setExpenseType] = useState<"loan" | "expense">(initialType || "expense");

  const categories = [
    "Food & Ration",
    "Medical",
    "Education",
    "Utilities",
    "Transportation",
    "Clothing",
    "Shelter",
    "Emergency",
    "Administrative",
    "Other"
  ];

  const paymentMethods = [
    "Cash",
    "Easypaisa",
    "JazzCash",
    "Bank Transfer",
    "Cheque",
    "Other"
  ];

  const loanTypes = [
    "Personal",
    "Business",
    "Medical",
    "Education",
    "Agricultural",
    "Emergency",
    "Other"
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const baseData = {
      type: expenseType,
      recipient_name: formData.get("recipient_name") as string,
      mobile_no: formData.get("mobile_no") as string,
      total_amount: parseFloat(formData.get("total_amount") as string),
      purpose: formData.get("purpose") as string,
      category: formData.get("category") as string,
      payment_method: formData.get("payment_method") as string,
      remarks: formData.get("remarks") as string,
      expense_date: formData.get("expense_date") as string,
    };

    let loanData = {};
    if (expenseType === "loan") {
      loanData = {
        loan_type: formData.get("loan_type") as "installment" | "one_time",
        return_date: formData.get("return_date") as string,
        interest_rate: parseFloat(formData.get("interest_rate") as string) || 0,
        installment_amount: parseFloat(formData.get("installment_amount") as string) || 0,
        total_installments: parseInt(formData.get("total_installments") as string) || 1,
        remaining_amount: parseFloat(formData.get("remaining_amount") as string) ||
          parseFloat(formData.get("total_amount") as string),
        collateral: formData.get("collateral") as string,
      };
    }

    const data: ExpenseRecordType = { ...baseData, ...loanData };

    const tempId = `temp-exp-${Date.now()}`;
    const optimisticRecord = { ...data, id: tempId, created_at: new Date().toISOString(), __optimistic: true } as any;

    try {
      if (onOptimistic) onOptimistic(optimisticRecord);

      const { error } = await supabase
        .from("expense_records")
        .insert([data]);

      if (error) {
        console.error(error);
        setError("Failed to save record. Please try again.");
        if (onRollback) onRollback(tempId);
      } else {
        setSuccess(
          expenseType === "loan"
            ? "Loan record has been successfully added!"
            : "Expense record has been successfully added!"
        );

        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 500);
        }
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      if (onRollback) onRollback(tempId);
    } finally {
      setLoading(false);
    }
  }

  if (success || error) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.statusModal}>
          <div className={`${styles.statusIcon} ${success ? styles.success : styles.error}`}>
            {success ? "✓" : "!"}
          </div>
          <h3 className={styles.statusTitle}>{success ? "Success" : "Error"}</h3>
          <p className={styles.statusMessage}>{success || error}</p>
          <button
            className={styles.statusButton}
            onClick={() => {
              if (success) {
                setSuccess(null);
                onClose();
              } else {
                setError(null);
              }
            }}
          >
            {success ? "Close" : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      {/* Dynamic Header */}
      {!hideHeader && (
        <div className={`${styles.formHeader} ${expenseType === 'loan' ? styles.loanHeader : styles.expenseHeader}`}>
          <div className={styles.headerContent}>
            <h2>{expenseType === "loan" ? "📝 LOAN RECORD" : "💰 EXPENSE RECORD"}</h2>
            <p>{expenseType === "loan" ? "Record financing provided to recipients" : "Record foundation expenditures"}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Type Selection - Hide if initialType is provided */}
        {!initialType && (
          <div className={styles.typeSelector}>
            <button
              type="button"
              onClick={() => setExpenseType("expense")}
              className={`${styles.typeButton} ${expenseType === "expense" ? styles.activeExpense : ""}`}
            >
              <span>💰</span> EXPENSE
            </button>
            <button
              type="button"
              onClick={() => setExpenseType("loan")}
              className={`${styles.typeButton} ${expenseType === "loan" ? styles.activeLoan : ""}`}
            >
              <span>📝</span> LOAN
            </button>
          </div>
        )}

        <div className={styles.formGrid}>
          {/* Recipient Name */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>👤 {expenseType === "loan" ? "Borrower Name *" : "Recipient Name *"}</label>
            <input
              name="recipient_name"
              placeholder="Full Name"
              required
              className={styles.input}
              disabled={loading}
            />
          </div>

          {/* Contact Number */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>📱 Contact Number</label>
            <input
              name="mobile_no"
              placeholder="0300-1234567"
              className={styles.input}
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>🏷️ {expenseType === "loan" ? "Loan Type *" : "Category *"}</label>
            <select name="category" required className={styles.select} disabled={loading}>
              <option value="">Select option</option>
              {(expenseType === "loan" ? loanTypes : categories).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>💳 Payment Method *</label>
            <select name="payment_method" required className={styles.select} disabled={loading}>
              <option value="">Select method</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Total Amount */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>💰 {expenseType === "loan" ? "Loan Amount (PKR) *" : "Amount (PKR) *"}</label>
            <input
              type="number"
              name="total_amount"
              placeholder="0.00"
              required
              className={styles.input}
              disabled={loading}
            />
          </div>

          {/* Date */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>📅 Date *</label>
            <input
              type="date"
              name="expense_date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className={styles.input}
              disabled={loading}
            />
          </div>
        </div>

        {/* Loan Specific Fields */}
        {expenseType === "loan" && (
          <div className={styles.loanSection}>
            <div className={styles.sectionDivider}>
              <span>📋 LOAN DETAILS</span>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>🔄 Repayment Type *</label>
                <select name="loan_type" required className={styles.select} disabled={loading}>
                  <option value="installment">Installment Based</option>
                  <option value="one_time">One-time Payment</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>⏰ Expected Return Date *</label>
                <input type="date" name="return_date" required className={styles.input} disabled={loading} />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>📈 Interest Rate (%)</label>
                <input type="number" name="interest_rate" placeholder="0" className={styles.input} disabled={loading} />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>🔢 Total Installments</label>
                <input type="number" name="total_installments" placeholder="1" className={styles.input} disabled={loading} />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>📊 Remaining Amount (PKR) *</label>
                <input type="number" name="remaining_amount" placeholder="0.00" required className={styles.input} disabled={loading} />
              </div>

              <div className={styles.fieldGroup} style={{ gridColumn: "span 2" }}>
                <label className={styles.label}>🏠 Collateral / Guarantee</label>
                <input name="collateral" placeholder="Describe collateral" className={styles.input} disabled={loading} />
              </div>
            </div>
          </div>
        )}

        {/* Purpose */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>🎯 Purpose / Description *</label>
          <input name="purpose" required placeholder="Description of this record" className={styles.input} disabled={loading} />
        </div>

        {/* Remarks */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>📝 Remarks (Optional)</label>
          <textarea
            name="remarks"
            placeholder="Add any additional notes..."
            className={styles.textarea}
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className={`${styles.submitButton} ${expenseType === 'loan' ? styles.loanBtn : styles.expenseBtn}`}>
          {loading ? (
            <>
              <span className={styles.spinner}></span>
              Processing...
            </>
          ) : (
            <>
              <span>💾</span> Save {expenseType === "loan" ? "Loan" : "Expense"} Record
            </>
          )}
        </button>
      </form>
    </div>
  );
}
