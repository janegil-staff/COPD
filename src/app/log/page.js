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

  const PAGE_SIZE = 20;

  const [patient, setPatient] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [pdfLoading, setPdfLoading] = useState(false);
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

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const CAT_LABELS = [
    t.cat8Cough,
    t.cat8Phlegm,
    t.cat8ChestTightness,
    t.cat8Breathlessness,
    t.cat8Activities,
    t.cat8Confidence,
    t.cat8Sleep,
    t.cat8Energy,
  ];
  const CAT_KEYS_PDF = [
    "cat8Cough",
    "cat8Phlegm",
    "cat8ChestTightness",
    "cat8Breathlessness",
    "cat8Activities",
    "cat8Confidence",
    "cat8Sleep",
    "cat8Energy",
  ];

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      if (typeof window === "undefined") return;
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // ── Design constants ───────────────────────────────────
      const W = 210;
      const ML = 16;
      const MR = 16;
      const CW = W - ML - MR;
      const ink = [20, 20, 20];
      const mid = [80, 80, 80];
      const light = [150, 150, 150];
      const rule = [200, 200, 200];
      const shade = [248, 248, 248];
      let y = 0;

      // ── Helpers ────────────────────────────────────────────
      const setFont = (size, style = "normal", color = ink) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(...color);
      };

      const hline = (yy, lw = 0.2, color = rule) => {
        doc.setLineWidth(lw);
        doc.setDrawColor(...color);
        doc.line(ML, yy, W - MR, yy);
      };

      const vline = (xx, y1, y2, lw = 0.2) => {
        doc.setLineWidth(lw);
        doc.setDrawColor(...rule);
        doc.line(xx, y1, xx, y2);
      };

      const box = (x, yy, w, h, fillColor, strokeColor, lw = 0.3) => {
        if (fillColor) {
          doc.setFillColor(...fillColor);
          doc.rect(x, yy, w, h, "F");
        }
        if (strokeColor) {
          doc.setLineWidth(lw);
          doc.setDrawColor(...strokeColor);
          doc.rect(x, yy, w, h, "S");
        }
      };

      const txt = (text, x, yy, opts = {}) => {
        const { align = "left", maxWidth } = opts;
        const s = String(text ?? "–");
        if (maxWidth) {
          const lines = doc.splitTextToSize(s, maxWidth);
          lines.forEach((ln, i) => doc.text(ln, x, yy + i * 4, { align }));
          return lines.length;
        }
        doc.text(s, x, yy, { align });
        return 1;
      };

      const addPage = () => {
        doc.addPage();
        drawFrame();
        y = 44;
      };
      const checkY = (need = 10) => {
        if (y + need > 270) addPage();
      };

      // ── Page frame ─────────────────────────────────────────
      const drawFrame = () => {
        // Outer border — two nested rectangles for a refined look
        doc.setLineWidth(0.6);
        doc.setDrawColor(...ink);
        doc.rect(10, 10, W - 20, 277, "S");
        doc.setLineWidth(0.15);
        doc.setDrawColor(...rule);
        doc.rect(12, 12, W - 24, 273, "S");

        // Footer rule
        doc.setLineWidth(0.2);
        doc.setDrawColor(...rule);
        doc.line(12, 275, W - 12, 275);
      };

      // ── Page 1 header ──────────────────────────────────────
      drawFrame();

      // Title — large, spaced caps
      setFont(20, "bold", ink);
      doc.text((t.reportTitle ?? t.symptomLog).toUpperCase(), ML, 30);

      // Subtitle rule
      doc.setLineWidth(0.4);
      doc.setDrawColor(...ink);
      doc.line(ML, 33, W - MR, 33);
      doc.setLineWidth(0.15);
      doc.setDrawColor(...rule);
      doc.line(ML, 34.2, W - MR, 34.2);

      // Meta block — right side
      setFont(7.5, "normal", mid);
      doc.text(t.reportDate ?? "Date", W - MR, 24, { align: "right" });
      setFont(8, "bold", ink);
      doc.text(new Date().toLocaleDateString(), W - MR, 29, { align: "right" });
      setFont(7.5, "normal", mid);
      doc.text(
        `${patient.age} · ${patient.gender === "male" ? t.male : t.female}`,
        W - MR,
        34,
        { align: "right" },
      );

      y = 42;

      // ── Summary stats — 4 columns ──────────────────────────
      const catVals = filtered.map((r) => r.cat8).filter((v) => v != null);
      const avgCat = catVals.length
        ? Math.round(catVals.reduce((a, b) => a + b, 0) / catVals.length)
        : null;
      const exCount = filtered.filter(
        (r) => r.moderateExacerbations || r.seriousExacerbations,
      ).length;
      const actVals = filtered
        .filter((r) => r.physicalActivity > 0)
        .map((r) => r.physicalActivity);
      const avgAct = actVals.length
        ? Math.round(actVals.reduce((a, b) => a + b, 0) / actVals.length)
        : null;

      const stats = [
        { label: t.daysRecorded, value: String(filtered.length) },
        { label: t.catScore, value: avgCat != null ? String(avgCat) : "–" },
        { label: t.exacerbation, value: String(exCount) },
        {
          label: t.physicalActivity,
          value: avgAct != null ? `${avgAct} min` : "–",
        },
      ];

      const statW = CW / stats.length;
      const statH = 18;
      box(ML, y, CW, statH, shade, rule, 0.3);

      stats.forEach(({ label, value }, i) => {
        const sx = ML + i * statW;
        if (i > 0) vline(sx, y, y + statH, 0.2);

        setFont(14, "bold", ink);
        doc.text(value, sx + statW / 2, y + 10.5, { align: "center" });

        setFont(6.5, "normal", mid);
        const lbl = doc.splitTextToSize(label.toUpperCase(), statW - 4);
        lbl.forEach((ln, li) =>
          doc.text(ln, sx + statW / 2, y + 15 + li * 3, { align: "center" }),
        );
      });

      y += statH + 10;

      // ── Column definitions ─────────────────────────────────
      const COL = {
        date: { x: ML, w: 22 },
        cat: { x: ML + 23, w: 13 },
        subs: { x: ML + 37, w: 68 },
        meds: { x: ML + 106, w: 46 },
        stats: { x: ML + 153, w: 25 },
      };

      // ── Table header ───────────────────────────────────────
      checkY(10);
      const thH = 7;
      box(ML, y, CW, thH, [235, 235, 235], ink, 0.4);

      setFont(6.5, "bold", mid);
      doc.text((t.month ?? "Date").toUpperCase(), COL.date.x + 2, y + 4.8);
      doc.text("CAT", COL.cat.x + COL.cat.w / 2, y + 4.8, { align: "center" });
      doc.text(
        (t.catSubScores ?? "Sub-scores").toUpperCase(),
        COL.subs.x + 2,
        y + 4.8,
      );
      doc.text(
        (t.medication ?? "Medication").toUpperCase(),
        COL.meds.x + 2,
        y + 4.8,
      );
      doc.text(
        `${(t.weight ?? "Wt").slice(0, 3).toUpperCase()} / MIN`,
        COL.stats.x + 2,
        y + 4.8,
      );

      [COL.cat.x, COL.subs.x, COL.meds.x, COL.stats.x].forEach((cx) =>
        vline(cx, y, y + thH, 0.3),
      );
      y += thH;

      // ── Records ────────────────────────────────────────────
      filtered.forEach((r, idx) => {
        const catLabel =
          r.cat8 <= 10
            ? t.low
            : r.cat8 <= 20
              ? t.moderate
              : r.cat8 <= 30
                ? t.high
                : t.veryHigh;

        const usedMeds = (r.medicines ?? []).map((id) => {
          const base = patient.medicines?.find((m) => m.id === id);
          const user = patient.userMedicines?.find(
            (um) => um.medicineId === id,
          );
          return base?.name ?? user?.medicine?.name ?? `ID ${id}`;
        });

        // Measure heights
        doc.setFontSize(6.5);
        const medText = usedMeds.join(", ");
        const medLines = medText
          ? doc.splitTextToSize(medText, COL.meds.w - 4).length
          : 0;
        const exLine =
          r.moderateExacerbations || r.seriousExacerbations ? 1 : 0;
        const noteText = r.note?.trim() ?? "";
        const noteLines = noteText
          ? doc.splitTextToSize(`${t.note}: ${noteText}`, CW - 8).length
          : 0;

        // Sub-scores: 4 rows × 2 cols
        const subH = 4 * 3.6 + 3;
        const medH = Math.max(medLines, 1) * 3.8 + 3;
        const bodyH = Math.max(subH, medH, 13);
        const exH = exLine ? 5.5 : 0;
        const noteH = noteLines ? noteLines * 3.5 + 4 : 0;
        const rowH = bodyH + exH + noteH + 2;

        checkY(rowH + 0.5);

        // Row fill + border
        if (idx % 2 === 0) box(ML, y, CW, rowH, shade, null);
        doc.setLineWidth(0.15);
        doc.setDrawColor(...rule);
        doc.rect(ML, y, CW, rowH, "S");

        // Column dividers
        [COL.cat.x, COL.subs.x, COL.meds.x, COL.stats.x].forEach((cx) =>
          vline(cx, y, y + bodyH + exH),
        );

        const ry = y + 5;

        // ── Date ──
        setFont(8, "bold", ink);
        doc.text(r.date, COL.date.x + 2, ry);

        // ── CAT score ──
        setFont(13, "bold", ink);
        doc.text(String(r.cat8), COL.cat.x + COL.cat.w / 2, ry + 1, {
          align: "center",
        });
        setFont(5.5, "normal", light);
        doc.text(catLabel.toUpperCase(), COL.cat.x + COL.cat.w / 2, ry + 5.5, {
          align: "center",
        });

        // ── CAT sub-scores — 2 col grid ──
        setFont(6.5, "normal", mid);
        const pairW = (COL.subs.w - 4) / 2;
        CAT_KEYS_PDF.forEach((k, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const lbl = (CAT_LABELS[i] ?? k).slice(0, 11);
          const val = r[k] ?? 0;
          const px = COL.subs.x + 2 + col * (pairW + 2);
          const py = ry + row * 3.6;
          // Label normal, value bold
          doc.setFont("helvetica", "normal");
          doc.text(`${lbl}:`, px, py);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...ink);
          doc.text(String(val), px + pairW - 4, py, { align: "right" });
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...mid);
        });

        // ── Medicines ──
        if (usedMeds.length) {
          setFont(7, "normal", ink);
          const mLines = doc.splitTextToSize(medText, COL.meds.w - 4);
          mLines.forEach((ln, li) =>
            doc.text(ln, COL.meds.x + 2, ry + li * 3.8),
          );
        }

        // ── Weight / activity ──
        setFont(7.5, "normal", ink);
        let sy = ry;
        if (r.weight != null) {
          doc.text(`${r.weight} kg`, COL.stats.x + 2, sy);
          sy += 4.5;
        }
        if (r.physicalActivity > 0) {
          doc.text(`${r.physicalActivity} min`, COL.stats.x + 2, sy);
        }

        // ── Exacerbation ──
        if (exLine) {
          const ey = y + bodyH;
          hline(ey, 0.15, [200, 200, 200]);
          setFont(6.5, "bold", mid);
          const exLbl = r.seriousExacerbations
            ? t.seriousExacerbation
            : t.moderateExacerbation;
          doc.text(`! ${exLbl}`, ML + 3, ey + 4);
        }

        // ── Note ──
        if (noteLines) {
          const ny = y + bodyH + exH;
          hline(ny, 0.15, [210, 210, 210]);
          setFont(6.5, "italic", light);
          const nLines = doc.splitTextToSize(`${t.note}: ${noteText}`, CW - 8);
          nLines.forEach((ln, li) => doc.text(ln, ML + 3, ny + 4 + li * 3.5));
        }

        y += rowH;
      });

      // Table closing rule
      doc.setLineWidth(0.4);
      doc.setDrawColor(...ink);
      doc.line(ML, y, W - MR, y);

      // ── Footer ─────────────────────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        setFont(6.5, "normal", light);
        doc.text(t.symptomLog, ML, 280);
        doc.text(`${p} / ${pageCount}`, W - MR, 280, { align: "right" });
        doc.text(new Date().toLocaleDateString(), W / 2, 280, {
          align: "center",
        });
      }

      doc.save(`${t.symptomLog}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setPdfLoading(false);
    }
  };

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
          <button
            onClick={downloadPDF}
            disabled={pdfLoading || filtered.length === 0}
            className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-1.5"
            style={{
              background: "#268E86",
              color: "#fff",
              border: "1px solid rgba(38,142,134,0.4)",
            }}
          >
            {pdfLoading ? "⏳" : "⬇"} PDF
          </button>
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
          <>
            {visible.map((record) => (
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
            ))}

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
    </div>
  );
}
