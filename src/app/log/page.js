"use client";
import { useEffect, useState, useRef, useCallback } from "react";
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
import PdfExportModal from "@/components/PdfExportModal";

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
  isFirst,
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

  const hasExacerbation =
    record.moderateExacerbations || record.seriousExacerbations;

  return (
    <div
      className="overflow-hidden transition-all"
      style={{
        background: expanded
          ? "rgba(255,255,255,0.95)"
          : "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        borderTop: isFirst ? "none" : "1px solid #c8c8c8",
        boxShadow: expanded ? "0 2px 12px rgba(38,142,134,0.06)" : "none",
      }}
    >
      {/* ── Compact row — matches dashboard style ── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-all hover:bg-black/[0.015]"
      >
        {/* Left: week + week range + dots */}
        <div className="flex items-center gap-2.5 min-w-0">
          {(() => {
            const rd = new Date(
              record.date.slice(0, 4),
              record.date.slice(5, 7) - 1,
              record.date.slice(8, 10),
            );
            const dow = (rd.getDay() + 6) % 7;
            const mon = new Date(
              rd.getFullYear(),
              rd.getMonth(),
              rd.getDate() - dow,
            );
            const sun = new Date(
              rd.getFullYear(),
              rd.getMonth(),
              rd.getDate() - dow + 6,
            );
            const fmt = (d) =>
              `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
            const thu = new Date(rd);
            thu.setDate(rd.getDate() - dow + 3);
            const jan4 = new Date(thu.getFullYear(), 0, 4);
            const wn = 1 + Math.round((thu - jan4) / 604800000);
            return (
              <>
                <span
                  className="font-bold tabular-nums shrink-0"
                  style={{ color: "#b8cccb", fontSize: 10, minWidth: 22 }}
                >
                  {t.week ?? "W"}
                  {wn}
                </span>
                <span
                  className="text-sm font-semibold shrink-0"
                  style={{ color: "#4a7a78" }}
                >
                  {fmt(mon)} – {fmt(sun)}
                </span>
              </>
            );
          })()}
          {/* Indicator dots */}
          <div className="flex gap-1 items-center">
            {hasExacerbation && (
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#ef4444" }}
              />
            )}
            {record.note?.trim() && (
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#8b5cf6" }}
              />
            )}
            {usedMeds.length > 0 && (
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#0ea5e9" }}
              />
            )}
          </div>
        </div>

        {/* Right: stats + CAT badge + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          {record.weight != null && (
            <span
              className="text-xs hidden sm:inline"
              style={{ color: "#a0b8b6" }}
            >
              ⚖ {record.weight} kg
            </span>
          )}
          {record.physicalActivity > 0 && (
            <span
              className="text-xs hidden sm:inline"
              style={{ color: "#a0b8b6" }}
            >
              🚶{" "}
              {t.activityLabels?.[record.physicalActivity] ??
                record.physicalActivity}
            </span>
          )}
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{
              background: c.bg,
              color: c.text,
              border: `1px solid ${c.border}`,
            }}
          >
            {t.catScore} {record.cat8}
          </span>
          <span
            className="transition-transform text-xs"
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              color: "#a0b8b6",
              display: "inline-block",
            }}
          >
            ▾
          </span>
        </div>
      </button>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div
          className="px-4 pb-4 space-y-4"
          style={{
            borderTop: "1px solid rgba(38,142,134,0.1)",
            paddingTop: 14,
          }}
        >
          {/* CAT sub-scores */}
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2.5"
              style={{ color: "#a0b8b6" }}
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
              className="flex items-center justify-between mt-2 pt-2"
              style={{ borderTop: "1px solid rgba(38,142,134,0.08)" }}
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

          {/* Stats row */}
          {(record.weight != null || record.physicalActivity > 0) && (
            <div className="flex gap-2">
              {record.weight != null && (
                <div
                  className="flex-1 px-3 py-2 rounded-xl text-center"
                  style={{
                    background: "rgba(38,142,134,0.05)",
                    border: "1px solid rgba(38,142,134,0.12)",
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
              {record.physicalActivity > 0 && (
                <div
                  className="flex-1 px-3 py-2 rounded-xl text-center"
                  style={{
                    background: "rgba(38,142,134,0.05)",
                    border: "1px solid rgba(38,142,134,0.12)",
                  }}
                >
                  <p className="text-xs" style={{ color: "#7a9a98" }}>
                    {t.physicalActivity}
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#268E86" }}>
                    {t.activityLabels?.[record.physicalActivity] ??
                      record.physicalActivity}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Exacerbation */}
          {hasExacerbation && (
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

          {/* Medicines */}
          {usedMeds.length > 0 && (
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: "#a0b8b6" }}
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
          {(record.note?.trim() ||
            record.notes?.trim() ||
            record.noteText?.trim() ||
            record.comment?.trim()) && (
            <div
              className="px-3 py-2.5 rounded-xl"
              style={{ background: "#f5f3ff", border: "1px solid #c4b5fd" }}
            >
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "#8b5cf6" }}
              >
                {t.note}
              </p>
              <p className="text-sm" style={{ color: "#6d28d9" }}>
                {record.note?.trim() ||
                  record.notes?.trim() ||
                  record.noteText?.trim() ||
                  record.comment?.trim()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LogPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;

  const PAGE_SIZE = 20;

  const [patient, setPatient] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("patientData");
    if (!raw) {
      router.replace("/");
      return;
    }
    setPatient(JSON.parse(raw));
  }, []);

  // Reset visible count whenever search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  // IntersectionObserver — load next batch when sentinel scrolls into view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_SIZE);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [patient]); // re-attach after patient loads

  if (!patient) return null;

  const records = [...(patient.records ?? [])].reverse();

  const filtered = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase().trim();

    // ISO week number
    const d = new Date(
      r.date.slice(0, 4),
      r.date.slice(5, 7) - 1,
      r.date.slice(8, 10),
    );
    const dow = (d.getDay() + 6) % 7;
    const thu = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + 3);
    const jan4 = new Date(thu.getFullYear(), 0, 4);
    const wn = 1 + Math.round((thu - jan4) / 604800000);
    const weekStr = `${t.week ?? "w"}${wn}`.toLowerCase();

    // CAT score
    const catStr = String(r.cat8 ?? "");

    return (
      weekStr.includes(q) ||
      String(wn) === q ||
      catStr === q ||
      r.note?.toLowerCase().includes(q) ||
      (r.notes?.toLowerCase() ?? "").includes(q) ||
      (r.medicines ?? []).some((id) => {
        const m = patient.medicines?.find((x) => x.id === id);
        return m?.name?.toLowerCase().includes(q);
      })
    );
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

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
            className="hidden md:inline text-xs px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(38,142,134,0.08)",
              color: "#268E86",
              border: "1px solid rgba(38,142,134,0.2)",
            }}
          >
            {filtered.length} {t.entries}
          </span>
          <button
            onClick={() => setPdfModalOpen(true)}
            disabled={filtered.length === 0}
            className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-1.5"
            style={{
              background: "#268E86",
              color: "#fff",
              border: "1px solid rgba(38,142,134,0.4)",
            }}
          >
            ⬇ PDF
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="px-6 pt-6 pb-2 max-w-3xl mx-auto w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`🔍  ${t.searchPlaceholder ?? t.placeholder}`}
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

      <div className="flex flex-wrap gap-4 mt-3 justify-center">
        {[
          ["#ef4444", t.exacerbation],
          ["#8b5cf6", t.notes],
          ["#0ea5e9", t.medication],
        ]
          .filter(Boolean)
          .map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
              />
              <span className="text-xs" style={{ color: "#7a9a98" }}>
                {label}
              </span>
            </div>
          ))}
      </div>
      {/* Records */}
      <main className="flex-1 px-6 py-4 max-w-3xl mx-auto w-full pb-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "#a0b8b6" }}>
              {t.noEntries}
            </p>
          </div>
        ) : (
          <>
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(38,142,134,0.14)",
                boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
              }}
            >
              {visible.map((record, idx) => {
                // Use ISO week year (year that owns the week) for grouping
                const isoWeekYear = (dateStr) => {
                  const d = new Date(
                    dateStr.slice(0, 4),
                    dateStr.slice(5, 7) - 1,
                    dateStr.slice(8, 10),
                  );
                  const dow = (d.getDay() + 6) % 7;
                  const thu = new Date(
                    d.getFullYear(),
                    d.getMonth(),
                    d.getDate() - dow + 3,
                  );
                  return String(thu.getFullYear());
                };
                const year = isoWeekYear(record.date);
                const prevYear =
                  idx > 0 ? isoWeekYear(visible[idx - 1].date) : null;
                const showYear = year !== prevYear;
                return (
                  <div key={record.date}>
                    {showYear && (
                      <div
                        className="flex items-center gap-2 px-4"
                        style={{
                          paddingTop: idx > 0 ? 10 : 6,
                          paddingBottom: 6,
                          borderTop: idx > 0 ? "1px solid #c8c8c8" : "none",
                        }}
                      >
                        <span
                          className="text-xs font-bold tracking-widest uppercase"
                          style={{ color: "#268E86" }}
                        >
                          {year}
                        </span>
                        <div
                          className="flex-1 h-px"
                          style={{ background: "rgba(38,142,134,0.2)" }}
                        />
                      </div>
                    )}
                    <RecordRow
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
                      isFirst={idx === 0 || showYear}
                    />
                  </div>
                );
              })}
            </div>

            {/* Sentinel — watched by IntersectionObserver */}
            <div ref={sentinelRef} className="py-2 text-center">
              {hasMore ? (
                <p className="text-xs" style={{ color: "#a0b8b6" }}>
                  {visible.length} / {filtered.length} {t.entries}
                </p>
              ) : filtered.length > PAGE_SIZE ? (
                <p className="text-xs" style={{ color: "#c8dedd" }}>
                  ✓ {filtered.length} {t.entries}
                </p>
              ) : null}
            </div>
          </>
        )}
      </main>

      <PdfExportModal
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        patient={patient}
        t={t}
      />
    </div>
  );
}
