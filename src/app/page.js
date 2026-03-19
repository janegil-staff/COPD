"use client";
import { useState } from "react";

import no from "./messages/no.json";
import en from "./messages/en.json";
import nl from "./messages/nl.json";
import fr from "./messages/fr.json";
import de from "./messages/de.json";
import it from "./messages/it.json";
import sv from "./messages/sv.json";
import da from "./messages/da.json";
import fi from "./messages/fi.json";
import es from "./messages/es.json";
import pl from "./messages/pl.json";
import pt from "./messages/pt.json";

const translations = { no, en, nl, fr, de, it, sv, da, fi, es, pl, pt };

const flags = [
  { code: "en", emoji: "🇬🇧", label: "English" },
  { code: "nl", emoji: "🇳🇱", label: "Nederlands" },
  { code: "fr", emoji: "🇫🇷", label: "Français" },
  { code: "de", emoji: "🇩🇪", label: "Deutsch" },
  { code: "it", emoji: "🇮🇹", label: "Italiano" },
  { code: "no", emoji: "🇳🇴", label: "Norsk" },
  { code: "sv", emoji: "🇸🇪", label: "Svenska" },
  { code: "da", emoji: "🇩🇰", label: "Dansk" },
  { code: "fi", emoji: "🇫🇮", label: "Suomi" },
  { code: "es", emoji: "🇪🇸", label: "Español" },
  { code: "pl", emoji: "🇵🇱", label: "Polski" },
  { code: "pt", emoji: "🇵🇹", label: "Português" },
];

const APP_STORE_URL = "https://apps.apple.com";
const GOOGLE_PLAY_URL = "https://play.google.com";

export default function Home() {
  const [lang, setLang] = useState("no");
  const [code, setCode] = useState("");
  const t = translations[lang];

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background:
          "linear-gradient(155deg, #ffffff 0%, #eaf7f6 50%, #cde9e6 100%)",
      }}
    >
      {/* Background blob */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 700,
          height: 700,
          bottom: -220,
          left: -180,
          background:
            "radial-gradient(circle, rgba(38,142,134,0.2) 0%, transparent 65%)",
        }}
      />

      {/* ── MAIN ── */}
      <main className="flex-1 flex items-start justify-center gap-10 px-12 pt-12 pb-6 flex-wrap relative z-10">
        {/* LEFT */}
        <div className="flex-1 min-w-[300px] max-w-[580px]">
          <h1
            className="font-bold mb-3 leading-tight"
            style={{
              color: "#268E86",
              fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
              fontFamily: "Georgia, serif",
            }}
          >
            {t.title}
          </h1>
          <p
            className="mb-8 leading-relaxed max-w-[460px]"
            style={{ color: "#268E86", fontSize: "0.97rem" }}
          >
            {t.subtitle}
          </p>

          {/* Three phones */}
          <div className="flex items-end gap-3">
            {[
              { src: "/screen4.png", alt: "Login" },
              { src: "/screen2.png", alt: "Calendar", lift: true },
              { src: "/screen1.png", alt: "Charts" },
            ].map(({ src, alt, lift }) => (
              <div
                key={src}
                className="flex-shrink-0 rounded-[20px] overflow-hidden shadow-2xl"
                style={{
                  width: 160,
                  marginBottom: lift ? 24 : 0,
                  border: "6px solid #1a1a1a",
                  borderRadius: 28,
                  background: "#1a1a1a",
                }}
              >
                <img
                  src={src}
                  alt={alt}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    borderRadius: 22,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — import card */}
        <div className="flex-shrink-0" style={{ width: 400 }}>
          <div
            className="rounded-2xl overflow-hidden shadow-lg"
            style={{
              background: "rgba(255,255,255,0.82)",
              border: "1px solid rgba(38,142,134,0.15)",
              backdropFilter: "blur(10px)",
              padding: 40,
            }}
          >
            {/* ── Two half-screenshots fading at the bottom ── */}
            <div className="relative overflow-hidden " style={{ height: 180 }}>
              {/* Left screenshot */}
              <div className="overflow-hidden">
                <img
                  src="/welcome.png"
                  alt="App home"
                  style={{
                    width: "200%",
                    height: "auto",
                    display: "block",
                    marginLeft: 0,
                  }}
                />
              </div>

              {/* Right screenshot */}
              <div
                className="absolute top-0 right-0 overflow-hidden"
                style={{ width: "50%", height: "100%" }}
              >
                <img
                  src="/screen5.png"
                  alt="App settings"
                  style={{
                    width: "200%",
                    height: "auto",
                    display: "block",
                    marginLeft: "-100%",
                  }}
                />
              </div>

              {/* Centre seam / divider shadow */}
              <div
                className="absolute inset-y-0"
                style={{
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 2,
                  background: "rgba(255,255,255,0.6)",
                }}
              />

              {/* Bottom fade-out gradient */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: 80,
                  background:
                    "linear-gradient(to bottom, transparent, rgba(255,255,255,0.95))",
                }}
              />
            </div>

            {/* Form area */}
            <div className="px-5 pb-5">
              <p className="text-center font-bold tracking-widest text-sm mb-4 text-gray-800 uppercase">
                {t.importTitle}
              </p>
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">
                {t.importLabel}
              </p>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t.placeholder}
                className="w-full rounded-lg px-4 py-3 text-sm text-gray-800 mb-3 outline-none transition-all"
                style={{
                  background: "#f4f4f4",
                  border: "1px solid #ddd",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#268E86";
                  e.target.style.boxShadow = "0 0 0 3px rgba(38,142,134,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#ddd";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                className="w-full py-3 rounded-lg text-white text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90"
                style={{ background: "#268E86" }}
              >
                {t.importButton}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 text-center pb-9 px-4">
        <p className="text-gray-500 text-sm mb-1">{t.available}</p>
        <p className="text-gray-500 text-sm mb-5">{t.download}</p>

        {/* Store buttons */}
        <div className="flex gap-3 justify-center flex-wrap mb-5">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-black text-white rounded-xl px-5 py-2.5 transition-all hover:-translate-y-0.5 hover:bg-[#268E86]"
          >
            <span className="text-2xl leading-none">🍎</span>
            <span className="flex flex-col text-left">
              <span className="text-[0.58rem] text-white/60 uppercase tracking-wide">
                Download on the
              </span>
              <span className="text-sm font-bold">App Store</span>
            </span>
          </a>
          <a
            href={GOOGLE_PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-black text-white rounded-xl px-5 py-2.5 transition-all hover:-translate-y-0.5 hover:bg-[#268E86]"
          >
            <span className="text-2xl leading-none">▶</span>
            <span className="flex flex-col text-left">
              <span className="text-[0.58rem] text-white/60 uppercase tracking-wide">
                Get it on
              </span>
              <span className="text-sm font-bold">Google Play</span>
            </span>
          </a>
        </div>

        {/* Flags */}
        <div className="flex gap-1 justify-center flex-wrap mb-3">
          {flags.map((f) => (
            <button
              key={f.code}
              title={f.label}
              onClick={() => setLang(f.code)}
              className="text-2xl leading-none px-1 py-0.5 rounded border-2 transition-all"
              style={{
                opacity: lang === f.code ? 1 : 0.6,
                borderColor: lang === f.code ? "#268E86" : "transparent",
                transform: lang === f.code ? "scale(1.1)" : "scale(1)",
              }}
            >
              {f.emoji}
            </button>
          ))}
        </div>

        <p className="text-gray-400 text-xs mb-2">
          Copyright 2026 - KBB Medic AS (org: 912 372 022)
        </p>
        <a
          href="mailto:post@kbbmedic.no"
          className="text-gray-400 text-xs flex items-center justify-center gap-1.5 hover:text-[#268E86] transition-colors"
        >
          ✉ post@kbbmedic.no
        </a>
      </footer>
    </div>
  );
}
