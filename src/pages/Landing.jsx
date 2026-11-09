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
  },
  {
    slug: "cedears",
    title: "CEDEARs",
    text: "Certificados que representan acciones de empresas del exterior.",
  },
  {
    slug: "etfs",
    title: "ETFs",
    text: "Fondos que replican un índice y se compran como una acción.",
  },
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

function Device({ p, phoneHeight = 580 }) {
  const width = lerp(600, 290, p);
  const height = lerp(Math.min(400, phoneHeight), phoneHeight, p);
  const radius = lerp(12, 44, p);
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
          <div className="muted device-label">Total de la cartera</div>
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
        <span>Cartera</span>
      </div>
    </div>
  );
}

function HeroText() {
  return (
    <>
      <span className="pill">Simulación · fondos virtuales</span>
      <h1 className="hero-title">Operá el mercado con fondos virtuales.</h1>
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
      <h2 className="section-title">Tu cartera, en el celular.</h2>
      <p className="section-sub">Seguí tus posiciones y revisá tus órdenes desde cualquier pantalla.</p>
    </>
  );
}

function PhoneTextRight() {
  return (
    <>
      <h2 className="section-title">Elegí por dónde empezar.</h2>
      <p className="section-sub">
        Acciones, CEDEARs y ETFs, con un test de perfil que ordena qué instrumentos corresponden.
      </p>
    </>
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
            <span className="logo-mark" />
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
            <a href="#celular">Cómo funciona</a>
            <a href="#cierre">Seguridad</a>
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
              <span className="instrument-icon" />
              <h3>{i.title}</h3>
              <p className="muted">{i.text}</p>
              <span className="instrument-more">Ver más →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="closing" id="cierre">
        <h2 className="closing-title">Empezá con tu cuenta simulada.</h2>
        <p className="section-sub closing-sub">
          El registro requiere la autorización de un representante legal. Todos los fondos son
          virtuales.
        </p>
        <Link to="/registro" className="btn btn-primary">
          Creá tu cuenta
        </Link>
      </section>

      <footer className="footer">
        <span>NextVest · Simulador educativo. No se opera con dinero real.</span>
        <span className="footer-links">
          <a href="#cierre">Términos</a>
          <a href="#cierre">Privacidad</a>
          <a href="#cierre">Contacto</a>
        </span>
      </footer>
    </div>
  );
}