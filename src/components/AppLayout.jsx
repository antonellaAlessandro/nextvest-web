import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { request, getSession, logout } from "../http.js";
import LegalNote from "./LegalNote.jsx";
import "./AppLayout.css";

const ICONS = {
  inicio: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 3v9l6 4",
  cartera: "M4 11a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM9 8V6a3 3 0 0 1 6 0v2",
  mercado: "M4 19V9M10 19V5M16 19v-8M22 19H2",
  actividad: "M4 6h16M4 12h16M4 18h10",
  perfil: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21a8 8 0 0 1 16 0",
  glosario: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M9 8h6",
  salir: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
};

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

const NAV = [
  { to: "/app", label: "Inicio", icon: "inicio", end: true },
  { to: "/app/cartera", label: "Cartera", icon: "cartera" },
  { to: "/app/mercado", label: "Mercado", icon: "mercado" },
  { to: "/app/actividad", label: "Actividad", icon: "actividad" },
  { to: "/app/perfil", label: "Perfil de inversor", icon: "perfil" },
  { to: "/app/glosario", label: "Glosario", icon: "glosario" },
];

const TITLES = {
  "/app/cartera": "Cartera",
  "/app/mercado": "Mercado",
  "/app/actividad": "Actividad",
  "/app/perfil": "Perfil de inversor",
  "/app/glosario": "Glosario",
};

const SUBTITLES = {
  "/app/glosario": "Palabras que aparecen en NextVest, explicadas en simple",
};

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function displayName(user, email) {
  const raw = user?.firstName ?? user?.name ?? user?.username ?? (email ? email.split("@")[0] : "");
  return capitalize(String(raw));
}

const PROFILE_NAMES = {
  conservative: "conservador",
  moderate: "moderado",
  aggressive: "agresivo",
};

function profileLabel(profile) {
  if (!profile) return "Perfil sin definir";
  const raw =
    typeof profile === "string"
      ? profile
      : profile.profile ?? profile.riskProfile ?? profile.type ?? profile.name ?? "";
  const key = String(raw).toLowerCase();
  return raw ? `Perfil ${PROFILE_NAMES[key] ?? key}` : "Perfil definido";
}

export default function AppLayout() {
  const session = getSession();
  const token = localStorage.getItem("token");
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  const allowed = Boolean(token && session && session.accountStatus === "ACTIVA");

  useEffect(() => {
    if (!allowed) return;
    let alive = true;
    (async () => {
      const [u, p] = await Promise.allSettled([
        request(`/api/users/${session.id}`),
        // Ruta asumida; si todavía no existe, se toma como "sin perfil".
        request(`/api/risk-profiles/user/${session.id}`),
      ]);
      if (!alive) return;
      if (u.status === "fulfilled") setUser(u.value);
      setProfile(p.status === "fulfilled" && p.value ? p.value : null);
      setReady(true);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, session?.id]);

  if (!token || !session) return <Navigate to="/login" replace />;
  if (session.accountStatus !== "ACTIVA") return <Navigate to="/pendiente" replace />;

  const name = displayName(user, session.email);
  const isHome = location.pathname === "/app" || location.pathname === "/app/";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-frame">
      <aside className="app-side">
        <div className="app-brand">
          <img src="/nv-logo-blanco.svg" alt="" height="22" />
          <span>NextVest</span>
        </div>

        <nav className="app-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? "on" : "")}>
              <Icon name={n.icon} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-bottom">
          <button type="button" className="app-logout" onClick={handleLogout}>
            <Icon name="salir" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <section className="app-main">
        <header className="app-head">
          <div>
            {isHome ? (
              <>
                <h1>
                  Hola, <em>{name}</em>
                </h1>
                <p>Resumen de tu cartera</p>
              </>
            ) : (
              <>
                <h1>{TITLES[location.pathname] ?? "NextVest"}</h1>
                {SUBTITLES[location.pathname] && <p>{SUBTITLES[location.pathname]}</p>}
              </>
            )}
          </div>

          <div className="app-who">
            <div className="app-av">{name ? name.charAt(0) : "?"}</div>
            <div>
              <b>{name}</b>
              <span>{ready ? profileLabel(profile) : " "}</span>
            </div>
          </div>
        </header>

        {ready ? <Outlet context={{ user, profile }} /> : <p className="app-loading">Cargando…</p>}

        <LegalNote />
      </section>
    </div>
  );
}