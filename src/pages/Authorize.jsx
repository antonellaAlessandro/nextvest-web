import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "../http.js";
import "./Authorize.css";

// Pantalla pública: la abre el representante legal desde el link que recibe.
// Usa fetch directo, sin token, para no depender de ninguna sesión guardada.
async function call(path, method = "GET") {
  let res;
  try {
    res = await fetch(API_URL + path, { method });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) throw new Error((data && data.detail) || "Ocurrió un error. Intentá de nuevo.");
  return data;
}

const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString("es-AR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default function Authorize() {
  const { uuid } = useParams();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(""); // authorized | rejected
  const [confirmReject, setConfirmReject] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    call(`/api/authorization/info/${encodeURIComponent(uuid)}`)
      .then((d) => alive && setInfo(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [uuid]);

  async function decide(kind) {
    setSaving(true);
    setError("");
    try {
      await call(`/api/authorization/${kind === "authorized" ? "authorize" : "reject"}/${encodeURIComponent(uuid)}`, "PUT");
      setResult(kind);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  let body;
  if (loading) {
    body = <p className="az-muted">Cargando…</p>;
  } else if (result) {
    body =
      result === "authorized" ? (
        <>
          <h1>Cuenta autorizada</h1>
          <p className="az-lead">
            Listo. {info?.minorName} ya puede ingresar a NextVest y empezar a operar con saldo virtual.
          </p>
        </>
      ) : (
        <>
          <h1>Cuenta rechazada</h1>
          <p className="az-lead">La cuenta de {info?.minorName} no se va a activar. No hace falta que hagas nada más.</p>
        </>
      );
  } else if (!info) {
    body = (
      <>
        <h1>No pudimos abrir este link</h1>
        <p className="az-lead">{error || "El link no es válido."}</p>
      </>
    );
  } else if (info.used || info.expired || !info.pending) {
    body = (
      <>
        <h1>{info.expired && !info.used ? "El link venció" : "Este link ya no se puede usar"}</h1>
        <p className="az-lead">
          {info.expired && !info.used
            ? "Los links de autorización duran 48 horas. Pedile a quien se registró que solicite uno nuevo."
            : "La cuenta ya fue autorizada o rechazada con este link."}
        </p>
      </>
    );
  } else {
    body = (
      <>
        <h1>Autorización de cuenta</h1>
        <p className="az-lead">
          {info.representativeName ? `${info.representativeName}, ` : ""}
          <b>
            {info.minorName} {info.minorLastName}
          </b>
          {info.minorAge != null ? ` (${info.minorAge} años)` : ""} se registró en NextVest y te indicó como representante legal.
        </p>
        <p className="az-text">
          NextVest es un simulador educativo de inversiones: se opera con saldo virtual y nunca se mueve dinero real. Para
          que la cuenta se active necesitamos tu autorización.
        </p>
        <p className="az-small">Este link vence el {fmtDateTime(info.expiration)}.</p>

        {error && <p className="az-error" role="alert">{error}</p>}

        {confirmReject ? (
          <div className="az-actions">
            <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => decide("rejected")}>
              {saving ? "Guardando…" : "Sí, rechazar la cuenta"}
            </button>
            <button type="button" className="btn btn-primary" disabled={saving} onClick={() => setConfirmReject(false)}>
              Volver
            </button>
          </div>
        ) : (
          <div className="az-actions">
            <button type="button" className="btn btn-primary" disabled={saving} onClick={() => decide("authorized")}>
              {saving ? "Guardando…" : "Autorizar cuenta"}
            </button>
            <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => setConfirmReject(true)}>
              Rechazar
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="az">
      <header className="az-top">
        <Link to="/" className="az-logo">
          <img src="/nv-logo-blanco.svg" alt="" height="22" />
          <span>NextVest</span>
        </Link>
      </header>
      <main className="az-main">
        <div className="az-card">{body}</div>
      </main>
      <footer className="az-foot">NextVest · Simulador educativo. No se opera con dinero real.</footer>
    </div>
  );
}