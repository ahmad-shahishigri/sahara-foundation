import LoanForm from "./loan-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan & Expense Records | Welfare Foundation",
  description: "Track and manage all loan and expense records with complete history",
};

export default function LoanRecordsPage() {
  return <LoanForm />;
}