"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./doner.module.css";

type DonerType = {
  name: string;
  mobile_no: string;
  payment_method: string;
  total_amount: number;
  purpose: string;
  remarks?: string;
  donation_date: string;
};

type DonerFormProps = {
  onClose?: () => void;
  onSuccess?: () => void;
  onOptimistic?: (record: any) => void;
  onRollback?: (tempId: string) => void;
};

export default function DonerForm({
  onClose = () => { },
  onSuccess,
  onOptimistic,
  onRollback,
}: DonerFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const data: DonerType = {
      name: formData.get("name") as string,
      mobile_no: formData.get("mobile_no") as string,
      payment_method: formData.get("payment_method") as string,
      total_amount: Number(formData.get("total_amount")),
      purpose: formData.get("purpose") as string,
      remarks: formData.get("remarks") as string,
      donation_date: formData.get("donation_date") as string,
    };

    const tempId = `temp-doner-${Date.now()}`;
    const optimisticRecord = { ...data, id: tempId, created_at: new Date().toISOString(), __optimistic: true };

    try {
      if (onOptimistic) onOptimistic(optimisticRecord);

      const { error } = await supabase.from("doner").insert([data]);

      if (error) {
        console.error(error);
        setError("Failed to add donor. Please try again.");
        if (onRollback) onRollback(tempId);
      } else {
        setSuccess("Donor record has been successfully added to the system!");
        try {
          form.reset();
        } catch (resetErr) {
          console.warn("Form reset failed (element may be unmounted):", resetErr);
        }

        if (onSuccess) {
          setTimeout(() => onSuccess(), 300);
        } else {
          setTimeout(() => router.refresh(), 300);
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
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2>
            <span>🤝</span> NEW DONOR REGISTRATION
          </h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {/* Form Body */}
        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>👤 Donor Name *</label>
                <input
                  name="name"
                  placeholder="Full Name"
                  required
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>📱 Mobile No *</label>
                <input
                  name="mobile_no"
                  placeholder="0300-1234567"
                  required
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>💳 Payment Method *</label>
                <select
                  name="payment_method"
                  required
                  className={styles.select}
                  disabled={loading}
                >
                  <option value="">Select method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>💰 Amount (PKR) *</label>
                <input
                  type="number"
                  name="total_amount"
                  placeholder="0.00"
                  required
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>📅 Donation Date *</label>
                <input
                  type="date"
                  name="donation_date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>🎯 Purpose *</label>
                <input
                  name="purpose"
                  placeholder="Donation Purpose"
                  required
                  className={styles.input}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>📝 Remarks (Optional)</label>
              <textarea
                name="remarks"
                placeholder="Additional notes..."
                className={styles.textarea}
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Processing...
                </>
              ) : (
                <>
                  <span>💾</span> Register Donor
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
