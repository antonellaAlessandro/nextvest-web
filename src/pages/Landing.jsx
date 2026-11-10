import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const ROWS = [
  { ticker: "AAPL", name: "Apple", price: "$ 18.420,00", change: "▲ +1,66%", up: true },
  { ticker: "KO", name: "Coca-Cola", price: "$ 12.150,00", change: "▲ +0,31%", up: true },
  { ticker: "MELI", name: "MercadoLibre", price: "$ 24.870,00", change: "▼ -0,30%", up: false },
];

const INSTRUMENTS = [
  {
    slug: "acciones",
    title: "Acciones",
    text: "Partes de una empresa. Su precio sube o baja según el mercado.",
    icon: "M4 17l5-6 4 3 7-9",
  },
  {
    slug: "bonos",
    title: "Bonos",
    text: "Préstamos a un gobierno o a una empresa que devuelven el dinero con intereses.",
    icon: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7",
  },
  {
    slug: "cedears",
    title: "CEDEARs",
    text: "Certificados que representan acciones de empresas del exterior.",
    icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  },
  {
    slug: "fci",
    title: "FCI",
    text: "Fondos que juntan el dinero de muchas personas y lo administra un equipo profesional.",
    icon: "M12 3v9h9a9 9 0 1 1-9-9zM15 3.5A9 9 0 0 1 20.5 9H15z",
  },
];

const DIFFERENCES = [
  {
    title: "Precios reales, saldo virtual",
    text: "Operás con precios de mercado y con la mecánica de un broker real, pero sin arriesgar dinero.",
    icon: "M4 17l5-6 4 3 7-9M4 21h16",
  },
  {
    title: "Autorización parental",
    text: "Un representante legal tiene que aprobar la cuenta antes de que puedas operar.",
    icon: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
  },
  {
    title: "Glosario en cada pantalla",
    text: "Si hay una palabra que no conocés, la tocás y te lleva a su explicación, sin salir de la app.",
    icon: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M9 8h6",
  },
  {
    title: "Un chat que conoce tu portafolio",
    text: "Un asistente adaptado a tus posiciones para que aprendas de tu propia experiencia, no de ejemplos genéricos.",
    icon: "M4 5h16v11H9l-5 4zM8 9h8M8 12h5",
    soon: true,
  },
];

const STEPS = [
  { title: "Te registrás", text: "Cargás tus datos y los de un representante legal." },
  { title: "Autorizan tu cuenta", text: "Un representante la aprueba antes de que puedas operar." },
  { title: "Hacés el test de perfil", text: "Un cuestionario corto define qué instrumentos te corresponden." },
  { title: "Empezás a operar", text: "Cargás saldo virtual, comprás, vendés y seguís tu portafolio." },
];

const GUARDIAN_POINTS = [
  { title: "No se opera con dinero real", text: "Todos los fondos son virtuales. No hay riesgo económico." },
  { title: "La cuenta necesita tu autorización", text: "Sin la aprobación de un representante legal, el chico no puede operar." },
  { title: "Resumen semanal de la actividad", text: "Un mail con las operaciones de la semana.", soon: true },
];

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function useViewportHeight() {
  const [h, setH] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => setH(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return h;
}

function useSceneProgress(ref, enabled) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setP(0);
      return undefined;
    }
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      setP(clamp(-rect.top / total));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled, ref]);
  return p;
}

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Device({ p, phoneHeight = 580 }) {
  const width = lerp(600, 290, p);
  const height = lerp(Math.min(400, phoneHeight), phoneHeight, p);
  const radius = lerp(14, 44, p);
  return (
    <div className="device" style={{ width, height, borderRadius: radius }}>
      <div className="device-dots" style={{ opacity: 1 - p }}>
        <span />
        <span />
        <span />
      </div>
      <div className="device-notch" style={{ opacity: p }} />
      <div className="device-body">
        <div className="device-balance">
          <div className="muted device-label">Valor del portafolio</div>
          <div className="num device-total">$ 1.248.300,00</div>
          <div className="num up device-change">▲ +1,66% hoy</div>
        </div>
        <div className="device-rows">
          {ROWS.map((r) => (
            <div className="device-row" key={r.ticker}>
              <div>
                <div className="device-ticker">{r.ticker}</div>
                <div className="muted device-name">{r.name}</div>
              </div>
              <div className="num device-price">
                <div>{r.price}</div>
                <div className={r.up ? "up" : "down"}>{r.change}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="device-tabs" style={{ opacity: p }}>
        <span>Inicio</span>
        <span>Mercado</span>
        <span>Actividad</span>
        <span>Portafolio</span>
      </div>
    </div>
  );
}

function HeroText() {
  return (
    <>
      <h1 className="hero-title">
        Operá el mercado con <em>fondos virtuales.</em>
      </h1>
      <p className="hero-sub">
        Comprá y vendé instrumentos con precios de mercado y conocé cómo funciona un broker antes
        de usar dinero real.
      </p>
      <div className="hero-actions">
        <Link to="/registro" className="btn btn-primary">
          Creá tu cuenta
        </Link>
        <a href="#instrumentos" className="hero-link">
          Ver instrumentos →
        </a>
      </div>
      <div className="muted small">Para chicos de 13 a 17 años. Con autorización de un representante.</div>
    </>
  );
}

function PhoneTextLeft() {
  return (
    <>
      <h2 className="section-title">Tu portafolio, en el celular.</h2>
      <p className="section-sub">Seguí tus posiciones y revisá tus órdenes desde cualquier pantalla.</p>
    </>
  );
}

function PhoneTextRight() {
  return (
    <>
      <h2 className="section-title">Elegí por dónde empezar.</h2>
      <p className="section-sub">
        Acciones, bonos, CEDEARs y FCI, con un test de perfil de inversor que ordena qué
        instrumentos corresponden.
      </p>
    </>
  );
}

function Steps() {
  return (
    <section className="steps" id="como-empezar">
      <h2 className="section-title">Cómo empezar</h2>
      <p className="section-sub">Cuatro pasos, y el primero lo hacés en un minuto.</p>
      <ol className="steps-row">
        {STEPS.map((s, i) => (
          <li className="step" key={s.title} style={{ "--i": i }}>
            <span className="step-num num">{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function GuardianDemo({ phase }) {
  const label = ["Pendiente de autorización", "Autorizando…", "Cuenta autorizada"][phase];

  return (
    <div className={`gdemo phase-${phase}`} aria-hidden="true">
      <div className="gdemo-head">
        <span className="gdemo-av">S</span>
        <div>
          <b>Cuenta de ejemplo</b>
          <span>Registro nuevo · 15 años</span>
        </div>
        <span className="gdemo-pill">{label}</span>
      </div>

      <div className="gdemo-mid">
        <div className="gdemo-shield">
          <svg viewBox="0 0 64 72" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path className="gdemo-outline" d="M32 4l24 9v18c0 17-10 30-24 37C18 61 8 48 8 31V13z" />
            <path className="gdemo-check" d="M21 36l8 8 15-17" />
          </svg>
        </div>
        <div className="gdemo-actions">
          <span className="gdemo-btn">{phase === 2 ? "Autorizada" : "Autorizar cuenta"}</span>
          <span className="gdemo-hint">{phase === 2 ? "Ya puede operar" : "Lo aprueba un representante"}</span>
        </div>
      </div>
    </div>
  );
}

function Guardians() {
  const ref = useRef(null);
  const reduce = useMedia("(prefers-reduced-motion: reduce)");
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState(0); // 0 pendiente · 1 autorizando · 2 autorizada
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting), { threshold: 0.35 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce) {
      setPhase(2);
      return undefined;
    }
    if (!visible) return undefined;
    let t1;
    let t2;
    let t3;
    const run = () => {
      setPhase(0);
      setCycle((c) => c + 1);
      t1 = setTimeout(() => setPhase(1), 1200);
      t2 = setTimeout(() => setPhase(2), 1900);
      t3 = setTimeout(run, 5200);
    };
    run();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible, reduce]);

  // Cada punto se tilda cuando la animación llega a ese momento.
  const ticked = [true, phase === 2, phase === 2];

  return (
    <section className="guardians" id="representantes" ref={ref}>
      <div className="guardians-card">
        <div className="guardians-intro">
          <span className="pill">Para madres, padres y representantes</span>
          <h2 className="section-title">Una forma segura de aprender a invertir.</h2>
        </div>

        <div className="guardians-right">
          <GuardianDemo phase={phase} />
          <ul className="guardians-list">
            {GUARDIAN_POINTS.map((g, i) => (
              <li key={`${cycle}-${g.title}`} style={{ "--i": i }} className={ticked[i] ? "on" : ""}>
                <span className="guardians-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l4 4 10-10" />
                  </svg>
                </span>
                <div>
                  <h3>
                    {g.title}
                    {g.soon && <span className="soon">Próximamente</span>}
                  </h3>
                  <p>{g.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Differences() {
  const refs = useRef([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(Number(en.target.dataset.i));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="differences" id="diferencias">
      <div className="diff-side">
        <h2 className="section-title">¿Qué nos diferencia?</h2>
        <p className="section-sub">
          No es un curso ni un broker: es la experiencia de invertir, antes de hacerlo con dinero real.
        </p>
        <div className="diff-progress" aria-hidden="true">
          <span style={{ height: `${((active + 1) / DIFFERENCES.length) * 100}%` }} />
        </div>
      </div>

      <ol className="diff-list">
        {DIFFERENCES.map((d, i) => (
          <li
            key={d.title}
            data-i={i}
            ref={(el) => (refs.current[i] = el)}
            className={`diff-item${i === active ? " on" : ""}`}
          >
            <span className="diff-orb" aria-hidden="true">
              <Icon d={d.icon} />
            </span>
            <div className="diff-copy">
              <span className="diff-num num">{String(i + 1).padStart(2, "0")}</span>
              <h3>
                {d.title}
                {d.soon && <span className="soon">Próximamente</span>}
              </h3>
              <p>{d.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Landing() {
  const sceneRef = useRef(null);
  const wide = useMedia("(min-width: 1100px)");
  const reduce = useMedia("(prefers-reduced-motion: reduce)");
  const animated = wide && !reduce;
  const p = useSceneProgress(sceneRef, animated);
  const viewportH = useViewportHeight();
  const phoneHeight = Math.min(580, Math.max(480, viewportH - 68 - 48));

  const morph = ease((p - 0.15) / 0.7);
  const heroOpacity = 1 - ease(p / 0.3);
  const sideOpacity = ease((p - 0.7) / 0.25);

  return (
    <div className="landing">
      <header className="nav">
        <div className="nav-left">
          <Link to="/" className="logo">
            <img src="/nv-logo-blanco.svg" alt="" height="22" />
            <span className="logo-text">NextVest</span>
          </Link>
          <nav className="nav-links">
            <div className="dropdown">
              <button type="button" className="nav-btn">
                Instrumentos ▾
              </button>
              <div className="dropdown-menu">
                {INSTRUMENTS.map((i) => (
                  <Link key={i.slug} to={`/instrumentos/${i.slug}`}>
                    {i.title}
                  </Link>
                ))}
              </div>
            </div>
            <a href="#como-empezar">Cómo empezar</a>
            <a href="#representantes">Para representantes</a>
          </nav>
        </div>
        <div className="nav-right">
          <Link to="/login" className="nav-login">
            Ingresar
          </Link>
          <Link to="/registro" className="btn btn-primary btn-sm">
            Registrate
          </Link>
        </div>
      </header>

      {animated ? (
        <section ref={sceneRef} className="scene" id="celular">
          <div className="scene-sticky">
            <div
              className="scene-text scene-text--hero"
              style={{
                opacity: heroOpacity,
                transform: `translateY(${(1 - heroOpacity) * -24}px)`,
                pointerEvents: heroOpacity < 0.3 ? "none" : "auto",
              }}
            >
              <HeroText />
            </div>
            <div style={{ transform: `translateX(${lerp(300, 0, morph)}px)` }}>
              <Device p={morph} phoneHeight={phoneHeight} />
            </div>
            <div
              className="scene-text scene-text--left"
              style={{ opacity: sideOpacity, transform: `translateX(${(1 - sideOpacity) * -24}px)` }}
            >
              <PhoneTextLeft />
            </div>
            <div
              className="scene-text scene-text--right"
              style={{ opacity: sideOpacity, transform: `translateX(${(1 - sideOpacity) * 24}px)` }}
            >
              <PhoneTextRight />
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="static-hero">
            <div className="static-hero-text">
              <HeroText />
            </div>
            <div className="static-device">
              <Device p={0} />
            </div>
          </section>
          <section className="static-phone" id="celular">
            <PhoneTextLeft />
            <Device p={1} />
            <PhoneTextRight />
          </section>
        </>
      )}

      <section className="instruments" id="instrumentos">
        <h2 className="section-title">Instrumentos</h2>
        <p className="section-sub">Qué son, cómo se usan y qué riesgo tienen.</p>
        <div className="instruments-grid">
          {INSTRUMENTS.map((i) => (
            <Link to={`/instrumentos/${i.slug}`} className="card instrument-card" key={i.slug}>
              <span className="instrument-icon">
                <Icon d={i.icon} />
              </span>
              <h3>{i.title}</h3>
              <p className="muted">{i.text}</p>
              <span className="instrument-more">Ver más →</span>
            </Link>
          ))}
        </div>
      </section>

      <Differences />

      <Steps />

      <Guardians />

      <section className="closing" id="cierre">
        <div className="closing-card">
          <h2 className="closing-title">Empezá con tu cuenta simulada.</h2>
          <p className="section-sub closing-sub">
            El registro requiere la autorización de un representante legal. Todos los fondos son
            virtuales.
          </p>
          <Link to="/registro" className="btn btn-primary">
            Creá tu cuenta
          </Link>
        </div>
      </section>

      <footer className="footer">
        <span>NextVest · Simulador educativo. No se opera con dinero real.</span>
        <span className="footer-links">
          <a href="#como-empezar">Cómo empezar</a>
          <a href="#representantes">Para representantes</a>
          <Link to="/terminos">Términos</Link>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/contacto">Contacto</Link>
        </span>
      </footer>
    </div>
  );
}