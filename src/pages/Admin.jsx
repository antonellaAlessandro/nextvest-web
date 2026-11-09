import { useEffect, useState } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import { request, getSession } from "../http.js";
import { initials } from "../helpers.js";
import "./Admin.css";

const STATUS = {
  ACTIVA: { label: "Activa", cls: "" },
  PENDIENTE: { label: "Pendiente", cls: "pending" },
  SUSPENDIDA: { label: "Suspendida", cls: "dim" },
  RECHAZADA: { label: "Rechazada", cls: "dim" },
};

const FILTERS = [
  { key: "ALL", label: "Todas" },
  { key: "PENDIENTE", label: "Pendientes" },
  { key: "ACTIVA", label: "Activas" },
  { key: "SUSPENDIDA", label: "Suspendidas" },
  { key: "RECHAZADA", label: "Rechazadas" },
];

// Qué se puede hacer según el estado actual de la cuenta.
const ACTIONS = {
  PENDIENTE: [
    { to: "ACTIVA", label: "Aprobar cuenta", primary: true },
    { to: "RECHAZADA", label: "Rechazar", confirm: true },
  ],
  ACTIVA: [{ to: "SUSPENDIDA", label: "Suspender", confirm: true }],
  SUSPENDIDA: [{ to: "ACTIVA", label: "Reactivar", primary: true }],
  RECHAZADA: [{ to: "ACTIVA", label: "Aprobar cuenta", primary: true }],
};

const fullName = (u) => `${u.name ?? ""} ${u.lastName ?? ""}`.trim() || u.email;
const roleLabel = (role) => (String(role ?? "").toUpperCase().includes("ADMIN") ? "Administrador" : "Usuario");

function formatBirth(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  const age = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
  const text = d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  return `${text} (${age} años)`;
}

function Line({ label, value }) {
  return (
    <div className="ad-line">
      <span>{label}</span>
      <b>{value || "—"}</b>
    </div>
  );
}

export default function Admin() {
  const { admin } = useOutletContext();
  const myId = getSession()?.id;

  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");


  useEffect(() => {
    if (!admin) return;
    let alive = true;
    request("/api/admin/users")
      .then((d) => alive && setUsers(Array.isArray(d) ? d : []))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [admin]);

  if (!admin) return <Navigate to="/app" replace />;

  async function select(id) {
    setSelectedId(id);
    setDetail(null);
    setConfirming(null);
    setActionError("");
    setDetailLoading(true);
    try {
      setDetail(await request(`/api/admin/users/${id}`));
    } catch (e) {
      setActionError(e.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function apply(to) {
    setSaving(true);
    setActionError("");
    try {
      const res = await request(`/api/admin/users/${selectedId}/status`, {
        method: "PUT",
        body: { accountStatus: to },
      });
      setUsers((list) => list.map((u) => (u.id === selectedId ? { ...u, accountStatus: res.accountStatus ?? to } : u)));
      setDetail((d) => (d ? { ...d, accountStatus: res.accountStatus ?? to } : d));
      setConfirming(null);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="ad-muted">Cargando…</p>;

  const pendingCount = users.filter((u) => u.accountStatus === "PENDIENTE").length;
  const shown = filter === "ALL" ? users : users.filter((u) => u.accountStatus === filter);
  const rep = detail?.legalRepresentative ?? detail?.representative ?? null;
  const isSelf = selectedId === myId;
  const actions = detail ? ACTIONS[detail.accountStatus] ?? [] : [];

  return (
    <div className="ad">
      {error && <div className="ad-error" role="alert">{error}</div>}

      <div className="ad-grid">
        <section className="ad-card">
          <div className="ad-head">
            <h3>Cuentas</h3>
            <div className="ad-seg" role="tablist" aria-label="Filtrar por estado">
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
                  {f.key === "PENDIENTE" && pendingCount > 0 && <i className="num">{pendingCount}</i>}
                </button>
              ))}
            </div>
          </div>

          {shown.length === 0 ? (
            <div className="ad-empty">
              <b>No hay cuentas en este estado</b>
              <span>Probá con otro filtro.</span>
            </div>
          ) : (
            shown.map((u) => {
              const st = STATUS[u.accountStatus] ?? { label: u.accountStatus, cls: "dim" };
              return (
                <button
                  type="button"
                  key={u.id}
                  className={`ad-row${u.id === selectedId ? " sel" : ""}`}
                  onClick={() => select(u.id)}
                >
                  <div className="ad-tile">{initials(u.name || u.email)}</div>
                  <div className="ad-nm">
                    <b>{fullName(u)}</b>
                    <span>{u.email}</span>
                  </div>
                  <span className="ad-role">{roleLabel(u.role)}</span>
                  <span className={`ad-tag ${st.cls}`}>{st.label}</span>
                </button>
              );
            })
          )}
        </section>

        {selectedId ? (
          <aside className="ad-card ad-panel">
            {detailLoading && <p className="ad-muted">Cargando…</p>}

            {detail && (
              <>
                <div className="ad-panel-head">
                  <div>
                    <h3>{fullName(detail)}</h3>
                    <p className="ad-muted">{detail.email}</p>
                  </div>
                  <span className={`ad-tag ${(STATUS[detail.accountStatus] ?? { cls: "dim" }).cls}`}>
                    {(STATUS[detail.accountStatus] ?? { label: detail.accountStatus }).label}
                  </span>
                </div>

                <div className="ad-lines">
                  <Line label="DNI" value={detail.dni} />
                  <Line label="Nacimiento" value={formatBirth(detail.birthDate)} />
                  <Line label="Rol" value={roleLabel(detail.role)} />
                </div>

                <h4>Representante legal</h4>
                {rep ? (
                  <div className="ad-lines">
                    <Line label="Nombre" value={`${rep.name ?? ""} ${rep.lastName ?? ""}`.trim()} />
                    <Line label="Email" value={rep.email} />
                    <Line label="DNI" value={rep.dni} />
                  </div>
                ) : (
                  <p className="ad-muted">No hay un representante legal cargado.</p>
                )}

                {isSelf ? (
                  <p className="ad-muted ad-note">No podés cambiar el estado de tu propia cuenta.</p>
                ) : confirming ? (
                  <div className="ad-confirm">
                    <p>¿Confirmás esta acción sobre la cuenta?</p>
                    <div className="ad-actions">
                      <button type="button" className="btn btn-primary" disabled={saving} onClick={() => apply(confirming)}>
                        {saving ? "Guardando…" : "Sí, confirmar"}
                      </button>
                      <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => setConfirming(null)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ad-actions">
                    {actions.map((a) => (
                      <button
                        key={a.to}
                        type="button"
                        className={`btn ${a.primary ? "btn-primary" : "btn-ghost"}`}
                        disabled={saving}
                        onClick={() => (a.confirm ? setConfirming(a.to) : apply(a.to))}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}

                {actionError && <p className="ad-block" role="alert">{actionError}</p>}
              </>
            )}

            {!detail && !detailLoading && actionError && <p className="ad-block" role="alert">{actionError}</p>}
          </aside>
        ) : (
          <aside className="ad-card ad-empty">
            <b>Elegí una cuenta</b>
            <span>Tocá una fila para ver sus datos y aprobarla, rechazarla o suspenderla.</span>
          </aside>
        )}
      </div>
    </div>
  );
}