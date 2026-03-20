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

export default function CalendarPanel({ t, records, medicines, onDayClick, selectedDate }) {
  const recordMap = useMemo(() => {
    const map = {};
    (records || []).forEach((r) => { map[r.date] = r; });
    return map;
  }, [records]);

  const now = new Date();
  const [viewYear, setViewYear] = useState(() => {
    if (records?.length) return parseInt(records[records.length - 1].date.slice(0, 4));
    return now.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (records?.length) return parseInt(records[records.length - 1].date.slice(5, 7)) - 1;
    return now.getMonth();
  });

  const cells = buildCalendar(viewYear, viewMonth);
  const pad = (n) => String(n).padStart(2, "0");

  const months = t.months ?? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const days = t.days ?? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const monthRecords = Object.entries(recordMap)
    .filter(([d]) => d.startsWith(`${viewYear}-${pad(viewMonth + 1)}`))
    .map(([, r]) => r);

  const counts = {
    low:      monthRecords.filter(r => r.cat8 <= 10).length,
    medium:   monthRecords.filter(r => r.cat8 > 10 && r.cat8 <= 20).length,
    high:     monthRecords.filter(r => r.cat8 > 20 && r.cat8 <= 30).length,
    veryHigh: monthRecords.filter(r => r.cat8 > 30).length,
    exacerbations: monthRecords.filter(r => r.moderateExacerbations || r.seriousExacerbations).length,
    filled: monthRecords.length,
  };

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-all" style={{ color: "#268E86", fontSize: 20 }}>‹</button>
        <h2 className="text-xl font-bold tracking-wide" style={{ color: "#1a3a38", fontFamily: "'Playfair Display', Georgia, serif" }}>
          {months[viewMonth]} {viewYear}
        </h2>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-all" style={{ color: "#268E86", fontSize: 20 }}>›</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {days.map((d) => (
          <div key={d} className="text-center text-xs font-semibold py-2 tracking-wider uppercase" style={{ color: "#a0b8b6" }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
          const record = recordMap[dateStr];
          const c = CAT_COLOR(record?.cat8);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
          const hasExacerbation = record?.moderateExacerbations || record?.seriousExacerbations;
          const hasNote = record?.note?.trim();
          const hasMeds = record?.medicines?.length > 0;

          return (
            <button
              key={dateStr}
              onClick={() => record && onDayClick(record)}
              disabled={!record}
              className="relative flex flex-col items-center justify-center rounded-xl transition-all"
              style={{
                aspectRatio: "1",
                minHeight: 54,
                background: isSelected ? "#268E86" : record ? c.bg : "transparent",
                border: isSelected ? "2px solid #268E86"
                  : isToday && !record ? "1.5px solid rgba(38,142,134,0.4)"
                  : record ? `1px solid ${c.border}` : "1px solid transparent",
                cursor: record ? "pointer" : "default",
                boxShadow: isSelected ? "0 2px 12px rgba(38,142,134,0.25)" : "none",
              }}
            >
              <span className="text-xs font-semibold leading-none" style={{ color: isSelected ? "#fff" : record ? c.text : "#c8d8d6", fontSize: 12 }}>{day}</span>
              {record && (
                <span className="font-bold leading-none mt-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.9)" : c.text, fontSize: 15 }}>
                  {record.cat8}
                </span>
              )}
              {record && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasExacerbation && <div className="w-1 h-1 rounded-full" style={{ background: isSelected ? "#fff" : "#ef4444" }} />}
                  {hasNote && <div className="w-1 h-1 rounded-full" style={{ background: isSelected ? "#fff" : "#8b5cf6" }} />}
                  {hasMeds && <div className="w-1 h-1 rounded-full" style={{ background: isSelected ? "#fff" : "#0ea5e9" }} />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Dot legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4" style={{ borderTop: "1px solid rgba(38,142,134,0.1)" }}>
        {[["#ef4444", t.exacerbation], ["#8b5cf6", t.notes], ["#0ea5e9", t.medication]].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-xs" style={{ color: "#7a9a98" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Monthly summary */}
      <div className="mt-5 rounded-xl p-4 grid grid-cols-2 gap-3" style={{ background: "rgba(38,142,134,0.05)", border: "1px solid rgba(38,142,134,0.12)" }}>
        <p className="col-span-2 text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#268E86" }}>
          {t.monthlySummary}
        </p>
        {[
          [t.filledDays,     counts.filled,      "#268E86"],
          [t.exacerbation,   counts.exacerbations,"#ef4444"],
          [t.lowImpact,      counts.low,          "#0f8a6a"],
          [t.mediumImpact,   counts.medium,       "#a16200"],
          [t.highImpact,     counts.high,         "#c05400"],
          [t.veryHighImpact, counts.veryHigh,     "#b91c1c"],
        ].map(([label, val, color]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "#7a9a98" }}>{label}</span>
            <span className="text-sm font-bold" style={{ color }}>{val}</span>
          </div>
        ))}
      </div>

      {/* All records list */}
      {records?.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#a0b8b6" }}>
            {t.allRecords}
          </p>
          <div className="space-y-1.5">
            {[...records].reverse().map((r) => {
              const c = CAT_COLOR(r.cat8);
              const isActive = selectedDate === r.date;
              return (
                <button
                  key={r.date}
                  onClick={() => onDayClick(r)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all hover:shadow-sm"
                  style={{
                    background: isActive ? "rgba(38,142,134,0.08)" : "rgba(38,142,134,0.03)",
                    border: `1px solid ${isActive ? "rgba(38,142,134,0.3)" : "rgba(38,142,134,0.1)"}`,
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: "#4a7a78" }}>{r.date}</span>
                  <div className="flex items-center gap-3">
                    {r.weight != null && <span className="text-xs" style={{ color: "#a0b8b6" }}>⚖ {r.weight} kg</span>}
                    {r.physicalActivity > 0 && <span className="text-xs" style={{ color: "#a0b8b6" }}>🚶 {r.physicalActivity} min</span>}
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                      {t.catScore} {r.cat8}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}