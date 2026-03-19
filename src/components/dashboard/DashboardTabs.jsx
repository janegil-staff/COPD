export default function DashboardTabs({ view, setView, t }) {
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

  return (
    <div
      className="flex justify-center mb-5"
      style={{
        background: "rgba(255,255,255,0.7)",
        borderRadius: 999,
        padding: 4,
        border: "1px solid rgba(38,142,134,0.12)",
      }}
    >
      <button style={tabStyle("calendar")} onClick={() => setView("calendar")}>
        {t.calendarTab}
      </button>
      <button style={tabStyle("summary")} onClick={() => setView("summary")}>
        {t.summaryTab}
      </button>
      <button style={tabStyle("log")} onClick={() => setView("log")}>
        {t.logTab}
      </button>
    </div>
  );
}
