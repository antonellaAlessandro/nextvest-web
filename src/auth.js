import { getToken, setToken, clearToken } from "./api.js";

export function saveSession(data) {
  setToken(data.token);
  localStorage.setItem(
    "session",
    JSON.stringify({ id: data.id, email: data.email, accountStatus: data.accountStatus })
  );
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("session"));
  } catch {
    return null;
  }
}

export function logout() {
  clearToken();
  localStorage.removeItem("session");
}

export function isLoggedIn() {
  return Boolean(getToken());
}