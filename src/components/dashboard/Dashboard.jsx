// src/components/dashboard/Dashboard.jsx
"use client";
import { useState } from "react";
import DashboardTabs from "./DashboardTabs";
import CalendarView from "./CalendarView";
import SummaryView from "./SummaryView";
import LogView from "./LogView";

export default function Dashboard({ t, lang }) {
  const [view, setView] = useState("calendar");

  return (
    <div>
      <DashboardTabs view={view} setView={setView} t={t} />
      {view === "calendar" && <CalendarView t={t} lang={lang} />}
      {view === "summary" && <SummaryView t={t} lang={lang} />}
      {view === "log" && <LogView t={t} lang={lang} />}
    </div>
  );
}
