import React, { useMemo } from "react";
import HistoryFilters from "@/components/HistoryFilters";
import ExportButtons from "@/components/ExportButtons";
import HistoryTable from "@/components/HistoryTable";

const raw = [
  { id: 1, room: "Living Room", title: "Light turned on", description: "Ceiling light was switched on via schedule." },
  { id: 2, room: "Kitchen", title: "Motion detected", description: "Motion sensor detected movement near the counter." },
  { id: 3, room: "Garage", title: "Door unlocked", description: "Garage door was unlocked using mobile app." },
  { id: 4, room: "Bedroom", title: "Temperature set", description: "Thermostat target temperature changed to 21°C." },
  { id: 5, room: "Bathroom", title: "Camera snapshot", description: "Camera captured a snapshot at 07:12." },
];

export default function HistoryPage() {
  const items = useMemo(() => {
    const now = Date.now();
    return raw.map((r, idx) => ({
      id: r.id,
      timestamp: new Date(now - [2 * 60 * 1000, 12 * 60 * 1000, 60 * 60 * 1000, 24 * 60 * 60 * 1000, 2 * 24 * 60 * 60 * 1000][idx] || 0).toISOString(),
      user: idx % 2 === 0 ? "System" : "Imad",
      room: r.room,
      device: r.title.split(" ")[0],
      action: r.title,
      note: r.description,
    }));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-zinc-400">Overview of recent activity and events</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <HistoryFilters />
          </div>
          <div>
            <ExportButtons items={items} filenamePrefix="history-export" />
          </div>
        </div>

        <HistoryTable items={items} />

        <div className="text-sm text-zinc-500">Showing {items.length} of {items.length} logs</div>
      </div>
    </div>
  );
}
