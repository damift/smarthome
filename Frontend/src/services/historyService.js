const API_BASE_URL = "http://localhost:8080/api";

function toDisplayValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => toDisplayValue(item, "")).filter(Boolean).join(", ") || fallback;
  }

  if (typeof value === "object") {
    const preferredKeys = ["name", "title", "label", "email", "id"];
    for (const key of preferredKeys) {
      const candidate = value[key];
      if (candidate !== null && candidate !== undefined && typeof candidate !== "object" && candidate !== "") {
        return String(candidate);
      }
    }

    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

function formatActionLabel(value) {
  const raw = toDisplayValue(value);
  if (raw === "-") return raw;

  return raw
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeLog(log = {}, index = 0) {
  return {
    ...log,
    id: log.id ?? `history-${index}`,
    timestamp: log.timestamp ?? log.created_at ?? log.updated_at ?? null,
    user: toDisplayValue(log.user ?? log.user_name ?? log.actor ?? log.created_by),
    room: toDisplayValue(log.room ?? log.room_name),
    device: toDisplayValue(log.device ?? log.device_name),
    action: formatActionLabel(log.action ?? log.action_name ?? log.event),
    description: toDisplayValue(log.description ?? log.value ?? ""),
  };
}

function extractLogs(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.logs)) return data.logs;
  return [];
}

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
      return extractLogs(data).map((log, index) => normalizeLog(log, index));
    } catch (error) {
      console.warn("historyService: error fetching logs:", error);
      return [];
    }
  },
};
