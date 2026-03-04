import React from "react";
import { Button } from "@/components/shadcn/button";

export default function DeviceList({ devices = [], onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto border border-zinc-900 rounded-lg">
      <table className="min-w-full table-fixed">
        {/* Overzicht van alle devices met snelle beheeracties. */}
        <thead>
          <tr className="bg-white">
            <th className="text-left px-6 py-3">Device Name</th>
            <th className="text-left px-6 py-3">Type</th>
            <th className="text-left px-6 py-3">Room</th>
            <th className="text-left px-6 py-3">Status</th>
            <th className="text-left px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Elke rij triggert callbacks in de parent voor edit/delete. */}
          {devices.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md border flex items-center justify-center">{d.icon ?? "🔌"}</div>
                <span>{d.name}</span>
              </td>
              <td className="px-6 py-4"><span className="inline-block px-2 py-1 text-xs rounded-full border bg-white">{d.type}</span></td>
              <td className="px-6 py-4">{d.room}</td>
              <td className="px-6 py-4"><span className={`inline-block px-2 py-1 text-xs rounded-full border ${d.status === "ON" ? "border-green-400 text-green-700" : "border-zinc-300 text-zinc-600"}`}>{d.status}</span></td>
              <td className="px-6 py-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit?.(d.id)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete?.(d.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
