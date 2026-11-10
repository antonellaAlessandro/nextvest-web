import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { money } from "../helpers.js";
import { INSTRUMENT_INFO, INSTRUMENT_ORDER } from "../instrumentInfo.js";
import "./Instrument.css";

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const TABS = ["Inicio", "Mercado", "Actividad", "Portafolio"];

function Phone({ tab, children }) {
  return (
    <div className="ph">
      <div className="ph-notch" />
      <div className="ph-screen">{children}</div>
      <div className="ph-tabs">
        {TABS.map((t) => (
          <span key={t} className={t === tab ? "on" : ""}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function Phones({ demo, title }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) setShown(true); }, { threshold: 0.25 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const pick = demo.rows[0];
  const total = pick.price * demo.qty;

  return (
    <div className={`phones${shown ? " in" : ""}`} ref={ref}>
      <figure className="phones-col" style={{ "--i": 0 }}>
        <Phone tab="Mercado">
          <h4 className="ph-title">Mercado</h4>
          <div className="ph-chips">
            <span>Todos</span>
            <span className="on">{demo.chip}</span>
          </div>
          {demo.rows.map((r, i) => (
            <div className="ph-row" key={r.ticker}>
              <div>
                <b>{r.ticker}</b>
                <small>{r.name}</small>
              </div>
              <span className="num ph-price">{money(r.price)}</span>
              <span className={`ph-pill${i === 0 ? " hot" : ""}`}>Comprar</span>
            </div>
          ))}
        </Phone>
        <figcaption><span className="num">1</span>Elegí el instrumento en Mercado y tocá Comprar.</figcaption>
      </figure>

      <figure className="phones-col" style={{ "--i": 1 }}>
        <Phone tab="Mercado">
          <h4 className="ph-title">Comprar {pick.ticker}</h4>
          <small className="ph-sub">{pick.name}</small>
          <div className="ph-line"><span>Precio unitario</span><b className="num">{money(pick.price)}</b></div>
          <div className="ph-line"><span>Saldo disponible</span><b className="num">{money(demo.balance)}</b></div>
          <span className="ph-label">Cantidad</span>
          <div className="ph-step">
            <span>−</span>
            <b className="num">{demo.qty}</b>
            <span>+</span>
          </div>
          <div className="ph-line big"><span>Total</span><b className="num">{money(total)}</b></div>
          <span className="ph-btn hot">Revisar orden</span>
        </Phone>
        <figcaption><span className="num">2</span>Elegí la cantidad y revisá el total antes de confirmar.</figcaption>
      </figure>

      <figure className="phones-col" style={{ "--i": 2 }}>
        <Phone tab="Portafolio">
          <div className="ph-toast">Orden ejecutada</div>
          <h4 className="ph-title">Portafolio</h4>
          <div className="ph-total">
            <small>Valor del portafolio</small>
            <b className="num">{money(total)}</b>
          </div>
          <div className="ph-row">
            <div>
              <b>{pick.ticker}</b>
              <small>{demo.qty} unidades</small>
            </div>
            <span className="num ph-price">{money(total)}</span>
          </div>
          <div className="ph-line"><span>Saldo disponible</span><b className="num">{money(demo.balance - total)}</b></div>
        </Phone>
        <figcaption><span className="num">3</span>Confirmás y el instrumento aparece en tu portafolio.</figcaption>
      </figure>
      <p className="phones-note">Pantallas de ejemplo con datos ficticios de {title}.</p>
    </div>
  );
}

export default function Instrument() {
  const { slug } = useParams();
  const info = INSTRUMENT_INFO[slug];

  return (
    <div className="ins">
      <header className="ins-top">
        <Link to="/" className="ins-logo">
          <img src="/nv-logo-blanco.svg" alt="" height="22" />
          <span>NextVest</span>
        </Link>
        <nav className="ins-nav">
          {INSTRUMENT_ORDER.map((s) => (
            <Link key={s} to={`/instrumentos/${s}`} className={s === slug ? "on" : ""}>
              {INSTRUMENT_INFO[s].title}
            </Link>
          ))}
        </nav>
        <div className="ins-actions">
          <Link to="/login" className="ins-login">Ingresar</Link>
          <Link to="/registro" className="btn btn-primary btn-sm">Registrate</Link>
        </div>
      </header>

      {!info ? (
        <main className="ins-main">
          <div className="ins-hero">
            <h1>No encontramos ese instrumento</h1>
            <p>Elegí uno de la lista de arriba.</p>
          </div>
        </main>
      ) : (
        <main className="ins-main" key={slug}>
          <section className="ins-hero">
            <span className="ins-icon">
              <Icon d={info.icon} />
            </span>
            <h1>{info.title}</h1>
            <p>{info.intro}</p>
          </section>

          <section className="ins-block" style={{ "--i": 0 }}>
            <h2>Cómo funciona</h2>
            <div className="ins-text">
              {info.how.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </section>

          <section className="ins-block" style={{ "--i": 1 }}>
            <h2>Cómo lo usás en NextVest</h2>
            <p className="ins-lead">
              Con la cuenta autorizada y el test de perfil de inversor hecho, así se ve por dentro.
            </p>
            <Phones demo={info.demo} title={info.title} />
          </section>

          <section className="ins-block" style={{ "--i": 2 }}>
            <h2>Dónde se usa</h2>
            <p className="ins-lead">Los rubros y las áreas donde más se encuentra.</p>
            <div className="ins-areas">
              {info.areas.map((a) => (
                <div className="card ins-area" key={a.name}>
                  <h3>{a.name}</h3>
                  <p>{a.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="ins-cta">
            <h2>Probalo con saldo virtual.</h2>
            <p>Creá tu cuenta y operá {info.title === "FCI" ? "con FCI" : `con ${info.title.toLowerCase()}`} sin arriesgar dinero real.</p>
            <Link to="/registro" className="btn btn-primary">Creá tu cuenta</Link>
          </section>
        </main>
      )}

      <footer className="ins-foot">NextVest · Simulador educativo. No se opera con dinero real.</footer>
    </div>
  );
}