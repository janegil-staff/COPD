export default function ImportCard({
  t, code, error, loading, setError, handleChange, handleClick,
}) {
  return (
    // ... all your existing JSX unchanged until the button:
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full py-3 rounded-lg text-white text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 disabled:opacity-60"
      style={{ background: "#268E86" }}
    >
      {loading ? (t.importing ?? "Importerer…") : t.importButton}
    </button>
  );
}