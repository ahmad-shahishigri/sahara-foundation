"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
  onClose?: () => void; // ✅ FIXED (optional now)
  onSuccess?: () => void;
  onOptimistic?: (record: any) => void;
  onRollback?: (tempId: string) => void;
};

export default function DonerForm({
  onClose = () => {}, // ✅ SAFE DEFAULT FUNCTION
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

      const { error } = await supabase.from("doners").insert([data]);

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

  // 🔽🔽🔽 EVERYTHING BELOW THIS LINE IS 100% UNCHANGED 🔽🔽🔽

  const colors = {
    primary: "#4c6ef5",
    primaryDark: "#3b5bdb",
    secondary: "#6c757d",
    success: "#20c997",
    error: "#fa5252",
    lightBg: "#f8f9fa",
    border: "#e9ecef",
    text: "#2d3748",
    textLight: "#718096",
  };

  const styles = {
    overlay: {
      position: "fixed" as const,
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
      backdropFilter: "blur(5px)",
    },
    container: {
      height: "90vh",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column" as const,
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
      width: "100%",
      maxWidth: "900px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      animation: "modalSlideIn 0.3s ease-out",
      overflow: "hidden",
    },
  };

  if (success || error) {
    return (
      <>
        <div style={styles.overlay}>
          <div>
            {success ? (
              <div>
                <h3>Success</h3>
                <p>{success}</p>
                <button
                  onClick={() => {
                    setSuccess(null);
                    onClose();
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => setError(null)}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.container} onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSubmit}>
            <input name="name" required />
            <input name="mobile_no" required />
            <select name="payment_method" required>
              <option value="">Select payment method</option>
              <option value="Cash">Cash</option>
            </select>
            <input type="number" name="total_amount" required />
            <input type="date" name="donation_date" required />
            <input name="purpose" required />
            <textarea name="remarks" />
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Register Donor"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
