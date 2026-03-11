import { getToken } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

// We bouwen headers op 1 plek zodat alle requests dezelfde auth/json-contracten gebruiken.
function buildHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Centrale response parser vertaalt technische statuscodes naar bruikbare UI-fouten.
async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message = data?.message || `${response.status} ${response.statusText}`;
    if (response.status === 401) {
      message = "Je sessie is verlopen. Log opnieuw in.";
    } else if (response.status === 403) {
      message = "Alleen admins kunnen device-toegang beheren.";
    }
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const deviceAccessService = {
  // 1 overzicht-call houdt de beheerpagina consistent: users, devices en koppelingen in sync.
  async getOverview() {
    const token = getToken();
    if (!token) {
      // Zonder token direct stoppen voorkomt een nutteloze call en geeft een duidelijkere melding.
      const error = new Error("Je sessie is verlopen. Log opnieuw in.");
      error.status = 401;
      throw error;
    }

    let response;
    try {
      response = await fetch(`${API_BASE}/api/device-access`, {
        method: "GET",
        headers: buildHeaders(),
      });
    } catch {
      const error = new Error("Kan geen verbinding maken met de server.");
      error.status = 0;
      throw error;
    }

    return parseResponse(response);
  },

  // Slaat geselecteerde device-toegang op voor een gebruiker als complete set.
  // Zo verwijderen we impliciet oude rechten die niet meer aangevinkt zijn.
  async updateUserAccess(userId, deviceIds) {
    const token = getToken();
    if (!token) {
      const error = new Error("Je sessie is verlopen. Log opnieuw in.");
      error.status = 401;
      throw error;
    }

    let response;
    try {
      response = await fetch(`${API_BASE}/api/device-access/${userId}`, {
        method: "PUT",
        headers: buildHeaders(),
        body: JSON.stringify({ device_ids: deviceIds }),
      });
    } catch {
      const error = new Error("Kan geen verbinding maken met de server.");
      error.status = 0;
      throw error;
    }

    return parseResponse(response);
  },
};

export default deviceAccessService;
