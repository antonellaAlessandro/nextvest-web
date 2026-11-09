import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Pending from "./pages/Pending.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Market from "./pages/Market.jsx";
import Glossary from "./pages/Glossary.jsx";

// Pantalla provisoria para las secciones que todavía no están armadas.
function Placeholder({ title }) {
  return (
    <div style={{ padding: 24 }}>
      {title && <h1 style={{ fontWeight: 400 }}>{title}</h1>}
      <p className="muted">Esta pantalla se arma en el próximo paso.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/pendiente" element={<Pending />} />
      <Route path="/instrumentos/:slug" element={<Placeholder title="Instrumento" />} />

      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="mercado" element={<Market />} />
        <Route path="actividad" element={<Placeholder />} />
        <Route path="cartera" element={<Placeholder />} />
        <Route path="perfil" element={<Placeholder />} />
        <Route path="glosario" element={<Glossary />} />
      </Route>

      <Route path="*" element={<Placeholder title="Página no encontrada" />} />
    </Routes>
  );
}