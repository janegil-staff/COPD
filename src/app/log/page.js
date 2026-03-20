"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
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

const CAT_KEYS = [
  "cat8Cough",
  "cat8Phlegm",
  "cat8ChestTightness",
  "cat8Breathlessness",
  "cat8Activities",
  "cat8Confidence",
  "cat8Sleep",
  "cat8Energy",
];

const CAT_COLOR = (score) => {
  if (score == null)
    return { text: "#7a9a98", bg: "#f0f7f6", border: "#c8e0de" };
  if (score <= 10) return { text: "#0f8a6a", bg: "#edfaf6", border: "#a8e6d4" };
  if (score <= 20) return { text: "#a16200", bg: "#fefbe8", border: "#f6df85" };
  if (score <= 30) return { text: "#c05400", bg: "#fff4ed", border: "#fdc99a" };
  return { text: "#b91c1c", bg: "#fff0f0", border: "#fca5a5" };
};

const BAR_COLOR = (v) =>
  v <= 1 ? "#0f8a6a" : v <= 2 ? "#a16200" : v <= 3 ? "#c05400" : "#b91c1c";

function ScoreBar({ value, max = 5 }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(38,142,134,0.12)", minWidth: 48 }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${(value / max) * 100}%`,
            background: BAR_COLOR(value),
          }}
        />
      </div>
      <span
        className="text-xs font-semibold w-3 text-right tabular-nums"
        style={{ color: BAR_COLOR(value) }}
      >
        {value}
      </span>
    </div>
  );
}

function RecordRow({
  record,
  medicines,
  userMedicines,
  t,
  expanded,
  onToggle,
}) {
  const c = CAT_COLOR(record.cat8);

  const usedMeds = (record.medicines ?? []).map((id, i) => {
    const base = medicines?.find((m) => m.id === id);
    const user = userMedicines?.find((um) => um.medicineId === id);
    return {
      id,
      name: base?.name ?? user?.medicine?.name ?? `${t.medication} ${id}`,
      image: user?.medicine?.image,
      times: record.medicinesUsedTimes?.[i] ?? null,
    };
  });

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${expanded ? "rgba(38,142,134,0.3)" : "rgba(38,142,134,0.14)"}`,
        boxShadow: expanded
          ? "0 4px 24px rgba(38,142,134,0.1)"
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Row header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all hover:bg-black/[0.02]"
      >
        {/* Date */}
        <div className="flex-shrink-0 w-28">
          <p
            className="text-sm font-bold"
            style={{
              color: "#1a3a38",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {record.date}
          </p>
        </div>

        {/* CAT badge */}
        <div
          className="flex-shrink-0 px-3 py-1 rounded-full text-sm font-black"
          style={{
            background: c.bg,
            color: c.text,
            border: `1px solid ${c.border}`,
          }}
        >
          {record.cat8}
        </div>

        {/* Mini bar strip */}
        <div
          className="flex-1 hidden sm:flex gap-1 items-end"
          style={{ height: 20 }}
        >
          {CAT_KEYS.map((k) => {
            const v = record[k] ?? 0;
            return (
              <div
                key={k}
                className="flex-1 rounded-sm"
                style={{
                  height: `${(v / 5) * 100}%`,
                  background: BAR_COLOR(v),
                  opacity: 0.7,
                  minHeight: 2,
                }}
              />
            );
          })}
        </div>

        {/* Indicators */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {(record.moderateExacerbations || record.seriousExacerbations) && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: "#fff0f0",
                color: "#b91c1c",
                border: "1px solid #fca5a5",
              }}
            >
              ⚠
            </span>
          )}
          {record.note?.trim() && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "#f5f3ff",
                color: "#7c3aed",
                border: "1px solid #c4b5fd",
              }}
            >
              📝
            </span>
          )}
          {usedMeds.length > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "#f0f9ff",
                color: "#0369a1",
                border: "1px solid #bae6fd",
              }}
            >
              💊 {usedMeds.length}
            </span>
          )}
          {record.weight != null && (
            <span
              className="text-xs hidden md:inline"
              style={{ color: "#a0b8b6" }}
            >
              ⚖ {record.weight} kg
            </span>
          )}
          {record.physicalActivity > 0 && (
            <span
              className="text-xs hidden md:inline"
              style={{ color: "#a0b8b6" }}
            >
              🚶 {record.physicalActivity} min
            </span>
          )}
        </div>

        {/* Chevron */}
        <div
          className="flex-shrink-0 ml-2 transition-transform"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            color: "#a0b8b6",
          }}
        >
          ▾
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="px-5 pb-5 grid gap-5"
          style={{
            borderTop: "1px solid rgba(38,142,134,0.1)",
            paddingTop: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {/* CAT sub-scores */}
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "#7a9a98" }}
            >
              {t.catSubScores}
            </p>
            <div className="space-y-2">
              {CAT_KEYS.map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <span
                    className="text-xs shrink-0"
                    style={{ color: "#7a9a98", width: 120 }}
                  >
                    {t[k]}
                  </span>
                  <ScoreBar value={record[k] ?? 0} />
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-between mt-3 pt-2"
              style={{ borderTop: "1px solid rgba(38,142,134,0.1)" }}
            >
              <span
                className="text-xs font-semibold"
                style={{ color: "#7a9a98" }}
              >
                Total
              </span>
              <span className="text-sm font-black" style={{ color: c.text }}>
                {record.cat8} / 40
              </span>
            </div>
          </div>

          {/* Medicines + stats + note */}
          <div className="space-y-4">
            {/* Exacerbation */}
            {(record.moderateExacerbations || record.seriousExacerbations) && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "#fff0f0", border: "1px solid #fca5a5" }}
              >
                <span>⚠️</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#b91c1c" }}
                >
                  {record.seriousExacerbations
                    ? t.seriousExacerbation
                    : t.moderateExacerbation}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-2">
              {record.weight != null && (
                <div
                  className="flex-1 px-3 py-2 rounded-xl text-center"
                  style={{
                    background: "rgba(38,142,134,0.06)",
                    border: "1px solid rgba(38,142,134,0.15)",
                  }}
                >
                  <p className="text-xs" style={{ color: "#7a9a98" }}>
                    {t.weight}
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#268E86" }}>
                    {record.weight} kg
                  </p>
                </div>
              )}
              {record.physicalActivity != null && (
                <div
                  className="flex-1 px-3 py-2 rounded-xl text-center"
                  style={{
                    background: "rgba(38,142,134,0.06)",
                    border: "1px solid rgba(38,142,134,0.15)",
                  }}
                >
                  <p className="text-xs" style={{ color: "#7a9a98" }}>
                    {t.physicalActivity}
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#268E86" }}>
                    {record.physicalActivity} min
                  </p>
                </div>
              )}
            </div>

            {/* Medicines */}
            {usedMeds.length > 0 && (
              <div>
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-2"
                  style={{ color: "#7a9a98" }}
                >
                  {t.usedMedicines}
                </p>
                <div className="space-y-1.5">
                  {usedMeds.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{
                        background: "#f0f9ff",
                        border: "1px solid #bae6fd",
                      }}
                    >
                      {m.image && (
                        <img
                          src={m.image}
                          alt={m.name}
                          className="w-7 h-7 object-contain rounded-lg"
                          style={{
                            background: "rgba(38,142,134,0.07)",
                            padding: 2,
                          }}
                        />
                      )}
                      <span
                        className="text-xs font-semibold flex-1"
                        style={{ color: "#1a3a38" }}
                      >
                        {m.name}
                      </span>
                      {m.times != null && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "#e0f2fe", color: "#0369a1" }}
                        >
                          {m.times}
                          {t.timesUsed}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note */}
            {record.note?.trim() && (
              <div>
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-2"
                  style={{ color: "#7a9a98" }}
                >
                  {t.note}
                </p>
                <div
                  className="px-3 py-2.5 rounded-xl"
                  style={{ background: "#f5f3ff", border: "1px solid #c4b5fd" }}
                >
                  <p className="text-sm" style={{ color: "#6d28d9" }}>
                    {record.note}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LogPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;

  const [patient, setPatient] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("patientData");
    if (!raw) {
      router.replace("/");
      return;
    }
    setPatient(JSON.parse(raw));
  }, []);

  if (!patient) return null;

  const records = [...(patient.records ?? [])].reverse();

  const filtered = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.date.includes(q) ||
      r.note?.toLowerCase().includes(q) ||
      (r.medicines ?? []).some((id) => {
        const m = patient.medicines?.find((x) => x.id === id);
        return m?.name?.toLowerCase().includes(q);
      })
    );
  });

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
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(38,142,134,0.15)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
            style={{
              background: "rgba(38,142,134,0.1)",
              color: "#268E86",
              border: "1px solid rgba(38,142,134,0.25)",
            }}
          >
            {t.back}
          </button>
          <h1
            className="text-lg font-bold"
            style={{
              color: "#1a3a38",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {t.symptomLog}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(38,142,134,0.08)",
              color: "#268E86",
              border: "1px solid rgba(38,142,134,0.2)",
            }}
          >
            {filtered.length} {t.entries}
          </span>
        </div>
      </header>

      {/* Search */}
      <div className="px-6 pt-6 pb-2 max-w-3xl mx-auto w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`🔍  ${t.placeholder}…`}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(38,142,134,0.2)",
            color: "#1a3a38",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#268E86";
            e.target.style.boxShadow = "0 0 0 3px rgba(38,142,134,0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(38,142,134,0.2)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Records */}
      <main className="flex-1 px-6 py-4 max-w-3xl mx-auto w-full space-y-3 pb-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "#a0b8b6" }}>
              {t.noEntries}
            </p>
          </div>
        ) : (
          filtered.map((record) => (
            <RecordRow
              key={record.date}
              record={record}
              medicines={patient.medicines}
              userMedicines={patient.userMedicines}
              t={t}
              expanded={expandedDate === record.date}
              onToggle={() =>
                setExpandedDate(
                  expandedDate === record.date ? null : record.date,
                )
              }
            />
          ))
        )}
      </main>
    </div>
  );
}
