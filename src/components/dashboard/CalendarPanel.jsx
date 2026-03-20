"use client";
import { useState, useMemo, useRef, useEffect } from "react";

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
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-xs font-medium" style={{ color: checked ? "#1a3a38" : "#a0b8b6" }}>
        {label}
      </span>
    </label>
  );
}

// show and onToggleShow come from page.js (lifted state)
export default function CalendarPanel({ t, records, medicines, onDayClick, selectedDate, show, onToggleShow }) {
  const recordMap = useMemo(() => {
    const map = {};
    (records || []).forEach((r) => { map[r.date] = r; });
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
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

    (records || []).forEach((r) => {
      const d   = parseLocal(r.date);
      const dow = (d.getDay() + 6) % 7; // 0=Mon … 6=Sun
      for (let i = 0; i < 7; i++) {
        const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + i);
        const key = toKey(dd);
        if (!map[key]) map[key] = r;
      }
    });
    // Exact record dates always win
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

  const cells  = buildCalendar(viewYear, viewMonth);
  const pad    = (n) => String(n).padStart(2, "0");
  const months = t.months ?? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const days   = t.days   ?? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

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
    low:           monthRecords.filter(r => r.cat8 <= 10).length,
    medium:        monthRecords.filter(r => r.cat8 > 10 && r.cat8 <= 20).length,
    high:          monthRecords.filter(r => r.cat8 > 20 && r.cat8 <= 30).length,
    veryHigh:      monthRecords.filter(r => r.cat8 > 30).length,
    exacerbations: monthRecords.filter(r => r.moderateExacerbations || r.seriousExacerbations).length,
    filled:        monthRecords.length,
  };

  const checkboxes = [
    { key: "catScore",     label: t.showCatScore,     color: "#268E86" },
    { key: "exacerbation", label: t.showExacerbation, color: "#ef4444" },
    { key: "medicine",     label: t.showMedicine,     color: "#0ea5e9" },
    { key: "note",         label: t.showNote,         color: "#8b5cf6" },
    { key: "activity",     label: t.showActivity,     color: "#0f8a6a" },
    { key: "weight",       label: t.showWeight,       color: "#a16200" },
  ];

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-all" style={{ color: "#268E86", fontSize: 18 }}>‹</button>
        <h2 className="text-lg font-bold tracking-wide" style={{ color: "#1a3a38", fontFamily: "'Playfair Display', Georgia, serif" }}>
          {months[viewMonth]} {viewYear}
        </h2>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-all" style={{ color: "#268E86", fontSize: 18 }}>›</button>
      </div>

      {/* Day headers — 8 cols: week number + 7 days */}
      <div className="grid mb-1" style={{ gridTemplateColumns: "24px repeat(7, 1fr)" }}>
        <div /> {/* empty corner above week numbers */}
        {days.map((d) => (
          <div key={d} className="text-center py-1 tracking-wider uppercase" style={{ color: "#a0b8b6", fontSize: 10, fontWeight: 600 }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid — 8 cols: week number + 7 day circles */}
      <div style={{ display: "grid", gridTemplateColumns: "24px repeat(7, 1fr)", gap: 3 }}>
        {(() => {
          const rows = [];
          let i = 0;
          while (i < cells.length) {
            const weekCells = cells.slice(i, i + 7);
            // Calculate ISO week number from the first real day in this row
            const firstDay = weekCells.find(d => d !== null);
            let weekNum = null;
            if (firstDay !== null && firstDay !== undefined) {
              const d = new Date(viewYear, viewMonth, firstDay);
              // ISO week: Thursday of current week's year
              const thu = new Date(d);
              thu.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
              const jan4 = new Date(thu.getFullYear(), 0, 4);
              weekNum = 1 + Math.round((thu - jan4) / 604800000);
            }

            rows.push(
              // Week number label
              <div
                key={`wn-${i}`}
                className="flex items-start justify-center pt-1"
                style={{ color: "#b8cccb", fontSize: 9, fontWeight: 600, userSelect: "none" }}
              >
                {weekNum !== null ? weekNum : ""}
              </div>
            );

            // 7 day cells for this row
            weekCells.forEach((day, j) => {
              const cellIndex = i + j;
              if (!day) {
                rows.push(<div key={`e-${cellIndex}`} />);
                return;
              }
              const dateStr   = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
              const record    = weekMap[dateStr];
              const isExact   = !!recordMap[dateStr];
              const c         = CAT_COLOR(record?.cat8);
              const isSelected = selectedDate === record?.date;
              const isToday   = dateStr === `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;

              const showExDot   = show.exacerbation && isExact && (recordMap[dateStr]?.moderateExacerbations || recordMap[dateStr]?.seriousExacerbations);
              const showNoteDot = show.note     && isExact && recordMap[dateStr]?.note?.trim();
              const showMedDot  = show.medicine && isExact && recordMap[dateStr]?.medicines?.length > 0;
              const anyDot      = showExDot || showNoteDot || showMedDot;

              rows.push(
                <div key={dateStr} className="flex flex-col items-center" style={{ gap: 2 }}>
                  <button
                    onClick={() => record && onDayClick(record)}
                    disabled={!record}
                    className="flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      width: 32, height: 32,
                      borderRadius: "50%",
                      background: isSelected ? "#268E86" : record ? c.bg : "transparent",
                      border: isSelected
                        ? "2px solid #268E86"
                        : isExact
                        ? `2px solid ${c.border}`
                        : record
                        ? `1px solid ${c.border}`
                        : isToday
                        ? "1px solid rgba(38,142,134,0.35)"
                        : "1px solid transparent",
                      cursor: record ? "pointer" : "default",
                      opacity: record && !isExact ? 0.6 : 1,
                      flexShrink: 0,
                    }}
                  >
                    <div className="flex flex-col items-center" style={{ gap: 1 }}>
                      <span style={{
                        color: isSelected ? "#fff" : record ? c.text : "#c8d8d6",
                        fontSize: isExact ? 10 : 9,
                        fontWeight: isExact ? 700 : 400,
                        lineHeight: 1,
                      }}>
                        {day}
                      </span>
                      {isExact && show.catScore && (
                        <span style={{ color: isSelected ? "rgba(255,255,255,0.85)" : c.text, fontSize: 9, fontWeight: 700, lineHeight: 1 }}>
                          {record.cat8}
                        </span>
                      )}
                    </div>
                  </button>
                  {isExact && anyDot && (
                    <div className="flex gap-0.5">
                      {showExDot   && <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#ef4444" }} />}
                      {showNoteDot && <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#8b5cf6" }} />}
                      {showMedDot  && <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#0ea5e9" }} />}
                    </div>
                  )}
                </div>
              );
            });

            i += 7;
          }
          return rows;
        })()}
      </div>

      {/* Visibility checkboxes */}
      <div
        className="mt-4 rounded-xl px-4 py-3"
        style={{ background: "rgba(38,142,134,0.03)", border: "1px solid rgba(38,142,134,0.1)" }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#7a9a98" }}>
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

      {/* Active dot legend */}
      <div className="flex flex-wrap gap-4 mt-3">
        {[
          show.exacerbation && ["#ef4444", t.exacerbation],
          show.note         && ["#8b5cf6", t.notes],
          show.medicine     && ["#0ea5e9", t.medication],
          show.activity     && ["#0f8a6a", t.physicalActivity],
          show.weight       && ["#a16200", t.weight],
        ].filter(Boolean).map(([color, label]) => (
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
          [t.filledDays,     counts.filled,         "#268E86"],
          [t.exacerbation,   counts.exacerbations,  "#ef4444"],
          [t.lowImpact,      counts.low,             "#0f8a6a"],
          [t.mediumImpact,   counts.medium,          "#a16200"],
          [t.highImpact,     counts.high,            "#c05400"],
          [t.veryHighImpact, counts.veryHigh,        "#b91c1c"],
        ].map(([label, val, color]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "#7a9a98" }}>{label}</span>
            <span className="text-sm font-bold" style={{ color }}>{val}</span>
          </div>
        ))}
      </div>

      {/* All records list — infinite scroll */}
      {records?.length > 0 && (
        <RecordsList
          records={records}
          selectedDate={selectedDate}
          onDayClick={onDayClick}
          show={show}
          t={t}
        />
      )}
    </div>
  );
}

const PAGE_SIZE = 20;

function RecordsList({ records, selectedDate, onDayClick, show, t }) {
  const sorted = useMemo(() => [...records].reverse(), [records]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  // Reset when records change (e.g. new patient loaded)
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [records]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + PAGE_SIZE);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  return (
    <div className="mt-6">
      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#a0b8b6" }}>
        {t.allRecords}
      </p>
      <div className="space-y-1.5">
        {visible.map((r) => {
          const c = CAT_COLOR(r.cat8);
          const isActive = selectedDate === r.date;

          // ISO week number
          const d   = new Date(r.date);
          const thu = new Date(d);
          thu.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
          const jan4 = new Date(thu.getFullYear(), 0, 4);
          const weekNum = 1 + Math.round((thu - jan4) / 604800000);

          return (
            <button
              key={r.date}
              onClick={() => onDayClick(r)}
              className="w-full flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all hover:shadow-sm"
              style={{
                background: isActive ? "rgba(38,142,134,0.08)" : "rgba(38,142,134,0.03)",
                border: `1px solid ${isActive ? "rgba(38,142,134,0.3)" : "rgba(38,142,134,0.1)"}`,
              }}
            >
              {/* Left: week number + date + indicator dots */}
              <div className="flex items-center gap-2">
                <span
                  className="font-bold tabular-nums flex-shrink-0"
                  style={{ color: "#b8cccb", fontSize: 10, minWidth: 20 }}
                >
                  W{weekNum}
                </span>
                <span className="text-xs sm:text-sm font-medium" style={{ color: "#4a7a78" }}>{r.date}</span>
                <div className="flex gap-0.5 sm:gap-1">
                  {show.exacerbation && (r.moderateExacerbations || r.seriousExacerbations) && (
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full" style={{ background: "#ef4444" }} />
                  )}
                  {show.note && r.note?.trim() && (
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full" style={{ background: "#8b5cf6" }} />
                  )}
                  {show.medicine && r.medicines?.length > 0 && (
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full" style={{ background: "#0ea5e9" }} />
                  )}
                </div>
              </div>

              {/* Right: weight, activity, CAT badge */}
              <div className="flex items-center gap-1.5 sm:gap-3">
                {show.weight   && r.weight != null       && <span className="text-xs hidden sm:inline" style={{ color: "#a0b8b6" }}>⚖ {r.weight} kg</span>}
                {show.activity && r.physicalActivity > 0 && <span className="text-xs hidden sm:inline" style={{ color: "#a0b8b6" }}>🚶 {r.physicalActivity} min</span>}
                {show.catScore && (
                  <span className="font-bold rounded-full" style={{
                    background: c.bg, color: c.text, border: `1px solid ${c.border}`,
                    fontSize: "10px", padding: "1px 6px",
                  }}>
                    <span className="hidden sm:inline">{t.catScore} </span>{r.cat8}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sentinel */}
      <div ref={sentinelRef} className="py-2 text-center">
        {hasMore ? (
          <p className="text-xs" style={{ color: "#a0b8b6" }}>
            {visible.length} / {sorted.length} {t.entries}
          </p>
        ) : sorted.length > PAGE_SIZE ? (
          <p className="text-xs" style={{ color: "#c8dedd" }}>
            ✓ {sorted.length} {t.entries}
          </p>
        ) : null}
      </div>
    </div>
  );
}