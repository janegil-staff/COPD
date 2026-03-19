"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { useSecretCode } from "@/hooks/useSecretCode";
import Headline from "@/components/home/Headline";
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
      <main className="flex-1 flex flex-col min-[600px]:flex-row items-start justify-center gap-6 px-6 min-[600px]:px-12 pt-12 pb-6 relative z-10">

        {/* Mobile: Headline → ImportCard → PhoneShowcase (top to bottom) */}
        {/* Desktop: left column (Headline + PhoneShowcase) | right column (ImportCard) */}

        {/* Left column on desktop */}
        <div className="flex flex-col gap-6 flex-1 min-[600px]:min-w-[300px] min-[600px]:max-w-[580px] w-full order-1 min-[600px]:order-1">
          <Headline t={t} />
          {/* PhoneShowcase hidden on mobile, shown on desktop */}
          <div className="hidden min-[600px]:block">
            <PhoneShowcase t={t} />
          </div>
        </div>

        {/* ImportCard — second on mobile, right column on desktop */}
        <div className="w-full min-[600px]:w-auto order-2 min-[600px]:order-2">
          <ImportCard
            t={t}
            code={code}
            error={error}
            setError={setError}
            handleChange={handleChange}
            handleClick={handleClick}
          />
        </div>

        {/* PhoneShowcase — shown only on mobile, at the bottom */}
        <div className="block min-[600px]:hidden w-full order-3">
          <PhoneShowcase t={t} />
        </div>

      </main>

      <HomeFooter t={t} lang={lang} setLang={setLang} />
    </div>
  );
}