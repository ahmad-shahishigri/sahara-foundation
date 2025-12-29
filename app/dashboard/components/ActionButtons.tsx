// // "use client";

// // import { useRouter } from "next/navigation";
// // import styles from "../dashboard.module.css";

// // export default function ActionButtons() {
// //   const router = useRouter();

// //   const handleAddDonor = () => {
// //     // Direct import and show modal instead of routing
// //     console.log("Add donor clicked");
// //     // You could also use a modal here
// //   };

// //   const handleAddSpend = () => {
// //     console.log("Add spend clicked");
// //   };

// //   return (
// //     <div className={styles.buttonsRow}>
// //       <button onClick={() => router.push("/Doner")}>
// //         + Add Donor
// //       </button>
      
// //       <button onClick={() => router.push("/spent")}>
// //         + Add Spend
// //       </button>
      
// //       <button onClick={() => router.push("/")}>
// //         + Add Loan
// //       </button>
      
// //       <button onClick={() => router.push("/Donerlist")}>
// //         View Donors
// //       </button>
      
// //       <button onClick={() => router.push("/loanrecord")}>
// //         View Loan +Expense Records
// //       </button>
// //     </div>
// //   );
// // }

// "use client";

// import { useRouter } from "next/navigation";
// import styles from "../dashboard.module.css";

// export default function ActionButtons() {
//   const router = useRouter();

//   const actions = [
//     {
//       icon: "👤",
//       label: "Add Donor",
//       description: "Register new contributor",
//       route: "/Doner",
//       color: "#3b82f6",
//     },
//     {
//       icon: "💸",
//       label: "Add Expense",
//       description: "Record foundation spending",
//       route: "/spent",
//       color: "#8b5cf6",
//     },
//     {
//       icon: "📝",
//       label: "Add Loan",
//       description: "Disburse new loan",
//       route: "/spent?type=loan",
//       color: "#10b981",
//     },
//     {
//       icon: "📊",
//       label: "View Donors",
//       description: "See all contributors",
//       route: "/viewdoners",
//       color: "#f59e0b",
//     },
//     {
//       icon: "💰",
//       label: "Loan Records",
//       description: "Track loans & expenses",
//       route: "/loanrecord",
//       color: "#ef4444",
//     },
//     {
//       icon: "📈",
//       label: "Reports",
//       description: "Generate analytics",
//       route: "/reports",
//       color: "#06b6d4",
//     }
//   ];

//   return (
//     <div className={styles.actionsSection}>
//       <h3 className={styles.sectionTitle}>🚀 Quick Actions</h3>
//       <div className={styles.actionsGrid}>
//         {actions.map((action, index) => (
//           <button
//             key={index}
//             className={styles.actionButton}
//             onClick={() => router.push(action.route)}
//             style={{ 
//               borderLeft: `4px solid ${action.color}`,
//               background: `linear-gradient(135deg, ${action.color}15, transparent)`
//             }}
//           >
//             <div className={styles.actionIcon} style={{ color: action.color }}>
//               {action.icon}
//             </div>
//             <div className={styles.actionContent}>
//               <div className={styles.actionLabel}>{action.label}</div>
//               <div className={styles.actionDescription}>{action.description}</div>
//             </div>
//             <div className={styles.actionArrow}>→</div>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }
// components/ActionButtons.tsx
// app/dashboard/components/ActionButtons.tsx
// app/dashboard/components/ActionButtons.tsx
"use client";

interface ActionButtonsProps {
  onAddDonor: () => void;
  onAddExpense: () => void;
  onAddLoan: () => void;
  onViewDonors: () => void;
  onViewLoanRecords: () => void;
}

export default function ActionButtons({ 
  onAddDonor, 
  onAddExpense, 
  onAddLoan, 
  onViewDonors, 
  onViewLoanRecords 
}: ActionButtonsProps) {
  // Common styles for all buttons
  const actionCardStyle = {
    background: "white",
    borderRadius: "10px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    textAlign: "center" as const,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e9ecef",
    transition: "all 0.2s ease",
    cursor: "pointer",
    width: "100%",
  };

  const actionIconStyle = (color1: string, color2: string) => ({
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
    fontSize: "1.5rem",
    color: "white",
    background: `linear-gradient(135deg, ${color1}, ${color2})`,
  });

  const styles = {
    actionsContainer: {
      margin: "2rem 0",
      padding: "1.5rem",
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      border: "1px solid #e9ecef",
    },
    sectionTitle: {
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "#2d3748",
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    actionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "1.25rem",
    },
    actionTitle: {
      fontSize: "1.1rem",
      fontWeight: "600",
      color: "#2d3748",
      marginBottom: "0.5rem",
    },
    actionDesc: {
      fontSize: "0.875rem",
      color: "#718096",
      lineHeight: "1.4",
    },
  };

  // Hover handler for all cards
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, color: string) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
    e.currentTarget.style.borderColor = color;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
    e.currentTarget.style.borderColor = "#e9ecef";
  };

  return (
    <div style={styles.actionsContainer}>
      <h2 style={styles.sectionTitle}>
        <span>⚡</span>
        Quick Actions
      </h2>
      
      <div style={styles.actionsGrid}>
        {/* Add Donor */}
        <div 
          style={actionCardStyle}
          onClick={onAddDonor}
          onMouseEnter={(e) => handleMouseEnter(e, "#4c6ef5")}
          onMouseLeave={handleMouseLeave}
        >
          <div style={actionIconStyle("#4c6ef5", "#3b5bdb")}>
            <i className="fas fa-user-plus"></i>
          </div>
          <h3 style={styles.actionTitle}>Add Donor</h3>
          <p style={styles.actionDesc}>Register new contributors</p>
        </div>

        {/* Add Expense */}
        <div 
          style={actionCardStyle}
          onClick={onAddExpense}
          onMouseEnter={(e) => handleMouseEnter(e, "#20c997")}
          onMouseLeave={handleMouseLeave}
        >
          <div style={actionIconStyle("#20c997", "#12b886")}>
            <i className="fas fa-file-invoice-dollar"></i>
          </div>
          <h3 style={styles.actionTitle}>Add Expense</h3>
          <p style={styles.actionDesc}>Record foundation spending</p>
        </div>

        {/* Add Loan */}
        <div 
          style={actionCardStyle}
          onClick={onAddLoan}
          onMouseEnter={(e) => handleMouseEnter(e, "#ff922b")}
          onMouseLeave={handleMouseLeave}
        >
          <div style={actionIconStyle("#ff922b", "#fd7e14")}>
            <i className="fas fa-hand-holding-usd"></i>
          </div>
          <h3 style={styles.actionTitle}>Add Loan</h3>
          <p style={styles.actionDesc}>Disburse new loan</p>
        </div>

        {/* View Donors */}
        <div 
          style={actionCardStyle}
          onClick={onViewDonors}
          onMouseEnter={(e) => handleMouseEnter(e, "#9775fa")}
          onMouseLeave={handleMouseLeave}
        >
          <div style={actionIconStyle("#9775fa", "#845ef7")}>
            <i className="fas fa-users"></i>
          </div>
          <h3 style={styles.actionTitle}>View Donors</h3>
          <p style={styles.actionDesc}>See all contributors</p>
        </div>

        {/* Loan Records */}
        <div 
          style={actionCardStyle}
          onClick={onViewLoanRecords}
          onMouseEnter={(e) => handleMouseEnter(e, "#51cf66")}
          onMouseLeave={handleMouseLeave}
        >
          <div style={actionIconStyle("#51cf66", "#40c057")}>
            <i className="fas fa-file-alt"></i>
          </div>
          <h3 style={styles.actionTitle}>Loan Records</h3>
          <p style={styles.actionDesc}>Track loans & expenses</p>
        </div>
      </div>
    </div>
  );
}