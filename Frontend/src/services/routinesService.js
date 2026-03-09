const API_BASE_URL = "http://localhost:8080/api";

function buildAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const routinesService = {
  async getRoutines() {
    const response = await fetch(`${API_BASE_URL}/routines`, {
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

  async activateRoutine(routineId) {
    const response = await fetch(`${API_BASE_URL}/routines/${routineId}/activate`, {
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

