import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { logout, isLoggedIn } from "../auth.js";

export default function Pending() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const justRegistered = Boolean(state?.justRegistered);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <AuthLayout
      title="Cuenta pendiente de autorización"
      subtitle={
        justRegistered
          ? "Recibimos tu registro."
          : "Tu cuenta todavía no está activa."
      }
    >
      <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
        Para operar, un representante legal tiene que autorizar la cuenta. Cuando esté
        autorizada, vas a poder ingresar y completar el test de perfil de inversor.
      </p>
      {isLoggedIn() ? (
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          Salir
        </button>
      ) : (
        <Link to="/login" className="btn btn-primary" style={{ textAlign: "center" }}>
          Ir a Ingresar
        </Link>
      )}
    </AuthLayout>
  );
}