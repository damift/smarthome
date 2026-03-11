const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

// 1 centrale base URL voorkomt dat auth-calls per bestand naar een andere backend wijzen.
// Centrale POST-helper zodat login/register exact dezelfde error-afhandeling gebruiken.
// Dit voorkomt dat de ene pagina andere foutteksten toont dan de andere.
async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  // Sommige fouten geven geen JSON terug; dan vallen we veilig terug op een leeg object.
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Laravel validatiefouten zitten vaak in `errors`; die voegen we samen tot 1 leesbare melding.
    const msg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(" ") : null) ||
      "Request failed";
    throw new Error(msg);
  }

  return data;
}

// Login endpoint levert token + user terug; caller slaat die daarna lokaal op.
export function login(email, password) {
  return postJson("/api/login", { email, password });
}

// Register gebruikt password_confirmation zodat backend-validatie (`confirmed`) direct matcht.
export function registerUser({ name, email, password, password_confirmation }) {
  return postJson("/api/register", { name, email, password, password_confirmation });
}
