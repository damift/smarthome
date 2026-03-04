import React from "react";

export default function HistoryItem({ item }) {
  return (
    // Compacte kaartweergave van 1 history event.
    <div className="border border-zinc-200 rounded-md p-4 bg-white flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 font-semibold">
        {item.icon || "⚙️"}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-zinc-600">{item.room}</div>
            <div className="font-medium text-zinc-900">{item.title}</div>
          </div>
          <div className="text-xs text-zinc-500">{item.timeAgo}</div>
        </div>

        <div className="mt-2 text-sm text-zinc-600">{item.description}</div>
      </div>
    </div>
  );
}
