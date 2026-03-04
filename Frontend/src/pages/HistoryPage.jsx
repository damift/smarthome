import React, { useState, useEffect } from "react";
import HistoryFilters from "@/components/HistoryFilters";
import ExportButtons from "@/components/ExportButtons";
import HistoryTable from "@/components/HistoryTable";
import { historyService } from "@/services/historyService";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Eénmalig historylogs ophalen bij pagina-load.
    async function fetchLogs() {
      try {
        setLoading(true);
        const data = await historyService.getLogs();
        setItems(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch history logs:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-zinc-400">Overview of recent activity and events</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <p className="text-zinc-600">Loading history...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading history</p>
            <p className="text-zinc-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {/* Filters en export werken op dezelfde items-collectie. */}
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
      )}
    </div>
  );
}
