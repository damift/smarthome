import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";

export default function RoutineCard({
  id,
  title,
  name,
  description,
  changes = [],
  items = [],
  icon,
  onActivate,
  activating = false,
}) {
  const displayTitle = title ?? name ?? "Routine";
  const displayItems = items.length ? items : changes;

  return (
    <Card className="border-zinc-900">
      <CardHeader className="flex items-start gap-4 p-6">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-zinc-300">
          {icon ?? <span className="text-xl">R</span>}
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg">{displayTitle}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="border-t border-zinc-200 pt-4">
          <div className="mb-2 text-xs font-semibold text-zinc-500">
            CHANGES ({displayItems.length})
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700">
            {displayItems.slice(0, 3).map((change, index) => (
              <li key={index}>{change}</li>
            ))}
          </ul>
          {displayItems.length > 3 && (
            <div className="mt-2 text-sm text-zinc-400">
              +{displayItems.length - 3} more changes
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="w-full p-6 pt-0">
        <Button
          variant="default"
          className="w-full"
          onClick={() => onActivate?.({ id, title: displayTitle })}
          disabled={activating}
        >
          {activating ? "Activating..." : "Activate Routine"}
        </Button>
      </CardFooter>
    </Card>
  );
}

