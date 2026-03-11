import React from "react";

// Formatteert ruwe timestamps naar leesbare datum+tijd in de UI.
function formatTime(ts) {
  if (!ts) return "-";

  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return String(ts);
    return d.toLocaleString();
  } catch {
    return ts;
  }
}

// Maakt verschillende datatypes veilig toonbaar in één tabelcel.
function formatCell(value) {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "object") {
    if (value.name) return String(value.name);
    if (value.label) return String(value.label);
    if (value.title) return String(value.title);
    if (value.email) return String(value.email);
    if (value.id !== undefined && value.id !== null) return String(value.id);
    try {
      return JSON.stringify(value);
    } catch {
      return "-";
    }
  }

  return "-";
}

// Basistabel met history records voor de historypagina.
export default function HistoryTable({ items = [] }) {
  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <table className="min-w-full table-fixed text-sm">
        {/* Eenvoudige tabelweergave van de genormaliseerde history items. */}
        <thead className="bg-white">
          <tr>
            <th className="text-left px-4 py-3 border-b">Timestamp</th>
            <th className="text-left px-4 py-3 border-b">User</th>
            <th className="text-left px-4 py-3 border-b">Room</th>
            <th className="text-left px-4 py-3 border-b">Device</th>
            <th className="text-left px-4 py-3 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, index) => (
            <tr key={it.id ?? index} className="border-t">
              <td className="px-4 py-3 align-top">{formatTime(it.timestamp)}</td>
              <td className="px-4 py-3 align-top">{formatCell(it.user)}</td>
              <td className="px-4 py-3 align-top">{formatCell(it.room)}</td>
              <td className="px-4 py-3 align-top">{formatCell(it.device)}</td>
              <td className="px-4 py-3 align-top">
                <div className="inline-block px-3 py-1 border rounded text-xs">{formatCell(it.action)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
