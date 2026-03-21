"use client";

const CAT_KEYS = ["cat8Cough","cat8Phlegm","cat8ChestTightness","cat8Breathlessness","cat8Activities","cat8Confidence","cat8Sleep","cat8Energy"];
const GAD7_KEYS = ["feelingNervous","noWorryingControl","worrying","troubleRelaxing","restless","easilyAnnoyed","afraid"];

function ScoreBar({ value, max = 5 }) {
  const pct = (value / max) * 100;
  const color = value <= 1 ? "#0f8a6a" : value <= 2 ? "#a16200" : value <= 3 ? "#c05400" : "#b91c1c";
  return (
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(38,142,134,0.1)" }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(38,142,134,0.1)", margin: "4px 0" }} />;
}

function SectionHeader({ children }) {
  return (
    <p className="text-xs font-semibold tracking-widest uppercase px-5 pt-5 pb-3" style={{ color: "#7a9a98" }}>
      {children}
    </p>
  );
}

export default function Sidebar({ t, patient, selectedRecord, show }) {
  const gad7 = patient.latestGad7;
  const gad7Sum = gad7
    ? GAD7_KEYS.reduce((s, k) => s + (gad7[k] ?? 0), 0)
    : null;
  const gad7Level = gad7Sum === null ? null
    : gad7Sum <= 9  ? t.mild
    : gad7Sum <= 14 ? t.moderate
    : t.serious;
  const gad7Color = gad7Sum === null ? "#7a9a98"
    : gad7Sum <= 9  ? "#0f8a6a"
    : gad7Sum <= 14 ? "#a16200"
    : "#b91c1c";

  const medSat = patient.latestMedicineSatisfaction;

  // Check if the selected-record section has anything visible to show
  const hasVisibleRecordData = selectedRecord && (
    show.catScore ||
    (show.exacerbation && (selectedRecord.moderateExacerbations || selectedRecord.seriousExacerbations)) ||
    (show.note && selectedRecord.note?.trim()) ||
    (show.weight && selectedRecord.weight) ||
    (show.activity && selectedRecord.physicalActivity > 0)
  );

  return (
    <div className="flex flex-col">

      {/* Selected day details */}
      {selectedRecord ? (
        hasVisibleRecordData ? (
          <>
            <SectionHeader>{t.catScore} · {selectedRecord.date}</SectionHeader>
            <div className="px-5 pb-4 space-y-2">

              {/* CAT sub-scores — always show when catScore is on */}
              {show.catScore && (
                <>
                  {CAT_KEYS.map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs shrink-0" style={{ color: "#7a9a98", width: 116 }}>{t[key]}</span>
                      <ScoreBar value={selectedRecord[key] ?? 0} />
                      <span className="text-xs font-semibold w-3 text-right" style={{ color: "#4a7a78" }}>
                        {selectedRecord[key] ?? 0}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: "1px solid rgba(38,142,134,0.1)" }}>
                    <span className="text-xs font-semibold" style={{ color: "#7a9a98" }}>Total</span>
                    <span className="text-sm font-bold" style={{ color: "#268E86" }}>{selectedRecord.cat8} / 40</span>
                  </div>
                </>
              )}
            </div>

            {/* Exacerbation */}
            {show.exacerbation && (selectedRecord.moderateExacerbations || selectedRecord.seriousExacerbations) && (
              <div className="mx-5 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#fff0f0", border: "1px solid #fca5a5" }}>
                <span>⚠️</span>
                <span className="text-xs font-semibold" style={{ color: "#b91c1c" }}>
                  {selectedRecord.seriousExacerbations ? t.seriousExacerbation : t.moderateExacerbation}
                </span>
              </div>
            )}

            {/* Note */}
            {show.note && selectedRecord.note?.trim() && (
              <div className="mx-5 mb-3 px-3 py-2 rounded-xl" style={{ background: "#f5f3ff", border: "1px solid #c4b5fd" }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: "#7c3aed" }}>{t.note}</p>
                <p className="text-xs" style={{ color: "#6d5a9a" }}>{selectedRecord.note}</p>
              </div>
            )}

            {/* Weight + activity */}
            {(show.weight || show.activity) && (
              <div className="mx-5 mb-4 flex gap-2">
                {show.weight && selectedRecord.weight && (
                  <div className="flex-1 px-3 py-2 rounded-xl text-center" style={{ background: "rgba(38,142,134,0.06)", border: "1px solid rgba(38,142,134,0.15)" }}>
                    <p className="text-xs" style={{ color: "#7a9a98" }}>{t.weight}</p>
                    <p className="text-sm font-bold" style={{ color: "#268E86" }}>{selectedRecord.weight} kg</p>
                  </div>
                )}
                {show.activity && selectedRecord.physicalActivity > 0 && (
                  <div className="flex-1 px-3 py-2 rounded-xl text-center" style={{ background: "rgba(38,142,134,0.06)", border: "1px solid rgba(38,142,134,0.15)" }}>
                    <p className="text-xs" style={{ color: "#7a9a98" }}>{t.physicalActivity}</p>
                    <p className="text-sm font-bold" style={{ color: "#268E86" }}>{selectedRecord.physicalActivity} {t.hours ?? t.hour}</p>
                  </div>
                )}
              </div>
            )}

            <Divider />
          </>
        ) : (
          /* A day is selected but all its toggles are off */
          <div className="px-5 py-6 text-center">
            <p className="text-sm" style={{ color: "#a0b8b6" }}>{selectedRecord.date}</p>
            <p className="text-xs mt-1" style={{ color: "#c8dedd" }}>{t.noData}</p>
          </div>
        )
      ) : (
        <div className="px-5 py-6 text-center">
          <p className="text-sm" style={{ color: "#a0b8b6" }}>{t.chooseDay}</p>
        </div>
      )}

      {/* Medicines — gated by show.medicine */}
      {show.medicine && patient.userMedicines?.length > 0 && (
        <>
          <SectionHeader>{t.medicines}</SectionHeader>
          <div className="px-5 pb-4 space-y-3">
            {patient.userMedicines.map((um) => (
              <div key={um.medicineId} className="flex items-center gap-3">
                {um.medicine?.image && (
                  <img
                    src={um.medicine.image}
                    alt={um.medicine.name}
                    className="w-9 h-9 object-contain rounded-lg"
                    style={{ background: "rgba(38,142,134,0.07)", padding: 4, border: "1px solid rgba(38,142,134,0.15)" }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#1a3a38" }}>{um.medicine?.name}</p>
                  <p className="text-xs" style={{ color: "#7a9a98" }}>
                    {um.medicine?.type === 2 ? t.asNeeded : t.daily} · {t.from} {um.startedUsage}
                    {um.stoppedUsage ? ` · ${t.stopped} ${um.stoppedUsage}` : ""}
                  </p>
                </div>
                {!um.stoppedUsage && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#0f8a6a" }} />
                )}
              </div>
            ))}
          </div>
          <Divider />
        </>
      )}

      {/* GAD-7 — not tied to checkboxes (it's a questionnaire, not a calendar indicator) */}
      {gad7 && (
        <>
          <SectionHeader>{t.anxiety} · {gad7.date}</SectionHeader>
          <div className="px-5 pb-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: "#7a9a98" }}>{t.anxietySum}</span>
              <span
                className="text-sm font-bold px-3 py-0.5 rounded-full"
                style={{ background: `${gad7Color}18`, color: gad7Color, border: `1px solid ${gad7Color}40` }}
              >
                {gad7Sum} · {gad7Level}
              </span>
            </div>
            {GAD7_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs shrink-0" style={{ color: "#7a9a98", width: 148 }}>
                  {t[`gad7${key.charAt(0).toUpperCase()}${key.slice(1)}`] ?? key}
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(38,142,134,0.1)" }}>
                  <div className="h-full rounded-full" style={{ width: `${((gad7[key] ?? 0) / 3) * 100}%`, background: gad7Color }} />
                </div>
                <span className="text-xs w-3 text-right" style={{ color: "#7a9a98" }}>{gad7[key] ?? 0}</span>
              </div>
            ))}
          </div>
          <Divider />
        </>
      )}

      {/* Medicine satisfaction — not tied to checkboxes */}
      {medSat?.medicines?.length > 0 && (
        <>
          <SectionHeader>{t.medicineSatisfaction} · {medSat.date}</SectionHeader>
          <div className="px-5 pb-5 space-y-2">
            {medSat.medicines.map((ms) => {
              const med = patient.userMedicines?.find(um => um.medicineId === ms.medicineId)?.medicine;
              return (
                <div key={ms.medicineId} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#7a9a98" }}>{med?.name ?? `ID ${ms.medicineId}`}</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((star) => (
                      <span key={star} style={{ color: star <= ms.satisfaction ? "#f59e0b" : "#d1e8e6", fontSize: 14 }}>★</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}