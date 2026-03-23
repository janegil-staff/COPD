// src/components/dashboard/DrawerContent.jsx
"use client";
import { CAT_KEYS } from "./catUtils";

function Bar({ value, max = 5 }) {
  const pct   = (value / max) * 100;
  const color = value <= 1 ? "#0f8a6a" : value <= 2 ? "#a16200" : value <= 3 ? "#c05400" : "#b91c1c";
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(38,142,134,0.1)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold w-4 text-right" style={{ color: "#7a9a98" }}>{value}</span>
    </div>
  );
}

/**
 * Pure content panel — no scroll container, no animation wrapper.
 * Rendered inside both the mobile slide-up and the desktop modal.
 *
 * Props:
 *   t             – translation object
 *   record        – the selected day record
 *   catColor      – { text, bg, border } from catColor(record.cat8)
 *   usedMedicines – resolved array from resolveMedicines()
 *   onClose       – close handler
 *   show          – visibility toggles { catScore, exacerbation, medicine, note, weight, activity }
 */
export default function DrawerContent({ t, record, catColor, usedMedicines, onClose, show }) {
  return (
    <div className="p-6">

      {/* ── Header: date + optional CAT badge + close ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#a0b8b6" }}>
            {t.registration}
          </p>
          <p className="text-xs font-semibold mb-0.5" style={{ color: "#a0b8b6" }}>
            {(() => {
              const d   = new Date(record.date.slice(0,4), record.date.slice(5,7)-1, record.date.slice(8,10));
              const dow = (d.getDay() + 6) % 7;
              const thu = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + 3);
              const jan4 = new Date(thu.getFullYear(), 0, 4);
              const wn  = 1 + Math.round((thu - jan4) / 604800000);
              return `${t.week ?? "W"}${wn}`;
            })()}
          </p>
          <p className="text-xl font-bold" style={{ color: "#1a3a38", fontFamily: "'Playfair Display', Georgia, serif" }}>
            {record.date}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {show.catScore && (
            <div
              className="text-2xl font-black px-4 py-2 rounded-xl"
              style={{ background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}` }}
            >
              {record.cat8}
            </div>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
            style={{ color: "#a0b8b6" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Exacerbation alert ── */}
      {show.exacerbation && (record.moderateExacerbations || record.seriousExacerbations) && (
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
          style={{ background: "#fff0f0", border: "1px solid #fca5a5" }}
        >
          <span>⚠️</span>
          <span className="text-sm font-semibold" style={{ color: "#b91c1c" }}>
            {record.seriousExacerbations ? t.seriousExacerbation : t.moderateExacerbation}
          </span>
        </div>
      )}

      {/* ── CAT sub-scores ── */}
      {show.catScore && (
        <>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#a0b8b6" }}>
            {t.catSubScores}
          </p>
          <div className="space-y-2.5 mb-5">
            {CAT_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs shrink-0" style={{ color: "#7a9a98", width: 128 }}>{t[key]}</span>
                <Bar value={record[key] ?? 0} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Weight + Activity ── */}
      {(show.weight || show.activity) && (
        <div className="flex gap-3 mb-5">
          {show.weight && record.weight != null && (
            <div
              className="flex-1 px-3 py-2.5 rounded-xl text-center"
              style={{ background: "rgba(38,142,134,0.06)", border: "1px solid rgba(38,142,134,0.15)" }}
            >
              <p className="text-xs mb-0.5" style={{ color: "#7a9a98" }}>{t.weight}</p>
              <p className="text-sm font-bold" style={{ color: "#268E86" }}>{record.weight} kg</p>
            </div>
          )}
          {show.activity && record.physicalActivity != null && (
            <div
              className="flex-1 px-3 py-2.5 rounded-xl text-center"
              style={{ background: "rgba(38,142,134,0.06)", border: "1px solid rgba(38,142,134,0.15)" }}
            >
              <p className="text-xs mb-0.5" style={{ color: "#7a9a98" }}>{t.physicalActivity}</p>
              <p className="text-sm font-bold" style={{ color: "#268E86" }}>{t.activityLabels?.[record.physicalActivity] ?? record.physicalActivity}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Medicines ── */}
      {show.medicine && usedMedicines.length > 0 && (
        <>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#a0b8b6" }}>
            {t.usedMedicines}
          </p>
          <div className="space-y-2 mb-5">
            {usedMedicines.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}
              >
                {m.image && (
                  <img
                    src={m.image}
                    alt={m.name}
                    className="w-8 h-8 object-contain rounded-lg"
                    style={{ background: "rgba(38,142,134,0.07)", padding: 3 }}
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "#1a3a38" }}>{m.name}</p>
                  {m.atc && <p className="text-xs" style={{ color: "#7a9a98" }}>{m.atc}</p>}
                </div>
                {m.times != null && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "#e0f2fe", color: "#0369a1" }}
                  >
                    {m.times}{t.timesUsed}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Note ── */}
      {show.note && (() => {
        const noteText = record.note?.trim() || record.notes?.trim() || record.noteText?.trim() || record.comment?.trim();
        return noteText ? (
          <>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#a0b8b6" }}>
              {t.note}
            </p>
            <div className="px-4 py-3 rounded-xl" style={{ background: "#f5f3ff", border: "1px solid #c4b5fd" }}>
              <p className="text-sm" style={{ color: "#6d28d9" }}>{noteText}</p>
            </div>
          </>
        ) : null;
      })()}

    </div>
  );
}