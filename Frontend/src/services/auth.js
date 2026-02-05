const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(" ") : null) ||
      "Login failed";
    throw new Error(msg);
  }

  return data;
}
