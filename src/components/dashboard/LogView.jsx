"use client";
import { useFullYear } from "@/hooks/useFullYear";
import { severityColor } from "@/utils/severityColor";
import { MONTHS_SHORT_LOCALE } from "@/utils/locales";

const cardStyle = {
  background: "rgba(255,255,255,0.88)",
  border: "1px solid rgba(38,142,134,0.12)",
  backdropFilter: "blur(10px)",
};
const headerBorder = { borderBottom: "1px solid rgba(38,142,134,0.08)" };

export default function LogView({ t, lang }) {
  const { allDays, logLoading } = useFullYear();
  const today = new Date();
  const MONTHS_SHORT = MONTHS_SHORT_LOCALE[lang] ?? MONTHS_SHORT_LOCALE.en;

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={cardStyle}>
      <div className="px-6 py-4" style={headerBorder}>
        <p
          className="font-bold text-base tracking-wide"
          style={{ color: "#268E86", fontFamily: "Georgia, serif" }}
        >
          {t.symptomLog} {today.getFullYear()}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {allDays.length} {t.entries}
        </p>
      </div>

      {logLoading ? (
        <div className="h-32 flex items-center justify-center text-gray-300 text-sm">
          {t.loading}
        </div>
      ) : allDays.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-gray-300 text-sm">
          {t.noEntries}
        </div>
      ) : (
        <table
          className="w-full"
          style={{ fontSize: 12, tableLayout: "fixed" }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(38,142,134,0.08)" }}>
              <th
                className="px-2 py-2 text-left text-gray-400 font-semibold uppercase tracking-wider"
                style={{ width: "8%" }}
              >
                Dato
              </th>
              <th
                className="px-2 py-2 text-center text-gray-400 font-semibold uppercase tracking-wider"
                style={{ width: "14%" }}
              >
                {t.avgSymptoms}
              </th>
              <th
                className="px-2 py-2 text-center text-gray-400 font-semibold uppercase tracking-wider"
                style={{ width: "14%" }}
              >
                {t.moderate}
              </th>
              <th
                className="px-2 py-2 text-center text-gray-400 font-semibold uppercase tracking-wider"
                style={{ width: "14%" }}
              >
                {t.serious}
              </th>
              <th
                className="px-2 py-2 text-center text-gray-400 font-semibold uppercase tracking-wider"
                style={{ width: "12%" }}
              >
                {t.activity}
              </th>
              <th
                className="px-2 py-2 text-center text-gray-400 font-semibold uppercase tracking-wider"
                style={{ width: "12%" }}
              >
                {t.medication}
              </th>
              <th
                className="px-2 py-2 text-left text-gray-400 font-semibold uppercase tracking-wider"
                style={{ width: "26%" }}
              >
                {t.notes}
              </th>
            </tr>
          </thead>
          <tbody>
            {allDays.map((entry, i) => {
              const d = new Date(entry.date);
              const s = entry.symptoms;
              const colors = severityColor(s.average);
              return (
                <tr
                  key={entry._id}
                  style={{
                    background:
                      i % 2 === 0 ? "rgba(248,250,252,0.6)" : "transparent",
                    borderBottom: "1px solid rgba(38,142,134,0.04)",
                  }}
                >
                  <td
                    className="px-2 py-2 font-bold"
                    style={{ color: "#268E86" }}
                  >
                    {d.getDate()}{" "}
                    <span className="font-normal text-gray-400">
                      {MONTHS_SHORT[d.getMonth()]}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span
                      className="px-1.5 py-0.5 rounded font-bold"
                      style={{
                        background: colors?.bg ?? "#f4f4f4",
                        color: colors?.text ?? "#9ca3af",
                      }}
                    >
                      {s.average !== null ? s.average : "—"}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center">
                    {s.moderateExacerbation ? (
                      <span style={{ color: "#268E86" }}>{t.moderate}</span>
                    ) : (
                      <span className="text-gray-200">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {s.seriousExacerbation ? (
                      <span style={{ color: "#e24b4a" }}>{t.serious}</span>
                    ) : (
                      <span className="text-gray-200">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {s.physicalActivity > 0 ? (
                      <span style={{ color: "#166534" }}>
                        {s.physicalActivity}
                      </span>
                    ) : (
                      <span className="text-gray-200">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {s.medication ? (
                      <span style={{ color: "#4338ca" }}>✓</span>
                    ) : (
                      <span className="text-gray-200">—</span>
                    )}
                  </td>
                  <td
                    className="px-2 py-2 text-gray-400 italic"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.notes || ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
