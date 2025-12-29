// import styles from "../dashboard.module.css";

// interface StatCardProps {
//   title: string;
//   amount: string;
// }

// export default function StatCard({ title, amount }: StatCardProps) {
//   return (
//     <div className={styles.statCard}>
//       <p className={styles.statTitle}>{title}</p>
//       <h3 className={styles.statAmount}>{amount}</h3>
//     </div>
//   );
// }

"use client";

import styles from "../dashboard.module.css";

type StatCardProps = {
  title: string;
  amount: string;
  icon: string;
  trend: "positive" | "negative" | "neutral" | "warning" | "expense";
  description: string;
  variant?: "primary" | "secondary";
};

export default function StatCard({ 
  title, 
  amount, 
  icon, 
  trend, 
  description, 
  variant = "primary" 
}: StatCardProps) {
  
  const getTrendColor = () => {
    switch(trend) {
      case "positive": return "#10b981";
      case "negative": return "#ef4444";
      case "warning": return "#f59e0b";
      case "expense": return "#8b5cf6";
      default: return "#6b7280";
    }
  };

  const getTrendIcon = () => {
    switch(trend) {
      case "positive": return "↗️";
      case "negative": return "↘️";
      case "warning": return "⚠️";
      case "expense": return "💸";
      default: return "➡️";
    }
  };

  return (
    <div className={`${styles.statCard} ${styles[variant]}`}>
      <div className={styles.statHeader}>
        <div className={styles.statIcon} style={{ background: getTrendColor() + "20" }}>
          <span style={{ color: getTrendColor(), fontSize: "1.5rem" }}>{icon}</span>
        </div>
        <div className={styles.trendIndicator}>
          <span className={styles.trendIcon}>{getTrendIcon()}</span>
        </div>
      </div>
      
      <div className={styles.statContent}>
        <h3 className={styles.statTitle}>{title}</h3>
        <div className={styles.statAmount}>{amount}</div>
        <p className={styles.statDescription}>{description}</p>
      </div>
      
      <div className={styles.statFooter}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ 
              width: trend === "positive" ? "75%" : 
                     trend === "negative" ? "30%" :
                     trend === "warning" ? "50%" : "60%",
              background: getTrendColor()
            }}
          />
        </div>
      </div>
    </div>
  );
}