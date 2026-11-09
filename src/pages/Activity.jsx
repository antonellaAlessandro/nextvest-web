import { useEffect, useState } from "react";
import { request, getSession } from "../http.js";
import { money, asList, initials } from "../helpers.js";
import "./Activity.css";

const FILTERS = [
  { key: "ALL", label: "Todas" },
  { key: "BUY", label: "Compras" },
  { key: "SELL", label: "Ventas" },
];

const TYPES = {
  BUY: { label: "Compra", cls: "buy" },
  SELL: { label: "Venta", cls: "" },
};

function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function Activity() {
  const userId = getSession()?.id;
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    request(`/api/orders/user/${userId}`)
      .then((d) => alive && setOrders(asList(d, "orders")))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [userId]);

  if (loading) return <p className="ac-muted">Cargando…</p>;

  const shown = filter === "ALL" ? orders : orders.filter((o) => o.type === filter);

  return (
    <div className="ac">
      {error && <div className="ac-error" role="alert">{error}</div>}

      <section className="ac-card">
        <div className="ac-head">
          <h3>Historial de operaciones</h3>
          <div className="ac-seg" role="tablist" aria-label="Filtrar por tipo">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                className={filter === f.key ? "on" : ""}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="ac-empty">
            <b>{orders.length === 0 ? "Todavía no hiciste operaciones" : "No hay operaciones de este tipo"}</b>
            <span>
              {orders.length === 0
                ? "Cuando compres o vendas un instrumento, vas a verlo acá."
                : "Probá con otro filtro."}
            </span>
          </div>
        ) : (
          shown.map((o) => {
            const t = TYPES[o.type] ?? { label: o.type, cls: "" };
            return (
              <div className="ac-row" key={o.id}>
                <div className="ac-tile">{initials(o.ticker)}</div>
                <div className="ac-nm">
                  <b>{o.ticker}</b>
                  <span>{o.instrumentName}</span>
                </div>
                <div className="ac-when">
                  <span className={`ac-tag ${t.cls}`}>{t.label}</span>
                  <small>{formatDateTime(o.dateTime)}</small>
                </div>
                <div className="ac-detail num">
                  {o.units} × {money(o.unitPrice)}
                </div>
                <div className="ac-total num">{money(o.totalAmount)}</div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}