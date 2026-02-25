// // import styles from "../dashboard.module.css";
// // import ActivityRow from "./ActivityRow";

// // export default function RecentActivity() {
// //   return (
// //     <div>
// //       <h3 style={{ marginBottom: "15px", fontWeight: 600, fontSize: "20px" }}>
// //         Recent Activity
// //       </h3>

// //       <table className={styles.recentTable}>
// //         <thead>
// //           <tr>
// //             <th>Type</th>
// //             <th>Description</th>
// //             <th>Amount</th>
// //             <th>Date</th>
// //             <th>Actions</th>
// //           </tr>
// //         </thead>

// //         <tbody>
// //           <ActivityRow
// //             type="Donation"
// //             description="Donation from Ali Ahmed"
// //             amount="Rs. 50,000"
// //             date="2025-11-12"
// //           />

// //           <ActivityRow
// //             type="Spend"
// //             description="Medical aid to Beneficiary X"
// //             amount="Rs. 15,000"
// //             date="2025-11-11"
// //           />

// //           <ActivityRow
// //             type="Loan"
// //             description="Loan to Beneficiary Y"
// //             amount="Rs. 20,000"
// //             date="2025-10-30"
// //           />
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // }
// "use client";

// import styles from "../dashboard.module.css";

// type RecentActivityProps = {
//   recentDonors: any[];
//   recentTransactions: any[];
// };

// export default function RecentActivity({ recentDonors, recentTransactions }: RecentActivityProps) {

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit"
//     });
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-PK", {
//       style: "currency",
//       currency: "PKR",
//       minimumFractionDigits: 0,
//     }).format(amount);
//   };

//   const combinedActivities = [
//     ...recentDonors.map(donor => ({
//       type: "donation" as const,
//       name: donor.name,
//       amount: donor.total_amount,
//       date: donor.created_at,
//       icon: "💰",
//       color: "#10b981"
//     })),
//     ...recentTransactions.map(transaction => ({
//       type: transaction.type,
//       name: transaction.recipient_name || transaction.borrower_name,
//       amount: transaction.total_amount,
//       date: transaction.created_at,
//       icon: transaction.type === "loan" ? "📝" : "💸",
//       color: transaction.type === "loan" ? "#3b82f6" : "#8b5cf6"
//     }))
//   ]
//   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
//   .slice(0, 6);

//   return (
//     <div className={styles.recentActivityList}>
//       {combinedActivities.length > 0 ? (
//         combinedActivities.map((activity, index) => (
//           <div key={index} className={styles.activityItem}>
//             <div 
//               className={styles.activityIcon}
//               style={{ background: activity.color + "20", color: activity.color }}
//             >
//               {activity.icon}
//             </div>
//             <div className={styles.activityContent}>
//               <div className={styles.activityHeader}>
//                 <span className={styles.activityName}>{activity.name}</span>
//                 <span className={styles.activityAmount}>{formatCurrency(activity.amount)}</span>
//               </div>
//               <div className={styles.activityFooter}>
//                 <span className={styles.activityType}>
//                   {activity.type === "donation" ? "Donation" : 
//                    activity.type === "loan" ? "Loan Disbursed" : "Expense"}
//                 </span>
//                 <span className={styles.activityTime}>{formatDate(activity.date)}</span>
//               </div>
//             </div>
//           </div>
//         ))
//       ) : (
//         <div className={styles.noActivity}>
//           <div className={styles.noActivityIcon}>📭</div>
//           <p>No recent activity</p>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import styles from "../dashboard.module.css";

type RecentActivityProps = {
  recentDonors: any[];
  recentTransactions: any[];
};

export default function RecentActivity({ recentDonors, recentTransactions }: RecentActivityProps) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // state: search + visible count for 'show more' behavior
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  const combinedActivities = [
    ...recentDonors.map(donor => ({
      type: "donation" as const,
      name: donor.name,
      amount: donor.total_amount,
      date: donor.created_at,
      icon: "💰",
      color: "#10b981",
      purpose: donor.purpose || "Donation"
    })),
    ...recentTransactions.map(transaction => ({
      type: transaction.type,
      name: transaction.recipient_name || transaction.borrower_name || "Unknown",
      amount: transaction.total_amount,
      date: transaction.created_at,
      icon: transaction.type === "loan" ? "📝" : "💸",
      color: transaction.type === "loan" ? "#3b82f6" : "#8b5cf6",
      purpose: transaction.purpose || (transaction.type === "loan" ? "Loan Disbursed" : "Expense")
    }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // client-side search (name, purpose, amount)
  const filtered = combinedActivities.filter((act) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (act.name || "").toLowerCase().includes(q) ||
      (act.purpose || "").toLowerCase().includes(q) ||
      String(act.amount).toLowerCase().includes(q)
    );
  });

  const visible = filtered.slice(0, visibleCount);

  return (
    <div>
      <div className={styles.activityToolbar}>
        <div className={styles.activityToolbarLeft}>
          {/* <h3 className={styles.sectionTitle}>📋 Recent activity</h3> */}
          <div className={styles.activityMeta}>{filtered.length} items</div>
        </div>

        <div className={styles.activityToolbarRight}>
          <div className={styles.searchWrap} role="search">
            <input
              aria-label="Search recent activity"
              placeholder="Search name, purpose or amount..."
              className={styles.activitySearch}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(6); }}
            />
            {searchTerm && (
              <button className={styles.clearSearch} onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>

          <button
            className={styles.exportButton}
            onClick={() => {
              // simple CSV export of filtered rows
              const rows = filtered.map(r => ({ type: r.type, name: r.name, purpose: r.purpose, amount: r.amount, date: r.date }));
              const csv = [Object.keys(rows[0] || {}).join(","), ...rows.map(r => Object.values(r).map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(","))].join("\n");
              const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `recent-activity.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            title="Export visible rows as CSV"
          >
            ⤓ Export
          </button>
        </div>
      </div>

      <div className={styles.recentActivityTableWrapper} aria-label="Recent activity table">
        <table className={styles.recentActivityTable} role="table">
          <thead>
            <tr role="row" className={styles.recentTableHeader}>
              <th role="columnheader" className={styles.cellType}>Activity</th>
              <th role="columnheader" className={styles.cellName}>Recipient/Donor</th>
              <th role="columnheader" className={styles.cellPurpose}>Description</th>
              <th role="columnheader" className={styles.cellAmount}>Amount</th>
              <th role="columnheader" className={styles.cellStatus}>Status</th>
              <th role="columnheader" className={styles.cellTime}>Date & Time</th>
            </tr>
          </thead>

          <tbody>
            {visible.length === 0 && (
              <tr role="row" className={styles.emptyRow}>
                <td role="cell" colSpan={5} style={{ textAlign: "center", padding: "2rem 1rem", color: "#9aa1ab" }}>
                  📭 No matching activity
                </td>
              </tr>
            )}

            {visible.map((activity, i) => (
              <tr
                key={i}
                role="row"
                className={styles.recentTableRow}
                title={`${activity.name} — ${activity.purpose} — ${formatCurrency(activity.amount)}`}
                style={(activity as any).__optimistic ? { opacity: 0.65 } : undefined}
              >
                <td role="cell" className={styles.cellType}>
                  <span className={styles.typeBadgeWrapper}>
                    <span className={styles.typeBadge}>
                      {activity.type === "donation" ? "Donation" : activity.type === "loan" ? "Loan" : "Expense"}
                    </span>
                  </span>
                </td>

                <td role="cell" className={styles.cellName}>
                  <div className={styles.rowNameWrap}>
                    <div className={styles.nameContent}>
                      <span className={styles.activityName}>{activity.name}</span>
                      <span className={styles.activityCategory}>
                        {activity.type === "donation" ? "Inbound Fund" : activity.type === "loan" ? "Disbursement" : "Administrative"}
                      </span>
                    </div>
                  </div>
                </td>

                <td role="cell" className={styles.cellPurpose}>
                  <span className={styles.purposeText}>{activity.purpose}</span>
                </td>

                <td role="cell" className={styles.cellAmount}>
                  <span className={styles.amountWrapper}>
                    <span className={`${styles.amountValue} ${activity.type === 'donation' ? styles.positiveAmount : styles.negativeAmount}`}>
                      {activity.type === 'donation' ? '+' : '-'} {formatCurrency(activity.amount)}
                    </span>
                  </span>
                </td>

                <td role="cell" className={styles.cellStatus}>
                  {(activity as any).__optimistic ? (
                    <span className={styles.statusBadgePending}>
                      Pending
                    </span>
                  ) : (
                    <span className={styles.statusBadgeSuccess}>
                      Completed
                    </span>
                  )}
                </td>

                <td role="cell" className={styles.cellTime}>
                  <span className={styles.timeWrapper}>{formatDate(activity.date)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > visibleCount && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <button className={styles.loadMoreButton} onClick={() => setVisibleCount((v) => v + 6)}>
            Show more ({Math.min(filtered.length - visibleCount, 12)})
          </button>
        </div>
      )}
    </div>
  );
}