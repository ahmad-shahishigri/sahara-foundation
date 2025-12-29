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

  const combinedActivities = [
    ...recentDonors.map(donor => ({
      type: "donation" as const,
      name: donor.name,
      amount: donor.total_amount,
      date: donor.created_at,
      icon: "💰",
      color: "#10b981"
    })),
    ...recentTransactions.map(transaction => ({
      type: transaction.type,
      name: transaction.recipient_name || transaction.borrower_name,
      amount: transaction.total_amount,
      date: transaction.created_at,
      icon: transaction.type === "loan" ? "📝" : "💸",
      color: transaction.type === "loan" ? "#3b82f6" : "#8b5cf6"
    }))
  ]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 6);

  return (
    <div className={styles.recentActivityList}>
      {combinedActivities.length > 0 ? (
        combinedActivities.map((activity, index) => (
          <div key={index} className={styles.activityItem}>
            <div 
              className={styles.activityIcon}
              style={{ background: activity.color + "20", color: activity.color }}
            >
              {activity.icon}
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityHeader}>
                <span className={styles.activityName}>{activity.name}</span>
                <span className={styles.activityAmount}>{formatCurrency(activity.amount)}</span>
              </div>
              <div className={styles.activityFooter}>
                <span className={styles.activityType}>
                  {activity.type === "donation" ? "Donation" : 
                   activity.type === "loan" ? "Loan Disbursed" : "Expense"}
                </span>
                <span className={styles.activityTime}>{formatDate(activity.date)}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className={styles.noActivity}>
          <div className={styles.noActivityIcon}>📭</div>
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );
}