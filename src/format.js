function fmt(n) {
  const v = Math.abs(Number(n) || 0);
  const [int, dec] = v.toFixed(2).split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${dec}`;
}

export function money(n) {
  const v = Number(n) || 0;
  return `${v < 0 ? "-" : ""}$ ${fmt(v)}`;
}

export function pct(n) {
  const v = Number(n) || 0;
  const sign = v > 0 ? "+" : v < 0 ? "-" : "";
  return `${sign}${fmt(v)}%`;
}

export function arrow(n) {
  const v = Number(n) || 0;
  return v > 0 ? "▲" : v < 0 ? "▼" : "–";
}

export function tone(n) {
  const v = Number(n) || 0;
  return v > 0 ? "up" : v < 0 ? "down" : "muted";
}