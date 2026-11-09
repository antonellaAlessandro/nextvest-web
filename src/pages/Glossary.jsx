import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { GLOSSARY } from "../glossary.js";
import "./Glossary.css";

export default function Glossary() {
  const { hash } = useLocation();
  const active = decodeURIComponent(hash.replace("#", ""));

  useEffect(() => {
    if (!active) return;
    document.getElementById(`t-${active}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active]);

  const terms = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term, "es"));

  return (
    <div className="gl-grid">
      {terms.map((t) => (
        <article key={t.id} id={`t-${t.id}`} className={`gl-term${t.id === active ? " gl-hl" : ""}`}>
          <h2>{t.term}</h2>
          <p>{t.def}</p>
        </article>
      ))}
    </div>
  );
}