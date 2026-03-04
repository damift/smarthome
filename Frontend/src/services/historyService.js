const API_BASE_URL = "http://localhost:8080/api";

export const historyService = {
  // Normaliseert verschillende backend-response vormen naar 1 array voor de UI.
  async getLogs() {
    try {
      const response = await fetch(`${API_BASE_URL}/logs`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        console.warn(`historyService: response not ok ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.data || data.logs || [];
    } catch (error) {
      console.warn("historyService: error fetching logs:", error);
      return [];
    }
  },
};
