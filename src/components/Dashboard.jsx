// src/components/Dashboard.jsx
"use client";

import { useEffect, useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function severityColor(value) {
  if (value === null || value === undefined) return null;
  if (value <= 3) return { bg: "#e6f7f5", text: "#0f6e56" };
  if (value <= 6) return { bg: "#faeeda", text: "#854f0b" };
  return { bg: "#fcebeb", text: "#a32d2d" };
}

export default function Dashboard() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [days, setDays] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    fetch(
      `/api/symptoms?userId=69bc130abdcd059844b6ed1d&year=${year}&month=${month}`,
    )
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
    <div>
      {/* Calendar card */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{
          background: "rgba(255,255,255,0.88)",
          border: "1px solid rgba(38,142,134,0.12)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Month navigation */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(38,142,134,0.08)" }}
        >
          <button
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-gray-100 text-gray-400 text-lg font-light"
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
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-gray-100 text-gray-400 text-lg font-light"
          >
            ›
          </button>
        </div>

        <div className="px-4 py-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 px-1">
            {[
              { color: "#e6f7f5", border: "#5dcaa5", label: "Mild" },
              { color: "#faeeda", border: "#ef9f27", label: "Moderate" },
              { color: "#fcebeb", border: "#e24b4a", label: "Serious" },
              { color: "#268E86", label: "Exacerbation", dot: true },
              { color: "#6366f1", label: "Medication", dot: true },
              { color: "#34d399", label: "Activity", dot: true },
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

          {/* Day headers */}
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

          {/* Grid */}
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm tracking-widest uppercase">
              Loading...
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

      {/* Day detail panel */}
      {selected && (
        <div
          className="mt-3 rounded-2xl overflow-hidden shadow-sm"
          style={{
            background: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(38,142,134,0.12)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid rgba(38,142,134,0.08)" }}
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
                    label: "Avg symptoms",
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
                    label: "Moderate exacerbation",
                    value: selected.data.symptoms.moderateExacerbation
                      ? "Yes"
                      : "No",
                    color: selected.data.symptoms.moderateExacerbation
                      ? "#e6f7f5"
                      : "#fafafa",
                    dot: selected.data.symptoms.moderateExacerbation
                      ? "#268E86"
                      : "#d1d5db",
                  },
                  {
                    label: "Serious exacerbation",
                    value: selected.data.symptoms.seriousExacerbation
                      ? "Yes"
                      : "No",
                    color: selected.data.symptoms.seriousExacerbation
                      ? "#fcebeb"
                      : "#fafafa",
                    dot: selected.data.symptoms.seriousExacerbation
                      ? "#e24b4a"
                      : "#d1d5db",
                  },
                  {
                    label: "Physical activity",
                    value:
                      selected.data.symptoms.physicalActivity !== null
                        ? `${selected.data.symptoms.physicalActivity} / 10`
                        : "—",
                    color: "#f0fdf4",
                    dot: "#34d399",
                  },
                  {
                    label: "Medication",
                    value: selected.data.symptoms.medication
                      ? "Taken"
                      : "Not taken",
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

                {selected.data.notes ? (
                  <div
                    className="col-span-2 sm:col-span-3 rounded-xl p-3"
                    style={{ background: "#f9fafb" }}
                  >
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-gray-600">
                      {selected.data.notes}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-gray-300 text-center py-4 tracking-wide">
                No data recorded for this day.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
