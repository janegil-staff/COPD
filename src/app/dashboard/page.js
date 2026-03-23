"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import CalendarPanel from "@/components/dashboard/CalendarPanel";
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

  const [patient, setPatient]           = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [show, setShow] = useState({
    catScore:     true,
    exacerbation: true,
    medicine:     true,
    note:         true,
    activity:     true,
    weight:       true,
  });
  const toggleShow = (key) => setShow(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const raw = sessionStorage.getItem("patientData");
    if (!raw) { router.replace("/"); return; }
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
        className="flex items-center justify-between px-8 py-4 relative z-[100]"
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
        {/* Desktop nav — hidden on small screens */}
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={() => router.push("/summary")} className="text-xs px-4 py-1.5 rounded-full font-semibold transition-all hover:opacity-80" style={{ background: "rgba(38,142,134,0.08)", color: "#268E86", border: "1px solid rgba(38,142,134,0.2)" }}>
            {t.summaryTab}
          </button>
          <button onClick={() => router.push("/log")} className="text-xs px-4 py-1.5 rounded-full font-semibold transition-all hover:opacity-80" style={{ background: "rgba(38,142,134,0.08)", color: "#268E86", border: "1px solid rgba(38,142,134,0.2)" }}>
            {t.logTab}
          </button>
          <button onClick={() => { sessionStorage.removeItem("patientData"); localStorage.removeItem("sessionStartAt"); router.replace("/"); }} className="text-xs px-4 py-1.5 rounded-full font-semibold transition-all hover:opacity-80" style={{ background: "rgba(38,142,134,0.12)", color: "#268E86", border: "1px solid rgba(38,142,134,0.3)" }}>
            {t.logout}
          </button>
        </div>

        {/* Mobile nav — hamburger dropdown */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-full transition-all"
            style={{ background: menuOpen ? "rgba(38,142,134,0.15)" : "rgba(38,142,134,0.08)", border: "1px solid rgba(38,142,134,0.25)" }}
          >
            <span className="block w-4 h-0.5 rounded-full transition-all" style={{ background: "#268E86", transform: menuOpen ? "translateY(4px) rotate(45deg)" : "none" }} />
            <span className="block w-4 h-0.5 rounded-full transition-all" style={{ background: "#268E86", opacity: menuOpen ? 0 : 1 }} />
            <span className="block w-4 h-0.5 rounded-full transition-all" style={{ background: "#268E86", transform: menuOpen ? "translateY(-8px) rotate(-45deg)" : "none" }} />
          </button>

          {menuOpen && (
            <>
              {/* Backdrop to close on outside click */}
              <div className="fixed inset-0 z-[199]" onClick={() => setMenuOpen(false)} />
              {/* Dropdown */}
              <div
                className="absolute right-0 top-11 z-[200] rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(38,142,134,0.2)",
                  boxShadow: "0 8px 32px rgba(38,142,134,0.15)",
                  minWidth: 160,
                }}
              >
                {[
                  { label: t.summaryTab, action: () => { setMenuOpen(false); router.push("/summary"); } },
                  { label: t.logTab,     action: () => { setMenuOpen(false); router.push("/log"); } },
                  { label: t.logout,     action: () => { setMenuOpen(false); sessionStorage.removeItem("patientData"); localStorage.removeItem("sessionStartAt"); router.replace("/"); }, danger: true },
                ].map(({ label, action, danger }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="text-left px-5 py-3 text-sm font-semibold transition-all hover:bg-black/5"
                    style={{ color: danger ? "#b91c1c" : "#268E86", borderBottom: "1px solid rgba(38,142,134,0.08)" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 gap-6">
        <div
          className="rounded-2xl shadow-xl w-full"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(38,142,134,0.18)",
            maxWidth: 480,
            padding: "20px 18px",
          }}
        >
          <h1
            className="text-center text-xl font-bold mb-4"
            style={{ color: "#268E86", fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t.title}
          </h1>
          <CalendarPanel
            t={t}
            records={patient.records}
            medicines={patient.medicines}
            onDayClick={handleDayClick}
            selectedDate={selectedRecord?.date}
            show={show}
            onToggleShow={toggleShow}
          />
        </div>
      </main>

      <DayDetailDrawer
        t={t}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
        medicines={patient.medicines}
        userMedicines={patient.userMedicines}
        show={show}
      />
    </div>
  );
}