import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { request, getSession } from "../http.js";
import Term from "../components/Term.jsx";
import "./Dashboard.css";

/* El backend todavía no guarda historial de la cartera.
   Mientras tanto, el gráfico usa datos de ejemplo y lo aclara en pantalla.
   Pasalo a false para mostrar el estado vacío. */
const SHOW_DEMO_CHART = true;

const nf = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (n) => {
  const v = Number(n) || 0;
  return `${v < 0 ? "−" : ""}$ ${nf.format(Math.abs(v))}`;
};
const pct = (n) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${nf.format(Math.abs(n))} %`;
const tone = (n) => (n > 0 ? "up" : n < 0 ? "down" : "");

/* ---------- Adaptadores ----------
   Si algún nombre de campo del backend es distinto, se corrige acá y nada más. */

const TYPE_LABEL = {
  STOCK: { label: "Acción", term: "accion" },
  ACCION: { label: "Acción", term: "accion" },
  CEDEAR: { label: "CEDEAR", term: "cedear" },
  ETF: { label: "ETF", term: "etf" },
};

function normalizeInstrument(i) {
  const type = TYPE_LABEL[String(i.type ?? i.instrumentType ?? "").toUpperCase()];
  return {
    id: i.id,
    ticker: i.ticker ?? i.symbol ?? i.code ?? "—",
    name: i.name ?? i.companyName ?? "",
    type,
    price: Number(i.currentPrice ?? i.price ?? 0),
  };
}

function normalizePosition(p) {
  const ins = p.instrument ?? {};
  const qty = Number(p.quantity ?? p.units ?? 0);
  const price = Number(p.currentPrice ?? ins.currentPrice ?? ins.price ?? 0);
  const avg = Number(p.averageBuyPrice ?? p.averagePrice ?? p.avgPrice ?? p.purchasePrice ?? 0);
  const value = Number(p.currentValue ?? p.totalValue ?? qty * price);
  const cost = avg > 0 ? avg * qty : 0;
  return {
    id: p.id ?? ins.id,
    ticker: p.ticker ?? p.symbol ?? ins.ticker ?? ins.symbol ?? "—",
    name: p.instrumentName ?? ins.name ?? "",
    qty,
    value,
    cost,
    change: cost > 0 ? ((value - cost) / cost) * 100 : null,
  };
}

const asList = (d, key) => (Array.isArray(d) ? d : d?.[key] ?? []);
const initials = (t) => String(t).slice(0, 2).toUpperCase();

/* ---------- Gráfico (datos de ejemplo) ---------- */

const RAW = [150,168,176,160,172,190,184,172,160,168,176,172,164,158,166,172,168,160,152,158,170,178,172,165,160,156,150,158,170,176,170,160,150,146,152,166,178,190,178,166,172,182,176,160,138,128,136,148,152,144,130,118,110,104,112,118,126,118,106,98,92,86,90,98,92,84,78,82,92,98,88,80];
const MONTHS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const Y_LABELS = ["1,4 M", "1,2 M", "1,0 M", "800 k", "600 k"];

function EvolutionChart() {
  const W = 960, H = 190, top = 14, bot = 26, left = 44;

  const g = useMemo(() => {
    const min = 40, max = 215, n = RAW.length;
    const pts = RAW.map((v, i) => [left + (i * (W - left)) / (n - 1), top + (1 - (v - min) / (max - min)) * (H - top - bot)]);
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
    }
    const area = `${d} L${pts[n - 1][0]} ${H - bot} L${pts[0][0]} ${H - bot} Z`;
    const k = Math.round(n * 0.42);
    return { d, area, px: pts[k][0], py: pts[k][1] };
  }, []);

  return (
    <div className="dash-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Evolución de la cartera, datos de ejemplo">
        <defs>
          <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9a8d4" stopOpacity=".45" />
            <stop offset="1" stopColor="#d9a8d4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Y_LABELS.map((l, i) => {
          const y = top + (i * (H - top - bot)) / 4;
          return (
            <g key={l}>
              <line x1={left} x2={W} y1={y} y2={y} stroke="rgba(255,255,255,.08)" />
              <text x="0" y={y + 4} fill="#cabfc8" fontSize="11" fontFamily="Poppins, sans-serif">{l}</text>
            </g>
          );
        })}
        {MONTHS.map((m, i) => (
          <text key={m} x={left + ((i + 0.5) * (W - left)) / 12} y={H - 6} fill="#cabfc8" fontSize="11" textAnchor="middle" fontFamily="Poppins, sans-serif">{m}</text>
        ))}
        <path d={g.area} fill="url(#dashArea)" />
        <path d={g.d} fill="none" stroke="#e4bde0" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <line x1={g.px} x2={g.px} y1={g.py} y2={H - bot} stroke="rgba(255,255,255,.35)" strokeDasharray="3 4" />
        <circle cx={g.px} cy={g.py} r="6" fill="#fff" stroke="#d9a8d4" strokeWidth="3" />
      </svg>
      <div className="dash-tip" style={{ left: `${(g.px / W) * 100}%`, top: `${(g.py / H) * 100 - 4}%` }}>
        <span>1 jun 2026</span>
        <b className="num">$ 1.164.500,00</b>
      </div>
    </div>
  );
}

/* ---------- Pantalla ---------- */

export default function Dashboard() {
  const { profile } = useOutletContext();
  const session = getSession();
  const userId = session?.id;

  const [wallet, setWallet] = useState(null);
  const [positions, setPositions] = useState([]);
  const [market, setMarket] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");

  const hasProfile = Boolean(profile);

  async function loadWallet() {
    setWallet(await request(`/api/wallets/user/${userId}`));
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      const [w, p, m] = await Promise.allSettled([
        request(`/api/wallets/user/${userId}`),
        request(`/api/portfolios/user/${userId}/positions`),
        request("/api/instruments/market"),
      ]);
      if (!alive) return;
      if (w.status === "fulfilled") setWallet(w.value);
      if (p.status === "fulfilled") setPositions(asList(p.value, "positions").map(normalizePosition));
      if (m.status === "fulfilled") setMarket(asList(m.value, "instruments").map(normalizeInstrument));
      const failed = [w, p, m].find((r) => r.status === "rejected");
      if (failed) setError(failed.reason?.message || "No pudimos cargar algunos datos.");
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  const balance = Number(wallet?.availableBalance ?? wallet?.balance ?? wallet?.amount ?? 0);
  const totalValue = positions.reduce((s, p) => s + p.value, 0);
  const totalCost = positions.reduce((s, p) => s + p.cost, 0);
  const totalGain = totalCost > 0 ? totalValue - totalCost : null;
  const totalPct = totalCost > 0 ? (totalGain / totalCost) * 100 : null;

  async function submitFunds(e) {
    e.preventDefault();
    const value = Number(String(amount).replace(",", "."));
    if (!value || value <= 0) {
      setAddError("Ingresá un monto mayor a cero.");
      return;
    }
    setSaving(true);
    setAddError("");
    try {
      await request(`/api/wallets/user/${userId}/add`, { method: "POST", body: value });
      await loadWallet();
      setAmount("");
      setAdding(false);
    } catch (err) {
      setAddError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="dash-muted">Cargando…</p>;

  const shownMarket = market.slice(0, 3);
  const shownPositions = positions.slice(0, 3);

  return (
    <div className="dash">
      {error && <div className="dash-error" role="alert">{error}</div>}

      <div className="dash-grid">
        {/* Valor de la cartera */}
        <section className="dash-card dash-total">
          <h3>Valor de la <Term id="cartera">cartera</Term></h3>
          <div className="dash-amt num">{money(totalValue)}</div>
          {positions.length === 0 ? (
            <div className="dash-delta dash-muted">Todavía no tenés inversiones</div>
          ) : totalGain !== null ? (
            <div className={`dash-delta num ${tone(totalGain)}`}>
              {totalGain < 0 ? "− " : totalGain > 0 ? "+ " : ""}{money(Math.abs(totalGain))} &nbsp;·&nbsp; {pct(totalPct)}
            </div>
          ) : null}
        </section>

        {/* Saldo, o primeros pasos si todavía no hay perfil */}
        {hasProfile ? (
          <section className="dash-card dash-cash">
            <h3><Term id="saldo">Saldo disponible</Term></h3>
            <div className="dash-amt-sm num">{money(balance)}</div>
            {adding ? (
              <form className="dash-form" onSubmit={submitFunds}>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Monto"
                  aria-label="Monto a cargar"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary dash-sm" disabled={saving}>
                  {saving ? "Cargando…" : "Confirmar"}
                </button>
                <button type="button" className="btn btn-ghost dash-sm" onClick={() => { setAdding(false); setAddError(""); }}>
                  Cancelar
                </button>
              </form>
            ) : (
              <button type="button" className="btn btn-primary dash-cta" onClick={() => setAdding(true)}>
                Cargar saldo
              </button>
            )}
            {addError && <div className="dash-form-error" role="alert">{addError}</div>}
          </section>
        ) : (
          <section className="dash-card dash-steps">
            <h3>Primeros pasos</h3>
            <div className="dash-step">
              <span className="dash-n">1</span>
              <span className="dash-step-tx">Test de <Term id="perfil">perfil de inversor</Term></span>
              <Link to="/app/perfil" className="btn btn-primary dash-sm">Hacer el test</Link>
            </div>
            <div className="dash-step off"><span className="dash-n">2</span><span className="dash-step-tx">Cargar saldo</span></div>
            <div className="dash-step off"><span className="dash-n">3</span><span className="dash-step-tx">Primera compra</span></div>
          </section>
        )}

        {/* Mercado */}
        <section className="dash-card dash-watch">
          <h3>Mercado</h3>
          {shownMarket.length === 0 && <p className="dash-muted">No hay instrumentos para mostrar.</p>}
          {shownMarket.map((i) => (
            <div className="dash-row" key={i.id ?? i.ticker}>
              <div className="dash-tile">{initials(i.ticker)}</div>
              <div className="dash-nm">
                <b>{i.ticker}</b>
                <span className="dash-sub">
                  {i.type && (<><Term id={i.type.term}>{i.type.label}</Term> · </>)}
                  {i.name}
                </span>
              </div>
              <div className="dash-pv"><b className="num">{money(i.price)}</b></div>
              {hasProfile ? (
                <Link className="dash-act buy" to={`/app/mercado?instrumento=${i.id}&accion=comprar`}>Comprar</Link>
              ) : (
                <span className="dash-act buy off" aria-disabled="true">Comprar</span>
              )}
            </div>
          ))}
          {!hasProfile && <p className="dash-lock">Completá el test de perfil para habilitar las compras.</p>}
          {hasProfile && <Link className="dash-more" to="/app/mercado">Ver mercado completo</Link>}
        </section>

        {/* Mi cartera */}
        <section className="dash-card dash-port">
          <h3>Mi cartera</h3>
          {shownPositions.length === 0 ? (
            <div className="dash-empty">
              <b>Tu cartera está vacía</b>
              <span>Cuando hagas tu primera compra, tus instrumentos van a aparecer acá.</span>
            </div>
          ) : (
            <>
              {shownPositions.map((p) => (
                <div className="dash-row" key={p.id ?? p.ticker}>
                  <div className="dash-tile">{initials(p.ticker)}</div>
                  <div className="dash-nm">
                    <b>{p.ticker}</b>
                    <span className="dash-sub">Cant. <span className="num">{p.qty}</span></span>
                  </div>
                  <div className="dash-pv">
                    <b className="num">{money(p.value)}</b>
                    {p.change !== null && <span className={`num ${tone(p.change)}`}>{pct(p.change)}</span>}
                  </div>
                  <Link className="dash-act" to={`/app/mercado?instrumento=${p.id}&accion=vender`}>Vender</Link>
                </div>
              ))}
              <Link className="dash-more" to="/app/cartera">Ver cartera completa</Link>
            </>
          )}
        </section>
      </div>

      {/* Evolución */}
      <section className="dash-card dash-perf">
        <div className="dash-perf-head">
          <h3>Evolución de la cartera</h3>
          {positions.length > 0 && SHOW_DEMO_CHART && <small>Datos de ejemplo</small>}
        </div>
        {positions.length > 0 && SHOW_DEMO_CHART ? (
          <EvolutionChart />
        ) : (
          <div className="dash-empty">
            <b>Todavía no hay datos para mostrar</b>
            <span>El gráfico se arma a medida que invertís.</span>
          </div>
        )}
      </section>
    </div>
  );
}