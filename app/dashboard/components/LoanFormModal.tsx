"use client";

import { useState } from "react";
import ExpenseForm from "../../spent/spent-form";

type LoanFormModalProps = {
  onClose: () => void;
  onSuccess?: () => void;
};

export default function LoanFormModal({ onClose, onSuccess }: LoanFormModalProps) {
  return (
    <div
      style={{
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
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "900px",
          height: "90vh",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem 2rem",
            background: "linear-gradient(135deg, #4c6ef5, #3b5bdb)",
            color: "white",
            flexShrink: 0,
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>
            📝 ADD LOAN RECORD
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "white",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem",
          }}
        >
          <ExpenseForm onClose={onClose} onSuccess={onSuccess} expenseType="loan" hideHeader={true} />
        </div>
      </div>
    </div>
  );
}
