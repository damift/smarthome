const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

// Centrale POST-helper voor auth-calls met uniforme error parsing.
async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(" ") : null) ||
      "Request failed";
    throw new Error(msg);
  }

  return data;
}

// Start login-flow en geeft token/user payload terug.
export function login(email, password) {
  return postJson("/api/login", { email, password });
}

// Start registratie-flow met backend-verwachte velden.
export function registerUser({ name, email, password, password_confirmation }) {
  return postJson("/api/register", { name, email, password, password_confirmation });
}
