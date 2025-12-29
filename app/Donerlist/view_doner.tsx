"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type DonerType = {
  id: string;
  name: string;
  mobile_no: string;
  payment_method: string;
  total_amount: number;
  purpose: string;
  remarks?: string;
  donation_date: string;
  created_at: string;
};

type TransactionType = {
  id: string;
  doner_id: string;
  amount: number;
  payment_method: string;
  purpose: string;
  remarks?: string;
  transaction_date: string;
  created_at: string;
};

type DonationRecord = {
  id: string;
  date: string;
  amount: number;
  payment_method: string;
  purpose: string;
  remarks?: string;
  is_main_record: boolean;
  doner_id: string;
  doner_name: string;
  mobile_no: string;
};

export default function ViewDoner() {
  const [searchTerm, setSearchTerm] = useState("");
  const [doners, setDoners] = useState<DonerType[]>([]);
  const [filteredDoners, setFilteredDoners] = useState<DonerType[]>([]);
  const [allDonations, setAllDonations] = useState<DonationRecord[]>([]);
  const [selectedMobile, setSelectedMobile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "donations">("list");

  useEffect(() => {
    fetchDoners();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDoners(doners);
    } else {
      const filtered = doners.filter(
        (doner) =>
          doner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doner.mobile_no.includes(searchTerm)
      );
      setFilteredDoners(filtered);
    }
  }, [searchTerm, doners]);

  async function fetchDoners() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("doners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDoners(data || []);
      setFilteredDoners(data || []);
    } catch (error) {
      console.error("Error fetching doners:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllDonationsForMobile(mobile_no: string) {
    try {
      setSearchLoading(true);
      setSelectedMobile(mobile_no);
      
      // 1. Find ALL donor records with this EXACT mobile number
      const { data: donerRecords, error: donersError } = await supabase
        .from("doners")
        .select("*")
        .eq("mobile_no", mobile_no)
        .order("donation_date", { ascending: false });

      if (donersError) throw donersError;

      if (!donerRecords || donerRecords.length === 0) {
        setAllDonations([]);
        return;
      }

      // 2. Get all donor IDs for this mobile number
      const donerIds = donerRecords.map(d => d.id);
      
      // 3. Fetch all transactions for all these donor IDs
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .in("doner_id", donerIds)
        .order("transaction_date", { ascending: false });

      if (transactionsError) throw transactionsError;

      // 4. Convert donor records to donation format
      const mainDonations: DonationRecord[] = donerRecords.map((doner) => ({
        id: doner.id,
        date: doner.donation_date,
        amount: doner.total_amount,
        payment_method: doner.payment_method,
        purpose: doner.purpose,
        remarks: doner.remarks,
        is_main_record: true,
        doner_id: doner.id,
        doner_name: doner.name,
        mobile_no: doner.mobile_no,
      }));

      // 5. Convert transactions to donation format
      const transactionDonations: DonationRecord[] = (transactionsData || []).map((transaction) => {
        // Find which donor this transaction belongs to
        const donor = donerRecords.find(d => d.id === transaction.doner_id);
        return {
          id: transaction.id,
          date: transaction.transaction_date,
          amount: transaction.amount,
          payment_method: transaction.payment_method,
          purpose: transaction.purpose,
          remarks: transaction.remarks,
          is_main_record: false,
          doner_id: transaction.doner_id,
          doner_name: donor?.name || "Unknown",
          mobile_no: donor?.mobile_no || mobile_no,
        };
      });

      // 6. Combine and sort by date (newest first)
      const allDonationsData = [...mainDonations, ...transactionDonations];
      allDonationsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAllDonations(allDonationsData);
    } catch (error) {
      console.error("Error fetching donations:", error);
      setAllDonations([]);
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleMobileSelect(mobile_no: string) {
    setViewMode("donations");
    await fetchAllDonationsForMobile(mobile_no);
  }

  // Group donors by MOBILE NUMBER only
  const groupedByMobile = filteredDoners.reduce((groups, doner) => {
    const mobileKey = doner.mobile_no.trim();
    
    if (!groups[mobileKey]) {
      groups[mobileKey] = {
        mobile_no: doner.mobile_no,
        records: [],
        totalAmount: 0,
        lastDonation: "",
        uniqueNames: new Set<string>(),
        count: 0,
      };
    }
    
    groups[mobileKey].records.push(doner);
    groups[mobileKey].totalAmount += doner.total_amount;
    groups[mobileKey].count += 1;
    groups[mobileKey].uniqueNames.add(doner.name);
    
    // Find the most recent donation date
    const currentDate = new Date(doner.donation_date);
    if (!groups[mobileKey].lastDonation || currentDate > new Date(groups[mobileKey].lastDonation)) {
      groups[mobileKey].lastDonation = doner.donation_date;
    }
    
    return groups;
  }, {} as Record<string, {
    mobile_no: string;
    records: DonerType[];
    totalAmount: number;
    lastDonation: string;
    uniqueNames: Set<string>;
    count: number;
  }>);

  // Convert to array and sort by count (most records first)
  const groupedByMobileArray = Object.values(groupedByMobile)
    .sort((a, b) => b.count - a.count);

  // Function to get display name for group
  function getDisplayName(uniqueNames: Set<string>): string {
    const names = Array.from(uniqueNames);
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]}, ${names[1]}`;
    return `${names[0]} +${names.length - 1} more`;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Calculate statistics for selected mobile
  const totalTransactions = allDonations.length;
  const totalAmount = allDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const averageDonation = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

  // Get unique names for selected mobile
  const selectedUniqueNames = selectedMobile 
    ? Array.from(new Set(allDonations.filter(d => d.is_main_record).map(d => d.doner_name)))
    : [];

  // Inline styles
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: "2rem 1rem",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    wrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "2.5rem",
    },
    headerTitle: {
      fontSize: "2.8rem",
      fontWeight: "800",
      color: "#2c3e50",
      marginBottom: "0.5rem",
      textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
    },
    headerSubtitle: {
      fontSize: "1.1rem",
      color: "#7f8c8d",
      maxWidth: "600px",
      margin: "0 auto",
    },
    card: {
      background: "white",
      borderRadius: "15px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      overflow: "hidden",
    },
    searchSection: {
      background: "linear-gradient(90deg, #3498db 0%, #2980b9 100%)",
      padding: "1.5rem 2rem",
    },
    searchContainer: {
      maxWidth: "600px",
      margin: "0 auto",
    },
    searchLabel: {
      display: "block",
      color: "white",
      fontSize: "1rem",
      fontWeight: "600",
      marginBottom: "0.5rem",
    },
    searchInput: {
      width: "100%",
      padding: "0.875rem 1rem",
      borderRadius: "10px",
      border: "none",
      fontSize: "1rem",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      outline: "none",
      transition: "all 0.3s ease",
    },
    searchInputFocus: {
      boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
    },
    searchHint: {
      color: "rgba(255,255,255,0.8)",
      fontSize: "0.85rem",
      marginTop: "0.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    mainContent: {
      padding: "2rem",
    },
    viewControls: {
      display: "flex",
      gap: "1rem",
      marginBottom: "1.5rem",
    },
    viewButton: {
      padding: "0.75rem 1.5rem",
      borderRadius: "8px",
      border: "none",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    viewButtonActive: {
      background: "linear-gradient(90deg, #2ecc71 0%, #27ae60 100%)",
      color: "white",
      boxShadow: "0 4px 6px rgba(46, 204, 113, 0.3)",
    },
    viewButtonInactive: {
      background: "#f8f9fa",
      color: "#6c757d",
    },
    backButton: {
      background: "#95a5a6",
      color: "white",
      padding: "0.75rem 1.5rem",
      borderRadius: "8px",
      border: "none",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "1.5rem",
    },
    backButtonHover: {
      background: "#7f8c8d",
    },
    loadingContainer: {
      textAlign: "center" as const,
      padding: "3rem",
      color: "#7f8c8d",
    },
    tableContainer: {
      overflowX: "auto" as const,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
    },
    tableHeader: {
      background: "#f8f9fa",
      borderBottom: "2px solid #dee2e6",
    },
    tableHeaderCell: {
      padding: "1rem",
      textAlign: "left" as const,
      fontWeight: "600",
      color: "#495057",
      fontSize: "0.9rem",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    },
    tableRow: {
      borderBottom: "1px solid #dee2e6",
      transition: "all 0.2s ease",
    },
    tableRowHover: {
      background: "#f8f9fa",
      cursor: "pointer",
    },
    tableCell: {
      padding: "1rem",
      color: "#495057",
      fontSize: "0.95rem",
    },
    amountCell: {
      fontWeight: "600",
      color: "#27ae60",
    },
    dateCell: {
      color: "#6c757d",
      fontSize: "0.85rem",
    },
    noData: {
      textAlign: "center" as const,
      padding: "3rem",
      color: "#6c757d",
      fontSize: "1.1rem",
    },
    donerInfoCard: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "12px",
      padding: "1.5rem",
      marginBottom: "1.5rem",
      color: "white",
    },
    donerInfoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1rem",
    },
    donerInfoItem: {
      marginBottom: "0.5rem",
    },
    donerInfoLabel: {
      fontSize: "0.85rem",
      opacity: "0.9",
      marginBottom: "0.25rem",
    },
    donerInfoValue: {
      fontSize: "1.1rem",
      fontWeight: "600",
    },
    statsCard: {
      background: "#f8f9fa",
      borderRadius: "10px",
      padding: "1rem",
      marginTop: "1rem",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "1rem",
      textAlign: "center" as const,
    },
    statItem: {
      padding: "0.75rem",
    },
    statValue: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#2c3e50",
    },
    statLabel: {
      fontSize: "0.85rem",
      color: "#7f8c8d",
      marginTop: "0.25rem",
    },
    donationRow: {
      borderBottom: "1px solid #dee2e6",
    },
    donationRowHover: {
      background: "#f8f9fa",
    },
    mainRecordBadge: {
      display: "inline-block",
      padding: "0.25rem 0.5rem",
      borderRadius: "4px",
      background: "#d4edda",
      color: "#155724",
      fontSize: "0.75rem",
      fontWeight: "600",
      marginRight: "0.5rem",
    },
    additionalBadge: {
      display: "inline-block",
      padding: "0.25rem 0.5rem",
      borderRadius: "4px",
      background: "#e3f2fd",
      color: "#1976d2",
      fontSize: "0.75rem",
      fontWeight: "600",
      marginRight: "0.5rem",
    },
    mobileBadge: {
      display: "inline-block",
      padding: "0.25rem 0.5rem",
      borderRadius: "4px",
      background: "#fff3cd",
      color: "#856404",
      fontSize: "0.75rem",
      fontWeight: "600",
      marginLeft: "0.5rem",
    },
    nameBadge: {
      display: "inline-block",
      padding: "0.25rem 0.5rem",
      borderRadius: "4px",
      background: "#d1ecf1",
      color: "#0c5460",
      fontSize: "0.75rem",
      fontWeight: "600",
      marginLeft: "0.5rem",
    },
    countBadge: {
      display: "inline-block",
      padding: "0.25rem 0.5rem",
      borderRadius: "4px",
      background: "#f8d7da",
      color: "#721c24",
      fontSize: "0.75rem",
      fontWeight: "600",
      marginLeft: "0.5rem",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>DONOR RECORDS</h1>
          <p style={styles.headerSubtitle}>
            Search and view donor information grouped by mobile number
          </p>
        </div>

        {/* Main Card */}
        <div style={styles.card}>
          {/* Search Section */}
          <div style={styles.searchSection}>
            <div style={styles.searchContainer}>
              <label style={styles.searchLabel}>
                🔍 SEARCH BY NAME OR MOBILE NUMBER
              </label>
              <input
                type="text"
                placeholder="Enter name or mobile number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                onFocus={(e) => Object.assign(e.target.style, styles.searchInputFocus)}
                onBlur={(e) => {
                  e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                }}
              />
              <div style={styles.searchHint}>
                {/* <span>💡 Tip: Groups records by exact mobile number</span> */}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={styles.mainContent}>
            {/* View Controls */}
            <div style={styles.viewControls}>
              <button
                style={{
                  ...styles.viewButton,
                  ...(viewMode === "list" ? styles.viewButtonActive : styles.viewButtonInactive),
                }}
                onClick={() => setViewMode("list")}
              >
                📋 Grouped by Mobile
              </button>
              {selectedMobile && viewMode === "donations" && (
                <button
                  style={{
                    ...styles.viewButton,
                    ...styles.viewButtonInactive,
                  }}
                  disabled
                >
                  💰 All Records for {selectedMobile}
                </button>
              )}
            </div>

            {/* Back Button (when viewing donations) */}
            {viewMode === "donations" && selectedMobile && (
              <button
                style={styles.backButton}
                onClick={() => {
                  setViewMode("list");
                  setSelectedMobile(null);
                  setAllDonations([]);
                }}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.backButtonHover)}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#95a5a6";
                }}
              >
                ← Back to Mobile Groups
              </button>
            )}

            {/* Mobile Info Card (when viewing donations) */}
            {viewMode === "donations" && selectedMobile && (
              <div style={styles.donerInfoCard}>
                <div style={styles.donerInfoGrid}>
                  <div style={styles.donerInfoItem}>
                    <div style={styles.donerInfoLabel}>MOBILE NUMBER</div>
                    <div style={styles.donerInfoValue}>
                      {selectedMobile}
                      <span style={styles.countBadge}>
                        {allDonations.filter(d => d.is_main_record).length} records
                      </span>
                    </div>
                  </div>
                  <div style={styles.donerInfoItem}>
                    <div style={styles.donerInfoLabel}>ASSOCIATED NAMES</div>
                    <div style={styles.donerInfoValue}>
                      {selectedUniqueNames.join(", ")}
                      {selectedUniqueNames.length > 1 && (
                        <span style={styles.nameBadge}>
                          {selectedUniqueNames.length} names
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={styles.donerInfoItem}>
                    <div style={styles.donerInfoLabel}>TOTAL DONATED</div>
                    <div style={styles.donerInfoValue}>{formatCurrency(totalAmount)}</div>
                  </div>
                  <div style={styles.donerInfoItem}>
                    <div style={styles.donerInfoLabel}>LAST DONATION</div>
                    <div style={styles.donerInfoValue}>
                      {allDonations.length > 0 ? formatDate(allDonations[0].date) : "N/A"}
                    </div>
                  </div>
                </div>
                <div style={styles.statsCard}>
                  <div style={styles.statsGrid}>
                    <div style={styles.statItem}>
                      <div style={styles.statValue}>
                        {allDonations.filter(d => d.is_main_record).length}
                      </div>
                      <div style={styles.statLabel}>Total Records</div>
                    </div>
                    <div style={styles.statItem}>
                      <div style={styles.statValue}>{totalTransactions}</div>
                      <div style={styles.statLabel}>Total Donations</div>
                    </div>
                    <div style={styles.statItem}>
                      <div style={styles.statValue}>
                        {formatCurrency(totalAmount)}
                      </div>
                      <div style={styles.statLabel}>Total Amount</div>
                    </div>
                    <div style={styles.statItem}>
                      <div style={styles.statValue}>
                        {formatCurrency(averageDonation)}
                      </div>
                      <div style={styles.statLabel}>Average Donation</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && viewMode === "list" && (
              <div style={styles.loadingContainer}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
                <p>Loading donor records...</p>
              </div>
            )}

            {searchLoading && viewMode === "donations" && (
              <div style={styles.loadingContainer}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
                <p>Loading complete donation history...</p>
              </div>
            )}

            {/* Grouped by Mobile List */}
            {!loading && viewMode === "list" && (
              <div style={styles.tableContainer}>
                {groupedByMobileArray.length > 0 ? (
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHeaderCell}>Mobile Number</th>
                        <th style={styles.tableHeaderCell}>Associated Names</th>
                        <th style={styles.tableHeaderCell}>Total Amount</th>
                        <th style={styles.tableHeaderCell}>Total Records</th>
                        <th style={styles.tableHeaderCell}>Last Donation</th>
                        <th style={styles.tableHeaderCell}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedByMobileArray.map((group, index) => (
                        <tr
                          key={`${group.mobile_no}_${index}`}
                          style={styles.tableRow}
                          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.tableRowHover)}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "";
                          }}
                        >
                          <td style={styles.tableCell}>
                            <div style={{ fontWeight: "600", color: "#2c3e50" }}>
                              {group.mobile_no}
                              <span style={styles.mobileBadge}>
                                {group.count} {group.count === 1 ? 'record' : 'records'}
                              </span>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                              {Array.from(group.uniqueNames).map((name, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    display: "inline-block",
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "4px",
                                    background: "#e9ecef",
                                    color: "#495057",
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ ...styles.tableCell, ...styles.amountCell }}>
                            {formatCurrency(group.totalAmount)}
                          </td>
                          <td style={styles.tableCell}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "50%",
                                background: group.count > 1 ? "#f8d7da" : "#d4edda",
                                color: group.count > 1 ? "#721c24" : "#155724",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                width: "24px",
                                height: "24px",
                                textAlign: "center",
                                lineHeight: "24px",
                              }}
                            >
                              {group.count}
                            </span>
                            {group.count > 1 && (
                              <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem", color: "#6c757d" }}>
                                records
                              </span>
                            )}
                          </td>
                          <td style={{ ...styles.tableCell, ...styles.dateCell }}>
                            {formatDate(group.lastDonation)}
                          </td>
                          <td style={styles.tableCell}>
                            <button
                              onClick={() => handleMobileSelect(group.mobile_no)}
                              style={{
                                padding: "0.5rem 1rem",
                                background: "linear-gradient(90deg, #3498db 0%, #2980b9 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 4px 6px rgba(52, 152, 219, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              View All Records
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={styles.noData}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                    <p>No donors found</p>
                    <p style={{ fontSize: "0.9rem", marginTop: "0.5rem", color: "#95a5a6" }}>
                      {searchTerm ? "Try a different search term" : "No donor records available"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Complete Donation History for Mobile */}
            {!searchLoading && viewMode === "donations" && (
              <div style={styles.tableContainer}>
                {allDonations.length > 0 ? (
                  <>
                    <div style={{ marginBottom: "1rem", color: "#495057" }}>
                      <h3 style={{ marginBottom: "0.5rem" }}>Donation Details:</h3>
                      <p style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                        Showing all records for mobile number: <strong>{selectedMobile}</strong>
                      </p>
                    </div>
                    <table style={styles.table}>
                      <thead style={styles.tableHeader}>
                        <tr>
                          <th style={styles.tableHeaderCell}>Date</th>
                          <th style={styles.tableHeaderCell}>Donor Name</th>
                          <th style={styles.tableHeaderCell}>Amount</th>
                          <th style={styles.tableHeaderCell}>Payment Method</th>
                          <th style={styles.tableHeaderCell}>Purpose</th>
                          <th style={styles.tableHeaderCell}>Remarks</th>
                          <th style={styles.tableHeaderCell}>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allDonations.map((donation, index) => (
                          <tr
                            key={`${donation.id}_${index}`}
                            style={styles.donationRow}
                            onMouseEnter={(e) =>
                              Object.assign(e.currentTarget.style, styles.donationRowHover)
                            }
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "";
                            }}
                          >
                            <td style={{ ...styles.tableCell, ...styles.dateCell }}>
                              {formatDate(donation.date)}
                            </td>
                            <td style={styles.tableCell}>
                              {donation.doner_name}
                              {donation.is_main_record && (
                                <span style={styles.mainRecordBadge}>MAIN</span>
                              )}
                            </td>
                            <td style={{ ...styles.tableCell, ...styles.amountCell }}>
                              {formatCurrency(donation.amount)}
                            </td>
                            <td style={styles.tableCell}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "4px",
                                  background: donation.is_main_record ? "#d4edda" : "#e3f2fd",
                                  color: donation.is_main_record ? "#155724" : "#1976d2",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {donation.payment_method}
                              </span>
                            </td>
                            <td style={styles.tableCell}>{donation.purpose}</td>
                            <td style={styles.tableCell}>
                              {donation.remarks || (
                                <span style={{ color: "#95a5a6", fontStyle: "italic" }}>
                                  No remarks
                                </span>
                              )}
                            </td>
                            <td style={styles.tableCell}>
                              {donation.is_main_record ? (
                                <span style={{ color: "#155724", fontSize: "0.85rem", fontWeight: "600" }}>
                                  Main Record
                                </span>
                              ) : (
                                <span style={{ color: "#1976d2", fontSize: "0.85rem" }}>
                                  Additional Transaction
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <div style={styles.noData}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💳</div>
                    <p>No donation history found for this mobile number</p>
                    <p style={{ fontSize: "0.9rem", marginTop: "0.5rem", color: "#95a5a6" }}>
                      Mobile: {selectedMobile}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}