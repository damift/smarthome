import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";

export default function RoutineCard({ id, title, name, description, changes = [], items = [], icon, onActivate }) {
  const [isActive, setIsActive] = useState(true);

  // Lokale UI-toggle; routine-activatie zelf gaat via onActivate callback.
  const handleToggle = () => setIsActive((v) => !v);

  const displayTitle = title ?? name;
  const displayItems = items.length ? items : changes;

  return (
    <Card className={`border-zinc-900 ${isActive ? "" : "opacity-80"}`}>
      <CardHeader className="flex items-start gap-4 p-6">
        <div className="flex-shrink-0 w-12 h-12 rounded-md border border-zinc-300 flex items-center justify-center">
          {icon ?? <span className="text-xl">⚙️</span>}
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg">{displayTitle}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </div>
        <div className="ml-4">
          <button
            onClick={handleToggle}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              isActive ? "bg-green-600 text-white" : "bg-zinc-700 text-white"
            }`}
          >
            {isActive ? "Aan" : "Uit"}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="border-t border-zinc-200 pt-4">
          <div className="text-xs text-zinc-500 font-semibold mb-2">CHANGES ({displayItems.length})</div>
          <ul className="list-disc list-inside text-sm text-zinc-700 space-y-1">
            {displayItems.slice(0, 3).map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          {displayItems.length > 3 && (
            <div className="text-sm text-zinc-400 mt-2">+{displayItems.length - 3} more changes</div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 w-full">
        <Button variant="default" className="w-full" onClick={() => onActivate?.({ id, title: displayTitle })}>
          <span className="mr-2">⚡</span> Activate Routine
        </Button>
      </CardFooter>
    </Card>
  );
}
