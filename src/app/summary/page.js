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

function LineChart({
  data,
  color = "#268E86",
  min: forceMin,
  max: forceMax,
  height = 80,
}) {
  if (!data?.length)
    return (
      <p className="text-xs text-center py-4" style={{ color: "#a0b8b6" }}>
        –
      </p>
    );
  const vals = data.map((d) => d.value);
  const minV = forceMin ?? Math.min(...vals);
  const maxV = forceMax ?? Math.max(...vals);
  const range = maxV - minV || 1;
  const W = 400,
    H = height;
  const pad = 8;
  const pts = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - ((d.value - minV) / range) * (H - pad * 2);
    return [x, y];
  });
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ");
  const area = `${path} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient
          id={`grad-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color.replace("#", "")})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={color} />
      ))}
    </svg>
  );
}

function BarChart({ data, colorFn, height = 80 }) {
  if (!data?.length)
    return (
      <p className="text-xs text-center py-4" style={{ color: "#a0b8b6" }}>
        –
      </p>
    );
  const vals = data.map((d) => d.value);
  const maxV = Math.max(...vals, 1);
  const W = 400,
    H = height,
    pad = 8;
  const bw = (W - pad * 2) / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const barH = (d.value / maxV) * (H - pad * 2);
        const x = pad + i * bw + bw * 0.15;
        const y = H - pad - barH;
        const color = colorFn ? colorFn(d.value) : "#268E86";
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={bw * 0.7}
            height={Math.max(barH, 2)}
            rx="3"
            fill={color}
            opacity="0.85"
          />
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
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#7a9a98" }}
        >
          {title}
        </p>
        {accent && (
          <span className="text-lg font-black" style={{ color: accent.color }}>
            {accent.value}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs mb-3" style={{ color: "#a0b8b6" }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div
      className="flex items-center justify-between py-1.5"
      style={{ borderBottom: "1px solid rgba(38,142,134,0.07)" }}
    >
      <span className="text-xs" style={{ color: "#7a9a98" }}>
        {label}
      </span>
      <span className="text-sm font-bold" style={{ color: color ?? "#268E86" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function SummaryPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("patientData");
    if (!raw) {
      router.replace("/");
      return;
    }
    setPatient(JSON.parse(raw));
  }, []);

  if (!patient) return null;

  const records = [...(patient.records ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // ── Derived data ────────────────────────────────────────────────────────

  // CAT trend
  const catTrend = records.map((r) => ({
    label: r.date.slice(5),
    value: r.cat8,
  }));

  // Average CAT per month
  const monthMap = {};
  records.forEach((r) => {
    const m = r.date.slice(0, 7);
    if (!monthMap[m]) monthMap[m] = [];
    monthMap[m].push(r.cat8);
  });
  const monthlyAvg = Object.entries(monthMap).map(([m, vals]) => ({
    label: m.slice(5),
    value: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
  }));

  // Exacerbations
  const modEx = records.filter((r) => r.moderateExacerbations).length;
  const sevEx = records.filter((r) => r.seriousExacerbations).length;

  // Overall CAT stats
  const catVals = records.map((r) => r.cat8).filter((v) => v != null);
  const avgCat = catVals.length
    ? Math.round(catVals.reduce((a, b) => a + b, 0) / catVals.length)
    : null;
  const minCat = catVals.length ? Math.min(...catVals) : null;
  const maxCat = catVals.length ? Math.max(...catVals) : null;

  // Weight trend
  const weightData = records
    .filter((r) => r.weight != null)
    .map((r) => ({ label: r.date.slice(5), value: r.weight }));

  // Physical activity trend
  const activityData = records
    .filter((r) => r.physicalActivity != null)
    .map((r) => ({ label: r.date.slice(5), value: r.physicalActivity }));
  const avgActivity = activityData.length
    ? Math.round(
        activityData.reduce((s, d) => s + d.value, 0) / activityData.length,
      )
    : null;

  // Medicine usage
  const medUsage = {};
  records.forEach((r) => {
    (r.medicines ?? []).forEach((id, i) => {
      const name =
        patient.medicines?.find((m) => m.id === id)?.name ??
        patient.userMedicines?.find((um) => um.medicineId === id)?.medicine
          ?.name ??
        `ID ${id}`;
      if (!medUsage[name]) medUsage[name] = { count: 0, times: 0 };
      medUsage[name].count++;
      medUsage[name].times += r.medicinesUsedTimes?.[i] ?? 1;
    });
  });
  const medList = Object.entries(medUsage).sort(
    (a, b) => b[1].count - a[1].count,
  );

  // GAD-7
  const gad7 = patient.latestGad7;
  const GAD7_KEYS = [
    "feelingNervous",
    "noWorryingControl",
    "worrying",
    "troubleRelaxing",
    "restless",
    "easilyAnnoyed",
    "afraid",
  ];
  const gad7Sum = gad7
    ? GAD7_KEYS.reduce((s, k) => s + (gad7[k] ?? 0), 0)
    : null;
  const gad7Level =
    gad7Sum === null
      ? null
      : gad7Sum <= 9
        ? t.mild
        : gad7Sum <= 14
          ? t.moderate
          : t.serious;
  const gad7Color =
    gad7Sum === null
      ? "#7a9a98"
      : gad7Sum <= 9
        ? "#0f8a6a"
        : gad7Sum <= 14
          ? "#a16200"
          : "#b91c1c";

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
            style={{
              background: "rgba(38,142,134,0.1)",
              color: "#268E86",
              border: "1px solid rgba(38,142,134,0.25)",
            }}
          >
            {t.back}
          </button>
          <h1
            className="text-lg font-bold"
            style={{
              color: "#1a3a38",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {t.summaryTab}
          </h1>
        </div>
        <span
          className="text-xs px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(38,142,134,0.08)",
            color: "#268E86",
            border: "1px solid rgba(38,142,134,0.2)",
          }}
        >
          {records.length} {t.entries}
        </span>
      </header>

      {/* Body */}
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full pb-16">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {/* CAT overview stats */}
          <Card
            title={t.catScore}
            accent={
              avgCat != null
                ? { value: avgCat, color: CAT_COLOR(avgCat) }
                : undefined
            }
            subtitle={t.avgSymptoms}
          >
            <StatRow label={t.daysRecorded} value={records.length} />
            {minCat != null && (
              <StatRow
                label="Min CAT"
                value={minCat}
                color={CAT_COLOR(minCat)}
              />
            )}
            {maxCat != null && (
              <StatRow
                label="Max CAT"
                value={maxCat}
                color={CAT_COLOR(maxCat)}
              />
            )}
            <StatRow
              label={t.moderateExacerbation}
              value={modEx}
              color={modEx > 0 ? "#f97316" : "#0f8a6a"}
            />
            <StatRow
              label={t.seriousExacerbation}
              value={sevEx}
              color={sevEx > 0 ? "#ef4444" : "#0f8a6a"}
            />
          </Card>

          {/* CAT trend line */}
          <Card
            title={t.catScore + " – " + t.symptomLog}
            subtitle={
              records[0]?.date + " → " + records[records.length - 1]?.date
            }
          >
            <LineChart
              data={catTrend}
              color="#268E86"
              min={0}
              max={40}
              height={90}
            />
            <div className="flex justify-between mt-1">
              {catTrend.map((d, i) => (
                <span
                  key={i}
                  className="text-xs tabular-nums"
                  style={{ color: CAT_COLOR(d.value), fontSize: 10 }}
                >
                  {d.value}
                </span>
              ))}
            </div>
          </Card>

          {/* Monthly average bars */}
          {monthlyAvg.length > 1 && (
            <Card
              title={t.averageMonthly ?? t.avgSymptoms}
              subtitle={t.lastFourMonths}
            >
              <BarChart data={monthlyAvg} colorFn={CAT_COLOR} height={80} />
              <div className="flex justify-between mt-1">
                {monthlyAvg.map((d, i) => (
                  <span
                    key={i}
                    className="text-xs tabular-nums"
                    style={{ color: "#a0b8b6", fontSize: 10 }}
                  >
                    {d.label}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Weight trend */}
          {weightData.length > 0 && (
            <Card
              title={t.weight}
              accent={
                weightData.length
                  ? {
                      value: weightData[weightData.length - 1].value + " kg",
                      color: "#268E86",
                    }
                  : undefined
              }
            >
              <LineChart data={weightData} color="#0ea5e9" height={80} />
              <div className="flex justify-between mt-1">
                {weightData.map((d, i) => (
                  <span
                    key={i}
                    className="text-xs tabular-nums"
                    style={{ color: "#a0b8b6", fontSize: 10 }}
                  >
                    {d.label}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Physical activity */}
          {activityData.length > 0 && (
            <Card
              title={t.physicalActivity}
              accent={
                avgActivity != null
                  ? { value: avgActivity + " min", color: "#0f8a6a" }
                  : undefined
              }
              subtitle={t.avgSymptoms}
            >
              <BarChart
                data={activityData}
                colorFn={() => "#34d399"}
                height={80}
              />
              <div className="flex justify-between mt-1">
                {activityData.map((d, i) => (
                  <span
                    key={i}
                    className="text-xs tabular-nums"
                    style={{ color: "#a0b8b6", fontSize: 10 }}
                  >
                    {d.label}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Medicine usage */}
          {medList.length > 0 && (
            <Card title={t.medicines}>
              <div className="space-y-2 mt-1">
                {medList.map(([name, stats]) => {
                  const um = patient.userMedicines?.find(
                    (u) => u.medicine?.name === name,
                  );
                  return (
                    <div
                      key={name}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl"
                      style={{
                        background: "rgba(38,142,134,0.05)",
                        border: "1px solid rgba(38,142,134,0.12)",
                      }}
                    >
                      {um?.medicine?.image && (
                        <img
                          src={um.medicine.image}
                          alt={name}
                          className="w-8 h-8 object-contain rounded-lg"
                          style={{
                            background: "rgba(38,142,134,0.07)",
                            padding: 3,
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: "#1a3a38" }}
                        >
                          {name}
                        </p>
                        <p className="text-xs" style={{ color: "#7a9a98" }}>
                          {stats.count} {t.daysRecorded?.toLowerCase()} ·{" "}
                          {stats.times} {t.timesUsed}
                        </p>
                      </div>
                      {/* Usage bar */}
                      <div
                        className="w-16 h-1.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(38,142,134,0.1)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(stats.count / records.length) * 100}%`,
                            background: "#268E86",
                          }}
                        />
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
                      <span
                        className="text-xs shrink-0"
                        style={{ color: "#7a9a98", width: 148 }}
                      >
                        {t[key] ?? k}
                      </span>
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(38,142,134,0.1)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(val / 3) * 100}%`,
                            background: gad7Color,
                          }}
                        />
                      </div>
                      <span
                        className="text-xs w-3 text-right tabular-nums"
                        style={{ color: gad7Color }}
                      >
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div
                className="mt-3 pt-2 flex justify-between"
                style={{ borderTop: "1px solid rgba(38,142,134,0.1)" }}
              >
                <span className="text-xs" style={{ color: "#7a9a98" }}>
                  {t.anxietySum}
                </span>
                <span
                  className="text-sm font-black"
                  style={{ color: gad7Color }}
                >
                  {gad7Sum} · {gad7Level}
                </span>
              </div>
            </Card>
          )}

          {/* PHQ-9 */}
          {phq9 && (
            <Card title={"PHQ-9 · " + phq9.date}>
              <div className="space-y-2 mt-1">
                {Object.entries(phq9)
                  .filter(([k]) => k !== "date")
                  .map(([k, v]) => (
                    <StatRow key={k} label={k} value={v} />
                  ))}
              </div>
            </Card>
          )}

          {/* Medicine satisfaction */}
          {patient.latestMedicineSatisfaction?.medicines?.length > 0 && (
            <Card
              title={
                t.medicineSatisfaction +
                " · " +
                patient.latestMedicineSatisfaction.date
              }
            >
              <div className="space-y-2 mt-1">
                {patient.latestMedicineSatisfaction.medicines.map((ms) => {
                  const med = patient.userMedicines?.find(
                    (um) => um.medicineId === ms.medicineId,
                  )?.medicine;
                  return (
                    <div
                      key={ms.medicineId}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-xs" style={{ color: "#7a9a98" }}>
                        {med?.name ?? `ID ${ms.medicineId}`}
                      </span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            style={{
                              color:
                                star <= ms.satisfaction ? "#f59e0b" : "#d1e8e6",
                              fontSize: 15,
                            }}
                          >
                            ★
                          </span>
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
