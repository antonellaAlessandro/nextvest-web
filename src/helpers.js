// Formato y adaptadores compartidos entre pantallas.
// Si un nombre de campo del backend cambia, se corrige acá.

const nf = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const money = (n) => {
  const v = Number(n) || 0;
  return `${v < 0 ? "−" : ""}$ ${nf.format(Math.abs(v))}`;
};
export const pct = (n) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${nf.format(Math.abs(n))} %`;
export const tone = (n) => (n > 0 ? "up" : n < 0 ? "down" : "");
export const asList = (d, key) => (Array.isArray(d) ? d : d?.[key] ?? []);
export const initials = (t) => String(t).slice(0, 2).toUpperCase();

// Orden de los perfiles: un instrumento exige un perfil mínimo.
export const PROFILE_RANK = { CONSERVATIVE: 0, MODERATE: 1 };
export const PROFILE_NAME = { CONSERVATIVE: "conservador", MODERATE: "moderado" };

const TYPE_LABEL = {
  STOCK: { label: "Acción", term: "accion" },
  ACCION: { label: "Acción", term: "accion" },
  CEDEAR: { label: "CEDEAR", term: "cedear" },
  ETF: { label: "ETF", term: "etf" },
  FCI: { label: "FCI", term: "fci" },
};

export function typeInfo(raw) {
  if (!raw) return null;
  return TYPE_LABEL[String(raw).toUpperCase()] ?? { label: String(raw), term: null };
}

export function normalizeInstrument(i) {
  return {
    id: i.id,
    ticker: i.ticker ?? i.symbol ?? "—",
    name: i.name ?? "",
    type: typeInfo(i.type),
    price: Number(i.currentPrice ?? i.price ?? 0),
    description: i.description ?? "",
    minimumProfile: i.minimumProfile ?? "CONSERVATIVE",
  };
}

export function normalizePosition(p) {
  const qty = Number(p.units ?? p.quantity ?? 0);
  const price = Number(p.currentPrice ?? 0);
  const avg = Number(p.averageBuyPrice ?? 0);
  const value = Number(p.currentValue ?? qty * price);
  const cost = avg > 0 ? avg * qty : 0;
  return {
    id: p.id,
    instrumentId: p.instrumentId, // si el backend lo manda; si no, se busca por ticker
    ticker: p.ticker ?? "—",
    name: p.instrumentName ?? "",
    qty,
    price,
    value,
    cost,
    change: cost > 0 ? ((value - cost) / cost) * 100 : null,
  };
}

// El rol viene en los datos del usuario (por ejemplo "ADMIN"). Solo se usa para mostrar u ocultar el panel;
// la protección real de /api/admin la hace el backend.
export const isAdmin = (user) => String(user?.role ?? "").toUpperCase().includes("ADMIN");