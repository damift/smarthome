import { getToken } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

function getAuthHeaders(includeJson = false) {
  const token = getToken();
  const headers = {};

  if (token) headers.Authorization = `Bearer ${token}`;
  if (includeJson) {
    headers["Content-Type"] = "application/json";
    headers.Accept = "application/json";
  }

  return headers;
}

async function handleResponse(res) {
  const text = await res.text().catch(() => "");
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      text ||
      `${res.status} ${res.statusText}`;

    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function getUsers() {
  const res = await fetch(`${API_BASE}/api/user`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
}

export async function createUser({
  name,
  email,
  password,
  password_confirmation,
  role,
}) {
  const body = { name, email, password, password_confirmation };
  if (role) body.role = role;

  const res = await fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: getAuthHeaders(true), // pakt token mee als aanwezig
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(true),
  });

  if (res.status === 204) return null;
  return handleResponse(res);
}

export async function assignRole(id, role) {
  // Backend gaf aan dat deze endpoint PUT verwacht
  // Als jouw backend route anders is, pas alleen de URL aan (bijv. /api/users/${id})
  const res = await fetch(`${API_BASE}/api/users/${id}/role`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ role }),
  });

  return handleResponse(res);
}

export default {
  getUsers,
  createUser,
  deleteUser,
  assignRole,
};