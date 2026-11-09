import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { api } from "../api.js";
import { saveSession, logout } from "../auth.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Completá el correo y la contraseña.");
      return;
    }
    setLoading(true);
    try {
      logout();
      const data = await api("/api/users/login", {
        method: "POST",
        body: { email: email.trim(), password },
      });
      saveSession(data);
      navigate(data.accountStatus === "ACTIVA" ? "/app" : "/pendiente");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Ingresar"
      subtitle="Accedé a tu cuenta simulada."
      footer={
        <>
          ¿No tenés cuenta? <Link to="/registro">Creá una</Link>
        </>
      }
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </AuthLayout>
  );
}