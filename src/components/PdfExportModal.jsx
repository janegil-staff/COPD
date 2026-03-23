// src/components/PdfExportModal.jsx
"use client";
import { useState, useEffect } from "react";

const CAT_KEYS_PDF = [
  "cat8Cough","cat8Phlegm","cat8ChestTightness","cat8Breathlessness",
  "cat8Activities","cat8Confidence","cat8Sleep","cat8Energy",
];

function Toggle({ checked, onChange, label, color = "#268E86" }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none group">
      <div
        onClick={onChange}
        className="relative flex-shrink-0 transition-all"
        style={{
          width: 36, height: 20,
          borderRadius: 10,
          background: checked ? color : "#d1e8e6",
          transition: "background 0.2s",
        }}
      >
        <div style={{
          position: "absolute",
          top: 3, left: checked ? 19 : 3,
          width: 14, height: 14,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 0.2s",
        }} />
      </div>
      <span className="text-sm" style={{ color: checked ? "#1a3a38" : "#7a9a98" }}>{label}</span>
    </label>
  );
}

function DateInput({ label, value, onChange, min, max }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#7a9a98" }}>
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
        onFocus={(e) => { e.target.style.borderColor = "#268E86"; e.target.style.boxShadow = "0 0 0 3px rgba(38,142,134,0.1)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "rgba(38,142,134,0.2)"; e.target.style.boxShadow = "none"; }}
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
  const allRecords = [...(patient?.records ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const minDate = allRecords[0]?.date ?? "";
  const maxDate = allRecords[allRecords.length - 1]?.date ?? "";

  const [fromDate, setFromDate]   = useState(() => {
    if (!maxDate) return "";
    const d = new Date(maxDate);
    d.setMonth(d.getMonth() - 4);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate]       = useState(maxDate);
  const [loading, setLoading]     = useState(false);

  const [fields, setFields] = useState({
    catScore:     true,
    catSubScores: true,
    exacerbation: true,
    medicines:    true,
    weight:       true,
    activity:     true,
    note:         true,
  });

  // Reset dates when patient changes
  useEffect(() => {
    const d = new Date(maxDate || new Date());
    d.setMonth(d.getMonth() - 4);
    setFromDate(maxDate ? d.toISOString().slice(0, 10) : "");
    setToDate(maxDate);
  }, [minDate, maxDate]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const toggle = (key) => setFields(prev => ({ ...prev, [key]: !prev[key] }));

  const filtered = allRecords.filter(r => {
    if (fromDate && r.date < fromDate) return false;
    if (toDate   && r.date > toDate)   return false;
    return true;
  });

  const CAT_LABELS = [
    t.cat8Cough, t.cat8Phlegm, t.cat8ChestTightness, t.cat8Breathlessness,
    t.cat8Activities, t.cat8Confidence, t.cat8Sleep, t.cat8Energy,
  ];

  const handleDownload = async () => {
    if (!filtered.length) return;
    setLoading(true);
    try {
      if (typeof window === "undefined") return;
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W   = 210;
      const ML  = 16;
      const MR  = 16;
      const CW  = W - ML - MR;
      const ink   = [20,  20,  20];
      const mid   = [80,  80,  80];
      const light = [150, 150, 150];
      const rule  = [200, 200, 200];
      const shade = [248, 248, 248];
      let y = 0;

      const setFont = (size, style = "normal", color = ink) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(...color);
      };

      const hline = (yy, lw = 0.2, color = rule) => {
        doc.setLineWidth(lw); doc.setDrawColor(...color);
        doc.line(ML, yy, W - MR, yy);
      };
      const vline = (xx, y1, y2, lw = 0.1) => {
        doc.setLineWidth(lw); doc.setDrawColor(...rule);
        // inset 0.5mm from top/bottom so dividers never touch row borders
        doc.line(xx, y1 + 0.5, xx, y2 - 0.5);
      };
      const box = (x, yy, w, h, fill, stroke, lw = 0.3) => {
        if (fill)   { doc.setFillColor(...fill);   doc.rect(x, yy, w, h, "F"); }
        if (stroke) { doc.setLineWidth(lw); doc.setDrawColor(...stroke); doc.rect(x, yy, w, h, "S"); }
      };

      const drawFrame = () => {
        // Single clean outer border
        doc.setLineWidth(0.4); doc.setDrawColor(140, 140, 140);
        doc.rect(11, 11, W - 22, 275, "S");
        // Footer rule
        doc.setLineWidth(0.1); doc.setDrawColor(...rule);
        doc.line(14, 274, W - 14, 274);
      };

      const addPage = () => { doc.addPage(); drawFrame(); y = 44; };
      const checkY  = (need = 10) => { if (y + need > 270) addPage(); };

      // ── Page 1 ──────────────────────────────────────────
      drawFrame();

      // Left: report title
      setFont(18, "bold", ink);
      doc.text((t.reportTitle ?? t.symptomLog).toUpperCase(), ML, 26);

      // Right column: label, date, patient
      setFont(7, "normal", light);
      doc.text(t.reportDate ?? "Date", W - MR, 20, { align: "right" });
      setFont(8, "bold", ink);
      doc.text(new Date().toLocaleDateString(), W - MR, 25, { align: "right" });
      setFont(7, "normal", mid);
      doc.text(`${patient.age} · ${patient.gender === "male" ? t.male : t.female}`, W - MR, 30, { align: "right" });

      // Date range — left, same baseline as patient info
      if (fromDate || toDate) {
        setFont(7, "normal", light);
        doc.text(`${fromDate ?? "–"}  →  ${toDate ?? "–"}`, ML, 30);
      }

      // Rule drawn AFTER all header text, with 2mm clearance below lowest text (y=30)
      doc.setLineWidth(0.25); doc.setDrawColor(170, 170, 170);
      doc.line(ML, 33.5, W - MR, 33.5);

      y = 39;

      // ── Summary stats ─────────────────────────────────
      const catVals = filtered.map(r => r.cat8).filter(v => v != null);
      const avgCat  = catVals.length ? Math.round(catVals.reduce((a,b)=>a+b,0)/catVals.length) : null;
      const exCount = filtered.filter(r => r.moderateExacerbations || r.seriousExacerbations).length;
      const actVals = filtered.filter(r => r.physicalActivity > 0).map(r => r.physicalActivity);
      const avgAct  = actVals.length ? Math.round(actVals.reduce((a,b)=>a+b,0)/actVals.length) : null;

      const stats = [
        { label: t.daysRecorded,    value: String(filtered.length) },
        { label: t.catScore,        value: avgCat != null ? String(avgCat) : "–" },
        { label: t.exacerbation,    value: String(exCount) },
        { label: t.physicalActivity, value: avgAct != null ? t.activityLabels?.[Math.round(avgAct)] ?? Math.round(avgAct) : "–" },
      ];

      const statW = CW / stats.length;
      const statH = 18;
      box(ML, y, CW, statH, shade, [210,210,210], 0.15);

      stats.forEach(({ label, value }, i) => {
        const sx = ML + i * statW;
        if (i > 0) vline(sx, y, y + statH, 0.2);
        setFont(14, "bold", ink);
        doc.text(value, sx + statW / 2, y + 10.5, { align: "center" });
        setFont(6.5, "normal", mid);
        const lbl = doc.splitTextToSize(label.toUpperCase(), statW - 4);
        lbl.forEach((ln, li) => doc.text(ln, sx + statW / 2, y + 15 + li * 3, { align: "center" }));
      });

      y += statH + 10;

      // ── Column definitions (adapt based on visible fields) ─
      // Always show date. Other columns shown only if toggled on.
      const showSubs  = fields.catScore && fields.catSubScores;
      const showMeds  = fields.medicines;
      const showStats = fields.weight || fields.activity;

      // Dynamic column layout
      let colX = ML;
      const COL = { date: { x: colX, w: 32 } }; colX += 33;
      if (fields.catScore) { COL.cat = { x: colX, w: 13 }; colX += 14; }
      if (showSubs)        { COL.subs = { x: colX, w: showMeds ? 58 : 80 }; colX += COL.subs.w + 1; }
      if (showMeds)        { COL.meds = { x: colX, w: showStats ? 36 : 54 }; colX += COL.meds.w + 1; }
      if (showStats)       { COL.stats = { x: colX, w: W - MR - colX }; }

      // ── Table header ─────────────────────────────────────
      checkY(10);
      const thH = 7;
      box(ML, y, CW, thH, [232,232,232], [180,180,180], 0.25);
      setFont(6.5, "bold", mid);

      doc.text((t.week ?? t.month ?? "Week").toUpperCase(), COL.date.x + 2, y + 4.8);
      if (COL.cat)   doc.text("CAT", COL.cat.x + COL.cat.w / 2, y + 4.8, { align: "center" });
      if (COL.subs)  doc.text((t.catSubScores ?? "Sub-scores").toUpperCase().slice(0, 18), COL.subs.x + 2, y + 4.8);
      if (COL.meds)  doc.text((t.medication ?? "Medication").toUpperCase(), COL.meds.x + 2, y + 4.8);
      if (COL.stats) {
        const statsHeader = `${t.weight ?? "Vekt"} / ${t.physicalActivity ?? "Aktivitet"}`;
        doc.setFontSize(5.5);
        doc.text(statsHeader.toUpperCase(), COL.stats.x + 2, y + 4.8);
        doc.setFontSize(6.5);
      }

      Object.entries(COL).filter(([k]) => k !== "date").forEach(([, c]) => vline(c.x, y, y + thH, 0.15));
      y += thH;

      // ── Layout constants ─────────────────────────────────
      const LINE_H   = 4.2;   // mm per text line
      const PAD_TOP  = 4.5;   // top padding inside a row
      const PAD_BOT  = 4;     // bottom padding inside a row
      const PAD_SIDE = 2;     // left padding inside each cell
      const SEP_H    = 5.5;   // height of exacerbation / note separator bands

      // ── Records ──────────────────────────────────────────
      filtered.slice().reverse().forEach((r, idx, arr) => {
        const prevEntry = arr[idx - 1] ?? null;
        // ── Year headline ────────────────────────────────────
        const rd0  = new Date(r.date.slice(0,4), r.date.slice(5,7)-1, r.date.slice(8,10));
        const thu0 = new Date(rd0.getFullYear(), rd0.getMonth(), rd0.getDate() - ((rd0.getDay()+6)%7) + 3);
        const year = String(thu0.getFullYear());
        const prevYear = idx > 0 ? (() => {
          const p = arr[idx-1];
          const pd = new Date(p.date.slice(0,4), p.date.slice(5,7)-1, p.date.slice(8,10));
          const pt = new Date(pd.getFullYear(), pd.getMonth(), pd.getDate() - ((pd.getDay()+6)%7) + 3);
          return String(pt.getFullYear());
        })() : null;
        if (year !== prevYear) {
          checkY(10);
          if (idx > 0) y += 3; // extra space before new year
          setFont(7, "bold", [38, 142, 134]);
          doc.text(year, ML + PAD_SIDE, y + 5);
          doc.setLineWidth(0.15); doc.setDrawColor(180, 220, 218);
          doc.line(ML + PAD_SIDE + 10, y + 4, W - MR, y + 4);
          y += 8;
        }
        const catLabel = r.cat8 <= 10 ? t.low : r.cat8 <= 20 ? t.moderate : r.cat8 <= 30 ? t.high : t.veryHigh;

        const usedMeds = (r.medicines ?? []).map(id => {
          const base = patient.medicines?.find(m => m.id === id);
          const user = patient.userMedicines?.find(um => um.medicineId === id);
          return base?.name ?? user?.medicine?.name ?? `ID ${id}`;
        });

        // ── Measure everything at render font size ──────────
        doc.setFontSize(6.5);
        const medText   = usedMeds.join(", ");
        const medW      = (COL.meds?.w ?? 40) - PAD_SIDE * 2;
        const medSplit  = (showMeds && medText) ? doc.splitTextToSize(medText, medW) : [];
        const exLine    = fields.exacerbation && (r.moderateExacerbations || r.seriousExacerbations);
        const noteText  = (fields.note && r.note?.trim()) ? r.note.trim() : "";
        const noteSplit = noteText
          ? doc.splitTextToSize(`${t.note ?? "Note"}: ${noteText}`, CW - PAD_SIDE * 4)
          : [];

        // Sub-scores occupy 4 rows of LINE_H each
        const subContentH  = showSubs ? 4 * LINE_H : 0;
        // Medicines content height
        const medContentH  = medSplit.length > 0 ? medSplit.length * LINE_H : 0;
        // Body = tallest content column + top + bottom padding
        const bodyContentH = Math.max(subContentH, medContentH, LINE_H * 3);
        const bodyH        = PAD_TOP + bodyContentH + PAD_BOT;

        // Extra bands below body
        const exH   = exLine         ? SEP_H : 0;
        const noteH = noteSplit.length > 0 ? PAD_TOP + noteSplit.length * LINE_H + PAD_BOT * 0.5 : 0;
        const rowH  = bodyH + exH + noteH;

        checkY(rowH + 1);

        // ── Draw all lines FIRST, then text on top ───────────
        // Row background fill
        if (idx % 2 === 0) {
          doc.setFillColor(...shade);
          doc.rect(ML, y, CW, rowH, "F");
        }
        // Row outer border — very faint
        doc.setLineWidth(0.1); doc.setDrawColor(215, 215, 215);
        doc.rect(ML, y, CW, rowH, "S");

        // Column dividers — inset so they don't pierce the outer border
        Object.entries(COL).filter(([k]) => k !== "date").forEach(([, c]) =>
          vline(c.x, y, y + bodyH + exH)
        );

        // Ex band separator
        if (exLine) {
          doc.setFillColor(255, 250, 250);
          doc.rect(ML, y + bodyH, CW, exH, "F");
          doc.setLineWidth(0.08); doc.setDrawColor(220, 210, 210);
          doc.line(ML + 1, y + bodyH, W - MR - 1, y + bodyH);
        }

        // Note band separator
        if (noteSplit.length > 0) {
          doc.setFillColor(251, 250, 255);
          doc.rect(ML, y + bodyH + exH, CW, noteH, "F");
          doc.setLineWidth(0.08); doc.setDrawColor(215, 210, 230);
          doc.line(ML + 1, y + bodyH + exH, W - MR - 1, y + bodyH + exH);
        }

        const ty = y + PAD_TOP; // first text baseline

        // ── Week number + full Mon / Sun dates stacked ───────
        const rd   = new Date(r.date.slice(0,4), r.date.slice(5,7)-1, r.date.slice(8,10));
        const dow  = (rd.getDay() + 6) % 7;
        const mon  = new Date(rd.getFullYear(), rd.getMonth(), rd.getDate() - dow);
        const sun  = new Date(rd.getFullYear(), rd.getMonth(), rd.getDate() - dow + 6);
        const fmt  = (d) => `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
        const thu  = new Date(rd); thu.setDate(rd.getDate() - dow + 3);
        const jan4 = new Date(thu.getFullYear(), 0, 4);
        const wn   = 1 + Math.round((thu - jan4) / 604800000);

        setFont(6, "bold", [180, 200, 198]);
        doc.text(`${t.week ?? "W"}${wn}`, COL.date.x + PAD_SIDE, ty);
        setFont(6.5, "bold", ink);
        doc.text(fmt(mon), COL.date.x + PAD_SIDE, ty + LINE_H * 0.95);
        setFont(6.5, "bold", ink);
        doc.text(fmt(sun), COL.date.x + PAD_SIDE, ty + LINE_H * 0.95 + LINE_H);

        // ── CAT score ───────────────────────────────────────
        if (COL.cat) {
          setFont(12, "bold", ink);
          doc.text(String(r.cat8), COL.cat.x + COL.cat.w / 2, ty + 1.5, { align: "center" });
          setFont(5.5, "normal", light);
          doc.text(catLabel.toUpperCase(), COL.cat.x + COL.cat.w / 2, ty + 6, { align: "center" });
        }

        // ── CAT sub-scores — 2-col grid ─────────────────────
        if (COL.subs) {
          setFont(6.5, "normal", mid);
          const pairW = (COL.subs.w - PAD_SIDE * 3) / 2;
          CAT_KEYS_PDF.forEach((k, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const lbl = (CAT_LABELS[i] ?? k).slice(0, 12);
            const val = r[k] ?? 0;
            const px  = COL.subs.x + PAD_SIDE + col * (pairW + PAD_SIDE);
            const py  = ty + row * LINE_H;
            doc.setFont("helvetica", "normal"); doc.setTextColor(...mid);
            // Label — clipped to available width minus score digit
            const lblSplit = doc.splitTextToSize(`${lbl}:`, pairW - 6);
            doc.text(lblSplit[0], px, py);
            // Value — right-aligned in pair column
            doc.setFont("helvetica", "bold"); doc.setTextColor(...ink);
            doc.text(String(val), px + pairW - 1, py, { align: "right" });
          });
        }

        // ── Medicines ───────────────────────────────────────
        if (COL.meds && medSplit.length > 0) {
          setFont(6.5, "normal", ink);
          medSplit.forEach((ln, li) =>
            doc.text(ln, COL.meds.x + PAD_SIDE, ty + li * LINE_H)
          );
        }

        // ── Weight / activity ────────────────────────────────
        if (COL.stats) {
          setFont(7, "normal", ink);
          let sy = ty;
          if (fields.weight   && r.weight != null)
            { doc.text(`${r.weight} kg`, COL.stats.x + PAD_SIDE, sy); sy += LINE_H; }
          if (fields.activity && r.physicalActivity > 0)
            { doc.text((t.activityLabels?.[r.physicalActivity] ?? r.physicalActivity) + "", COL.stats.x + PAD_SIDE, sy); }
        }

        // ── Exacerbation text ───────────────────────────────
        if (exLine) {
          const ey = y + bodyH;
          setFont(6.5, "bold", [150, 40, 40]);
          const exLbl = r.seriousExacerbations ? t.seriousExacerbation : t.moderateExacerbation;
          doc.text(`! ${exLbl}`, ML + PAD_SIDE + 1, ey + 3.8);
        }

        // ── Note text ───────────────────────────────────────
        if (noteSplit.length > 0) {
          const ny = y + bodyH + exH;
          setFont(6.5, "italic", [120, 100, 160]);
          noteSplit.forEach((ln, li) =>
            doc.text(ln, ML + PAD_SIDE + 1, ny + PAD_TOP * 0.8 + li * LINE_H)
          );
        }

        y += rowH;
      });

      doc.setLineWidth(0.2); doc.setDrawColor(160, 160, 160);
      doc.line(ML, y, W - MR, y);

      // ── Footer ───────────────────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        setFont(6.5, "normal", light);
        doc.text(t.symptomLog, ML, 280);
        doc.text(`${p} / ${pageCount}`, W - MR, 280, { align: "right" });
        doc.text(new Date().toLocaleDateString(), W / 2, 280, { align: "center" });
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
    { key: "medicines",    label: t.medicines },
    { key: "weight",       label: t.weight },
    { key: "activity",     label: t.physicalActivity },
    { key: "note",         label: t.note },
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
            <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "#7a9a98" }}>
              {t.downloadPdf ?? "Download PDF"}
            </p>
            <p className="text-lg font-bold" style={{ color: "#1a3a38", fontFamily: "'Playfair Display', Georgia, serif" }}>
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
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#7a9a98" }}>
              {(() => {
                if (!fromDate || !toDate) return t.lastFourMonths ?? "Period";
                const from = new Date(fromDate);
                const to   = new Date(toDate);
                const months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
                const rounded = Math.max(1, Math.round(months));
                return `${rounded} ${rounded === 1 ? (t.monthSingular ?? t.month ?? "month") : (t.months ?? "months")}`;
              })()}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <DateInput
                label={t.from ?? "From"}
                value={fromDate}
                onChange={setFromDate}
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
                <span className="ml-2" style={{ color: "#ef4444" }}>—  {t.noEntries}</span>
              )}
            </p>
          </div>

          {/* Field toggles */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#7a9a98" }}>
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
                      {children.map(child => (
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
            style={{ background: "rgba(38,142,134,0.08)", color: "#268E86", border: "1px solid rgba(38,142,134,0.2)" }}
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
