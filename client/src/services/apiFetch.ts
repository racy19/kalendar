import { store } from "../store/store";
import { logout } from "../store/auth/authSlice";

// fetch wrapper that includes auth token and handles 401 responses
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = store.getState().auth.token;

  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  // invalid token, logout
  if (res.status === 401) {
    store.dispatch(logout());
  }

  return res;
}