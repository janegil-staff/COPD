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

      {/* Week rows — one bar per week */}
      <div className="space-y-1">
        {(() => {
          const rows = [];
          let i = 0;
          while (i < cells.length) {
            const weekCells = cells.slice(i, i + 7);
            const firstDay  = weekCells.find(d => d != null);
            i += 7;
            if (firstDay == null) continue;

            const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(firstDay)}`;
            // Find the record for this week via weekMap
            const record  = weekMap[dateStr];
            const c       = CAT_COLOR(record?.cat8);
            const isSelected = record && selectedDate === record.date;

            // ISO week number
            const d    = new Date(viewYear, viewMonth, firstDay);
            const dow  = (d.getDay() + 6) % 7;
            const thu  = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + 3);
            const jan4 = new Date(thu.getFullYear(), 0, 4);
            const wn   = 1 + Math.round((thu - jan4) / 604800000);

            // Mon–Sun date range
            const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow);
            const sun = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + 6);
            const fmt = (dd) => `${String(dd.getDate()).padStart(2,"0")}.${String(dd.getMonth()+1).padStart(2,"0")}`;

            const showExDot   = show.exacerbation && record && (record.moderateExacerbations || record.seriousExacerbations);
            const showNoteDot = show.note     && record?.note?.trim();
            const showMedDot  = show.medicine && record?.medicines?.length > 0;
            const showActDot  = show.activity && record?.physicalActivity > 0;
            const showWtDot   = show.weight   && record?.weight != null;
            const anyDot      = showExDot || showNoteDot || showMedDot || showActDot || showWtDot;

            // Solid colour backgrounds per CAT level
            const bgColor = record
              ? record.cat8 <= 10 ? "#4CC189"
              : record.cat8 <= 20 ? "#FFC659"
              : record.cat8 <= 30 ? "#FF7473"
              : "#BE3830"
              : "rgba(38,142,134,0.05)";
            const textColor = record ? "#fff" : "#a0b8b6";
            const stripeColor = isSelected
              ? "#0f6b63"
              : record
              ? record.cat8 <= 10 ? "#2e9e68"
              : record.cat8 <= 20 ? "#c99500"
              : record.cat8 <= 30 ? "#cc4040"
              : "#8a2020"
              : "rgba(38,142,134,0.15)";

            rows.push(
              <div
                key={`week-${wn}`}
                role="button"
                tabIndex={record ? 0 : -1}
                onClick={() => record && onDayClick(record)}
                onKeyDown={(e) => e.key === "Enter" && record && onDayClick(record)}
                className="w-full flex flex-col rounded-xl transition-all overflow-hidden"
                style={{
                  background: bgColor,
                  border: isSelected ? `2.5px solid #1a1a1a` : "none",
                  borderLeft: isSelected ? `2.5px solid #1a1a1a` : "none",
                  cursor: record ? "pointer" : "default",
                  boxShadow: isSelected ? "0 8px 24px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.4)" : record ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                  paddingLeft: 8, paddingRight: 10, paddingTop: 3, paddingBottom: 3,
                  gap: 1,
                  color: record ? "#1a1a1a" : "#a0b8b6",
                  WebkitTextFillColor: record ? "#1a1a1a" : "#a0b8b6",
                }}
              >
                {/* Top row: week label + dots + CAT score */}
                <div className="flex items-center justify-between w-full">
                  <span style={{ color: record ? "#1a1a1a" : "#b8cccb", fontSize: 9, fontWeight: 900 }}>
                    {t.week ?? "W"}{wn}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {anyDot && (
                      <div className="flex gap-0.5">
                        {showExDot   && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ff6b6b" }} />}
                        {showNoteDot && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#c084fc" }} />}
                        {showMedDot  && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#38bdf8" }} />}
                        {showActDot  && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4ade80" }} />}
                        {showWtDot   && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#fbbf24" }} />}
                      </div>
                    )}
                    {record && show.catScore && (
                      <span style={{ fontSize: 12, fontWeight: 900, lineHeight: 1, color: record ? "#1a1a1a" : "#fff" }}>
                        {record.cat8}
                      </span>
                    )}
                  </div>
                </div>

                {/* Day numbers spanning full width */}
                <div className="flex items-center justify-between w-full">
                  {Array.from({ length: 7 }).map((_, di) => {
                    const dd      = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + di);
                    const inMonth = dd.getMonth() === viewMonth;
                    const dayNum  = dd.getDate();
                    const isToday = dd.toDateString() === now.toDateString();
                    return (
                      <div
                        key={di}
                        style={{
                          width: 18, height: 18,
                          borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                          background: isToday && record ? "rgba(0,0,0,0.12)" : "transparent",
                          border: isToday && record ? "1.5px solid rgba(0,0,0,0.5)" : "none",
                        }}
                      >
                        <span style={{
                          fontSize: 10,
                          fontWeight: isToday ? 900 : inMonth ? 700 : 400,
                          color: record
                            ? inMonth ? "#1a1a1a" : "rgba(0,0,0,0.3)"
                            : inMonth ? "#a0b8b6" : "#d0e0de",
                          lineHeight: 1,
                        }}>
                          {dayNum}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
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
      <div
        className="mt-5 rounded-xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid rgba(38,142,134,0.14)", boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)" }}
      >
        <div className="px-4 pt-3 pb-2" style={{ borderBottom: "1px solid rgba(38,142,134,0.08)" }}>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#268E86" }}>
            {t.monthlySummary}
          </p>
        </div>

        {[
          {
            icon: "⬤",
            iconColor: counts.filled === 0 ? "#a0b8b6"
              : monthRecords.length && (monthRecords.reduce((s, r) => s + (r.cat8 ?? 0), 0) / monthRecords.length) <= 10 ? "#4CC189"
              : (monthRecords.reduce((s, r) => s + (r.cat8 ?? 0), 0) / monthRecords.length) <= 20 ? "#FFC659"
              : (monthRecords.reduce((s, r) => s + (r.cat8 ?? 0), 0) / monthRecords.length) <= 30 ? "#FF7473"
              : "#BE3830",
            label: t.avgSymptoms,
            value: counts.filled
              ? Math.round(monthRecords.reduce((s, r) => s + (r.cat8 ?? 0), 0) / monthRecords.length)
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
            value: monthRecords.filter(r => r.seriousExacerbations).length,
          },
          {
            icon: "🏃",
            iconColor: "#268E86",
            label: t.physicalActivity,
            value: (() => {
              const vals = monthRecords.filter(r => r.physicalActivity > 0);
              return vals.length
                ? `${Math.round(vals.reduce((s, r) => s + r.physicalActivity, 0) / vals.length)} ${t.hours ?? t.hour}`
                : "–";
            })(),
          },
          {
            icon: "💊",
            iconColor: "#0ea5e9",
            label: t.weeksWithMedicine ?? t.medicines,
            value: monthRecords.filter(r => r.medicines?.length > 0).length,
          },
        ].map(({ icon, iconColor, label, value }) => (
          <div
            key={label}
            className="flex items-center px-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(38,142,134,0.06)" }}
          >
            <span className="w-6 text-base" style={{ color: iconColor }}>{icon}</span>
            <span className="flex-1 text-sm ml-2" style={{ color: "#4a7a78" }}>{label}</span>
            <span className="text-sm font-bold" style={{ color: "#b91c1c" }}>{value}</span>
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
        {visible.map((r, idx) => {
          const c = CAT_COLOR(r.cat8);
          const isActive = selectedDate === r.date;

          // ISO week year helper
          const isoWeekYear = (dateStr) => {
            const d   = new Date(dateStr.slice(0,4), dateStr.slice(5,7)-1, dateStr.slice(8,10));
            const dow = (d.getDay() + 6) % 7;
            const thu = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + 3);
            return String(thu.getFullYear());
          };
          const year     = isoWeekYear(r.date);
          const prevYear = idx > 0 ? isoWeekYear(visible[idx - 1].date) : null;
          const showYearHeadline = year !== prevYear;

          // Mon–Sun range
          const rd  = new Date(r.date.slice(0,4), r.date.slice(5,7)-1, r.date.slice(8,10));
          const dow = (rd.getDay() + 6) % 7;
          const mon = new Date(rd.getFullYear(), rd.getMonth(), rd.getDate() - dow);
          const sun = new Date(rd.getFullYear(), rd.getMonth(), rd.getDate() - dow + 6);
          const fmt = (d) => `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}`;
          const thu  = new Date(rd); thu.setDate(rd.getDate() - dow + 3);
          const jan4 = new Date(thu.getFullYear(), 0, 4);
          const weekNum = 1 + Math.round((thu - jan4) / 604800000);
          const weekRange = `${fmt(mon)} – ${fmt(sun)}`;

          return (
            <div key={r.date}>
              {showYearHeadline && (
                <div
                  className="flex items-center gap-2 mb-1"
                  style={{ marginTop: idx > 0 ? 8 : 0 }}
                >
                  <span
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: "#268E86" }}
                  >
                    {year}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "rgba(38,142,134,0.2)" }} />
                </div>
              )}
              <button
                onClick={() => onDayClick(r)}
                className="w-full flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all hover:shadow-sm"
                style={{
                  background: isActive ? "rgba(38,142,134,0.08)" : "rgba(38,142,134,0.03)",
                  border: `1px solid ${isActive ? "rgba(38,142,134,0.3)" : "rgba(38,142,134,0.1)"}`,
                }}
            >
              {/* Left: week number + week range + indicator dots */}
              <div className="flex items-center gap-2">
                <span
                  className="font-bold tabular-nums flex-shrink-0"
                  style={{ color: "#b8cccb", fontSize: 10, minWidth: 20 }}
                >
                  {t.week ?? "W"}{weekNum}
                </span>
                <span className="text-xs sm:text-sm font-medium" style={{ color: "#4a7a78" }}>{weekRange}</span>
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
                {show.activity && r.physicalActivity > 0 && <span className="text-xs hidden sm:inline" style={{ color: "#a0b8b6" }}>🚶 {r.physicalActivity} {t.hour}</span>}
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
            </div>
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