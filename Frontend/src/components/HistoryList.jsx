import React from "react";
import HistoryItem from "./HistoryItem";

export default function HistoryList({ items = [] }) {
  if (!items.length) return <div className="text-zinc-500">No history yet.</div>;

  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((it) => (
        <HistoryItem key={it.id} item={it} />
      ))}
    </div>
  );
}
