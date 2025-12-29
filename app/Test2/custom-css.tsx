// app/dashboard/page.jsx
"use client";  // ← Required for useRouter

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  
  return (
    <div>
      <button onClick={() => router.push("/spent")}>
        Go to Profile
      </button>
      <button onClick={() => router.replace("/Doner")}>
        Replace with Settings
      </button>
      <button onClick={() => router.back()}>
        Go Back
      </button>
    </div>
  );
}