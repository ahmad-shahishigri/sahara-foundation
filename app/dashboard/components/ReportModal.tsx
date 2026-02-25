"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type ReportModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type TabKey = "donors" | "loans" | "expenses" | "pending" | "all";

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("all");
    const [donors, setDonors] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchAllData();
            setSearchTerm("");
        }
    }, [isOpen]);

    const fetchAllData = async () => {
        setLoading(true);
        const [donorRes, recordRes] = await Promise.all([
            supabase.from("doner").select("*").order("created_at", { ascending: false }),
            supabase.from("expense_records").select("*").order("created_at", { ascending: false }),
        ]);
        setDonors(donorRes.data || []);
        setRecords(recordRes.data || []);
        setLoading(false);
    };

    const loans = records.filter(r => r.type === "loan" && r.status !== "pending");
    const expenses = records.filter(r => r.type === "expense" && r.status !== "pending");
    const pending = records.filter(r => r.status === "pending");

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(n || 0);

    const formatDate = (d: string) =>
        d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";

    const search = (items: any[], keys: string[]) => {
        if (!searchTerm.trim()) return items;
        const q = searchTerm.toLowerCase();
        return items.filter(item => keys.some(k => String(item[k] || "").toLowerCase().includes(q)));
    };

    // ---------- CSV helpers ----------
    const toCsv = (rows: Record<string, any>[]) => {
        if (!rows.length) return "";
        const headers = Object.keys(rows[0]);
        const lines = [headers.join(","), ...rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))];
        return lines.join("\n");
    };

    const downloadCsv = (csv: string, filename: string) => {
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadTab = () => {
        let data: any[] = [];
        let filename = "report.csv";

        if (activeTab === "donors") {
            data = search(donors, ["name", "mobile_no", "purpose"]).map(d => ({
                Name: d.name, Mobile: d.mobile_no, Amount: d.total_amount, Purpose: d.purpose, Payment: d.payment_method, Date: d.created_at
            }));
            filename = "donors_report.csv";
        } else if (activeTab === "loans") {
            data = search(loans, ["recipient_name", "category", "purpose"]).map(r => ({
                Name: r.recipient_name, Mobile: r.mobile_no, Amount: r.total_amount, Remaining: r.remaining_amount, Category: r.category, Purpose: r.purpose, Status: r.status, Date: r.expense_date
            }));
            filename = "loans_report.csv";
        } else if (activeTab === "expenses") {
            data = search(expenses, ["recipient_name", "category", "purpose"]).map(r => ({
                Recipient: r.recipient_name, Amount: r.total_amount, Category: r.category, Purpose: r.purpose, Payment: r.payment_method, Status: r.status, Date: r.expense_date
            }));
            filename = "expenses_report.csv";
        } else if (activeTab === "pending") {
            data = search(pending, ["recipient_name", "category", "purpose"]).map(r => ({
                Type: r.type, Recipient: r.recipient_name, Amount: r.total_amount, Category: r.category, Purpose: r.purpose, Date: r.expense_date
            }));
            filename = "pending_report.csv";
        } else {
            // All
            const allRows = [
                ...donors.map(d => ({ Section: "Donor", Name: d.name, Mobile: d.mobile_no, Amount: d.total_amount, Category: "-", Purpose: d.purpose || "-", Status: "-", Date: d.created_at })),
                ...loans.map(r => ({ Section: "Loan", Name: r.recipient_name, Mobile: r.mobile_no, Amount: r.total_amount, Category: r.category, Purpose: r.purpose, Status: r.status, Date: r.expense_date })),
                ...expenses.map(r => ({ Section: "Expense", Name: r.recipient_name, Mobile: r.mobile_no, Amount: r.total_amount, Category: r.category, Purpose: r.purpose, Status: r.status, Date: r.expense_date })),
                ...pending.map(r => ({ Section: `Pending ${r.type}`, Name: r.recipient_name, Mobile: r.mobile_no, Amount: r.total_amount, Category: r.category, Purpose: r.purpose, Status: r.status, Date: r.expense_date })),
            ];
            data = allRows;
            filename = "all_records_report.csv";
        }

        if (!data.length) return;
        downloadCsv(toCsv(data), filename);
    };

    const downloadAll = () => {
        const allRows = [
            ...donors.map(d => ({ Section: "Donor", Name: d.name, Mobile: d.mobile_no, Amount: d.total_amount, Category: "-", Purpose: d.purpose || "-", Status: "-", Payment: d.payment_method || "-", Date: d.created_at })),
            ...records.map(r => ({ Section: r.status === "pending" ? `Pending ${r.type}` : r.type === "loan" ? "Loan" : "Expense", Name: r.recipient_name, Mobile: r.mobile_no, Amount: r.total_amount, Category: r.category, Purpose: r.purpose, Status: r.status, Payment: r.payment_method, Date: r.expense_date })),
        ];
        if (!allRows.length) return;
        downloadCsv(toCsv(allRows), "sahara_foundation_all_records.csv");
    };

    // ---------- Tab config ----------
    const tabs: { key: TabKey; label: string; icon: string; color: string; count: number }[] = [
        { key: "all", label: "All Records", icon: "📋", color: "#4c6ef5", count: donors.length + records.length },
        { key: "donors", label: "Donors", icon: "👥", color: "#10b981", count: donors.length },
        { key: "loans", label: "Loans", icon: "📝", color: "#3b82f6", count: loans.length },
        { key: "expenses", label: "Expenses", icon: "💸", color: "#8b5cf6", count: expenses.length },
        { key: "pending", label: "Pending", icon: "⏳", color: "#fab005", count: pending.length },
    ];

    // ---------- Table renderer ----------
    const renderTable = () => {
        if (activeTab === "donors") {
            const filtered = search(donors, ["name", "mobile_no", "purpose"]);
            return (
                <table style={tableStyle}>
                    <thead><tr style={headerRowStyle}>
                        <th style={thStyle}>#</th><th style={thStyle}>Name</th><th style={thStyle}>Mobile</th><th style={thStyle}>Amount</th><th style={thStyle}>Purpose</th><th style={thStyle}>Payment</th><th style={thStyle}>Date</th>
                    </tr></thead>
                    <tbody>{filtered.map((d, i) => (
                        <tr key={d.id} style={rowStyle(i)}>
                            <td style={tdStyle}>{i + 1}</td><td style={tdBold}>{d.name}</td><td style={tdStyle}>{d.mobile_no || "-"}</td><td style={{ ...tdStyle, color: "#10b981", fontWeight: 700 }}>+{formatCurrency(d.total_amount)}</td><td style={tdStyle}>{d.purpose || "-"}</td><td style={tdStyle}>{d.payment_method || "-"}</td><td style={tdStyle}>{formatDate(d.created_at)}</td>
                        </tr>
                    ))}</tbody>
                </table>
            );
        }

        if (activeTab === "loans") {
            const filtered = search(loans, ["recipient_name", "category", "purpose"]);
            return (
                <table style={tableStyle}>
                    <thead><tr style={headerRowStyle}>
                        <th style={thStyle}>#</th><th style={thStyle}>Borrower</th><th style={thStyle}>Mobile</th><th style={thStyle}>Amount</th><th style={thStyle}>Remaining</th><th style={thStyle}>Category</th><th style={thStyle}>Purpose</th><th style={thStyle}>Date</th>
                    </tr></thead>
                    <tbody>{filtered.map((r, i) => (
                        <tr key={r.id} style={rowStyle(i)}>
                            <td style={tdStyle}>{i + 1}</td><td style={tdBold}>{r.recipient_name}</td><td style={tdStyle}>{r.mobile_no || "-"}</td><td style={{ ...tdStyle, color: "#e03131", fontWeight: 700 }}>-{formatCurrency(r.total_amount)}</td><td style={{ ...tdStyle, fontWeight: 600 }}>{formatCurrency(r.remaining_amount ?? r.total_amount)}</td><td style={tdStyle}>{r.category}</td><td style={tdStyle}>{r.purpose}</td><td style={tdStyle}>{formatDate(r.expense_date)}</td>
                        </tr>
                    ))}</tbody>
                </table>
            );
        }

        if (activeTab === "expenses") {
            const filtered = search(expenses, ["recipient_name", "category", "purpose"]);
            return (
                <table style={tableStyle}>
                    <thead><tr style={headerRowStyle}>
                        <th style={thStyle}>#</th><th style={thStyle}>Recipient</th><th style={thStyle}>Amount</th><th style={thStyle}>Category</th><th style={thStyle}>Purpose</th><th style={thStyle}>Payment</th><th style={thStyle}>Date</th>
                    </tr></thead>
                    <tbody>{filtered.map((r, i) => (
                        <tr key={r.id} style={rowStyle(i)}>
                            <td style={tdStyle}>{i + 1}</td><td style={tdBold}>{r.recipient_name}</td><td style={{ ...tdStyle, color: "#e03131", fontWeight: 700 }}>-{formatCurrency(r.total_amount)}</td><td style={tdStyle}>{r.category}</td><td style={tdStyle}>{r.purpose}</td><td style={tdStyle}>{r.payment_method}</td><td style={tdStyle}>{formatDate(r.expense_date)}</td>
                        </tr>
                    ))}</tbody>
                </table>
            );
        }

        if (activeTab === "pending") {
            const filtered = search(pending, ["recipient_name", "category", "purpose"]);
            return (
                <table style={tableStyle}>
                    <thead><tr style={headerRowStyle}>
                        <th style={thStyle}>#</th><th style={thStyle}>Type</th><th style={thStyle}>Recipient</th><th style={thStyle}>Amount</th><th style={thStyle}>Category</th><th style={thStyle}>Purpose</th><th style={thStyle}>Date</th>
                    </tr></thead>
                    <tbody>{filtered.map((r, i) => (
                        <tr key={r.id} style={rowStyle(i)}>
                            <td style={tdStyle}>{i + 1}</td><td style={tdStyle}><span style={{ background: r.type === "loan" ? "#dbeafe" : "#f3e8ff", color: r.type === "loan" ? "#2563eb" : "#7c3aed", padding: "2px 10px", borderRadius: "12px", fontWeight: 600, fontSize: "0.8rem" }}>{r.type}</span></td><td style={tdBold}>{r.recipient_name}</td><td style={{ ...tdStyle, color: "#e67700", fontWeight: 700 }}>{formatCurrency(r.total_amount)}</td><td style={tdStyle}>{r.category}</td><td style={tdStyle}>{r.purpose}</td><td style={tdStyle}>{formatDate(r.expense_date)}</td>
                        </tr>
                    ))}</tbody>
                </table>
            );
        }

        // ALL tab
        const allItems = [
            ...donors.map(d => ({ ...d, _section: "Donor", _name: d.name, _amount: d.total_amount, _date: d.created_at, _category: "-", _purpose: d.purpose || "-" })),
            ...loans.map(r => ({ ...r, _section: "Loan", _name: r.recipient_name, _amount: r.total_amount, _date: r.expense_date, _category: r.category, _purpose: r.purpose })),
            ...expenses.map(r => ({ ...r, _section: "Expense", _name: r.recipient_name, _amount: r.total_amount, _date: r.expense_date, _category: r.category, _purpose: r.purpose })),
            ...pending.map(r => ({ ...r, _section: `Pending`, _name: r.recipient_name, _amount: r.total_amount, _date: r.expense_date, _category: r.category, _purpose: r.purpose })),
        ];
        const filtered = search(allItems, ["_name", "_category", "_purpose", "_section"]);
        return (
            <table style={tableStyle}>
                <thead><tr style={headerRowStyle}>
                    <th style={thStyle}>#</th><th style={thStyle}>Section</th><th style={thStyle}>Name</th><th style={thStyle}>Amount</th><th style={thStyle}>Category</th><th style={thStyle}>Purpose</th><th style={thStyle}>Date</th>
                </tr></thead>
                <tbody>{filtered.map((item, i) => {
                    const sectionColors: Record<string, { bg: string; fg: string }> = {
                        Donor: { bg: "#d3f9d8", fg: "#2b8a3e" },
                        Loan: { bg: "#dbeafe", fg: "#2563eb" },
                        Expense: { bg: "#f3e8ff", fg: "#7c3aed" },
                        Pending: { bg: "#fff3bf", fg: "#e67700" },
                    };
                    const sc = sectionColors[item._section] || sectionColors.Donor;
                    return (
                        <tr key={`${item._section}-${item.id}-${i}`} style={rowStyle(i)}>
                            <td style={tdStyle}>{i + 1}</td>
                            <td style={tdStyle}><span style={{ background: sc.bg, color: sc.fg, padding: "2px 10px", borderRadius: "12px", fontWeight: 600, fontSize: "0.8rem" }}>{item._section}</span></td>
                            <td style={tdBold}>{item._name}</td>
                            <td style={{ ...tdStyle, fontWeight: 700, color: item._section === "Donor" ? "#10b981" : item._section === "Pending" ? "#e67700" : "#e03131" }}>
                                {item._section === "Donor" ? "+" : "-"}{formatCurrency(item._amount)}
                            </td>
                            <td style={tdStyle}>{item._category}</td>
                            <td style={tdStyle}>{item._purpose}</td>
                            <td style={tdStyle}>{formatDate(item._date)}</td>
                        </tr>
                    );
                })}</tbody>
            </table>
        );
    };

    // ---------- Styles ----------
    const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" };
    const headerRowStyle: React.CSSProperties = { background: "#f8f9fa", position: "sticky" as const, top: 0, zIndex: 1 };
    const thStyle: React.CSSProperties = { padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#495057", borderBottom: "2px solid #dee2e6", whiteSpace: "nowrap" };
    const tdStyle: React.CSSProperties = { padding: "10px 14px", borderBottom: "1px solid #f1f3f5", color: "#495057" };
    const tdBold: React.CSSProperties = { ...tdStyle, fontWeight: 600, color: "#1f2937" };
    const rowStyle = (i: number): React.CSSProperties => ({ background: i % 2 === 0 ? "white" : "#f8f9fa" });

    if (!isOpen) return null;

    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
            <div style={{ background: "white", borderRadius: "16px", width: "100%", maxWidth: "1100px", height: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem 2rem", background: "linear-gradient(135deg, #4c6ef5, #3b5bdb)", color: "white", flexShrink: 0 }}>
                    <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>📈 Reports & Records</h2>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <button onClick={downloadAll} style={{ background: "rgba(255,255,255,0.2)", border: "none", padding: "8px 16px", borderRadius: "8px", color: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }} title="Download all records as single CSV">
                            ⤓ Download All
                        </button>
                        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", cursor: "pointer", color: "white" }}>×</button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "0.5rem", padding: "1rem 2rem 0", flexWrap: "wrap", borderBottom: "1px solid #e9ecef", flexShrink: 0 }}>
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearchTerm(""); }}
                            style={{
                                padding: "8px 18px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.88rem",
                                background: activeTab === tab.key ? tab.color : "transparent",
                                color: activeTab === tab.key ? "white" : "#6b7280",
                                transition: "all 0.2s ease",
                            }}>
                            {tab.icon} {tab.label} <span style={{ marginLeft: 4, opacity: 0.8, fontSize: "0.8rem" }}>({tab.count})</span>
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 2rem", flexShrink: 0 }}>
                    <input
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #dee2e6", fontSize: "0.88rem", width: "280px", outline: "none" }}
                    />
                    <button onClick={downloadTab} style={{ background: "#f1f3f5", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem", color: "#495057" }}>
                        ⤓ Download {tabs.find(t => t.key === activeTab)?.label} CSV
                    </button>
                </div>

                {/* Table content */}
                <div style={{ flex: 1, overflowY: "auto", padding: "0 2rem 2rem" }}>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "3rem", color: "#868e96" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
                            <p>Loading records...</p>
                        </div>
                    ) : (
                        renderTable()
                    )}
                </div>

                {/* Footer summary */}
                <div style={{ display: "flex", gap: "2rem", padding: "0.8rem 2rem", background: "#f8f9fa", borderTop: "1px solid #e9ecef", fontSize: "0.85rem", fontWeight: 600, color: "#495057", flexWrap: "wrap", flexShrink: 0 }}>
                    <span>👥 Donors: {donors.length}</span>
                    <span>📝 Loans: {loans.length}</span>
                    <span>💸 Expenses: {expenses.length}</span>
                    <span>⏳ Pending: {pending.length}</span>
                    <span style={{ marginLeft: "auto", color: "#10b981" }}>Total Donations: {formatCurrency(donors.reduce((s, d) => s + (d.total_amount || 0), 0))}</span>
                </div>
            </div>
        </div>
    );
}
