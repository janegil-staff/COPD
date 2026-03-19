// src/app/dashboard/page.jsx
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  return (
    <div
      className="min-h-screen p-8"
      style={{
        background:
          "linear-gradient(155deg, #ffffff 0%, #eaf7f6 50%, #cde9e6 100%)",
      }}
    >
      <Dashboard />
    </div>
  );
}