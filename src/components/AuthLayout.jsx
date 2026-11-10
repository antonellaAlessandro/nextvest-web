import { Link } from "react-router-dom";
import "./AuthLayout.css";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="auth">
      <header className="auth-top">
        <Link to="/" className="auth-logo">
          <img src="/nv-logo-blanco.svg" alt="" height="22" />
          <span>NextVest</span>
        </Link>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-sub">{subtitle}</p>}
          <div className="auth-body">{children}</div>
          {footer && <div className="auth-foot">{footer}</div>}
        </div>
      </main>

      <footer className="auth-legal">NextVest · Simulador educativo. No se opera con dinero real.</footer>
    </div>
  );
}