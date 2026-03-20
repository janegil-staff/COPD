"use client";
import { useEffect } from "react";

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

function Bar({ value, max = 5 }) {
  const pct = (value / max) * 100;
  const color =
    value <= 1
      ? "#0f8a6a"
      : value <= 2
        ? "#a16200"
        : value <= 3
          ? "#c05400"
          : "#b91c1c";
  return (
    <div className="flex items-center gap-2 flex-1">
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(38,142,134,0.1)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span
        className="text-xs font-semibold w-4 text-right"
        style={{ color: "#7a9a98" }}
      >
        {value}
      </span>
    </div>
  );
}

function DrawerContent({ t, record, catColor, usedMedicines, onClose, show }) {
  // CAT sub-scores are always shown — they're the core clinical data.
  // Everything else respects the show toggles.
  return (
    <div className="p-6">
      {/* Header — date + CAT badge always visible */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: "#a0b8b6" }}
          >
            {t.registration}
          </p>
          <p
            className="text-xl font-bold"
            style={{
              color: "#1a3a38",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {record.date}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {show.catScore && (
            <div
              className="text-2xl font-black px-4 py-2 rounded-xl"
              style={{
                background: catColor.bg,
                color: catColor.text,
                border: `1px solid ${catColor.border}`,
              }}
            >
              {record.cat8}
            </div>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
            style={{ color: "#a0b8b6" }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Exacerbation alert */}
      {show.exacerbation &&
        (record.moderateExacerbations || record.seriousExacerbations) && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
            style={{ background: "#fff0f0", border: "1px solid #fca5a5" }}
          >
            <span>⚠️</span>
            <span
              className="text-sm font-semibold"
              style={{ color: "#b91c1c" }}
            >
              {record.seriousExacerbations
                ? t.seriousExacerbation
                : t.moderateExacerbation}
            </span>
          </div>
        )}

      {/* CAT sub-scores — always shown, they are the clinical detail */}
      <p
        className="text-xs font-semibold tracking-widest uppercase mb-3"
        style={{ color: "#a0b8b6" }}
      >
        {t.catSubScores}
      </p>
      <div className="space-y-2.5 mb-5">
        {CAT_KEYS.map((key) => (
          <div key={key} className="flex items-center gap-3">
            <span
              className="text-xs shrink-0"
              style={{ color: "#7a9a98", width: 128 }}
            >
              {t[key]}
            </span>
            <Bar value={record[key] ?? 0} />
          </div>
        ))}
      </div>

      {/* Weight + Activity stats */}
      {(show.weight || show.activity) && (
        <div className="flex gap-3 mb-5">
          {show.weight && record.weight != null && (
            <div
              className="flex-1 px-3 py-2.5 rounded-xl text-center"
              style={{
                background: "rgba(38,142,134,0.06)",
                border: "1px solid rgba(38,142,134,0.15)",
              }}
            >
              <p className="text-xs mb-0.5" style={{ color: "#7a9a98" }}>
                {t.weight}
              </p>
              <p className="text-sm font-bold" style={{ color: "#268E86" }}>
                {record.weight} kg
              </p>
            </div>
          )}
          {show.activity && record.physicalActivity != null && (
            <div
              className="flex-1 px-3 py-2.5 rounded-xl text-center"
              style={{
                background: "rgba(38,142,134,0.06)",
                border: "1px solid rgba(38,142,134,0.15)",
              }}
            >
              <p className="text-xs mb-0.5" style={{ color: "#7a9a98" }}>
                {t.physicalActivity}
              </p>
              <p className="text-sm font-bold" style={{ color: "#268E86" }}>
                {record.physicalActivity} min
              </p>
            </div>
          )}
        </div>
      )}

      {/* Medicines used */}
      {show.medicine && usedMedicines.length > 0 && (
        <>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#a0b8b6" }}
          >
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
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#1a3a38" }}
                  >
                    {m.name}
                  </p>
                  {m.atc && (
                    <p className="text-xs" style={{ color: "#7a9a98" }}>
                      {m.atc}
                    </p>
                  )}
                </div>
                {m.times != null && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "#e0f2fe", color: "#0369a1" }}
                  >
                    {m.times}
                    {t.timesUsed}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Note */}
      {show.note && record.note?.trim() && (
        <>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: "#a0b8b6" }}
          >
            {t.note}
          </p>
          <div
            className="px-4 py-3 rounded-xl"
            style={{ background: "#f5f3ff", border: "1px solid #c4b5fd" }}
          >
            <p className="text-sm" style={{ color: "#6d28d9" }}>
              {record.note}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function DayDetailDrawer({
  t,
  open,
  onClose,
  record,
  medicines,
  userMedicines,
  show,
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!record) return null;

  const catColor = CAT_COLOR(record.cat8);
  const usedMedicines = (record.medicines ?? []).map((id, i) => {
    const base = medicines?.find((m) => m.id === id);
    const user = userMedicines?.find((um) => um.medicineId === id);
    return {
      id,
      name: base?.name ?? user?.medicine?.name ?? `${t.medication} ${id}`,
      image: user?.medicine?.image,
      times: record.medicinesUsedTimes?.[i] ?? null,
      atc: record.medicinesAtc?.[i] ?? null,
    };
  });

  const backdropStyle = {
    background: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(4px)",
    opacity: open ? 1 : 0,
    pointerEvents: open ? "auto" : "none",
    transition: "opacity 0.2s ease",
  };

  const sharedDrawerStyle = {
    background: "rgba(255,255,255,0.97)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(38,142,134,0.25)",
  };

  return (
    <>
      {/* Mobile — slide up */}
      <div
        className="fixed inset-0 z-40 lg:hidden"
        style={backdropStyle}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-2xl overflow-y-auto"
        style={{
          ...sharedDrawerStyle,
          maxHeight: "82vh",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <div
          className="w-10 h-1 rounded-full mx-auto mt-3 mb-1"
          style={{ background: "rgba(38,142,134,0.25)" }}
        />
        <DrawerContent
          t={t}
          record={record}
          catColor={catColor}
          usedMedicines={usedMedicines}
          onClose={onClose}
          show={show}
        />
      </div>

      {/* Desktop — centred modal */}
      <div
        className="hidden lg:block fixed inset-0 z-40"
        style={backdropStyle}
        onClick={onClose}
      />
      <div
        className="hidden lg:block fixed top-1/2 left-1/2 z-50 rounded-2xl overflow-y-auto shadow-2xl"
        style={{
          ...sharedDrawerStyle,
          width: 440,
          maxHeight: "82vh",
          transform: open
            ? "translate(-50%,-50%) scale(1)"
            : "translate(-50%,-50%) scale(0.96)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "all 0.2s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <DrawerContent
          t={t}
          record={record}
          catColor={catColor}
          usedMedicines={usedMedicines}
          onClose={onClose}
          show={show}
        />
      </div>
    </>
  );
}
