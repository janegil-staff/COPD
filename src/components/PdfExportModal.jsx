// src/components/PdfExportModal.jsx
"use client";
import { useState, useEffect } from "react";

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

function Toggle({ checked, onChange, label, color = "#268E86" }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none group">
      <div
        onClick={onChange}
        className="relative flex-shrink-0 transition-all"
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: checked ? color : "#d1e8e6",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 19 : 3,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
          }}
        />
      </div>
      <span
        className="text-sm"
        style={{ color: checked ? "#1a3a38" : "#7a9a98" }}
      >
        {label}
      </span>
    </label>
  );
}

function DateInput({ label, value, onChange, min, max }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: "#7a9a98" }}
      >
        {label}
      </label>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-xl text-sm outline-none transition-all"
        style={{
          background: "#f4f8f8",
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
  );
}

/**
 * PdfExportModal
 *
 * Props:
 *   open        – boolean
 *   onClose     – () => void
 *   patient     – full patient object from sessionStorage
 *   t           – translation object
 */
export default function PdfExportModal({ open, onClose, patient, t }) {
  const allRecords = [...(patient?.records ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const minDate = allRecords[0]?.date ?? "";
  const maxDate = allRecords[allRecords.length - 1]?.date ?? "";

  const [fromDate, setFromDate] = useState(minDate);
  const [toDate, setToDate] = useState(maxDate);
  const [loading, setLoading] = useState(false);

  const [fields, setFields] = useState({
    catScore: true,
    catSubScores: true,
    exacerbation: true,
    medicines: true,
    weight: true,
    activity: true,
    note: true,
  });

  // Reset dates when patient changes
  useEffect(() => {
    setFromDate(minDate);
    setToDate(maxDate);
  }, [minDate, maxDate]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const toggle = (key) => setFields((prev) => ({ ...prev, [key]: !prev[key] }));

  const filtered = allRecords.filter((r) => {
    if (fromDate && r.date < fromDate) return false;
    if (toDate && r.date > toDate) return false;
    return true;
  });

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

  const handleDownload = async () => {
    if (!filtered.length) return;
    setLoading(true);
    try {
      if (typeof window === "undefined") return;
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

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
      const box = (x, yy, w, h, fill, stroke, lw = 0.3) => {
        if (fill) {
          doc.setFillColor(...fill);
          doc.rect(x, yy, w, h, "F");
        }
        if (stroke) {
          doc.setLineWidth(lw);
          doc.setDrawColor(...stroke);
          doc.rect(x, yy, w, h, "S");
        }
      };

      const drawFrame = () => {
        doc.setLineWidth(0.6);
        doc.setDrawColor(...ink);
        doc.rect(10, 10, W - 20, 277, "S");
        doc.setLineWidth(0.15);
        doc.setDrawColor(...rule);
        doc.rect(12, 12, W - 24, 273, "S");
        doc.setLineWidth(0.2);
        doc.setDrawColor(...rule);
        doc.line(12, 275, W - 12, 275);
      };

      const addPage = () => {
        doc.addPage();
        drawFrame();
        y = 44;
      };
      const checkY = (need = 10) => {
        if (y + need > 270) addPage();
      };

      // ── Page 1 ──────────────────────────────────────────
      drawFrame();

      setFont(20, "bold", ink);
      doc.text((t.reportTitle ?? t.symptomLog).toUpperCase(), ML, 30);

      doc.setLineWidth(0.4);
      doc.setDrawColor(...ink);
      doc.line(ML, 33, W - MR, 33);
      doc.setLineWidth(0.15);
      doc.setDrawColor(...rule);
      doc.line(ML, 34.2, W - MR, 34.2);

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

      // Date range line
      if (fromDate || toDate) {
        setFont(7, "normal", light);
        doc.text(`${fromDate ?? "–"}  →  ${toDate ?? "–"}`, ML, 34);
      }

      y = 42;

      // ── Summary stats ─────────────────────────────────
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

      // ── Column definitions (adapt based on visible fields) ─
      // Always show date. Other columns shown only if toggled on.
      const showSubs = fields.catScore && fields.catSubScores;
      const showMeds = fields.medicines;
      const showStats = fields.weight || fields.activity;

      // Dynamic column layout
      let colX = ML;
      const COL = { date: { x: colX, w: 22 } };
      colX += 23;
      if (fields.catScore) {
        COL.cat = { x: colX, w: 13 };
        colX += 14;
      }
      if (showSubs) {
        COL.subs = { x: colX, w: showMeds ? 58 : 80 };
        colX += COL.subs.w + 1;
      }
      if (showMeds) {
        COL.meds = { x: colX, w: showStats ? 36 : 54 };
        colX += COL.meds.w + 1;
      }
      if (showStats) {
        COL.stats = { x: colX, w: W - MR - colX };
      }

      // ── Table header ─────────────────────────────────────
      checkY(10);
      const thH = 7;
      box(ML, y, CW, thH, [235, 235, 235], ink, 0.4);
      setFont(6.5, "bold", mid);

      doc.text((t.month ?? "Date").toUpperCase(), COL.date.x + 2, y + 4.8);
      if (COL.cat)
        doc.text("CAT", COL.cat.x + COL.cat.w / 2, y + 4.8, {
          align: "center",
        });
      if (COL.subs)
        doc.text(
          (t.catSubScores ?? "Sub-scores").toUpperCase().slice(0, 18),
          COL.subs.x + 2,
          y + 4.8,
        );
      if (COL.meds)
        doc.text(
          (t.medication ?? "Medication").toUpperCase(),
          COL.meds.x + 2,
          y + 4.8,
        );
      if (COL.stats)
        doc.text(
          `${(t.weight ?? "Wt").slice(0, 2).toUpperCase()} / MIN`,
          COL.stats.x + 2,
          y + 4.8,
        );

      Object.entries(COL)
        .filter(([k]) => k !== "date")
        .forEach(([, c]) => vline(c.x, y, y + thH, 0.3));
      y += thH;

      // ── Records ──────────────────────────────────────────
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

        doc.setFontSize(6.5);
        const medText = usedMeds.join(", ");
        const medLines =
          showMeds && medText
            ? doc.splitTextToSize(medText, (COL.meds?.w ?? 40) - 4).length
            : 0;
        const exLine =
          fields.exacerbation &&
          (r.moderateExacerbations || r.seriousExacerbations)
            ? 1
            : 0;
        const noteText = fields.note && r.note?.trim() ? r.note.trim() : "";
        const noteLines = noteText
          ? doc.splitTextToSize(`${t.note}: ${noteText}`, CW - 8).length
          : 0;

        const subH = showSubs ? 4 * 3.6 + 3 : 0;
        const medH = showMeds ? Math.max(medLines, 1) * 3.8 + 3 : 0;
        const bodyH = Math.max(subH, medH, 13);
        const exH = exLine ? 5.5 : 0;
        const noteH = noteLines ? noteLines * 3.5 + 4 : 0;
        const rowH = bodyH + exH + noteH + 2;

        checkY(rowH + 0.5);

        if (idx % 2 === 0) box(ML, y, CW, rowH, shade, null);
        doc.setLineWidth(0.15);
        doc.setDrawColor(...rule);
        doc.rect(ML, y, CW, rowH, "S");

        Object.entries(COL)
          .filter(([k]) => k !== "date")
          .forEach(([, c]) => vline(c.x, y, y + bodyH + exH));

        const ry = y + 5;

        // Date
        setFont(8, "bold", ink);
        doc.text(r.date, COL.date.x + 2, ry);

        // CAT
        if (COL.cat) {
          setFont(13, "bold", ink);
          doc.text(String(r.cat8), COL.cat.x + COL.cat.w / 2, ry + 1, {
            align: "center",
          });
          setFont(5.5, "normal", light);
          doc.text(
            catLabel.toUpperCase(),
            COL.cat.x + COL.cat.w / 2,
            ry + 5.5,
            { align: "center" },
          );
        }

        // Sub-scores
        if (COL.subs) {
          setFont(6.5, "normal", mid);
          const pairW = (COL.subs.w - 4) / 2;
          CAT_KEYS_PDF.forEach((k, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const lbl = (CAT_LABELS[i] ?? k).slice(0, 11);
            const val = r[k] ?? 0;
            const px = COL.subs.x + 2 + col * (pairW + 2);
            const py = ry + row * 3.6;
            doc.setFont("helvetica", "normal");
            doc.text(`${lbl}:`, px, py);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...ink);
            doc.text(String(val), px + pairW - 4, py, { align: "right" });
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...mid);
          });
        }

        // Medicines
        if (COL.meds && usedMeds.length) {
          setFont(7, "normal", ink);
          doc
            .splitTextToSize(medText, COL.meds.w - 4)
            .forEach((ln, li) => doc.text(ln, COL.meds.x + 2, ry + li * 3.8));
        }

        // Weight / activity
        if (COL.stats) {
          setFont(7.5, "normal", ink);
          let sy = ry;
          if (fields.weight && r.weight != null) {
            doc.text(`${r.weight} kg`, COL.stats.x + 2, sy);
            sy += 4.5;
          }
          if (fields.activity && r.physicalActivity > 0) {
            doc.text(`${r.physicalActivity} min`, COL.stats.x + 2, sy);
          }
        }

        // Exacerbation
        if (exLine) {
          const ey = y + bodyH;
          hline(ey, 0.15, [200, 200, 200]);
          setFont(6.5, "bold", mid);
          const exLbl = r.seriousExacerbations
            ? t.seriousExacerbation
            : t.moderateExacerbation;
          doc.text(`! ${exLbl}`, ML + 3, ey + 4);
        }

        // Note
        if (noteLines) {
          const ny = y + bodyH + exH;
          hline(ny, 0.15, [210, 210, 210]);
          setFont(6.5, "italic", light);
          doc
            .splitTextToSize(`${t.note}: ${noteText}`, CW - 8)
            .forEach((ln, li) => doc.text(ln, ML + 3, ny + 4 + li * 3.5));
        }

        y += rowH;
      });

      doc.setLineWidth(0.4);
      doc.setDrawColor(...ink);
      doc.line(ML, y, W - MR, y);

      // ── Footer ───────────────────────────────────────────
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

      doc.save(`${t.symptomLog}-${fromDate ?? ""}-${toDate ?? ""}.pdf`);
      onClose();
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const fieldGroups = [
    {
      label: t.catScore,
      key: "catScore",
      children: [{ key: "catSubScores", label: t.catSubScores }],
    },
    { key: "exacerbation", label: t.exacerbation },
    { key: "medicines", label: t.medicines },
    { key: "weight", label: t.weight },
    { key: "activity", label: t.physicalActivity },
    { key: "note", label: t.note },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[400]"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 z-[401] rounded-2xl shadow-2xl overflow-hidden"
        style={{
          transform: "translate(-50%, -50%)",
          width: "min(480px, calc(100vw - 32px))",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(38,142,134,0.2)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(38,142,134,0.12)" }}
        >
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-0.5"
              style={{ color: "#7a9a98" }}
            >
              {t.downloadPdf ?? "Download PDF"}
            </p>
            <p
              className="text-lg font-bold"
              style={{
                color: "#1a3a38",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              {t.reportTitle ?? t.symptomLog}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
            style={{ color: "#a0b8b6" }}
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Date range */}
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "#7a9a98" }}
            >
              {t.lastFourMonths ?? "Period"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <DateInput
                label={t.from ?? "From"}
                value={fromDate}
                onChange={setFromDate}
                min={minDate}
                max={toDate || maxDate}
              />
              <DateInput
                label={t.stopped ?? "To"}
                value={toDate}
                onChange={setToDate}
                min={fromDate || minDate}
                max={maxDate}
              />
            </div>
            {/* Record count indicator */}
            <p className="text-xs mt-2" style={{ color: "#a0b8b6" }}>
              {filtered.length} {t.entries}
              {filtered.length === 0 && (
                <span className="ml-2" style={{ color: "#ef4444" }}>
                  — {t.noEntries}
                </span>
              )}
            </p>
          </div>

          {/* Field toggles */}
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "#7a9a98" }}
            >
              {t.showIn ?? "Include in report"}
            </p>
            <div className="space-y-2.5">
              {fieldGroups.map(({ key, label, children }) => (
                <div key={key}>
                  <Toggle
                    checked={fields[key]}
                    onChange={() => toggle(key)}
                    label={label}
                  />
                  {children && fields[key] && (
                    <div className="ml-10 mt-2 space-y-2">
                      {children.map((child) => (
                        <Toggle
                          key={child.key}
                          checked={fields[child.key]}
                          onChange={() => toggle(child.key)}
                          label={child.label}
                          color="#a0b8b6"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(38,142,134,0.12)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{
              background: "rgba(38,142,134,0.08)",
              color: "#268E86",
              border: "1px solid rgba(38,142,134,0.2)",
            }}
          >
            {t.back ?? "Cancel"}
          </button>
          <button
            onClick={handleDownload}
            disabled={loading || filtered.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "#268E86", color: "#fff" }}
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>⬇</span>
            )}
            {loading ? (t.loading ?? "…") : (t.downloadPdf ?? "Download PDF")}
          </button>
        </div>
      </div>
    </>
  );
}
