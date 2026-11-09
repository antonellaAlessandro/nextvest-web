import { Link } from "react-router-dom";
import "./AuthLayout.css";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo">
        <span className="auth-logo-mark" />
        <span>NextVest</span>
      </Link>
      <main className="auth-card card">
        <span className="auth-pill">Simulación · fondos virtuales</span>
        <h1>{title}</h1>
        {subtitle && <p className="muted auth-subtitle">{subtitle}</p>}
        {children}
      </main>
      {footer && <div className="auth-footer muted">{footer}</div>}
    </div>
  );
}