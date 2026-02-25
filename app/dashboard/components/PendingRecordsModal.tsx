"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type PendingRecord = {
    id: string;
    recipient_name: string;
    mobile_no: string;
    total_amount: number;
    purpose: string;
    category: string;
    payment_method: string;
    expense_date: string;
    created_at: string;
    type: string;
    status: string;
    remaining_amount?: number;
    loan_type?: string;
    return_date?: string;
    collateral?: string;
};

type PendingRecordsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onApproved?: () => void;
};

export default function PendingRecordsModal({ isOpen, onClose, onApproved }: PendingRecordsModalProps) {
    const [records, setRecords] = useState<PendingRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [typeFilter, setTypeFilter] = useState<"all" | "loan" | "expense">("all");

    const fetchPendingRecords = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("expense_records")
            .select("*")
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setRecords(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            fetchPendingRecords();
            setNotification(null);
        }
    }, [isOpen]);

    const getAvailableBalance = async (): Promise<number> => {
        try {
            const { data: donors } = await supabase.from("doner").select("total_amount");
            const { data: recs } = await supabase
                .from("expense_records")
                .select("total_amount, type, remaining_amount, status");

            const totalFunds = donors?.reduce((s, d) => s + (d.total_amount || 0), 0) || 0;
            const approved = (recs || []).filter(r => r.status !== "pending");
            const totalExpenses = approved.filter(r => r.type === "expense").reduce((s, r) => s + (r.total_amount || 0), 0);
            const totalActiveLoans = approved.filter(r => r.type === "loan").reduce((s, r) => s + (r.remaining_amount ?? r.total_amount ?? 0), 0);

            return totalFunds - totalExpenses - totalActiveLoans;
        } catch {
            return 0;
        }
    };

    const handleApprove = async (record: PendingRecord) => {
        setApprovingId(record.id);
        setNotification(null);

        try {
            const availableBalance = await getAvailableBalance();
            if (record.total_amount > availableBalance) {
                setNotification({
                    type: "error",
                    message: `Insufficient funds! Available: PKR ${availableBalance.toLocaleString()}, Required: PKR ${record.total_amount.toLocaleString()}`,
                });
                setApprovingId(null);
                return;
            }

            const { error } = await supabase
                .from("expense_records")
                .update({ status: "approved" })
                .eq("id", record.id);

            if (error) {
                setNotification({ type: "error", message: "Failed to approve. Please try again." });
            } else {
                setNotification({ type: "success", message: `Loan for ${record.recipient_name} has been approved and disbursed!` });
                setRecords(prev => prev.filter(r => r.id !== record.id));
                if (onApproved) onApproved();
            }
        } catch {
            setNotification({ type: "error", message: "An unexpected error occurred." });
        }

        setApprovingId(null);
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 9999,
                padding: "1rem",
            }}
        >
            <div
                style={{
                    background: "white",
                    borderRadius: "16px",
                    width: "100%",
                    maxWidth: "950px",
                    height: "90vh",
                    maxHeight: "90vh",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1.5rem 2rem",
                        background: "linear-gradient(135deg, #fab005, #f59f00)",
                        color: "white",
                        flexShrink: 0,
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>
                        ⏳ PENDING RECORDS
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "rgba(255, 255, 255, 0.2)",
                            border: "none",
                            width: "40px", height: "40px",
                            borderRadius: "10px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.5rem",
                            cursor: "pointer",
                            color: "white",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"; }}
                    >
                        ×
                    </button>
                </div>

                {/* Notification */}
                {notification && (
                    <div
                        style={{
                            padding: "1rem 2rem",
                            background: notification.type === "success" ? "#d3f9d8" : "#ffe3e3",
                            color: notification.type === "success" ? "#2b8a3e" : "#c92a2a",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        {notification.type === "success" ? "✅" : "⚠️"} {notification.message}
                    </div>
                )}

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: "0.5rem", padding: "1rem 2rem 0", flexShrink: 0 }}>
                    {(["all", "loan", "expense"] as const).map(f => {
                        const labels = { all: "📋 All", loan: "📝 Loans", expense: "💸 Expenses" };
                        const colors = { all: "#fab005", loan: "#3b82f6", expense: "#8b5cf6" };
                        const counts = { all: records.length, loan: records.filter(r => r.type === "loan").length, expense: records.filter(r => r.type === "expense").length };
                        return (
                            <button key={f} onClick={() => setTypeFilter(f)} style={{
                                padding: "8px 18px", borderRadius: "8px", border: "none", cursor: "pointer",
                                fontWeight: 600, fontSize: "0.88rem",
                                background: typeFilter === f ? colors[f] : "#f1f3f5",
                                color: typeFilter === f ? "white" : "#6b7280",
                                transition: "all 0.2s ease",
                            }}>
                                {labels[f]} ({counts[f]})
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 2rem" }}>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "3rem", color: "#868e96" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
                            <p>Loading pending records...</p>
                        </div>
                    ) : records.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "3rem", color: "#868e96" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
                            <h3 style={{ color: "#495057", marginBottom: "0.5rem" }}>No Pending Records</h3>
                            <p>All records are approved. Great job!</p>
                        </div>
                    ) : (() => {
                        const filtered = typeFilter === "all" ? records : records.filter(r => r.type === typeFilter);
                        if (filtered.length === 0) return (
                            <div style={{ textAlign: "center", padding: "3rem", color: "#868e96" }}>
                                <p>No pending {typeFilter} records.</p>
                            </div>
                        );
                        return (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <p style={{ color: "#868e96", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                                    {filtered.length} pending record{filtered.length !== 1 ? "s" : ""} awaiting approval
                                </p>
                                {filtered.map((record) => (
                                    <div
                                        key={record.id}
                                        style={{
                                            border: "1px solid #e9ecef",
                                            borderRadius: "12px",
                                            padding: "1.5rem",
                                            background: "#fffdf0",
                                            borderLeft: "4px solid #fab005",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                                            {/* Details */}
                                            <div style={{ flex: 1, minWidth: "250px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                                                    <span style={{
                                                        background: "#fff3bf", color: "#e67700",
                                                        padding: "4px 12px", borderRadius: "20px",
                                                        fontWeight: 700, fontSize: "0.8rem",
                                                    }}>
                                                        PENDING
                                                    </span>
                                                    <span style={{
                                                        background: record.type === "loan" ? "#dbeafe" : "#f3e8ff",
                                                        color: record.type === "loan" ? "#2563eb" : "#7c3aed",
                                                        padding: "4px 12px", borderRadius: "20px",
                                                        fontWeight: 700, fontSize: "0.8rem", textTransform: "capitalize" as const,
                                                    }}>
                                                        {record.type}
                                                    </span>
                                                    <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1f2937" }}>
                                                        {record.recipient_name}
                                                    </span>
                                                </div>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.5rem", fontSize: "0.88rem", color: "#495057" }}>
                                                    <div>📱 <strong>Mobile:</strong> {record.mobile_no || "N/A"}</div>
                                                    <div>🏷️ <strong>Category:</strong> {record.category}</div>
                                                    <div>💳 <strong>Payment:</strong> {record.payment_method}</div>
                                                    <div>📅 <strong>Date:</strong> {formatDate(record.expense_date)}</div>
                                                    {record.return_date && <div>⏰ <strong>Return:</strong> {formatDate(record.return_date)}</div>}
                                                    {record.collateral && <div>🏠 <strong>Collateral:</strong> {record.collateral}</div>}
                                                </div>
                                                {record.purpose && (
                                                    <div style={{ marginTop: "0.5rem", fontSize: "0.88rem", color: "#6b7280" }}>
                                                        🎯 <strong>Purpose:</strong> {record.purpose}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Amount & Approve */}
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
                                                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#e67700" }}>
                                                    {formatCurrency(record.total_amount)}
                                                </div>
                                                <button
                                                    onClick={() => handleApprove(record)}
                                                    disabled={approvingId === record.id}
                                                    style={{
                                                        padding: "0.6rem 1.5rem",
                                                        background: approvingId === record.id
                                                            ? "#dee2e6"
                                                            : "linear-gradient(135deg, #51cf66, #40c057)",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "10px",
                                                        fontWeight: 700,
                                                        fontSize: "0.95rem",
                                                        cursor: approvingId === record.id ? "not-allowed" : "pointer",
                                                        transition: "all 0.2s ease",
                                                        boxShadow: "0 4px 12px rgba(64, 192, 87, 0.3)",
                                                    }}
                                                >
                                                    {approvingId === record.id ? "Approving..." : "✅ Approve & Disburse"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
