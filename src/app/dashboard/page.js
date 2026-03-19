"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import Dashboard from "@/components/dashboard/Dashboard";
import no from "../messages/no.json";
import en from "../messages/en.json";
import nl from "../messages/nl.json";
import fr from "../messages/fr.json";
import de from "../messages/de.json";
import it from "../messages/it.json";
import sv from "../messages/sv.json";
import da from "../messages/da.json";
import fi from "../messages/fi.json";
import es from "../messages/es.json";
import pl from "../messages/pl.json";
import pt from "../messages/pt.json";

const translations = { no, en, nl, fr, de, it, sv, da, fi, es, pl, pt };

export default function DashboardPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Back button */}
        <div className="mb-2">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            {t.back}
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "#268E86", fontFamily: "Georgia, serif" }}
          >
            {t.dashboardTitle}
          </h1>
          <p className="text-sm text-gray-400 tracking-wide">
            {t.dashboardSubtitle}
          </p>
        </div>

        {/* Dashboard — uses src/components/Dashboard.jsx which composes CalendarView, SummaryView, LogView */}
        <Dashboard t={t} lang={lang} />

        {/* Exit button */}
        <div className="flex justify-center mt-10 mb-4">
          <button
            onClick={() => router.push("/")}
            className="px-10 py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(38,142,134,0.2)",
              color: "#268E86",
              backdropFilter: "blur(10px)",
            }}
          >
            {t.avslutt}
          </button>
        </div>
      </div>
    </div>
  );
}
