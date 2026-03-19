"use client";

import { useEffect, useState } from "react";

const DAYS_LOCALE = {
  no: ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  nl: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
  fr: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
  it: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
  sv: ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"],
  da: ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"],
  fi: ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"],
  es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  pl: ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nie"],
  pt: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
};

const MONTHS_LOCALE = {
  no: [
    "Januar",
    "Februar",
    "Mars",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Desember",
  ],
  en: [
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
  ],
  nl: [
    "Januari",
    "Februari",
    "Maart",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Augustus",
    "September",
    "Oktober",
    "November",
    "December",
  ],
  fr: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  de: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
  it: [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ],
  sv: [
    "Januari",
    "Februari",
    "Mars",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "Augusti",
    "September",
    "Oktober",
    "November",
    "December",
  ],
  da: [
    "Januar",
    "Februar",
    "Marts",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "December",
  ],
  fi: [
    "Tammikuu",
    "Helmikuu",
    "Maaliskuu",
    "Huhtikuu",
    "Toukokuu",
    "Kesäkuu",
    "Heinäkuu",
    "Elokuu",
    "Syyskuu",
    "Lokakuu",
    "Marraskuu",
    "Joulukuu",
  ],
  es: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  pl: [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ],
  pt: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
};

const MONTHS_SHORT_LOCALE = {
  no: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ],
  en: [
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
  ],
  nl: [
    "Jan",
    "Feb",
    "Mrt",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dec",
  ],
  fr: [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Jun",
    "Jul",
    "Aoû",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ],
  de: [
    "Jan",
    "Feb",
    "Mär",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dez",
  ],
  it: [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
  ],
  sv: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Maj",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dec",
  ],
  da: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Maj",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dec",
  ],
  fi: [
    "Tam",
    "Hel",
    "Maa",
    "Huh",
    "Tou",
    "Kes",
    "Hei",
    "Elo",
    "Syy",
    "Lok",
    "Mar",
    "Jou",
  ],
  es: [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ],
  pl: [
    "Sty",
    "Lut",
    "Mar",
    "Kwi",
    "Maj",
    "Cze",
    "Lip",
    "Sie",
    "Wrz",
    "Paź",
    "Lis",
    "Gru",
  ],
  pt: [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ],
};

const USER_ID = "69bc130abdcd059844b6ed1d";

function severityColor(value) {
  if (value === null || value === undefined) return null;
  if (value <= 3) return { bg: "#e6f7f5", text: "#0f6e56" };
  if (value <= 6) return { bg: "#faeeda", text: "#854f0b" };
  return { bg: "#fcebeb", text: "#a32d2d" };
}

function useFourMonths() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const promises = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      promises.push(
        fetch(
          `/api/symptoms?userId=${USER_ID}&year=${d.getFullYear()}&month=${d.getMonth()}`,
        )
          .then((r) => r.json())
          .then((res) => ({
            year: d.getFullYear(),
            month: d.getMonth(),
            days: res.days ?? [],
          })),
      );
    }
    Promise.all(promises).then((results) => {
      setData(results);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}

function useFullYear() {
  const [allDays, setAllDays] = useState([]);
  const [logLoading, setLogLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const promises = [];
    for (let m = 0; m < 12; m++) {
      promises.push(
        fetch(`/api/symptoms?userId=${USER_ID}&year=${year}&month=${m}`)
          .then((r) => r.json())
          .then((data) => data.days ?? []),
      );
    }
    Promise.all(promises).then((results) => {
      const all = results
        .flat()
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllDays(all);
      setLogLoading(false);
    });
  }, []);

  return { allDays, logLoading };
}

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

export default function Dashboard({ t, lang }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [days, setDays] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("calendar");

  const { allDays, logLoading } = useFullYear();

  const DAYS = DAYS_LOCALE[lang] ?? DAYS_LOCALE.en;
  const MONTHS = MONTHS_LOCALE[lang] ?? MONTHS_LOCALE.en;
  const MONTHS_SHORT = MONTHS_SHORT_LOCALE[lang] ?? MONTHS_SHORT_LOCALE.en;

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

  const tabStyle = (tab) => ({
    padding: "8px 20px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.05em",
    cursor: "pointer",
    border: "none",
    background: view === tab ? "#268E86" : "transparent",
    color: view === tab ? "#fff" : "#9ca3af",
    transition: "all 0.2s",
  });

  const cardStyle = {
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(38,142,134,0.12)",
    backdropFilter: "blur(10px)",
  };

  const headerBorder = { borderBottom: "1px solid rgba(38,142,134,0.08)" };

  return (
    <div>
      {/* Tabs */}
      <div
        className="flex justify-center mb-5"
        style={{
          background: "rgba(255,255,255,0.7)",
          borderRadius: 999,
          padding: 4,
          border: "1px solid rgba(38,142,134,0.12)",
        }}
      >
        <button
          style={tabStyle("calendar")}
          onClick={() => setView("calendar")}
        >
          {t.calendarTab}
        </button>
        <button style={tabStyle("summary")} onClick={() => setView("summary")}>
          {t.summaryTab}
        </button>
        <button style={tabStyle("log")} onClick={() => setView("log")}>
          {t.logTab}
        </button>
      </div>

      {/* ── CALENDAR ── */}
      {view === "calendar" && (
        <div
          className="rounded-2xl overflow-hidden shadow-sm"
          style={cardStyle}
        >
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
                      style={{
                        background: color,
                        border: `1px solid ${border}`,
                      }}
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
      )}

      {/* Day detail */}
      {view === "calendar" && selected && (
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

      {/* ── SUMMARY ── */}
      {view === "summary" && (
        <div
          className="rounded-2xl overflow-hidden shadow-sm"
          style={cardStyle}
        >
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
      )}

      {/* ── LOG ── */}
      {view === "log" && (
        <div
          className="rounded-2xl overflow-hidden shadow-sm"
          style={cardStyle}
        >
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
                    style={{ width: "12%" }}
                  >
                    {t.moderate}
                  </th>
                  <th
                    className="px-2 py-2 text-center text-gray-400 font-semibold uppercase tracking-wider"
                    style={{ width: "12%" }}
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
                    style={{ width: "20%" }}
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
      )}
    </div>
  );
}
