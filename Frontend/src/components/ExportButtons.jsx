import React, { useState } from "react";

export default function ExportButtons({ data, items, filenamePrefix = "history-export" }) {
  const rows = items || data || [];
  const [open, setOpen] = useState(false);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenamePrefix}-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const exportCSV = () => {
    if (!rows || !rows.length) return;
    const headers = ["timestamp", "user", "room", "device", "action", "description"];
    const csvRows = rows.map((r) => [r.timestamp, r.user, r.room, r.device, r.action, (r.description || "").replace(/\n/g, " ")]);
    const csv = [headers, ...csvRows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenamePrefix}-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded border bg-white"
        aria-expanded={open}
      >
        ⬇ Export
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-sm z-10">
          <button onClick={exportCSV} className="w-full text-left px-3 py-2 hover:bg-zinc-50">Export CSV</button>
          <button onClick={exportJSON} className="w-full text-left px-3 py-2 hover:bg-zinc-50">Export JSON</button>
        </div>
      )}
    </div>
  );
}
