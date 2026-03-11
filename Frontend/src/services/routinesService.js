import { getToken } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

// Standaard headers voor routine-calls (met bearer token indien aanwezig).
function buildAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const routinesService = {
  // Haalt alle routines op voor de routinespagina.
  async getRoutines() {
    const response = await fetch(`${API_BASE}/api/routines`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Failed to fetch routines: ${response.statusText}`,
      );
    }

    if (!Array.isArray(data)) return [];
    return data;
  },

  // Activeert een routine op de backend.
  async activateRoutine(routineId) {
    const response = await fetch(`${API_BASE}/api/routines/${routineId}/activate`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({}),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Failed to activate routine: ${response.statusText}`,
      );
    }

    return data;
  },
};

