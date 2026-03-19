"use client";
import { useEffect, useState } from "react";
import { severityColor } from "@/utils/severityColor";
import { DAYS_LOCALE, MONTHS_LOCALE } from "@/utils/locales";

const USER_ID = "69bc130abdcd059844b6ed1d";
const cardStyle = {
  background: "rgba(255,255,255,0.88)",
  border: "1px solid rgba(38,142,134,0.12)",
  backdropFilter: "blur(10px)",
};
const headerBorder = { borderBottom: "1px solid rgba(38,142,134,0.08)" };

export default function CalendarView({ t, lang }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [days, setDays] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const DAYS = DAYS_LOCALE[lang] ?? DAYS_LOCALE.en;
  const MONTHS = MONTHS_LOCALE[lang] ?? MONTHS_LOCALE.en;

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    fetch(`/api/symptoms?userId=${USER_ID}&year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        setDays(data.days ?? []);
        setLoading(false);
      })
      .catch(console.error);
  }, [year, month]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  function getDayData(dayNum) {
    const d = new Date(year, month, dayNum);
    return days.find((entry) => {
      const ed = new Date(entry.date);
      return (
        ed.getFullYear() === d.getFullYear() &&
        ed.getMonth() === d.getMonth() &&
        ed.getDate() === d.getDate()
      );
    });
  }

  const isToday = (dayNum) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === dayNum;

  return (
    <>
      <div className="rounded-2xl overflow-hidden shadow-sm" style={cardStyle}>
        <div
          className="flex items-center justify-between px-6 py-4"
          style={headerBorder}
        >
          <button
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-gray-100 text-gray-400 text-lg"
          >
            ‹
          </button>
          <div className="text-center">
            <p
              className="font-bold text-base tracking-wide"
              style={{ color: "#268E86", fontFamily: "Georgia, serif" }}
            >
              {MONTHS[month]}
            </p>
            <p className="text-xs text-gray-400">{year}</p>
          </div>
          <button
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-gray-100 text-gray-400 text-lg"
          >
            ›
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 px-1">
            {[
              { color: "#e6f7f5", border: "#5dcaa5", label: t.mild },
              { color: "#faeeda", border: "#ef9f27", label: t.moderate },
              { color: "#fcebeb", border: "#e24b4a", label: t.serious },
              { color: "#268E86", label: t.exacerbation, dot: true },
              { color: "#6366f1", label: t.medication, dot: true },
              { color: "#34d399", label: t.activity, dot: true },
            ].map(({ color, border, label, dot }) => (
              <div key={label} className="flex items-center gap-1.5">
                {dot ? (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: color }}
                  />
                ) : (
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: color, border: `1px solid ${border}` }}
                  />
                )}
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-gray-300 uppercase py-1 tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm tracking-widest uppercase">
              {t.loading}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                (dayNum) => {
                  const data = getDayData(dayNum);
                  const s = data?.symptoms;
                  const colors = s ? severityColor(s.average) : null;
                  const todayCell = isToday(dayNum);
                  const isSelected = selected?.day === dayNum;

                  return (
                    <button
                      key={dayNum}
                      onClick={() =>
                        setSelected(isSelected ? null : { day: dayNum, data })
                      }
                      className="rounded-xl flex flex-col items-center justify-start pt-1.5 pb-1 gap-1 transition-all hover:scale-105 active:scale-95"
                      style={{
                        minHeight: 52,
                        background: isSelected
                          ? "rgba(38,142,134,0.1)"
                          : colors
                            ? colors.bg
                            : "#fafafa",
                        border: todayCell
                          ? "2px solid #268E86"
                          : isSelected
                            ? "2px solid rgba(38,142,134,0.3)"
                            : "2px solid transparent",
                      }}
                    >
                      <span
                        className="text-xs font-bold leading-none"
                        style={{
                          color: todayCell
                            ? "#268E86"
                            : colors
                              ? colors.text
                              : "#9ca3af",
                        }}
                      >
                        {dayNum}
                      </span>
                      {s && (
                        <div className="flex gap-0.5 justify-center flex-wrap px-1">
                          {(s.moderateExacerbation ||
                            s.seriousExacerbation) && (
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background: s.seriousExacerbation
                                  ? "#e24b4a"
                                  : "#268E86",
                              }}
                            />
                          )}
                          {s.medication && (
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: "#6366f1" }}
                            />
                          )}
                          {s.physicalActivity > 0 && (
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: "#34d399" }}
                            />
                          )}
                        </div>
                      )}
                    </button>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div
          className="mt-3 rounded-2xl overflow-hidden shadow-sm"
          style={cardStyle}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={headerBorder}
          >
            <p
              className="font-bold text-sm tracking-wide"
              style={{ color: "#268E86", fontFamily: "Georgia, serif" }}
            >
              {MONTHS[month]} {selected.day}, {year}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-300 transition-all"
            >
              ×
            </button>
          </div>
          <div className="p-5">
            {selected.data ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  {
                    label: t.avgSymptoms,
                    value:
                      selected.data.symptoms.average !== null
                        ? `${selected.data.symptoms.average} / 10`
                        : "—",
                    color:
                      severityColor(selected.data.symptoms.average)?.bg ??
                      "#f4f4f4",
                    dot:
                      severityColor(selected.data.symptoms.average)?.text ??
                      "#9ca3af",
                  },
                  {
                    label: t.moderateExacerbation,
                    value: selected.data.symptoms.moderateExacerbation
                      ? "✓"
                      : "✗",
                    color: selected.data.symptoms.moderateExacerbation
                      ? "#e6f7f5"
                      : "#fafafa",
                    dot: selected.data.symptoms.moderateExacerbation
                      ? "#268E86"
                      : "#d1d5db",
                  },
                  {
                    label: t.seriousExacerbation,
                    value: selected.data.symptoms.seriousExacerbation
                      ? "✓"
                      : "✗",
                    color: selected.data.symptoms.seriousExacerbation
                      ? "#fcebeb"
                      : "#fafafa",
                    dot: selected.data.symptoms.seriousExacerbation
                      ? "#e24b4a"
                      : "#d1d5db",
                  },
                  {
                    label: t.physicalActivity,
                    value:
                      selected.data.symptoms.physicalActivity !== null
                        ? `${selected.data.symptoms.physicalActivity} / 10`
                        : "—",
                    color: "#f0fdf4",
                    dot: "#34d399",
                  },
                  {
                    label: t.medication,
                    value: selected.data.symptoms.medication ? "✓" : "✗",
                    color: selected.data.symptoms.medication
                      ? "#eef2ff"
                      : "#fafafa",
                    dot: selected.data.symptoms.medication
                      ? "#6366f1"
                      : "#d1d5db",
                  },
                ].map(({ label, value, color, dot }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3"
                    style={{ background: color }}
                  >
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                      {label}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: dot }}
                      />
                      <p className="text-sm font-bold text-gray-700">{value}</p>
                    </div>
                  </div>
                ))}
                {selected.data.notes && (
                  <div
                    className="col-span-2 sm:col-span-3 rounded-xl p-3"
                    style={{ background: "#f9fafb" }}
                  >
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                      {t.notes}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selected.data.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-300 text-center py-4 tracking-wide">
                {t.noData}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
