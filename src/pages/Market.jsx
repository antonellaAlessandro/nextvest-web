import { useEffect, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { request, getSession } from "../http.js";
import Term from "../components/Term.jsx";
import {
  money,
  asList,
  initials,
  normalizeInstrument,
  normalizePosition,
  PROFILE_RANK,
  PROFILE_NAME,
} from "../helpers.js";
import "./Market.css";

const TYPE_FILTERS = [
  { key: "ALL", label: "Todos" },
  { key: "Acción", label: "Acciones" },
  { key: "Bono", label: "Bonos" },
  { key: "CEDEAR", label: "CEDEARs" },
  { key: "FCI", label: "FCI" },
];

const rank = (type) => PROFILE_RANK[type] ?? 0;

function Line({ label, value, strong }) {
  return (
    <div className={`mk-line${strong ? " strong" : ""}`}>
      <span>{label}</span>
      <b className="num">{value}</b>
    </div>
  );
}

/* ---------- Panel de orden: formulario, confirmación y resultado ---------- */

function OrderPanel({ mode, target, balance, profile, userId, onDone, onClose }) {
  const isBuy = mode === "buy";
  const [units, setUnits] = useState("1");
  const [step, setStep] = useState("form"); // form | confirm | done
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const n = Number(units);
  const valid = Number.isInteger(n) && n >= 1;
  const total = valid ? n * target.price : 0;

  const noProfile = isBuy && !profile;
  const unsuitable = isBuy && profile && rank(target.minimumProfile) > rank(profile.type);
  const noFunds = isBuy && valid && total > balance;
  const tooMany = !isBuy && valid && n > target.held;

  let block = "";
  if (noProfile) block = "Completá el test de perfil de inversor para poder comprar.";
  else if (unsuitable) block = "Este instrumento no corresponde a tu perfil de inversor.";
  else if (!valid) block = "Ingresá una cantidad entera, de 1 en adelante.";
  else if (noFunds) block = "No tenés saldo suficiente para esta compra.";
  else if (tooMany) block = `Solo tenés ${target.held} ${target.held === 1 ? "unidad" : "unidades"} para vender.`;
  else if (!target.id) block = "No pudimos identificar el instrumento.";

  function step_(delta) {
    const base = valid ? n : 0;
    setUnits(String(Math.max(1, base + delta)));
  }

  async function submit() {
    setSaving(true);
    setError("");
    try {
      const res = await request(isBuy ? "/api/orders/buy" : "/api/orders/sell", {
        method: "POST",
        body: { userId, instrumentId: target.id, units: n },
      });
      setResult(res);
      setStep("done");
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const verb = isBuy ? "Comprar" : "Vender";
  const balanceAfter = isBuy ? balance - total : balance + total;

  return (
    <aside className="mk-panel">
      <div className="mk-panel-head">
        <div>
          <h3>{step === "confirm" ? "Confirmá la orden" : step === "done" ? "Orden ejecutada" : `${verb} ${target.ticker}`}</h3>
          <p>{target.name}</p>
        </div>
        {step !== "done" && (
          <button type="button" className="mk-close" onClick={onClose} aria-label="Cerrar">×</button>
        )}
      </div>

      {step === "form" && (
        <>
          {isBuy && target.description && <p className="mk-desc">{target.description}</p>}

          <div className="mk-lines">
            <Line label="Precio unitario" value={money(target.price)} />
            {isBuy ? (
              <Line label="Saldo disponible" value={money(balance)} />
            ) : (
              <Line label="Unidades en portafolio" value={target.held} />
            )}
          </div>

          <label className="mk-label" htmlFor="mk-units">Cantidad</label>
          <div className="mk-stepper">
            <button type="button" onClick={() => step_(-1)} aria-label="Menos">−</button>
            <input
              id="mk-units"
              className="num"
              type="text"
              inputMode="numeric"
              value={units}
              onChange={(e) => setUnits(e.target.value.replace(/[^\d]/g, ""))}
            />
            <button type="button" onClick={() => step_(1)} aria-label="Más">+</button>
          </div>

          <div className="mk-lines">
            <Line label="Total" value={money(total)} strong />
          </div>

          {block && (
            <p className="mk-block" role="alert">
              {block}
              {noProfile && <> <Link to="/app/perfil">Hacer el test</Link></>}
            </p>
          )}

          <div className="mk-actions">
            <button type="button" className="btn btn-primary" disabled={Boolean(block)} onClick={() => setStep("confirm")}>
              Revisar orden
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          </div>
        </>
      )}

      {step === "confirm" && (
        <>
          <div className="mk-lines">
            <Line label="Operación" value={isBuy ? "Compra" : "Venta"} />
            <Line label="Instrumento" value={target.ticker} />
            <Line label="Cantidad" value={n} />
            <Line label="Precio unitario" value={money(target.price)} />
            <Line label="Total" value={money(total)} strong />
            <Line label="Saldo después de la operación" value={money(balanceAfter)} />
          </div>

          {error && <p className="mk-block" role="alert">{error}</p>}

          <div className="mk-actions">
            <button type="button" className="btn btn-primary" disabled={saving} onClick={submit}>
              {saving ? "Procesando…" : isBuy ? "Confirmar compra" : "Confirmar venta"}
            </button>
            <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => { setStep("form"); setError(""); }}>
              Volver
            </button>
          </div>
        </>
      )}

      {step === "done" && (
        <>
          <p className="mk-desc">
            {isBuy ? "Compraste" : "Vendiste"} {n} {n === 1 ? "unidad" : "unidades"} de {target.ticker} por{" "}
            <span className="num">{money(result?.totalAmount ?? total)}</span>.
          </p>
          <div className="mk-actions">
            <Link to="/app/actividad" className="btn btn-primary">Ver actividad</Link>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Seguir operando</button>
          </div>
        </>
      )}
    </aside>
  );
}

/* ---------- Pantalla ---------- */

export default function Market() {
  const { profile } = useOutletContext();
  const userId = getSession()?.id;
  const [params, setParams] = useSearchParams();

  const [instruments, setInstruments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  async function load() {
    const [m, p, w] = await Promise.allSettled([
      request("/api/instruments/market"),
      request(`/api/portfolios/user/${userId}/positions`),
      request(`/api/wallets/user/${userId}`),
    ]);
    if (m.status === "fulfilled") setInstruments(asList(m.value, "instruments").map(normalizeInstrument));
    if (p.status === "fulfilled") setPositions(asList(p.value, "positions").map(normalizePosition));
    if (w.status === "fulfilled") setBalance(Number(w.value?.availableBalance ?? w.value?.balance ?? 0));
    const failed = [m, p, w].find((r) => r.status === "rejected");
    setError(failed ? failed.reason?.message || "No pudimos cargar algunos datos." : "");
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heldOf = (ticker) => positions.find((p) => p.ticker === ticker)?.qty ?? 0;

  /* Qué instrumento y qué acción están elegidos (vienen en la URL) */
  const action = params.get("accion");
  const mode = action === "vender" ? "sell" : action === "comprar" ? "buy" : null;
  const idParam = params.get("instrumento");
  const tickerParam = params.get("ticker");

  let target = null;
  if (mode === "buy") {
    const ins = instruments.find((i) => String(i.id) === idParam);
    if (ins) target = { ...ins, held: heldOf(ins.ticker) };
  }
  if (mode === "sell") {
    const pos = positions.find(
      (p) => (idParam && String(p.instrumentId) === idParam) || (tickerParam && p.ticker === tickerParam)
    );
    if (pos) {
      const ins = instruments.find((i) => String(i.id) === String(pos.instrumentId) || i.ticker === pos.ticker);
      target = {
        id: ins?.id ?? pos.instrumentId,
        ticker: pos.ticker,
        name: pos.name,
        price: pos.price || ins?.price || 0,
        description: ins?.description ?? "",
        minimumProfile: ins?.minimumProfile,
        held: pos.qty,
      };
    }
  }

  const visible = instruments.filter((i) => typeFilter === "ALL" || i.type?.label === typeFilter);

  const choose = (ins, accion) => setParams({ instrumento: ins.id, accion });
  const close = () => setParams({});

  if (loading) return <p className="mk-muted">Cargando…</p>;

  return (
    <div className="mk">
      {error && <div className="mk-error" role="alert">{error}</div>}

      <div className="mk-grid">
        <section className="mk-card">
          <h3>Instrumentos disponibles</h3>

          <div className="mk-seg" role="tablist" aria-label="Filtrar por tipo">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={typeFilter === f.key}
                className={typeFilter === f.key ? "on" : ""}
                onClick={() => setTypeFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {visible.length === 0 && <p className="mk-muted">No hay instrumentos para mostrar.</p>}

          {visible.map((i) => {
            const held = heldOf(i.ticker);
            const selected = target && target.ticker === i.ticker;
            return (
              <div className={`mk-row${selected ? " sel" : ""}`} key={i.id}>
                <div className="mk-tile">{initials(i.ticker)}</div>
                <div className="mk-nm">
                  <b>{i.ticker}</b>
                  <span className="mk-sub">
                    {i.type && (<><Term id={i.type.term}>{i.type.label}</Term> · </>)}
                    {i.name}
                  </span>
                </div>
                <div className="mk-price num">{money(i.price)}</div>
                <button type="button" className="mk-act buy" onClick={() => choose(i, "comprar")}>Comprar</button>
                {held > 0 && (
                  <button type="button" className="mk-act" onClick={() => choose(i, "vender")}>Vender</button>
                )}
              </div>
            );
          })}
        </section>

        {target ? (
          <OrderPanel
            key={`${mode}-${target.ticker}`}
            mode={mode}
            target={target}
            balance={balance}
            profile={profile}
            userId={userId}
            onDone={load}
            onClose={close}
          />
        ) : (
          <aside className="mk-panel mk-empty">
            {mode ? (
              <>
                <b>No encontramos ese instrumento</b>
                <span>Elegilo de la lista para operar.</span>
              </>
            ) : (
              <>
                <b>Elegí un instrumento</b>
                <span>Tocá Comprar o Vender en la lista y acá vas a ver el detalle de la orden.</span>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}