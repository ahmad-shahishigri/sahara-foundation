"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type ExpenseRecordType = {
  id: string;
  type: "loan" | "expense";
  recipient_name: string;
  mobile_no: string;
  total_amount: number;
  purpose: string;
  category: string;
  payment_method: string;
  remarks?: string;
  expense_date: string;
  created_at: string;
  loan_type?: "installment" | "one_time";
  return_date?: string;
  interest_rate?: number;
  installment_amount?: number;
  total_installments?: number;
  remaining_amount?: number;
  collateral?: string;
};

interface LoanRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoanRecordsModal({ isOpen, onClose }: LoanRecordsModalProps) {
  const [records, setRecords] = useState<ExpenseRecordType[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ExpenseRecordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "loan" | "expense">("all");

  useEffect(() => {
    if (isOpen) {
      fetchRecords();
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, viewMode]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter(
        (record) =>
          record.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (record.mobile_no && record.mobile_no.includes(searchTerm)) ||
          record.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
    }
  }, [searchTerm, records]);

  async function fetchRecords() {
    try {
      setLoading(true);
      let query = supabase.from("expense_records").select("*");

      if (viewMode === "loan") {
        query = query.eq("type", "loan");
      } else if (viewMode === "expense") {
        query = query.eq("type", "expense");
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "0px",
        left: "0px",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "stretch",
        zIndex: 99999,
        padding: "0px",
        margin: "0px",
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "0px",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          margin: "0px",
          padding: "0px",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            minHeight: "60px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 800 }}>All Records</h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              fontSize: "2rem",
              cursor: "pointer",
              width: "50px",
              height: "50px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Controls */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
            flexWrap: "wrap",
            background: "#f9fafb",
          }}
        >
          <input
            type="text"
            placeholder="Search by name, mobile, purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: "300px",
              padding: "0.8rem 1.2rem",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          />

          <div style={{ display: "flex", gap: "0.8rem" }}>
            {["all", "loan", "expense"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as "all" | "loan" | "expense")}
                style={{
                  padding: "0.8rem 1.5rem",
                  background:
                    viewMode === mode
                      ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
                      : "#f3f4f6",
                  color: viewMode === mode ? "white" : "#374151",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "2rem", background: "#ffffff" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <p style={{ fontSize: "1.1rem", color: "#666" }}>Loading records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "#666" }}>
              <p style={{ fontSize: "1.1rem" }}>No records found</p>
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "1rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    fontWeight: 600,
                    position: "sticky",
                    top: 0,
                  }}
                >
                  <th style={{ padding: "1.2rem", textAlign: "left" }}>Type</th>
                  <th style={{ padding: "1.2rem", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "1.2rem", textAlign: "left" }}>Mobile</th>
                  <th style={{ padding: "1.2rem", textAlign: "left" }}>Amount</th>
                  <th style={{ padding: "1.2rem", textAlign: "left" }}>Purpose</th>
                  <th style={{ padding: "1.2rem", textAlign: "left" }}>Category</th>
                  <th style={{ padding: "1.2rem", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "1.2rem", textAlign: "left" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f0f0f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        index % 2 === 0 ? "#ffffff" : "#f9fafb")
                    }
                  >
                    <td style={{ padding: "1.2rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.5rem 0.8rem",
                          borderRadius: "6px",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          background:
                            record.type === "loan" ? "#dbeafe" : "#dcfce7",
                          color: record.type === "loan" ? "#0c4a6e" : "#166534",
                        }}
                      >
                        {record.type === "loan" ? "💰 Loan" : "💸 Expense"}
                      </span>
                    </td>
                    <td style={{ padding: "1.2rem", fontWeight: 600 }}>
                      {record.recipient_name}
                    </td>
                    <td style={{ padding: "1.2rem" }}>{record.mobile_no}</td>
                    <td
                      style={{
                        padding: "1.2rem",
                        fontWeight: 700,
                        color: "#667eea",
                        fontSize: "1.05rem",
                      }}
                    >
                      {new Intl.NumberFormat("en-PK", {
                        style: "currency",
                        currency: "PKR",
                      }).format(record.total_amount)}
                    </td>
                    <td style={{ padding: "1.2rem" }}>{record.purpose}</td>
                    <td style={{ padding: "1.2rem" }}>
                      <span
                        style={{
                          padding: "0.4rem 0.8rem",
                          background: "#f0f0f0",
                          borderRadius: "6px",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                        }}
                      >
                        {record.category}
                      </span>
                    </td>
                    <td style={{ padding: "1.2rem", fontSize: "0.95rem" }}>
                      {new Date(record.expense_date).toLocaleDateString("en-PK")}
                    </td>
                    <td style={{ padding: "1.2rem" }}>
                      <span
                        style={{
                          padding: "0.5rem 0.8rem",
                          borderRadius: "6px",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          background:
                            record.type === "loan" &&
                            (record.remaining_amount || 0) > 0
                              ? "#fef3c7"
                              : "#d1fae5",
                          color:
                            record.type === "loan" &&
                            (record.remaining_amount || 0) > 0
                              ? "#92400e"
                              : "#065f46",
                        }}
                      >
                        {record.type === "loan" && (record.remaining_amount || 0) > 0
                          ? "Pending"
                          : "Completed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1.5rem",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            background: "#f9fafb",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.9rem 2rem",
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
