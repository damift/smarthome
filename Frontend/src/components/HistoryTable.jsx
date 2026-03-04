import React from "react";

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return ts;
  }
}

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
          {items.map((it) => (
            <tr key={it.id} className="border-t">
              <td className="px-4 py-3 align-top">{formatTime(it.timestamp)}</td>
              <td className="px-4 py-3 align-top">{it.user}</td>
              <td className="px-4 py-3 align-top">{it.room}</td>
              <td className="px-4 py-3 align-top">{it.device}</td>
              <td className="px-4 py-3 align-top">
                <div className="inline-block px-3 py-1 border rounded text-xs">{it.action}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
