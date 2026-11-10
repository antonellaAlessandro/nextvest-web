import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { request, getSession } from "../http.js";
import { money, pct, tone, asList, initials, normalizePosition } from "../helpers.js";
import "./Portfolio.css";

const COLORS = ["#e6bde2", "#9d7f99", "#c9a0c4", "#6f5a6c", "#cabfc8", "#8a7487"];
const MAX_SLICES = 5;

/* Distribución por valor: los instrumentos más grandes y el resto agrupado */
function buildSlices(positions) {
  const sorted = positions.filter((p) => p.value > 0).sort((a, b) => b.value - a.value);
  const head = sorted.slice(0, MAX_SLICES);
  const rest = sorted.slice(MAX_SLICES);
  const slices = head.map((p) => ({ label: p.ticker, value: p.value }));
  if (rest.length) slices.push({ label: "Otros", value: rest.reduce((s, p) => s + p.value, 0) });
  return slices;
}

function Donut({ slices, count }) {
  const R = 70;
  const C = 2 * Math.PI * R;
  const total = slices.reduce((s, i) => s + i.value, 0);
  let acc = 0;

  return (
    <svg viewBox="0 0 200 200" className="po-donut" role="img" aria-label="Distribución del portafolio">
      <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="22" />
      {slices.map((s, i) => {
        const len = (s.value / total) * C;
        const shown = Math.max(len - 2, 0);
        const circle = (
          <circle
            key={s.label}
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth="22"
            strokeDasharray={`${shown} ${C - shown}`}
            strokeDashoffset={-acc}
            transform="rotate(-90 100 100)"
          />
        );
        acc += len;
        return circle;
      })}
      <text x="100" y="98" textAnchor="middle" fill="#f8f4f7" fontSize="28" fontWeight="300" fontFamily="Poppins, sans-serif">
        {count}
      </text>
      <text x="100" y="120" textAnchor="middle" fill="#cabfc8" fontSize="12" fontFamily="Poppins, sans-serif">
        {count === 1 ? "instrumento" : "instrumentos"}
      </text>
    </svg>
  );
}

export default function Portfolio() {
  const userId = getSession()?.id;
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    request(`/api/portfolios/user/${userId}/positions`)
      .then((d) => alive && setPositions(asList(d, "positions").map(normalizePosition)))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [userId]);

  if (loading) return <p className="po-muted">Cargando…</p>;

  const totalValue = positions.reduce((s, p) => s + p.value, 0);
  const totalCost = positions.reduce((s, p) => s + p.cost, 0);
  const totalGain = totalCost > 0 ? totalValue - totalCost : null;
  const totalPct = totalCost > 0 ? (totalGain / totalCost) * 100 : null;
  const slices = buildSlices(positions);
  const sliceTotal = slices.reduce((s, i) => s + i.value, 0);

  return (
    <div className="po">
      {error && <div className="po-error" role="alert">{error}</div>}

      {positions.length === 0 ? (
        <section className="po-card po-empty">
          <b>Tu portafolio está vacío</b>
          <span>Cuando hagas tu primera compra, tus instrumentos van a aparecer acá.</span>
          <Link to="/app/mercado" className="btn btn-primary">Ir al mercado</Link>
        </section>
      ) : (
        <div className="po-grid">
          <section className="po-card">
            <div className="po-head">
              <div>
                <h3>Mi portafolio</h3>
                <p className="po-muted">Valor total</p>
              </div>
              <div className="po-total">
                <b className="num">{money(totalValue)}</b>
                {totalGain !== null && (
                  <span className={`num ${tone(totalGain)}`}>
                    {totalGain < 0 ? "− " : totalGain > 0 ? "+ " : ""}
                    {money(Math.abs(totalGain))} · {pct(totalPct)}
                  </span>
                )}
              </div>
            </div>

            <div className="po-cols" aria-hidden="true">
              <span>Instrumento</span>
              <span>Cantidad</span>
              <span>Valor</span>
              <span>Resultado</span>
              <span />
            </div>

            {positions.map((p) => (
              <div className="po-row" key={p.id ?? p.ticker}>
                <div className="po-inst">
                  <div className="po-tile">{initials(p.ticker)}</div>
                  <div className="po-nm">
                    <b>{p.ticker}</b>
                    <span>{p.name}</span>
                  </div>
                </div>
                <span className="num po-qty">{p.qty}</span>
                <span className="num">{money(p.value)}</span>
                <span className={`num ${p.change !== null ? tone(p.change) : ""}`}>
                  {p.change !== null ? (
                    <>
                      {money(p.value - p.cost)}
                      <small>{pct(p.change)}</small>
                    </>
                  ) : (
                    "—"
                  )}
                </span>
                <Link
                  className="po-act"
                  to={`/app/mercado?${p.instrumentId ? `instrumento=${p.instrumentId}` : `ticker=${p.ticker}`}&accion=vender`}
                >
                  Vender
                </Link>
              </div>
            ))}
          </section>

          <section className="po-card">
            <h3>Distribución</h3>
            {slices.length > 0 ? (
              <>
                <Donut slices={slices} count={positions.length} />
                <ul className="po-legend">
                  {slices.map((s, i) => (
                    <li key={s.label}>
                      <i style={{ background: COLORS[i % COLORS.length] }} />
                      <span>{s.label}</span>
                      <b className="num">{((s.value / sliceTotal) * 100).toFixed(1).replace(".", ",")} %</b>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="po-muted">No hay valores para mostrar.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}