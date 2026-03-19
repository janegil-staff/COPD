"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/context/LangContext";
import { useSecretCode } from "@/hooks/useSecretCode";
import ImportCard from "@/components/home/ImportCard";
import PhoneShowcase from "@/components/home/PhoneShowcase";
import HomeFooter from "@/components/home/HomeFooter";
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

export default function Home() {
  const { lang, setLang } = useLang();
  const router = useRouter();
  const [error, setError] = useState(false);
  const t = translations[lang];
  const { input: code, handleChange } = useSecretCode();

  const handleClick = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.valid) {
      router.push("/dashboard");
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 700,
          height: 700,
          bottom: -220,
          left: -180,
          background: "radial-gradient(circle, rgba(38,142,134,0.2) 0%, transparent 65%)",
        }}
      />

      <main className="flex-1 flex flex-col min-[600px]:flex-row items-start justify-center gap-10 px-6 min-[600px]:px-12 pt-12 pb-6 relative z-10">
        
        <ImportCard
          t={t}
          code={code}
          error={error}
          setError={setError}
          handleChange={handleChange}
          handleClick={handleClick}
        />
    
        <PhoneShowcase t={t} />
      </main>

      <HomeFooter t={t} lang={lang} setLang={setLang} />
    </div>
  );
}