"use client";

import { useState } from "react";
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
  onClose: () => void;
  onSuccess?: () => void;
};

export default function DonerForm({ onClose, onSuccess }: DonerFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const data: DonerType = {
      name: formData.get("name") as string,
      mobile_no: formData.get("mobile_no") as string,
      payment_method: formData.get("payment_method") as string,
      total_amount: Number(formData.get("total_amount")),
      purpose: formData.get("purpose") as string,
      remarks: formData.get("remarks") as string,
      donation_date: formData.get("donation_date") as string,
    };

    try {
      const { error } = await supabase.from("doners").insert([data]);

      if (error) {
        console.error(error);
        setError("Failed to add donor. Please try again.");
      } else {
        setSuccess("Donor record has been successfully added to the system!");
        e.currentTarget.reset();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Professional color scheme
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
    // Modal Overlay
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

    // Main container
    container: {
      maxHeight: "90vh",
      overflowY: "auto" as const,
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
      width: "100%",
      maxWidth: "900px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      animation: "modalSlideIn 0.3s ease-out",
    },
    
    // Form Header with Close Button
    formHeader: {
      background: colors.primary,
      padding: "1.5rem 2rem",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky" as const,
      top: 0,
      zIndex: 10,
    },
    headerContent: {
      flex: 1,
    },
    formTitle: {
      fontSize: "1.5rem",
      fontWeight: "600",
      marginBottom: "0.25rem",
    },
    formSubtitle: {
      opacity: "0.9",
      fontSize: "0.95rem",
    },
    closeButton: {
      background: "rgba(255, 255, 255, 0.2)",
      border: "none",
      color: "white",
      width: "40px",
      height: "40px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "1.5rem",
      transition: "all 0.2s ease",
      marginLeft: "1rem",
    },
    closeButtonHover: {
      background: "rgba(255, 255, 255, 0.3)",
    },

    formBody: {
      padding: "2rem",
    },

    // Form Grid
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "1.5rem",
      marginBottom: "1.5rem",
    },

    // Form Field
    fieldGroup: {
      marginBottom: "1.25rem",
    },
    label: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: "600",
      color: colors.text,
      marginBottom: "0.5rem",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    input: {
      width: "100%",
      padding: "0.75rem 1rem",
      border: `1px solid ${colors.border}`,
      borderRadius: "8px",
      fontSize: "0.95rem",
      transition: "all 0.2s ease",
      backgroundColor: "white",
      color: colors.text,
    },
    inputFocus: {
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px rgba(76, 110, 245, 0.1)`,
      outline: "none",
    },
    select: {
      width: "100%",
      padding: "0.75rem 1rem",
      border: `1px solid ${colors.border}`,
      borderRadius: "8px",
      fontSize: "0.95rem",
      transition: "all 0.2s ease",
      backgroundColor: "white",
      color: colors.text,
      appearance: "none" as const,
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: "right 0.5rem center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "1.25em 1.25em",
      cursor: "pointer",
    },
    textarea: {
      width: "100%",
      padding: "0.75rem 1rem",
      border: `1px solid ${colors.border}`,
      borderRadius: "8px",
      fontSize: "0.95rem",
      transition: "all 0.2s ease",
      backgroundColor: "white",
      color: colors.text,
      minHeight: "100px",
      resize: "vertical" as const,
    },

    // Required Field Indicator
    required: {
      color: colors.error,
      marginLeft: "2px",
    },

    // Submit Button
    submitButton: {
      width: "100%",
      padding: "0.875rem",
      background: colors.primary,
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      marginTop: "1rem",
    },
    submitButtonHover: {
      background: colors.primaryDark,
      transform: "translateY(-1px)",
      boxShadow: `0 4px 12px rgba(76, 110, 245, 0.3)`,
    },
    submitButtonDisabled: {
      opacity: "0.6",
      cursor: "not-allowed",
    },

    // Result Modal Container
    resultModalContainer: {
      width: "100%",
      maxWidth: "400px",
    },
    successModal: {
      background: "white",
      borderRadius: "12px",
      padding: "2.5rem 2rem",
      textAlign: "center" as const,
      boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    },
    errorModal: {
      background: "white",
      borderRadius: "12px",
      padding: "2.5rem 2rem",
      textAlign: "center" as const,
      boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    },

    // Result Modal Icon
    modalIcon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "60px",
      width: "60px",
      borderRadius: "50%",
      margin: "0 auto 1.25rem",
      fontSize: "1.75rem",
    },
    successIcon: {
      backgroundColor: colors.success,
      color: "white",
    },
    errorIcon: {
      backgroundColor: colors.error,
      color: "white",
    },

    // Result Modal Text
    modalTitle: {
      fontSize: "1.5rem",
      fontWeight: "600",
      marginBottom: "0.75rem",
    },
    successTitle: {
      color: colors.success,
    },
    errorTitle: {
      color: colors.error,
    },
    modalMessage: {
      fontSize: "1rem",
      marginBottom: "1.5rem",
      lineHeight: "1.5",
      color: colors.textLight,
    },

    // Result Modal Button
    modalButton: {
      padding: "0.75rem 2rem",
      borderRadius: "8px",
      border: "none",
      fontSize: "0.95rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    successModalButton: {
      background: colors.success,
      color: "white",
    },
    errorModalButton: {
      background: colors.error,
      color: "white",
    },
    modalButtonHover: {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  };

  const styleTag = `
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-30px) scale(0.95);
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
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `;

  // If showing success/error modal, show that instead
  if (success || error) {
    return (
      <>
        <style>{styleTag}</style>
        <div style={styles.overlay}>
          <div style={styles.resultModalContainer}>
            {success ? (
              <div style={styles.successModal}>
                <div style={{ ...styles.modalIcon, ...styles.successIcon }}>
                  <span>✓</span>
                </div>
                <h3 style={{ ...styles.modalTitle, ...styles.successTitle }}>
                  Success
                </h3>
                <p style={styles.modalMessage}>
                  {success}
                </p>
                <button
                  onClick={() => {
                    setSuccess(null);
                    onClose();
                  }}
                  style={{ ...styles.modalButton, ...styles.successModalButton }}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.modalButtonHover)}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div style={styles.errorModal}>
                <div style={{ ...styles.modalIcon, ...styles.errorIcon }}>
                  <span>✗</span>
                </div>
                <h3 style={{ ...styles.modalTitle, ...styles.errorTitle }}>
                  Error
                </h3>
                <p style={styles.modalMessage}>
                  {error}
                </p>
                <button
                  onClick={() => setError(null)}
                  style={{ ...styles.modalButton, ...styles.errorModalButton }}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.modalButtonHover)}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
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
      <style>{styleTag}</style>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.container} onClick={(e) => e.stopPropagation()}>
          <div style={styles.formHeader}>
            <div style={styles.headerContent}>
              <h2 style={styles.formTitle}>Add New Donor</h2>
              <p style={styles.formSubtitle}>
                Register a new donor for Sahara Welfare Foundation. All fields marked with <span style={styles.required}>*</span> are required.
              </p>
            </div>
            <button
              onClick={onClose}
              style={styles.closeButton}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.closeButtonHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} style={styles.formBody}>
            <div style={styles.formGrid}>
              {/* Donor Name */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Donor Name <span style={styles.required}>*</span>
                </label>
                <input
                  name="name"
                  placeholder="Enter full name"
                  required
                  style={styles.input}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Mobile Number */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Mobile Number <span style={styles.required}>*</span>
                </label>
                <input
                  name="mobile_no"
                  placeholder="0300-1234567"
                  required
                  style={styles.input}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Payment Method */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Payment Method <span style={styles.required}>*</span>
                </label>
                <select
                  name="payment_method"
                  required
                  style={styles.select}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="">Select payment method</option>
                  <option value="Cash">Cash</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Total Amount */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Total Amount (PKR) <span style={styles.required}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "0.95rem",
                    color: colors.textLight
                  }}>Rs</span>
                  <input
                    type="number"
                    name="total_amount"
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                    style={{ ...styles.input, paddingLeft: "40px" }}
                    onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                    onBlur={(e) => {
                      e.target.style.borderColor = colors.border;
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Donation Date */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Donation Date <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="donation_date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  style={styles.input}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Purpose */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Purpose <span style={styles.required}>*</span>
                </label>
                <input
                  name="purpose"
                  placeholder="Charity, Event, Project, etc."
                  required
                  style={styles.input}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Remarks */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Remarks (Optional)
              </label>
              <textarea
                name="remarks"
                placeholder="Add any additional notes or comments..."
                style={styles.textarea}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {}),
              }}
              onMouseEnter={(e) => !loading && Object.assign(e.currentTarget.style, styles.submitButtonHover)}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = colors.primary;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {loading ? (
                <>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>
                    ⌛
                  </span>
                  Processing...
                </>
              ) : (
                "Register Donor"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}