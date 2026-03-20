"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import no from "@/app/messages/no.json";
import en from "@/app/messages/en.json";
import nl from "@/app/messages/nl.json";
import fr from "@/app/messages/fr.json";
import de from "@/app/messages/de.json";
import it from "@/app/messages/it.json";
import sv from "@/app/messages/sv.json";
import da from "@/app/messages/da.json";
import fi from "@/app/messages/fi.json";
import es from "@/app/messages/es.json";
import pl from "@/app/messages/pl.json";
import pt from "@/app/messages/pt.json";

const translations = { no, en, nl, fr, de, it, sv, da, fi, es, pl, pt };

const CAT_COLOR = (score) => {
  if (score == null) return "#7a9a98";
  if (score <= 10) return "#0f8a6a";
  if (score <= 20) return "#d4a017";
  if (score <= 30) return "#f97316";
  return "#ef4444";
};

const CAT_BG = (score) => {
  if (score == null) return "#f0f7f6";
  if (score <= 10) return "#edfaf6";
  if (score <= 20) return "#fefbe8";
  if (score <= 30) return "#fff4ed";
  return "#fff0f0";
};

// ─── Tiny SVG line/bar charts ──────────────────────────────────────────────

function LineChart({ data, color = "#268E86", min: forceMin, max: forceMax, height = 90 }) {
  if (!data?.length) return <p className="text-xs text-center py-4" style={{ color: "#a0b8b6" }}>–</p>;
  const vals = data.map(d => d.value);
  const minV = forceMin ?? Math.min(...vals);
  const maxV = forceMax ?? Math.max(...vals);
  const range = maxV - minV || 1;
  const W = 400, H = height;
  const padL = 36, padR = 8, padT = 8, padB = 8;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const pts = data.map((d, i) => {
    const x = padL + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padT + chartH - ((d.value - minV) / range) * chartH;
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${path} L${pts[pts.length-1][0]},${padT + chartH} L${pts[0][0]},${padT + chartH} Z`;

  // 3 Y-axis ticks
  const ticks = [0, 0.5, 1].map(f => ({
    value: Math.round(minV + f * range),
    y: padT + chartH - f * chartH,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Gridlines + Y labels */}
      {ticks.map((tick, i) => (
        <g key={i}>
          <line x1={padL} y1={tick.y} x2={W - padR} y2={tick.y} stroke="#e0eeec" strokeWidth="1" />
          <text x={padL - 4} y={tick.y + 3.5} textAnchor="end" fontSize="9" fill="#a0b8b6">{tick.value}</text>
        </g>
      ))}
      <path d={area} fill={`url(#grad-${color.replace("#","")})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={color} />
      ))}
    </svg>
  );
}

function BarChart({ data, colorFn, height = 90 }) {
  if (!data?.length) return <p className="text-xs text-center py-4" style={{ color: "#a0b8b6" }}>–</p>;
  const vals = data.map(d => d.value);
  const maxV = Math.max(...vals, 1);
  const W = 400, H = height;
  const padL = 36, padR = 8, padT = 8, padB = 8;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const bw = chartW / data.length;

  // 3 Y-axis ticks
  const ticks = [0, 0.5, 1].map(f => ({
    value: Math.round(f * maxV),
    y: padT + chartH - f * chartH,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {/* Gridlines + Y labels */}
      {ticks.map((tick, i) => (
        <g key={i}>
          <line x1={padL} y1={tick.y} x2={W - padR} y2={tick.y} stroke="#e0eeec" strokeWidth="1" />
          <text x={padL - 4} y={tick.y + 3.5} textAnchor="end" fontSize="9" fill="#a0b8b6">{tick.value}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const barH = (d.value / maxV) * chartH;
        const x = padL + i * bw + bw * 0.15;
        const y = padT + chartH - barH;
        const color = colorFn ? colorFn(d.value) : "#268E86";
        return (
          <rect key={i} x={x} y={y} width={bw * 0.7} height={Math.max(barH, 2)} rx="3" fill={color} opacity="0.85" />
        );
      })}
    </svg>
  );
}

// ─── Card wrapper ──────────────────────────────────────────────────────────

function Card({ title, subtitle, children, accent }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(38,142,134,0.14)",
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#7a9a98" }}>{title}</p>
        {accent && <span className="text-lg font-black" style={{ color: accent.color }}>{accent.value}</span>}
      </div>
      {subtitle && <p className="text-xs mb-3" style={{ color: "#a0b8b6" }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(38,142,134,0.07)" }}>
      <span className="text-xs" style={{ color: "#7a9a98" }}>{label}</span>
      <span className="text-sm font-bold" style={{ color: color ?? "#268E86" }}>{value}</span>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function SummaryPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;
  const [patient, setPatient] = useState(null);
  const [viewYear,  setViewYear]  = useState(null);
  const [viewMonth, setViewMonth] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("patientData");
    if (!raw) { router.replace("/"); return; }
    const data = JSON.parse(raw);
    setPatient(data);
    // Default to the month of the latest record
    const sorted = [...(data.records ?? [])].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length) {
      const last = sorted[sorted.length - 1].date;
      setViewYear(parseInt(last.slice(0, 4)));
      setViewMonth(parseInt(last.slice(5, 7)) - 1);
    }
  }, []);

  if (!patient) return null;

  const allRecords = [...(patient.records ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const pad = (n) => String(n).padStart(2, "0");

  // Active month
  const vy = viewYear  ?? new Date().getFullYear();
  const vm = viewMonth ?? new Date().getMonth();
  const monthKey = `${vy}-${pad(vm + 1)}`;

  // All records in the selected month
  const records = allRecords.filter(r => r.date.startsWith(monthKey));

  // Month navigation
  const months = t.months ?? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const prevMonth = () => { if (vm === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (vm === 11) { setViewMonth(0);  setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
  const hasPrev = allRecords.some(r => r.date < monthKey);
  const hasNext = allRecords.some(r => r.date > monthKey + "-31");

  // ── Per-week grouping (ISO weeks within the month) ──────────────────────
  const isoWeek = (dateStr) => {
    const d   = new Date(dateStr.slice(0,4), dateStr.slice(5,7)-1, dateStr.slice(8,10));
    const dow = (d.getDay() + 6) % 7;
    const thu = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + 3);
    const jan4 = new Date(thu.getFullYear(), 0, 4);
    return 1 + Math.round((thu - jan4) / 604800000);
  };
  const weekMonday = (dateStr) => {
    const d   = new Date(dateStr.slice(0,4), dateStr.slice(5,7)-1, dateStr.slice(8,10));
    const dow = (d.getDay() + 6) % 7;
    const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow);
    return `${String(mon.getDate()).padStart(2,"0")}.${String(mon.getMonth()+1).padStart(2,"0")}`;
  };

  // Group records by ISO week, build chart data points
  const weekMap = {};
  records.forEach(r => {
    const wn = isoWeek(r.date);
    if (!weekMap[wn]) weekMap[wn] = { wn, mon: weekMonday(r.date), items: [] };
    weekMap[wn].items.push(r);
  });
  const weeks = Object.values(weekMap).sort((a, b) => a.wn - b.wn);

  // ── Derived data ────────────────────────────────────────────────────────

  // CAT per week (avg of items in each week)
  const catTrend = weeks.map(w => ({
    label: `W${w.wn}`,
    value: Math.round(w.items.reduce((s, r) => s + (r.cat8 ?? 0), 0) / w.items.length),
  }));

  // Weekly exacerbation counts
  const exWeekly = weeks.map(w => ({
    label: `W${w.wn}`,
    value: w.items.filter(r => r.moderateExacerbations || r.seriousExacerbations).length,
  }));

  // Exacerbations
  const modEx = records.filter(r => r.moderateExacerbations).length;
  const sevEx = records.filter(r => r.seriousExacerbations).length;

  // Overall CAT stats
  const catVals = records.map(r => r.cat8).filter(v => v != null);
  const avgCat = catVals.length ? Math.round(catVals.reduce((a, b) => a + b, 0) / catVals.length) : null;
  const minCat = catVals.length ? Math.min(...catVals) : null;
  const maxCat = catVals.length ? Math.max(...catVals) : null;

  // Weight per week (last known weight in week)
  const weightData = weeks
    .map(w => {
      const withWeight = w.items.filter(r => r.weight != null);
      if (!withWeight.length) return null;
      const avg = withWeight.reduce((s, r) => s + r.weight, 0) / withWeight.length;
      return { label: `W${w.wn}`, value: Math.round(avg * 10) / 10 };
    })
    .filter(Boolean);

  // Activity per week (sum of minutes)
  const activityData = weeks
    .map(w => {
      const total = w.items.reduce((s, r) => s + (r.physicalActivity ?? 0), 0);
      return { label: `W${w.wn}`, value: total };
    })
    .filter(d => d.value > 0);
  const avgActivity = activityData.length
    ? Math.round(activityData.reduce((s, d) => s + d.value, 0) / activityData.length)
    : null;

  // Medicine usage
  const medUsage = {};
  records.forEach(r => {
    (r.medicines ?? []).forEach((id, i) => {
      const name = patient.medicines?.find(m => m.id === id)?.name
        ?? patient.userMedicines?.find(um => um.medicineId === id)?.medicine?.name
        ?? `ID ${id}`;
      if (!medUsage[name]) medUsage[name] = { count: 0, times: 0 };
      medUsage[name].count++;
      medUsage[name].times += r.medicinesUsedTimes?.[i] ?? 1;
    });
  });
  const medList = Object.entries(medUsage).sort((a, b) => b[1].count - a[1].count);

  // GAD-7
  const gad7 = patient.latestGad7;
  const GAD7_KEYS = ["feelingNervous","noWorryingControl","worrying","troubleRelaxing","restless","easilyAnnoyed","afraid"];
  const gad7Sum = gad7 ? GAD7_KEYS.reduce((s, k) => s + (gad7[k] ?? 0), 0) : null;
  const gad7Level = gad7Sum === null ? null : gad7Sum <= 9 ? t.mild : gad7Sum <= 14 ? t.moderate : t.serious;
  const gad7Color = gad7Sum === null ? "#7a9a98" : gad7Sum <= 9 ? "#0f8a6a" : gad7Sum <= 14 ? "#a16200" : "#b91c1c";

  const phq9 = patient.latestPhq9;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/background-copd.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(38,142,134,0.15)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
            style={{ background: "rgba(38,142,134,0.1)", color: "#268E86", border: "1px solid rgba(38,142,134,0.25)" }}
          >
            {t.back}
          </button>
          <h1
            className="text-lg font-bold"
            style={{ color: "#1a3a38", fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t.summaryTab}
          </h1>
          {/* Month picker */}
          <div className="flex items-center gap-1 ml-3">
            <button
              onClick={prevMonth}
              disabled={!hasPrev}
              className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-black/5 disabled:opacity-30"
              style={{ color: "#268E86", fontSize: 16 }}
            >‹</button>
            <span className="text-sm font-semibold" style={{ color: "#268E86", minWidth: 90, textAlign: "center" }}>
              {months[vm]} {vy}
            </span>
            <button
              onClick={nextMonth}
              disabled={!hasNext}
              className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-black/5 disabled:opacity-30"
              style={{ color: "#268E86", fontSize: 16 }}
            >›</button>
          </div>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(38,142,134,0.08)", color: "#268E86", border: "1px solid rgba(38,142,134,0.2)" }}>
          {records.length} {t.entries}
        </span>
      </header>

      {/* Body */}
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full pb-16">
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>

          {/* CAT overview stats */}
          <Card
            title={t.catScore}
            accent={avgCat != null ? { value: avgCat, color: CAT_COLOR(avgCat) } : undefined}
            subtitle={t.avgSymptoms}
          >
            <StatRow label={t.daysRecorded} value={records.length} />
            {minCat != null && <StatRow label="Min CAT" value={minCat} color={CAT_COLOR(minCat)} />}
            {maxCat != null && <StatRow label="Max CAT" value={maxCat} color={CAT_COLOR(maxCat)} />}
            <StatRow label={t.moderateExacerbation} value={modEx} color={modEx > 0 ? "#f97316" : "#0f8a6a"} />
            <StatRow label={t.seriousExacerbation} value={sevEx} color={sevEx > 0 ? "#ef4444" : "#0f8a6a"} />
          </Card>

          {/* CAT trend per week */}
          {catTrend.length > 0 && (
            <Card title={t.catScore + " – " + t.symptomLog} subtitle={months[vm] + " " + vy}>
              <LineChart data={catTrend} color="#268E86" min={0} max={40} height={90} />
              <div className="flex justify-between mt-1">
                {catTrend.map((d, i) => (
                  <span key={i} className="text-xs tabular-nums" style={{ color: "#a0b8b6", fontSize: 10 }}>{d.label}</span>
                ))}
              </div>
            </Card>
          )}
          {records.length === 0 && (
            <Card title={t.summaryTab}>
              <p className="text-sm text-center py-4" style={{ color: "#a0b8b6" }}>{t.noEntries}</p>
            </Card>
          )}

          {/* Exacerbations per week */}
          {exWeekly.some(d => d.value > 0) && (
            <Card title={t.exacerbation} subtitle={months[vm] + " " + vy}>
              <BarChart data={exWeekly} colorFn={() => "#ef4444"} height={80} />
              <div className="flex justify-between mt-1">
                {exWeekly.map((d, i) => (
                  <span key={i} className="text-xs tabular-nums" style={{ color: "#a0b8b6", fontSize: 10 }}>{d.label}</span>
                ))}
              </div>
            </Card>
          )}

          {/* Weight trend */}
          {weightData.length > 0 && (
            <Card
              title={t.weight}
              accent={weightData.length ? { value: weightData[weightData.length-1].value + " kg", color: "#268E86" } : undefined}
            >
              <LineChart data={weightData} color="#0ea5e9" height={80} />
              <div className="flex justify-between mt-1">
                {weightData.map((d, i) => (
                  <span key={i} className="text-xs tabular-nums" style={{ color: "#a0b8b6", fontSize: 10 }}>{d.label}</span>
                ))}
              </div>
            </Card>
          )}

          {/* Physical activity */}
          {activityData.length > 0 && (
            <Card
              title={t.physicalActivity}
              accent={avgActivity != null ? { value: avgActivity + " " + t.hour, color: "#0f8a6a" } : undefined}
              subtitle={t.avgSymptoms}
            >
              <BarChart data={activityData} colorFn={() => "#34d399"} height={80} />
              <div className="flex justify-between mt-1">
                {activityData.map((d, i) => (
                  <span key={i} className="text-xs tabular-nums" style={{ color: "#a0b8b6", fontSize: 10 }}>{d.label}</span>
                ))}
              </div>
            </Card>
          )}

          {/* Medicine usage */}
          {medList.length > 0 && (
            <Card title={t.medicines}>
              <div className="space-y-2 mt-1">
                {medList.map(([name, stats]) => {
                  const um = patient.userMedicines?.find(u => u.medicine?.name === name);
                  return (
                    <div key={name} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                      style={{ background: "rgba(38,142,134,0.05)", border: "1px solid rgba(38,142,134,0.12)" }}>
                      {um?.medicine?.image && (
                        <img src={um.medicine.image} alt={name} className="w-8 h-8 object-contain rounded-lg"
                          style={{ background: "rgba(38,142,134,0.07)", padding: 3 }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#1a3a38" }}>{name}</p>
                        <p className="text-xs" style={{ color: "#7a9a98" }}>
                          {stats.count} {t.daysRecorded?.toLowerCase()} · {stats.times} {t.timesUsed}
                        </p>
                      </div>
                      {/* Usage bar */}
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(38,142,134,0.1)" }}>
                        <div className="h-full rounded-full" style={{ width: `${(stats.count / records.length) * 100}%`, background: "#268E86" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* GAD-7 */}
          {gad7 && (
            <Card
              title={t.anxiety + " GAD-7 · " + gad7.date}
              accent={{ value: gad7Sum, color: gad7Color }}
              subtitle={gad7Level}
            >
              <div className="space-y-2 mt-1">
                {GAD7_KEYS.map((k) => {
                  const key = `gad7${k.charAt(0).toUpperCase()}${k.slice(1)}`;
                  const val = gad7[k] ?? 0;
                  return (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-xs shrink-0" style={{ color: "#7a9a98", width: 148 }}>{t[key] ?? k}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(38,142,134,0.1)" }}>
                        <div className="h-full rounded-full" style={{ width: `${(val / 3) * 100}%`, background: gad7Color }} />
                      </div>
                      <span className="text-xs w-3 text-right tabular-nums" style={{ color: gad7Color }}>{val}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-2 flex justify-between" style={{ borderTop: "1px solid rgba(38,142,134,0.1)" }}>
                <span className="text-xs" style={{ color: "#7a9a98" }}>{t.anxietySum}</span>
                <span className="text-sm font-black" style={{ color: gad7Color }}>{gad7Sum} · {gad7Level}</span>
              </div>
            </Card>
          )}

          {/* PHQ-9 */}
          {phq9 && (
            <Card title={"PHQ-9 · " + phq9.date}>
              <div className="space-y-2 mt-1">
                {Object.entries(phq9).filter(([k]) => k !== "date").map(([k, v]) => (
                  <StatRow key={k} label={k} value={v} />
                ))}
              </div>
            </Card>
          )}

          {/* Medicine satisfaction */}
          {patient.latestMedicineSatisfaction?.medicines?.length > 0 && (
            <Card title={t.medicineSatisfaction + " · " + patient.latestMedicineSatisfaction.date}>
              <div className="space-y-2 mt-1">
                {patient.latestMedicineSatisfaction.medicines.map((ms) => {
                  const med = patient.userMedicines?.find(um => um.medicineId === ms.medicineId)?.medicine;
                  return (
                    <div key={ms.medicineId} className="flex items-center justify-between py-1">
                      <span className="text-xs" style={{ color: "#7a9a98" }}>{med?.name ?? `ID ${ms.medicineId}`}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          <span key={star} style={{ color: star <= ms.satisfaction ? "#f59e0b" : "#d1e8e6", fontSize: 15 }}>★</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
}