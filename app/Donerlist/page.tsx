import ViewDoner from "./view_doner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "View Donors | Welfare Foundation",
  description: "Search and view donor records and transaction history",
};

export default function ViewDonersPage() {
  return <ViewDoner />;
}