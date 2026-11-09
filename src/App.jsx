import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Pending from "./pages/Pending.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Glossary from "./pages/Glossary.jsx";
import Market from "./pages/Market.jsx";

function Pantalla({ titulo }) {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontWeight: 500 }}>{titulo}</h1>
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
      <Route path="/instrumentos/:slug" element={<Pantalla titulo="Instrumento" />} />

      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="mercado" element={<Pantalla titulo="Mercado" />} />
        <Route path="actividad" element={<Pantalla titulo="Actividad" />} />
        <Route path="cartera" element={<Pantalla titulo="Cartera" />} />
        <Route path="perfil" element={<Pantalla titulo="Test de perfil de inversor" />} />
        <Route path="glosario" element={<Glossary />} />
        <Route path="mercado" element={<Market />} />
      </Route>

      <Route path="*" element={<Pantalla titulo="Página no encontrada" />} />
    </Routes>
  );
}