"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import CalendarPanel from "@/components/dashboard/CalendarPanel";
import Sidebar from "@/components/dashboard/Sidebar";
import DayDetailDrawer from "@/components/dashboard/DayDetailDrawer";
import no from "@/app/messages/no.json";
import en from "@/app/messages/en.json";
import nl from "@/app/messages/nl.json";
import fr from "@/app/messages/fr.json";
import de from "@/app/messages/de.json";
import it from "@/app/messages/it.json";
import sv from "@/app/messages/sv.json";
import da from "@/app/messages/da.json";
import fi from "@/app/messages/fi.json";
import es from "@/app/messages/es.json";
import pl from "@/app/messages/pl.json";
import pt from "@/app/messages/pt.json";

const translations = { no, en, nl, fr, de, it, sv, da, fi, es, pl, pt };

export default function Dashboard() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;

  const [patient, setPatient] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("patientData");
    if (!raw) {
      router.replace("/");
      return;
    }
    const data = JSON.parse(raw);
    setPatient(data);
    if (data.records?.length) {
      setSelectedRecord(data.records[data.records.length - 1]);
    }
  }, []);

  const handleDayClick = (record) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  if (!patient) return null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/background-copd.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-8 py-4"
        style={{
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(38,142,134,0.15)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "#268E86" }}
          >
            {patient.gender === "male" ? t.male?.[0] : t.female?.[0]}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#1a3a38" }}>
              {patient.age} · {patient.gender === "male" ? t.male : t.female}
            </p>
            <p className="text-xs" style={{ color: "#7a9a98" }}>
              {patient.records?.length ?? 0} {t.registrations}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem("patientData");
            router.replace("/");
          }}
          className="text-xs px-4 py-1.5 rounded-full font-semibold transition-all hover:opacity-80"
          style={{
            background: "rgba(38,142,134,0.12)",
            color: "#268E86",
            border: "1px solid rgba(38,142,134,0.3)",
          }}
        >
          {t.logout}
        </button>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 gap-6">
        {/* Calendar card */}
        <div
          className="rounded-2xl shadow-xl w-full"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(38,142,134,0.18)",
            maxWidth: 700,
            padding: "32px 28px",
          }}
        >
          <CalendarPanel
            t={t}
            records={patient.records}
            medicines={patient.medicines}
            onDayClick={handleDayClick}
            selectedDate={selectedRecord?.date}
          />
        </div>

        {/* Sidebar */}
        <div
          className="hidden lg:block rounded-2xl shadow-xl overflow-y-auto flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(38,142,134,0.18)",
            width: 290,
            maxHeight: "calc(100vh - 120px)",
            position: "sticky",
            top: 24,
          }}
        >
          <Sidebar t={t} patient={patient} selectedRecord={selectedRecord} />
        </div>
      </main>

      <DayDetailDrawer
        t={t}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
        medicines={patient.medicines}
        userMedicines={patient.userMedicines}
      />
    </div>
  );
}
