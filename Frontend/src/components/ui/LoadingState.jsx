import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Herbruikbare loading UI voor inline blokken en volledige pagina's.
export default function LoadingState({
  message = "Loading...",
  variant = "inline",
  fullScreen = false,
  className,
}) {
  // Kiest layout op basis van context: component in content of volledige pagina.
  const wrapperClass = variant === "page"
    ? cn(
        "flex items-center justify-center",
        fullScreen ? "min-h-screen bg-zinc-50" : "min-h-[40vh]",
      )
    : "rounded-md border border-zinc-200 bg-white p-4";

  return (
    <div className={cn(wrapperClass, className)}>
      <div className="flex items-center gap-3 text-sm text-zinc-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
}
