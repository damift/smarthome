import React from "react";
import { Moon, MoonStar, Pencil, Plane, Plus, Settings, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";
import RoutineCard from "@/components/RoutineCard";
import { routinesService } from "@/services/routinesService";
import { devicesService } from "@/services/devicesService";
import { typesService } from "@/services/typesService";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";

const ROUTINE_ICONS = {
  SUN: Sun,
  MOON: Moon,
  NIGHT: MoonStar,
  VACATION: Plane,
};

const SELECT_CLASS = "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm";

const EMPTY_STEP = {
  summary: "",
  room_name: "",
  type_name: "",
  device_id: "",
  device_name: "",
  action_name: "",
  value: "",
};

function createEmptyForm() {
  return {
    slug: "",
    title: "",
    description: "",
    icon: "",
    steps: [{ ...EMPTY_STEP }],
  };
}

function normalizeTypeName(value) {
  return String(value ?? "").trim().toUpperCase();
}

function formatActionLabel(name) {
  return String(name || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeActionOption(action) {
  const name = normalizeTypeName(action?.name);
  if (!name) return null;

  return {
    id: action?.id ?? name,
    name,
    valueType: normalizeTypeName(action?.value_type),
    description: String(action?.description ?? ""),
  };
}

function dedupeActions(actions) {
  const map = new Map();

  actions.forEach((action) => {
    if (!action?.name) return;
    if (!map.has(action.name)) {
      map.set(action.name, action);
      return;
    }

    const current = map.get(action.name);
    if (!current?.valueType && action.valueType) {
      map.set(action.name, action);
    }
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeTypeOptions(typesRaw) {
  if (!Array.isArray(typesRaw)) return [];

  return typesRaw
    .map((type) => {
      const name = normalizeTypeName(type?.name);
      if (!name) return null;

      const actions = Array.isArray(type?.actions)
        ? dedupeActions(type.actions.map(normalizeActionOption).filter(Boolean))
        : [];

      return {
        id: type?.id ?? name,
        name,
        label: String(type?.name ?? name),
        actions,
      };
    })
    .filter(Boolean);
}

function normalizeDeviceOptions(devicesRaw) {
  if (!Array.isArray(devicesRaw)) return [];

  return devicesRaw
    .map((device) => {
      const id = String(device?.id ?? "");
      if (!id) return null;

      const typeName = normalizeTypeName(device?.type?.name ?? device?.type);
      const roomName = String(
        typeof device?.room === "string" ? device.room : device?.room?.name ?? "",
      );
      const state = typeof device?.state === "object" && device.state !== null ? device.state : {};

      const rawActions = Array.isArray(device?.actions)
        ? device.actions
        : Array.isArray(device?.type?.actions)
        ? device.type.actions
        : [];

      return {
        id,
        name: String(device?.name ?? `Device ${id}`),
        typeName,
        roomName,
        state,
        actions: dedupeActions(rawActions.map(normalizeActionOption).filter(Boolean)),
      };
    })
    .filter(Boolean);
}

function normalizeSteps(steps) {
  if (!Array.isArray(steps)) return [];

  return steps.map((step) => ({
    summary: String(step?.summary ?? ""),
    room_name: String(step?.room_name ?? step?.room ?? ""),
    type_name: normalizeTypeName(step?.type_name ?? step?.type),
    device_id: String(step?.device_id ?? ""),
    device_name: String(step?.device_name ?? step?.device ?? ""),
    action_name: normalizeTypeName(step?.action_name ?? step?.action),
    value: step?.value == null ? "" : String(step.value),
  }));
}

function normalizeRoutine(routine) {
  const steps = normalizeSteps(routine?.steps);

  return {
    id: routine?.id ?? routine?.slug ?? "",
    dbId: routine?.db_id ?? null,
    slug: routine?.slug ?? routine?.id ?? "",
    title: routine?.title ?? "Routine",
    description: routine?.description ?? "",
    icon: routine?.icon ?? null,
    isActive: routine?.is_active ?? true,
    steps,
    changes: Array.isArray(routine?.changes) ? routine.changes : [],
  };
}

function renderIcon(iconKey) {
  const Icon = ROUTINE_ICONS[normalizeTypeName(iconKey)] || Settings;
  return <Icon className="h-6 w-6" />;
}

function slugify(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.slice(0, 100);
}

function routineToForm(routine) {
  const steps = Array.isArray(routine?.steps) && routine.steps.length > 0
    ? routine.steps.map((step) => ({ ...EMPTY_STEP, ...step }))
    : [{ ...EMPTY_STEP }];

  return {
    slug: routine?.slug ?? routine?.id ?? "",
    title: routine?.title ?? "",
    description: routine?.description ?? "",
    icon: normalizeTypeName(routine?.icon ?? ""),
    steps,
  };
}

function toStepPayload(step, index) {
  return {
    position: index + 1,
    summary: step.summary.trim() || null,
    room_name: step.room_name.trim() || null,
    type_name: normalizeTypeName(step.type_name) || null,
    device_name: step.device_name.trim() || null,
    action_name: normalizeTypeName(step.action_name),
    value: String(step.value ?? "").trim() === "" ? null : String(step.value).trim(),
  };
}

function buildDefaultValueOptions(actionName, valueType) {
  const normalizedAction = normalizeTypeName(actionName);
  const normalizedType = normalizeTypeName(valueType);

  if (normalizedType === "BOOLEAN") return ["true", "false"];
  if (normalizedAction.includes("TEMPERATURE")) return ["16", "18", "20", "22", "24"];
  if (normalizedAction.includes("BRIGHTNESS")) return ["0", "25", "50", "75", "100"];
  if (normalizedAction.includes("COLOR") || normalizedAction.includes("COLOUR")) {
    return ["#ffffff", "#ffd166", "#5682e8", "#ff6b6b"];
  }
  if (normalizedType === "INT") return ["0", "25", "50", "75", "100"];
  if (normalizedType === "DECIMAL") return ["0", "0.5", "1", "1.5", "2"];
  return [];
}

export default function RoutinesPage() {
  const [routines, setRoutines] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [activatingId, setActivatingId] = React.useState(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [editingRoutine, setEditingRoutine] = React.useState(null);
  const [form, setForm] = React.useState(() => createEmptyForm());
  const [formError, setFormError] = React.useState(null);

  const [typeOptions, setTypeOptions] = React.useState([]);
  const [deviceOptions, setDeviceOptions] = React.useState([]);
  const [loadingFormOptions, setLoadingFormOptions] = React.useState(false);
  const [formOptionsError, setFormOptionsError] = React.useState(null);

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

  const fetchFormOptions = React.useCallback(async () => {
    try {
      setLoadingFormOptions(true);
      setFormOptionsError(null);

      const [typesData, devicesData] = await Promise.all([
        typesService.getTypes(),
        devicesService.getDevices(),
      ]);

      const rawTypes = Array.isArray(typesData) ? typesData : typesData?.data ?? [];
      const rawDevices = Array.isArray(devicesData) ? devicesData : devicesData?.data ?? [];

      setTypeOptions(normalizeTypeOptions(rawTypes));
      setDeviceOptions(normalizeDeviceOptions(rawDevices));
    } catch (err) {
      console.error("Failed to load routine dropdown options:", err);
      setFormOptionsError(err.message || "Could not load routine options");
      setTypeOptions([]);
      setDeviceOptions([]);
    } finally {
      setLoadingFormOptions(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  React.useEffect(() => {
    fetchFormOptions();
  }, [fetchFormOptions]);

  const actionsByType = React.useMemo(() => {
    const map = new Map();

    typeOptions.forEach((type) => {
      map.set(type.name, dedupeActions(type.actions));
    });

    deviceOptions.forEach((device) => {
      if (!device.typeName) return;
      const current = map.get(device.typeName) ?? [];
      map.set(device.typeName, dedupeActions([...current, ...device.actions]));
    });

    return map;
  }, [typeOptions, deviceOptions]);

  const allActionOptions = React.useMemo(() => {
    const allActions = [];
    actionsByType.forEach((actions) => allActions.push(...actions));
    return dedupeActions(allActions);
  }, [actionsByType]);

  function getSelectedDevice(step) {
    if (step.device_id) {
      const byId = deviceOptions.find((device) => String(device.id) === String(step.device_id));
      if (byId) return byId;
    }

    if (!step.device_name) return null;

    const normalizedType = normalizeTypeName(step.type_name);
    return (
      deviceOptions.find((device) => {
        const sameName = device.name === step.device_name;
        if (!sameName) return false;
        if (!normalizedType) return true;
        return normalizeTypeName(device.typeName) === normalizedType;
      }) ?? null
    );
  }

  function getDevicesForStep(step) {
    const normalizedType = normalizeTypeName(step.type_name);
    if (!normalizedType) return deviceOptions;
    return deviceOptions.filter((device) => normalizeTypeName(device.typeName) === normalizedType);
  }

  function getActionOptionsForStep(step) {
    const selectedDevice = getSelectedDevice(step);
    const normalizedType = normalizeTypeName(step.type_name);

    let actionOptions = [];
    if (selectedDevice?.actions?.length) {
      actionOptions = selectedDevice.actions;
    } else if (normalizedType && actionsByType.has(normalizedType)) {
      actionOptions = actionsByType.get(normalizedType) ?? [];
    } else {
      actionOptions = allActionOptions;
    }

    const normalizedActionName = normalizeTypeName(step.action_name);
    if (normalizedActionName && !actionOptions.some((action) => action.name === normalizedActionName)) {
      const fallbackAction = normalizeActionOption({ name: normalizedActionName });
      if (fallbackAction) {
        actionOptions = dedupeActions([...actionOptions, fallbackAction]);
      }
    }

    return actionOptions;
  }

  function getValueOptionsForStep(step, actionOptions) {
    const normalizedAction = normalizeTypeName(step.action_name);
    if (!normalizedAction) return [];

    const selectedAction = actionOptions.find((action) => action.name === normalizedAction);
    const selectedDevice = getSelectedDevice(step);
    const normalizedType = normalizeTypeName(step.type_name);

    const scopedDevices = selectedDevice
      ? [selectedDevice]
      : normalizedType
      ? deviceOptions.filter((device) => normalizeTypeName(device.typeName) === normalizedType)
      : deviceOptions;

    const valueSet = new Set();

    scopedDevices.forEach((device) => {
      const stateValue = device.state?.[normalizedAction];
      if (stateValue === undefined || stateValue === null || stateValue === "") return;
      valueSet.add(String(stateValue));
    });

    buildDefaultValueOptions(normalizedAction, selectedAction?.valueType).forEach((value) => {
      valueSet.add(value);
    });

    if (String(step.value ?? "").trim() !== "") {
      valueSet.add(String(step.value));
    }

    return Array.from(valueSet).map((value) => ({
      value,
      label: value,
    }));
  }

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

  function openCreateDialog() {
    setEditingRoutine(null);
    setForm(createEmptyForm());
    setFormError(null);
    setDialogOpen(true);
  }

  function openEditDialog(routine) {
    setEditingRoutine(routine);
    setForm(routineToForm(routine));
    setFormError(null);
    setDialogOpen(true);
  }

  function updateStep(index, field, value) {
    setForm((prev) => {
      const nextSteps = prev.steps.map((step, stepIndex) => {
        if (stepIndex !== index) return step;
        return { ...step, [field]: value };
      });

      return { ...prev, steps: nextSteps };
    });
  }

  function handleTypeChange(index, value) {
    setForm((prev) => {
      const nextSteps = [...prev.steps];
      const current = nextSteps[index] ?? { ...EMPTY_STEP };

      nextSteps[index] = {
        ...current,
        type_name: normalizeTypeName(value),
        device_id: "",
        device_name: "",
        action_name: "",
        value: "",
      };

      return { ...prev, steps: nextSteps };
    });
  }

  function handleDeviceChange(index, deviceId) {
    setForm((prev) => {
      const nextSteps = [...prev.steps];
      const current = nextSteps[index] ?? { ...EMPTY_STEP };
      const selected = deviceOptions.find((device) => String(device.id) === String(deviceId));

      if (!selected) {
        nextSteps[index] = {
          ...current,
          device_id: "",
          device_name: "",
          action_name: "",
          value: "",
        };
      } else {
        nextSteps[index] = {
          ...current,
          device_id: selected.id,
          device_name: selected.name,
          type_name: selected.typeName || current.type_name,
          room_name: selected.roomName || current.room_name,
          action_name: "",
          value: "",
        };
      }

      return { ...prev, steps: nextSteps };
    });
  }

  function handleActionChange(index, actionName) {
    setForm((prev) => {
      const nextSteps = [...prev.steps];
      const current = nextSteps[index] ?? { ...EMPTY_STEP };

      nextSteps[index] = {
        ...current,
        action_name: normalizeTypeName(actionName),
        value: "",
      };

      return { ...prev, steps: nextSteps };
    });
  }

  function handleValueChange(index, value) {
    updateStep(index, "value", value);
  }

  function addStep() {
    setForm((prev) => ({ ...prev, steps: [...prev.steps, { ...EMPTY_STEP }] }));
  }

  function removeStep(index) {
    setForm((prev) => {
      if (prev.steps.length === 1) return prev;
      return {
        ...prev,
        steps: prev.steps.filter((_, stepIndex) => stepIndex !== index),
      };
    });
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const title = form.title.trim();
    const baseSlug = form.slug.trim() || title;
    const slug = slugify(baseSlug);
    const normalizedSteps = form.steps
      .map((step, index) => toStepPayload(step, index))
      .filter((step) => step.action_name);

    if (!title) {
      setFormError("Title is required.");
      return;
    }

    if (!slug) {
      setFormError("Slug is required. Use letters, numbers and '-'.");
      return;
    }

    if (normalizedSteps.length === 0) {
      setFormError("Add at least one step with an action.");
      return;
    }

    const payload = {
      slug,
      title,
      description: form.description.trim() || null,
      icon: normalizeTypeName(form.icon) || null,
      steps: normalizedSteps,
    };

    try {
      setSubmitting(true);

      if (editingRoutine) {
        await routinesService.updateRoutine(editingRoutine.id, payload);
        toast.success("Routine updated");
      } else {
        await routinesService.createRoutine(payload);
        toast.success("Routine created");
      }

      setDialogOpen(false);
      setEditingRoutine(null);
      setForm(createEmptyForm());
      await fetchRoutines();
    } catch (err) {
      console.error("Failed to save routine:", err);
      setFormError(err.message || "Failed to save routine");
      toast.error(err.message || "Failed to save routine");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Routines</h1>
          <p className="text-zinc-400">Activate, create and edit device routines</p>
        </div>
        <Button type="button" className="gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Add Routine
        </Button>
      </div>

      {loading && (
        <div className="rounded-md border p-4 text-sm text-zinc-500">
          Loading routines...
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load routines: {error}
        </div>
      )}

      {formOptionsError && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Some dropdown options could not be loaded: {formOptionsError}
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
              onEdit={() => openEditDialog(routine)}
            />
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (submitting) return;
          setDialogOpen(open);
          if (!open) {
            setEditingRoutine(null);
            setForm(createEmptyForm());
            setFormError(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoutine ? "Edit Routine" : "Create Routine"}</DialogTitle>
            <DialogDescription>
              Configure a routine with dropdowns for type, device, action, value and icon.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="routine_title">Title</Label>
                <Input
                  id="routine_title"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Morning"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routine_slug">Slug</Label>
                <Input
                  id="routine_slug"
                  value={form.slug}
                  onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                  placeholder="morning"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routine_description">Description</Label>
                <Input
                  id="routine_description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Prepare the house for the morning"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routine_icon">Icon</Label>
                <select
                  id="routine_icon"
                  value={normalizeTypeName(form.icon)}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, icon: normalizeTypeName(event.target.value) }))
                  }
                  className={SELECT_CLASS}
                >
                  <option value="">No icon</option>
                  {Object.keys(ROUTINE_ICONS).map((iconKey) => (
                    <option key={iconKey} value={iconKey}>
                      {iconKey}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Steps</h3>
                <Button type="button" variant="outline" size="sm" onClick={addStep} className="gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  Add Step
                </Button>
              </div>

              {loadingFormOptions && (
                <p className="text-sm text-zinc-500">Loading dropdown options...</p>
              )}

              {form.steps.map((step, index) => {
                const stepDevices = getDevicesForStep(step);
                const selectedDevice = getSelectedDevice(step);
                const selectedDeviceId = selectedDevice?.id ?? step.device_id ?? "";

                const stepActions = getActionOptionsForStep(step);
                const selectedActionName = normalizeTypeName(step.action_name);

                const stepValues = getValueOptionsForStep(step, stepActions);

                return (
                  <div key={`step-${index}`} className="space-y-3 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-zinc-500">Step {index + 1}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(index)}
                        disabled={form.steps.length === 1}
                        className="gap-1 text-zinc-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <select
                          value={normalizeTypeName(step.type_name)}
                          onChange={(event) => handleTypeChange(index, event.target.value)}
                          className={SELECT_CLASS}
                        >
                          <option value="">All types</option>
                          {typeOptions.map((type) => (
                            <option key={type.id} value={type.name}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Device</Label>
                        <select
                          value={String(selectedDeviceId)}
                          onChange={(event) => handleDeviceChange(index, event.target.value)}
                          className={SELECT_CLASS}
                        >
                          <option value="">All devices</option>
                          {stepDevices.map((device) => (
                            <option key={device.id} value={device.id}>
                              {device.name}
                              {device.roomName ? ` (${device.roomName})` : ""}
                            </option>
                          ))}
                          {selectedDeviceId &&
                            !stepDevices.some((device) => String(device.id) === String(selectedDeviceId)) && (
                              <option value={String(selectedDeviceId)}>
                                {step.device_name || `Device ${selectedDeviceId}`}
                              </option>
                            )}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Action</Label>
                        <select
                          value={selectedActionName}
                          onChange={(event) => handleActionChange(index, event.target.value)}
                          className={SELECT_CLASS}
                        >
                          <option value="">Select action</option>
                          {stepActions.map((action) => (
                            <option key={`${action.id}-${action.name}`} value={action.name}>
                              {formatActionLabel(action.name)}
                              {action.valueType ? ` (${action.valueType})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Value</Label>
                        <select
                          value={String(step.value ?? "")}
                          onChange={(event) => handleValueChange(index, event.target.value)}
                          className={SELECT_CLASS}
                          disabled={!selectedActionName}
                        >
                          <option value="">Select value</option>
                          {stepValues.map((valueOption) => (
                            <option key={`${valueOption.value}-${index}`} value={valueOption.value}>
                              {valueOption.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Room</Label>
                        <Input
                          value={step.room_name}
                          onChange={(event) => updateStep(index, "room_name", event.target.value)}
                          placeholder="Living Room"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Summary</Label>
                        <Input
                          value={step.summary}
                          onChange={(event) => updateStep(index, "summary", event.target.value)}
                          placeholder="Living Room light on"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                <Pencil className="h-4 w-4" />
                {submitting ? "Saving..." : editingRoutine ? "Save Changes" : "Create Routine"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
