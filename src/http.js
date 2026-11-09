// Cliente HTTP mínimo para la zona privada.
// Usa el mismo token y la misma sesión que ya guarda el login.

export const API_URL = "http://localhost:8081";

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("session"));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("session");
}

export async function request(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (res.status === 401 && token) {
    logout();
    window.location.href = "/login";
    throw new Error("La sesión expiró. Volvé a ingresar.");
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const err = new Error((data && data.detail) || "Ocurrió un error. Intentá de nuevo.");
    err.status = res.status;
    throw err;
  }
  return data;
}