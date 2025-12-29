import styles from "../dashboard.module.css";

interface RowProps {
  type: string;
  description: string;
  amount: string;
  date: string;
}

export default function ActivityRow({ type, description, amount, date }: RowProps) {
  return (
    <tr>
      <td>{type}</td>
      <td>{description}</td>
      <td>{amount}</td>
      <td>{date}</td>
      <td className={styles.actions}>
        <a href="#">View</a>
      </td>
    </tr>
  );
}
