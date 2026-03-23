"use client";
import { useState, useMemo } from "react";

const CAT_COLOR = (score) => {
  if (score === null || score === undefined)
    return { bg: "transparent", text: "#b0c4c2", border: "transparent" };
  if (score <= 10) return { bg: "#edfaf6", text: "#0f8a6a", border: "#a8e6d4" };
  if (score <= 20) return { bg: "#fefbe8", text: "#a16200", border: "#f6df85" };
  if (score <= 30) return { bg: "#fff4ed", text: "#c05400", border: "#fdc99a" };
  return { bg: "#fff0f0", text: "#b91c1c", border: "#fca5a5" };
};

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function Checkbox({ checked, onChange, label, color }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={onChange}
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: checked ? color : "transparent",
          border: `1.5px solid ${checked ? color : "#c8dedd"}`,
          boxShadow: checked ? `0 0 0 2px ${color}22` : "none",
        }}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.5 6L8 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span
        className="text-xs font-medium"
        style={{ color: checked ? "#1a3a38" : "#a0b8b6" }}
      >
        {label}
      </span>
    </label>
  );
}

// show and onToggleShow come from page.js (lifted state)
export default function CalendarPanel({
  t,
  records,
  medicines,
  onDayClick,
  selectedDate,
  show,
  onToggleShow,
}) {
  const recordMap = useMemo(() => {
    const map = {};
    (records || []).forEach((r) => {
      map[r.date] = r;
    });
    return map;
  }, [records]);

  // weekMap: for every date, find the record whose Mon–Sun week contains it
  const weekMap = useMemo(() => {
    const map = {};

    // Parse YYYY-MM-DD safely without timezone shifting
    const parseLocal = (dateStr) => {
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d); // local midnight — no UTC offset
    };

    const toKey = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    (records || []).forEach((r) => {
      const d = parseLocal(r.date);
      const dow = (d.getDay() + 6) % 7; // 0=Mon … 6=Sun
      for (let i = 0; i < 7; i++) {
        const dd = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate() - dow + i,
        );
        const key = toKey(dd);
        if (!map[key]) map[key] = r;
      }
    });
    // Exact record dates always win
    (records || []).forEach((r) => {
      map[r.date] = r;
    });
    return map;
  }, [records]);

  const now = new Date();
  const [viewYear, setViewYear] = useState(() => {
    if (records?.length)
      return parseInt(records[records.length - 1].date.slice(0, 4));
    return now.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (records?.length)
      return parseInt(records[records.length - 1].date.slice(5, 7)) - 1;
    return now.getMonth();
  });

  const cells = buildCalendar(viewYear, viewMonth);
  const pad = (n) => String(n).padStart(2, "0");
  const months = t.monthNames ?? [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = t.days ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const monthRecords = Object.entries(recordMap)
    .filter(([d]) => d.startsWith(`${viewYear}-${pad(viewMonth + 1)}`))
    .map(([, r]) => r);

  const counts = {
    low: monthRecords.filter((r) => r.cat8 != null && r.cat8 <= 10).length,
    medium: monthRecords.filter(
      (r) => r.cat8 != null && r.cat8 > 10 && r.cat8 <= 20,
    ).length,
    high: monthRecords.filter(
      (r) => r.cat8 != null && r.cat8 > 20 && r.cat8 <= 30,
    ).length,
    veryHigh: monthRecords.filter((r) => r.cat8 != null && r.cat8 > 30).length,
    exacerbations: monthRecords.filter(
      (r) => r.moderateExacerbations || r.seriousExacerbations,
    ).length,
    filled: monthRecords.length,
  };

  const checkboxes = [
    { key: "medicine", label: t.showMedicine, color: "#0ea5e9" },
    { key: "note", label: t.showNote, color: "#8b5cf6" },
    { key: "activity", label: t.showActivity, color: "#0f8a6a" },
    { key: "weight", label: t.showWeight, color: "#a16200" },
  ];

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
          style={{ color: "#268E86", fontSize: 18 }}
        >
          ‹
        </button>
        <h2
          className="text-lg font-bold tracking-wide"
          style={{
            color: "#1a3a38",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {months[viewMonth]} {viewYear}
        </h2>
        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
          style={{ color: "#268E86", fontSize: 18 }}
        >
          ›
        </button>
      </div>

      {/* Week rows — one bar per week */}
      <div className="space-y-1">
        {(() => {
          // Build week rows from ISO weeks that overlap with this month
          const rows = [];
          const seen = new Set();

          // Iterate every day of the month, collect unique ISO weeks
          const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
          for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(viewYear, viewMonth, d);
            const dow = (date.getDay() + 6) % 7; // 0=Mon
            const mon = new Date(viewYear, viewMonth, d - dow);
            const monKey = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`;
            if (seen.has(monKey)) continue;
            seen.add(monKey);

            // ISO week number
            const thu = new Date(
              mon.getFullYear(),
              mon.getMonth(),
              mon.getDate() + 3,
            );
            const jan4 = new Date(thu.getFullYear(), 0, 4);
            const wn = 1 + Math.round((thu - jan4) / 604800000);

            // Find record via weekMap using the Monday date
            const record = weekMap[monKey];
            const isSelected = record && selectedDate === record.date;

            const showExDot =
              show.exacerbation &&
              record &&
              (record.moderateExacerbations || record.seriousExacerbations);
            const showNoteDot = show.note && record?.note?.trim();
            const showMedDot = show.medicine && record?.medicines?.length > 0;
            const showActDot = show.activity && record?.physicalActivity > 0;
            const showWtDot = show.weight && record?.weight != null;
            const anyDot =
              showExDot || showNoteDot || showMedDot || showActDot || showWtDot;

            const bgColor = record
              ? record.cat8 == null
                ? "rgba(38,142,134,0.08)"
                : record.cat8 <= 10
                  ? "#4CC189"
                  : record.cat8 <= 20
                    ? "#FFC659"
                    : record.cat8 <= 30
                      ? "#FF7473"
                      : "#BE3830"
              : "rgba(38,142,134,0.03)";
            const stripeColor = isSelected
              ? "#0f6b63"
              : record
                ? record.cat8 == null
                  ? "rgba(38,142,134,0.2)"
                  : record.cat8 <= 10
                    ? "#2e9e68"
                    : record.cat8 <= 20
                      ? "#c99500"
                      : record.cat8 <= 30
                        ? "#cc4040"
                        : "#8a2020"
                : "rgba(38,142,134,0.08)";

            rows.push(
              <div
                key={monKey}
                role="button"
                tabIndex={record ? 0 : -1}
                onClick={() => record && onDayClick(record)}
                onKeyDown={(e) =>
                  e.key === "Enter" && record && onDayClick(record)
                }
                className="w-full flex flex-col rounded-xl transition-all overflow-hidden"
                style={{
                  background: bgColor,
                  border: "none",
                  cursor: record ? "pointer" : "default",
                  boxShadow: record ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                  paddingLeft: 8,
                  paddingRight: 10,
                  paddingTop: 3,
                  paddingBottom: 3,
                  gap: 1,
                  color: record ? "#1a1a1a" : "#a0b8b6",
                  WebkitTextFillColor: record ? "#1a1a1a" : "#a0b8b6",
                }}
              >
                {/* Day numbers Mon–Sun */}
                <div
                  className="flex items-center justify-between w-full"
                  style={{ direction: "ltr" }}
                >
                  {Array.from({ length: 7 }).map((_, di) => {
                    const dd = new Date(
                      mon.getFullYear(),
                      mon.getMonth(),
                      mon.getDate() + di,
                    );
                    const inMonth = dd.getMonth() === viewMonth;
                    const dayNum = dd.getDate();
                    const isToday = dd.toDateString() === now.toDateString();
                    return (
                      <div
                        key={di}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          background:
                            isToday && record
                              ? "rgba(0,0,0,0.12)"
                              : "transparent",
                          border:
                            isToday && record
                              ? "1.5px solid rgba(0,0,0,0.5)"
                              : "none",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: isToday ? 900 : 700,
                            color: record
                              ? record.cat8 == null
                                ? inMonth
                                  ? "rgba(38,142,134,0.5)"
                                  : "rgba(38,142,134,0.25)"
                                : inMonth
                                  ? "#1a1a1a"
                                  : "rgba(0,0,0,0.3)"
                              : inMonth
                                ? "#a0b8b6"
                                : "#d0e0de",
                            lineHeight: 1,
                          }}
                        >
                          {dayNum}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>,
            );
          }
          return rows;
        })()}
      </div>

      {/* Visibility checkboxes */}
      <div
        className="mt-4 rounded-xl px-4 py-3"
        style={{
          background: "rgba(38,142,134,0.03)",
          border: "1px solid rgba(38,142,134,0.1)",
        }}
      >
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ color: "#7a9a98" }}
        >
          {t.showIn}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
          {checkboxes.map(({ key, label, color }) => (
            <Checkbox
              key={key}
              checked={show[key]}
              onChange={() => onToggleShow(key)}
              label={label}
              color={color}
            />
          ))}
        </div>
      </div>

      {/* Monthly summary */}
      <div
        className="mt-5 rounded-xl overflow-hidden"
        style={{
          background: "#fff",
          border: "1px solid rgba(38,142,134,0.14)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <div
          className="px-4 pt-3 pb-2"
          style={{ borderBottom: "1px solid rgba(38,142,134,0.08)" }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#268E86" }}
          >
            {t.monthlySummary}
          </p>
        </div>

        {[
          {
            icon: "⬤",
            iconColor:
              counts.filled === 0
                ? "#a0b8b6"
                : monthRecords.length &&
                    monthRecords.reduce((s, r) => s + (r.cat8 ?? 0), 0) /
                      monthRecords.length <=
                      10
                  ? "#4CC189"
                  : monthRecords.reduce((s, r) => s + (r.cat8 ?? 0), 0) /
                        monthRecords.length <=
                      20
                    ? "#FFC659"
                    : monthRecords.reduce((s, r) => s + (r.cat8 ?? 0), 0) /
                          monthRecords.length <=
                        30
                      ? "#FF7473"
                      : "#BE3830",
            label: t.avgSymptoms,
            value: counts.filled
              ? Math.round(
                  monthRecords.reduce((s, r) => s + (r.cat8 ?? 0), 0) /
                    monthRecords.length,
                )
              : "–",
          },
          {
            icon: "⚠",
            iconColor: "#f97316",
            label: t.moderateExacerbation,
            value: counts.exacerbations,
          },
          {
            icon: "⚠",
            iconColor: "#ef4444",
            label: t.seriousExacerbation,
            value: monthRecords.filter((r) => r.seriousExacerbations).length,
          },
          {
            icon: "🏃",
            iconColor: "#268E86",
            label: t.physicalActivity,
            value: (() => {
              const vals = monthRecords.filter((r) => r.physicalActivity > 0);
              if (!vals.length) return "–";
              const avg = Math.round(
                vals.reduce((s, r) => s + r.physicalActivity, 0) / vals.length,
              );
              return t.activityLabels?.[avg] ?? avg;
            })(),
          },
          {
            icon: "💊",
            iconColor: "#0ea5e9",
            label: t.weeksWithMedicine ?? t.medicines,
            value: monthRecords.filter((r) => r.medicines?.length > 0).length,
          },
        ].map(({ icon, iconColor, label, value }) => (
          <div
            key={label}
            className="flex items-center px-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(38,142,134,0.06)" }}
          >
            <span className="w-6 text-base" style={{ color: iconColor }}>
              {icon}
            </span>
            <span className="flex-1 text-sm ml-2" style={{ color: "#4a7a78" }}>
              {label}
            </span>
            <span className="text-sm font-bold" style={{ color: "#b91c1c" }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
