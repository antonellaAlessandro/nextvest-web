import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { request, getSession } from "../http.js";
import "./Profile.css";

// En el backend, la opción A suma hacia el perfil conservador y cualquier otra, hacia el moderado.
// Con una cantidad par de preguntas, un empate da conservador.
const QUESTIONS = [
  {
    text: "Si una inversión tuya baja 10 % en una semana, ¿qué hacés?",
    options: [
      { value: "A", label: "Vendo para evitar perder más." },
      { value: "B", label: "Espero a que se recupere." },
    ],
  },
  {
    text: "¿Por cuánto tiempo pensás mantener tus inversiones?",
    options: [
      { value: "A", label: "Pocos meses: quiero poder usar el dinero pronto." },
      { value: "B", label: "Varios años: puedo esperar." },
    ],
  },
  {
    text: "¿Qué preferís?",
    options: [
      { value: "A", label: "Ganar poco, pero con un resultado más estable." },
      { value: "B", label: "Ganar más, aunque el resultado cambie mucho." },
    ],
  },
  {
    text: "Te dan $ 100.000 virtuales. ¿Cómo los repartís?",
    options: [
      { value: "A", label: "Casi todo en instrumentos de bajo riesgo." },
      { value: "B", label: "Una parte importante en instrumentos que suben y bajan más." },
    ],
  },
  {
    text: "¿Cómo te sentís al ver que el valor de tu cartera sube y baja todos los días?",
    options: [
      { value: "A", label: "Me pone nervioso." },
      { value: "B", label: "Lo tomo con calma: es parte de invertir." },
    ],
  },
  {
    text: "Una inversión promete ganar mucho, pero podés perder parte del dinero. ¿Qué hacés?",
    options: [
      { value: "A", label: "La evito." },
      { value: "B", label: "La considero." },
    ],
  },
];

const RESULTS = {
  CONSERVATIVE: {
    title: "Conservador",
    text: "Priorizás cuidar tu dinero y evitar sobresaltos. Vas a poder operar instrumentos de bajo riesgo.",
  },
  MODERATE: {
    title: "Moderado",
    text: "Aceptás algunas subas y bajas a cambio de la posibilidad de ganar más. Vas a poder operar instrumentos de riesgo bajo y moderado.",
  },
};

function formatDate(iso) {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Profile() {
  const { profile, reloadProfile } = useOutletContext();
  const userId = getSession()?.id;

  const [stage, setStage] = useState(profile ? "summary" : "quiz"); // summary | quiz | result
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [resultType, setResultType] = useState(null);

  const last = index === QUESTIONS.length - 1;
  const current = QUESTIONS[index];
  const selected = answers[index];

  function startQuiz() {
    setAnswers([]);
    setIndex(0);
    setError("");
    setStage("quiz");
  }

  function select(value) {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
  }

  async function submit() {
    setSaving(true);
    setError("");
    try {
      const res = await request(`/api/risk-profiles/user/${userId}/evaluate`, {
        method: "POST",
        body: answers,
      });
      setResultType(res?.type ?? null);
      await reloadProfile();
      setStage("result");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function next() {
    if (!selected) return;
    if (last) submit();
    else setIndex(index + 1);
  }

  /* ---------- Perfil actual ---------- */
  if (stage === "summary") {
    const info = RESULTS[profile?.type];
    return (
      <div className="pf-card">
        <p className="pf-kicker">Tu perfil actual</p>
        <h2 className="pf-title">{info?.title ?? "Definido"}</h2>
        {info && <p className="pf-text">{info.text}</p>}
        {profile?.evaluationDate && <p className="pf-meta">Evaluado el {formatDate(profile.evaluationDate)}</p>}
        <div className="pf-actions">
          <button type="button" className="btn btn-ghost" onClick={startQuiz}>Repetir el test</button>
          <Link to="/app/mercado" className="btn btn-primary">Ir al mercado</Link>
        </div>
      </div>
    );
  }

  /* ---------- Resultado ---------- */
  if (stage === "result") {
    const info = RESULTS[resultType ?? profile?.type];
    return (
      <div className="pf-card">
        <p className="pf-kicker">Tu resultado</p>
        <h2 className="pf-title">Perfil {info ? info.title.toLowerCase() : "definido"}</h2>
        {info && <p className="pf-text">{info.text}</p>}
        <p className="pf-meta">Podés repetir el test cuando quieras.</p>
        <div className="pf-actions">
          <Link to="/app" className="btn btn-primary">Ir al inicio</Link>
          <Link to="/app/mercado" className="btn btn-ghost">Ver el mercado</Link>
        </div>
      </div>
    );
  }

  /* ---------- Test ---------- */
  return (
    <div className="pf-card">
      <div className="pf-progress" aria-hidden="true">
        <span style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }} />
      </div>
      <p className="pf-kicker">Pregunta {index + 1} de {QUESTIONS.length}</p>
      <h2 className="pf-question">{current.text}</h2>

      <div className="pf-options" role="radiogroup" aria-label={current.text}>
        {current.options.map((o) => (
          <button
            type="button"
            key={o.value}
            role="radio"
            aria-checked={selected === o.value}
            className={`pf-opt${selected === o.value ? " on" : ""}`}
            onClick={() => select(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {error && <p className="pf-error" role="alert">{error}</p>}

      <div className="pf-actions">
        {index > 0 && (
          <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => setIndex(index - 1)}>
            Anterior
          </button>
        )}
        <button type="button" className="btn btn-primary" disabled={!selected || saving} onClick={next}>
          {saving ? "Calculando…" : last ? "Ver mi perfil" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}