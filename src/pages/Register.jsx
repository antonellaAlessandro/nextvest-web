import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { api } from "../api.js";

function ageFrom(dateString) {
  const birth = new Date(dateString);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

const EMPTY = {
  name: "",
  lastName: "",
  dni: "",
  birthDate: "",
  email: "",
  password: "",
  confirm: "",
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function validate() {
    if (!form.name.trim() || !form.lastName.trim()) return "Completá el nombre y el apellido.";
    if (!/^\d{7,8}$/.test(form.dni.trim())) return "El DNI tiene que tener 7 u 8 números, sin puntos.";
    const age = ageFrom(form.birthDate);
    if (age === null) return "Ingresá la fecha de nacimiento.";
    if (age < 13 || age > 17) return "NextVest es para chicos de 13 a 17 años.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Ingresá un correo electrónico válido.";
    if (form.password.length < 8) return "La contraseña tiene que tener al menos 8 caracteres.";
    if (form.password !== form.confirm) return "Las contraseñas no coinciden.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api("/api/users/register", {
        method: "POST",
        body: {
          name: form.name.trim(),
          lastName: form.lastName.trim(),
          dni: form.dni.trim(),
          birthDate: form.birthDate,
          email: form.email.trim(),
          password: form.password,
        },
      });
      navigate("/pendiente", { state: { justRegistered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Creá tu cuenta"
      subtitle="Todos los fondos son virtuales. Un representante legal tiene que autorizar la cuenta."
      footer={
        <>
          ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
        </>
      }
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-row">
          <div className="field">
            <label htmlFor="name">Nombre</label>
            <input id="name" autoComplete="given-name" value={form.name} onChange={set("name")} />
          </div>
          <div className="field">
            <label htmlFor="lastName">Apellido</label>
            <input id="lastName" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="dni">DNI</label>
            <input id="dni" inputMode="numeric" value={form.dni} onChange={set("dni")} />
          </div>
          <div className="field">
            <label htmlFor="birthDate">Fecha de nacimiento</label>
            <input id="birthDate" type="date" value={form.birthDate} onChange={set("birthDate")} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
          />
          <span className="field-hint">Mínimo 8 caracteres.</span>
        </div>
        <div className="field">
          <label htmlFor="confirm">Repetir contraseña</label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={set("confirm")}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creando cuenta..." : "Creá tu cuenta"}
        </button>
      </form>
    </AuthLayout>
  );
}