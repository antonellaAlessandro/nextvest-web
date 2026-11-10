import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { request, getSession, logout } from "../http.js";
import { PROFILE_NAME } from "../helpers.js";
import "./Account.css";

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(String(iso).length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
};

function Line({ label, value }) {
  return (
    <div className="ac-line">
      <span>{label}</span>
      <b>{value || "—"}</b>
    </div>
  );
}

/* ---------- Mis datos ---------- */

function DataCard({ user, reloadUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", lastName: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name ?? "", lastName: user.lastName ?? "", email: user.email ?? "" });
  }, [user]);

  const set = (field) => (e) => {
    setDone(false);
    setForm({ ...form, [field]: e.target.value });
  };

  const dirty =
    form.name.trim() !== (user?.name ?? "") ||
    form.lastName.trim() !== (user?.lastName ?? "") ||
    form.email.trim() !== (user?.email ?? "");

  async function save(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.lastName.trim()) return setError("Completá el nombre y el apellido.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Ingresá un correo electrónico válido.");
    setError("");
    setSaving(true);
    try {
      const emailChanged = form.email.trim() !== (user?.email ?? "");
      await request(`/api/users/${user.id}`, {
        method: "PUT",
        body: { name: form.name.trim(), lastName: form.lastName.trim(), email: form.email.trim() },
      });
      if (emailChanged) {
        // El correo es el que identifica la sesión: hay que volver a ingresar con el nuevo.
        logout();
        navigate("/login", { replace: true });
        return;
      }
      await reloadUser();
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="ac-card">
      <h3>Mis datos</h3>
      <form className="ac-form" onSubmit={save} noValidate>
        <div className="ac-row2">
          <div className="ac-field">
            <label htmlFor="ac-name">Nombre</label>
            <input id="ac-name" value={form.name} onChange={set("name")} autoComplete="given-name" />
          </div>
          <div className="ac-field">
            <label htmlFor="ac-last">Apellido</label>
            <input id="ac-last" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
          </div>
        </div>
        <div className="ac-field">
          <label htmlFor="ac-email">Correo electrónico</label>
          <input id="ac-email" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
          <span className="ac-hint">Si lo cambiás, vas a tener que volver a ingresar con el correo nuevo.</span>
        </div>

        <div className="ac-lines">
          <Line label="DNI" value={user?.dni} />
          {user?.birthDate && <Line label="Fecha de nacimiento" value={fmtDate(user.birthDate)} />}
        </div>
        <span className="ac-hint">El DNI y la fecha de nacimiento no se pueden cambiar porque validan tu edad.</span>

        {error && <p className="ac-error" role="alert">{error}</p>}
        {done && <p className="ac-ok" role="status">Datos actualizados.</p>}

        <div className="ac-actions">
          <button type="submit" className="btn btn-primary" disabled={!dirty || saving}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ---------- Contraseña ---------- */

function PasswordCard({ userId }) {
  const [form, setForm] = useState({ current: "", next: "", repeat: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (field) => (e) => {
    setDone(false);
    setForm({ ...form, [field]: e.target.value });
  };

  async function save(e) {
    e.preventDefault();
    if (!form.current) return setError("Ingresá tu contraseña actual.");
    if (form.next.length < 8) return setError("La contraseña nueva tiene que tener al menos 8 caracteres.");
    if (form.next !== form.repeat) return setError("Las contraseñas nuevas no coinciden.");
    setError("");
    setSaving(true);
    try {
      await request(`/api/users/${userId}/password`, {
        method: "PUT",
        body: { currentPassword: form.current, newPassword: form.next },
      });
      setForm({ current: "", next: "", repeat: "" });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="ac-card">
      <h3>Cambiar contraseña</h3>
      <form className="ac-form" onSubmit={save} noValidate>
        <div className="ac-field">
          <label htmlFor="ac-cur">Contraseña actual</label>
          <input id="ac-cur" type="password" autoComplete="current-password" value={form.current} onChange={set("current")} />
        </div>
        <div className="ac-row2">
          <div className="ac-field">
            <label htmlFor="ac-new">Contraseña nueva</label>
            <input id="ac-new" type="password" autoComplete="new-password" value={form.next} onChange={set("next")} />
          </div>
          <div className="ac-field">
            <label htmlFor="ac-rep">Repetir contraseña</label>
            <input id="ac-rep" type="password" autoComplete="new-password" value={form.repeat} onChange={set("repeat")} />
          </div>
        </div>
        <span className="ac-hint">Mínimo 8 caracteres.</span>

        {error && <p className="ac-error" role="alert">{error}</p>}
        {done && <p className="ac-ok" role="status">Contraseña actualizada.</p>}

        <div className="ac-actions">
          <button type="submit" className="btn btn-primary" disabled={saving || !form.current || !form.next}>
            {saving ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ---------- Representante legal (solo lectura) ---------- */

function GuardianCard({ userId }) {
  const [rep, setRep] = useState(undefined); // undefined = cargando · null = sin datos

  useEffect(() => {
    let alive = true;
    request(`/api/authorization/user/${userId}/representative`)
      .then((d) => alive && setRep(d ?? null))
      .catch((e) => alive && setRep(e.status === 404 ? "none" : null));
    return () => {
      alive = false;
    };
  }, [userId]);

  return (
    <section className="ac-card">
      <h3>Representante legal</h3>
      {rep === undefined && <p className="ac-muted">Cargando…</p>}
      {rep === "none" && <p className="ac-muted">Todavía no hay un representante legal cargado.</p>}
      {rep === null && <p className="ac-muted">No pudimos mostrar los datos del representante legal.</p>}
      {rep && rep !== "none" && (
        <div className="ac-lines">
          <Line label="Nombre" value={`${rep.name ?? ""} ${rep.lastName ?? ""}`.trim()} />
          <Line label="Correo electrónico" value={rep.email} />
          <Line label="DNI" value={rep.dni} />
        </div>
      )}
      <p className="ac-hint ac-note">
        Estos datos son solo de lectura. Si hay algo para corregir, <Link to="/contacto">escribinos</Link>.
      </p>
    </section>
  );
}

/* ---------- Perfil de inversor ---------- */

function ProfileCard({ profile }) {
  return (
    <section className="ac-card">
      <h3>Perfil de inversor</h3>
      {profile ? (
        <>
          <div className="ac-lines">
            <Line label="Tu perfil" value={PROFILE_NAME[profile.type] ?? String(profile.type ?? "").toLowerCase()} />
            <Line label="Último test" value={fmtDate(profile.evaluationDate)} />
          </div>
          <p className="ac-hint ac-note">Podés repetir el test cuando quieras. Tu perfil se actualiza con el nuevo resultado.</p>
        </>
      ) : (
        <p className="ac-muted">Todavía no hiciste el test de perfil de inversor.</p>
      )}
      <div className="ac-actions">
        <Link to="/app/perfil" className="btn btn-ghost">
          {profile ? "Repetir el test" : "Hacer el test"}
        </Link>
      </div>
    </section>
  );
}

/* ---------- Pantalla ---------- */

export default function Account() {
  const { user, profile, reloadUser } = useOutletContext();
  const userId = getSession()?.id;

  if (!user) return <p className="ac-muted">Cargando…</p>;

  return (
    <div className="ac">
      <div className="ac-col">
        <DataCard user={user} reloadUser={reloadUser} />
        <PasswordCard userId={userId} />
      </div>
      <div className="ac-col">
        <GuardianCard userId={userId} />
        <ProfileCard profile={profile} />
      </div>
    </div>
  );
}