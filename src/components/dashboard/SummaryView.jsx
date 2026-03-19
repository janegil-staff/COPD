"use client";
import { useFourMonths } from "@/hooks/useFourMonths";
import { MONTHS_SHORT_LOCALE } from "@/utils/locales";

const cardStyle = {
  background: "rgba(255,255,255,0.88)",
  border: "1px solid rgba(38,142,134,0.12)",
  backdropFilter: "blur(10px)",
};
const headerBorder = { borderBottom: "1px solid rgba(38,142,134,0.08)" };

function FourMonthIntro({ t }) {
  const { data, loading } = useFourMonths();
  if (loading) return <p className="text-sm text-gray-300 mb-4">{t.loading}</p>;

  const allDays = data.flatMap((m) => m.days);
  const painDays = allDays.filter((d) => d.symptoms?.average !== null).length;
  const acuteMeds = allDays.filter(
    (d) => d.symptoms?.seriousExacerbation,
  ).length;

  return (
    <div
      className="rounded-xl p-4 mb-6 text-sm leading-relaxed text-gray-700"
      style={{
        background: "#f0fdf9",
        border: "1px solid rgba(38,142,134,0.1)",
      }}
    >
      <span className="font-semibold" style={{ color: "#268E86" }}>
        {t.lastFourMonths}:{" "}
      </span>
      <span>{t.daysWithSymptoms}: </span>
      <span className="font-bold text-gray-800">{painDays}</span>.{" "}
      <span>{t.acuteMedication} </span>
      <span className="font-bold text-gray-800">{acuteMeds}</span>{" "}
      <span>{t.occasions}</span>.
    </div>
  );
}

function MonthlyTable({ t, lang }) {
  const { data, loading } = useFourMonths();
  const today = new Date();
  const monthsShort = MONTHS_SHORT_LOCALE[lang] ?? MONTHS_SHORT_LOCALE.en;

  if (loading)
    return (
      <div className="h-24 flex items-center justify-center text-gray-300 text-sm">
        {t.loading}
      </div>
    );

  return (
    <div>
      <div
        className="grid text-xs font-semibold uppercase tracking-widest text-gray-400 pb-2 mb-1 gap-2"
        style={{
          gridTemplateColumns: "130px 1fr 90px 70px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <span>{t.month}</span>
        <span>
          {t.daysWithSymptoms} ({t.mild} / {t.moderate} / {t.serious})
        </span>
        <span className="text-center">{t.medication}</span>
        <span className="text-right">{t.scoreHeader}</span>
      </div>

      {data.map(({ year, month, days }) => {
        const mild = days.filter(
          (d) => d.symptoms?.average !== null && d.symptoms.average <= 3,
        ).length;
        const moderate = days.filter(
          (d) => d.symptoms?.average > 3 && d.symptoms.average <= 6,
        ).length;
        const serious = days.filter((d) => d.symptoms?.average > 6).length;
        const total = mild + moderate + serious;
        const medication = days.filter((d) => d.symptoms?.medication).length;
        const score = mild * 1 + moderate * 2 + serious * 3;
        const isCurrentMonth =
          year === today.getFullYear() && month === today.getMonth();

        return (
          <div
            key={`${year}-${month}`}
            className="grid py-3 text-sm items-center gap-2"
            style={{
              gridTemplateColumns: "130px 1fr 90px 70px",
              borderBottom: "1px solid #f9f9f9",
              background: isCurrentMonth
                ? "rgba(38,142,134,0.03)"
                : "transparent",
            }}
          >
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              {monthsShort[month]} {year}
              {isCurrentMonth && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(38,142,134,0.1)",
                    color: "#268E86",
                  }}
                >
                  {t.current}
                </span>
              )}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-700">{total}</span>
              <span className="text-gray-400 text-xs">
                ( <span style={{ color: "#0f6e56" }}>{mild}</span> /{" "}
                <span style={{ color: "#854f0b" }}>{moderate}</span> /{" "}
                <span style={{ color: "#a32d2d" }}>{serious}</span> )
              </span>
              {total > 0 && (
                <div className="flex gap-0.5">
                  {mild > 0 && (
                    <div
                      className="h-3 rounded-sm"
                      style={{
                        width: Math.max(mild * 5, 4),
                        background: "#5dcaa5",
                      }}
                    />
                  )}
                  {moderate > 0 && (
                    <div
                      className="h-3 rounded-sm"
                      style={{
                        width: Math.max(moderate * 5, 4),
                        background: "#ef9f27",
                      }}
                    />
                  )}
                  {serious > 0 && (
                    <div
                      className="h-3 rounded-sm"
                      style={{
                        width: Math.max(serious * 5, 4),
                        background: "#e24b4a",
                      }}
                    />
                  )}
                </div>
              )}
            </div>
            <span className="text-center text-gray-600">{medication}</span>
            <span
              className="text-right font-mono font-bold"
              style={{
                color:
                  score > 20 ? "#a32d2d" : score > 10 ? "#854f0b" : "#0f6e56",
              }}
            >
              {score}
            </span>
          </div>
        );
      })}
      <p className="text-xs text-gray-300 mt-4">{t.scoreLabel}</p>
    </div>
  );
}

export default function SummaryView({ t, lang }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={cardStyle}>
      <div className="px-6 py-4" style={headerBorder}>
        <p
          className="font-bold text-base tracking-wide"
          style={{ color: "#268E86", fontFamily: "Georgia, serif" }}
        >
          {t.patientSummary}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{t.lastFourMonths}</p>
      </div>
      <div className="p-6">
        <FourMonthIntro t={t} />
        <MonthlyTable t={t} lang={lang} />
      </div>
    </div>
  );
}
