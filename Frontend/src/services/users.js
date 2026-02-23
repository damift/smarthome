import { getToken } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

async function handleResponse(res) {
  const text = await res.text().catch(() => "");
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.message || data?.error || text || `${res.status} ${res.statusText}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function getUsers() {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE}/api/user`, { headers });
  return handleResponse(res);
}

export async function createUser({ name, email, password, password_confirmation, role }) {
  const body = { name, email, password, password_confirmation };
  if (role) body.role = role;
  const res = await fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export default { getUsers, createUser };
