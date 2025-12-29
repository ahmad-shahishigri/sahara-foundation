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

export default function ExpenseForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expenseType, setExpenseType] = useState<"loan" | "expense">("expense");

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

  const repaymentTypes = [
    "Monthly Installment",
    "Weekly Installment",
    "Bi-weekly Installment",
    "Quarterly Installment",
    "Yearly Installment",
    "One-time Payment"
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

    try {
      const { error } = await supabase
        .from("expense_records")
        .insert([data]);

      if (error) {
        console.error(error);
        // setError("Failed to add record. Please try again.");
      } else {
        setSuccess(
          expenseType === "loan" 
            ? "Loan record has been successfully added!"
            : "Expense record has been successfully added!"
        );
        // e.currentTarget.reset();
      }
    } catch (err) {
      console.error(err);
      // setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style jsx global>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className={styles.formContainer}>
        {/* Form Header */}
        <div style={{ 
          textAlign: "center", 
          padding: "1.5rem 2rem",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white"
        }}>
          <h2 style={{ 
            fontSize: "1.8rem",
            fontWeight: "700",
            margin: "0 0 0.5rem 0",
            letterSpacing: "0.5px",
            textAlign: "center"
          }}>
            FOUNDATION FINANCE RECORD
          </h2>
          <p style={{ 
            opacity: "0.9",
            margin: "0",
            fontSize: "0.95rem",
            textAlign: "center"
          }}>
            Record all loans and expenses with complete details
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Type Selection */}
          <div className={styles.typeSelector}>
            <div className={styles.typeOptions}>
              <button
                type="button"
                className={`${styles.typeButton} ${expenseType === "expense" ? styles.active : ""}`}
                onClick={() => setExpenseType("expense")}
              >
                <span className={styles.typeIcon}>💰</span>
                EXPENSE RECORD
              </button>
              <button
                type="button"
                className={`${styles.typeButton} ${expenseType === "loan" ? styles.active : ""}`}
                onClick={() => setExpenseType("loan")}
              >
                <span className={styles.typeIcon}>📝</span>
                LOAN RECORD
              </button>
            </div>
            <div className={styles.typeIndicator}>
              Currently recording: <strong>{expenseType === "loan" ? "LOAN" : "EXPENSE"}</strong>
            </div>
          </div>

          {/* Form Grid - Common Fields */}
          <div className={styles.formGrid}>
            {/* Recipient Name */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>👤</span>
                {expenseType === "loan" ? "BORROWER NAME *" : "RECIPIENT NAME *"}
              </label>
              <input
                type="text"
                name="recipient_name"
                placeholder={expenseType === "loan" ? "Enter borrower's full name" : "Enter recipient's full name"}
                required
                className={styles.input}
                disabled={loading}
              />
            </div>

            {/* Contact Number */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>📱</span>
                CONTACT NUMBER
              </label>
              <input
                type="tel"
                name="mobile_no"
                placeholder="0300-1234567"
                className={styles.input}
                disabled={loading}
              />
            </div>

            {/* Category */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>🏷️</span>
                {expenseType === "loan" ? "LOAN TYPE *" : "CATEGORY *"}
              </label>
              <select
                name="category"
                required
                className={styles.select}
                disabled={loading}
              >
                <option value="">Select {expenseType === "loan" ? "loan type" : "category"}</option>
                {(expenseType === "loan" ? loanTypes : categories).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>💳</span>
                PAYMENT METHOD *
              </label>
              <select
                name="payment_method"
                required
                className={styles.select}
                disabled={loading}
              >
                <option value="">Select method</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Amount */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>💰</span>
                {expenseType === "loan" ? "LOAN AMOUNT (PKR) *" : "AMOUNT (PKR) *"}
              </label>
              <div className={styles.amountWrapper}>
                <span className={styles.currencySymbol}>₨</span>
                <input
                  type="number"
                  name="total_amount"
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  className={`${styles.input} ${styles.amountInput}`}
                  disabled={loading}
                  onChange={(e) => {
                    if (expenseType === "loan") {
                      const remainingInput = document.querySelector('input[name="remaining_amount"]') as HTMLInputElement;
                      if (remainingInput) {
                        remainingInput.value = e.target.value;
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Expense Date */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>📅</span>
                {expenseType === "loan" ? "DISBURSEMENT DATE *" : "EXPENSE DATE *"}
              </label>
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
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>📋</span>
                LOAN DETAILS
              </div>
              {expenseType === "loan" && (
  <div className={styles.fieldGroup}>
    <label className={styles.label}>
      <span className={styles.labelIcon}>📊</span>
      LOAN STATUS *
    </label>
    <select
      name="loan_status"
      required
      className={styles.select}
      disabled={loading}
      defaultValue="active"
    >
      <option value="active">🟢 Active (Ongoing)</option>
      <option value="completed">🔵 Completed (Paid in Full)</option>
      <option value="pending">🟡 Pending (Not Started)</option>
      <option value="defaulted">🔴 Defaulted (Not Paying)</option>
    </select>
  </div>
)}
              <div className={styles.formGrid}>
                {/* Loan Type (Installment/One-time) */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>🔄</span>
                    REPAYMENT TYPE *
                  </label>
                  <select
                    name="loan_type"
                    required
                    className={styles.select}
                    disabled={loading}
                    onChange={(e) => {
                      const installmentFields = document.querySelectorAll('.installment-field');
                      installmentFields.forEach(field => {
                        if (e.target.value === 'one_time') {
                          (field as HTMLElement).style.opacity = '0.5';
                          (field as HTMLElement).style.pointerEvents = 'none';
                        } else {
                          (field as HTMLElement).style.opacity = '1';
                          (field as HTMLElement).style.pointerEvents = 'all';
                        }
                      });
                    }}
                  >
                    <option value="">Select repayment type</option>
                    <option value="installment">Installment Based</option>
                    <option value="one_time">One-time Payment</option>
                  </select>
                </div>

                {/* Return Date */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>⏰</span>
                    EXPECTED RETURN DATE *
                  </label>
                  <input
                    type="date"
                    name="return_date"
                    required
                    className={styles.input}
                    disabled={loading}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  
                </div>

                {/* Interest Rate */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>📈</span>
                    INTEREST RATE (%)
                  </label>
                  <div className={styles.percentageWrapper}>
                    <input
                      type="number"
                      name="interest_rate"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      className={`${styles.input} ${styles.percentageInput}`}
                      disabled={loading}
                    />
                    <span className={styles.percentageSymbol}>%</span>
                  </div>
                </div>

                {/* Installment Amount */}
                <div className={`${styles.fieldGroup} installment-field`}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>💵</span>
                    INSTALLMENT AMOUNT
                  </label>
                  <div className={styles.amountWrapper}>
                    <span className={styles.currencySymbol}>₨</span>
                    <input
                      type="number"
                      name="installment_amount"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`${styles.input} ${styles.amountInput}`}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Total Installments */}
                <div className={`${styles.fieldGroup} installment-field`}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>🔢</span>
                    TOTAL INSTALLMENTS
                  </label>
                  <input
                    type="number"
                    name="total_installments"
                    placeholder="1"
                    min="1"
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                {/* Remaining Amount */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>📊</span>
                    REMAINING AMOUNT *
                  </label>
                  <div className={styles.amountWrapper}>
                    <span className={styles.currencySymbol}>₨</span>
                    <input
                      type="number"
                      name="remaining_amount"
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                      className={`${styles.input} ${styles.amountInput}`}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Collateral */}
                <div className={styles.fieldGroup} style={{ gridColumn: "span 2" }}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>🏠</span>
                    COLLATERAL / GUARANTEE
                  </label>
                  <input
                    type="text"
                    name="collateral"
                    placeholder="Describe collateral (if any)"
                    className={styles.input}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Purpose */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>🎯</span>
              {expenseType === "loan" ? "LOAN PURPOSE *" : "PURPOSE / DESCRIPTION *"}
            </label>
            <input
              type="text"
              name="purpose"
              placeholder={expenseType === "loan" 
                ? "Describe the purpose of this loan" 
                : "Describe the purpose of this expense"}
              required
              className={styles.input}
              disabled={loading}
            />
          </div>

          {/* Remarks */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>📝</span>
              REMARKS (OPTIONAL)
            </label>
            <textarea
              name="remarks"
              placeholder="Add any additional notes, receipt details, or special instructions..."
              rows={3}
              className={styles.textarea}
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`${styles.submitButton} ${loading ? styles.loading : ""} ${expenseType === "loan" ? styles.loanButton : styles.expenseButton}`}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                PROCESSING...
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>
                  {expenseType === "loan" ? "📝" : "💾"}
                </span>
                {expenseType === "loan" ? "SAVE LOAN RECORD" : "SAVE EXPENSE RECORD"}
              </>
            )}
          </button>
        </form>

        {/* Success Modal */}
        {success && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={`${styles.modalIcon} ${expenseType === "loan" ? styles.loanSuccess : styles.success}`}>
                <span>{expenseType === "loan" ? "📝" : "✓"}</span>
              </div>
              <h3 className={styles.modalTitle}>
                {expenseType === "loan" ? "Loan Recorded!" : "Success!"}
              </h3>
              <p className={styles.modalMessage}>{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className={`${styles.modalButton} ${expenseType === "loan" ? styles.loanModalButton : ""}`}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {error && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={`${styles.modalIcon} ${styles.error}`}>
                <span>✗</span>
              </div>
              <h3 className={styles.modalTitle}>Error!</h3>
              <p className={styles.modalMessage}>{error}</p>
              <button
                onClick={() => setError(null)}
                className={styles.modalButton}
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}