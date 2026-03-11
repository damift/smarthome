import React from "react";
import { Moon, MoonStar, Plane, Settings, Sun } from "lucide-react";
import { toast } from "sonner";
import RoutineCard from "@/components/RoutineCard";
import LoadingState from "@/components/ui/LoadingState";
import { routinesService } from "@/services/routinesService";

const ROUTINE_ICONS = {
  SUN: Sun,
  MOON: Moon,
  NIGHT: MoonStar,
  VACATION: Plane,
};

function normalizeTypeName(value) {
  return String(value ?? "").trim().toUpperCase();
}

function buildStepSummary(step) {
  if (!step || typeof step !== "object") return "";

  const targetParts = [
    step.room_name ?? step.room ?? "",
    step.type_name ?? step.type ?? "",
    step.device_name ?? step.device ?? "",
  ]
    .map((part) => String(part).trim())
    .filter(Boolean);

  const target = targetParts.length ? targetParts.join(" - ") : "All devices";
  const action = normalizeTypeName(step.action_name ?? step.action ?? "");
  if (!action) return "";

  const hasValue = step.value !== null && step.value !== undefined && String(step.value) !== "";
  return hasValue ? `${target} -> ${action} (${step.value})` : `${target} -> ${action}`;
}

function normalizeRoutine(routine) {
  const steps = Array.isArray(routine?.steps) ? routine.steps : [];
  const fallbackChanges = steps.map(buildStepSummary).filter(Boolean);
  const changes = Array.isArray(routine?.changes) && routine.changes.length > 0
    ? routine.changes
    : fallbackChanges;

  return {
    id: routine?.id ?? routine?.slug ?? "",
    title: String(routine?.title ?? "Routine"),
    description: String(routine?.description ?? ""),
    icon: routine?.icon ?? null,
    changes,
  };
}

function renderIcon(iconKey) {
  const Icon = ROUTINE_ICONS[normalizeTypeName(iconKey)] || Settings;
  return <Icon className="h-6 w-6" />;
}

export default function RoutinesPage() {
  const [routines, setRoutines] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [activatingId, setActivatingId] = React.useState(null);

  const fetchRoutines = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await routinesService.getRoutines();
      setRoutines(data.map(normalizeRoutine));
      setError(null);
    } catch (err) {
      console.error("Failed to load routines:", err);
      setError(err.message || "Failed to load routines");
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  async function handleActivate(routine) {
    try {
      setActivatingId(routine.id);
      const result = await routinesService.activateRoutine(routine.id);
      const appliedCount = Number(result?.applied_count || 0);

      if (appliedCount > 0) {
        toast.success(`${routine.title} activated (${appliedCount} changes)`);
      } else {
        toast(`${routine.title} activated, but no devices were changed`);
      }
    } catch (err) {
      console.error("Failed to activate routine:", err);
      toast.error(err.message || `Failed to activate ${routine.title}`);
    } finally {
      setActivatingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Routines</h1>
        <p className="text-zinc-400">Activate saved device routines</p>
      </div>

      {loading && <LoadingState message="Loading routines..." />}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load routines: {error}
        </div>
      )}

      {!loading && !error && routines.length === 0 && (
        <div className="rounded-md border p-4 text-sm text-zinc-500">
          No routines available.
        </div>
      )}

      {!loading && !error && routines.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              id={routine.id}
              title={routine.title}
              description={routine.description}
              changes={routine.changes}
              icon={renderIcon(routine.icon)}
              activating={activatingId === routine.id}
              onActivate={() => handleActivate(routine)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
