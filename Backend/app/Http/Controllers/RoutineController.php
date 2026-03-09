<?php

namespace App\Http\Controllers;

use App\Models\Action;
use App\Models\Device;
use App\Models\History;
use App\Models\Routine;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoutineController extends Controller
{
    public function index()
    {
        $routines = Routine::where('is_active', true)
            ->orderBy('id')
            ->get();

        return response()->json(
            $routines->map(function ($routine) {
                return $this->normalizeRoutine($routine);
            })->values()
        );
    }

    public function activate(Request $request, $routine)
    {
        $routineModel = $this->findRoutine($routine);
        $userId = $request->user()?->id;

        if (!$routineModel || !$routineModel->is_active) {
            return response()->json([
                'message' => 'Routine not found',
            ], 404);
        }

        $steps = $this->normalizeSteps($routineModel->steps);
        $applied = [];
        $skipped = [];

        DB::transaction(function () use ($steps, $routineModel, $userId, &$applied, &$skipped) {
            foreach ($steps as $step) {
                $actionName = strtoupper((string) ($step['action_name'] ?? $step['action'] ?? ''));

                if ($actionName === '') {
                    $skipped[] = [
                        'target' => $this->describeStepTarget($step),
                        'reason' => 'Missing action name in routine step',
                    ];
                    continue;
                }

                $action = Action::where('name', $actionName)->first();
                if (!$action) {
                    $skipped[] = [
                        'action' => $actionName,
                        'target' => $this->describeStepTarget($step),
                        'reason' => 'Action not found',
                    ];
                    continue;
                }

                $rawValue = $step['value'] ?? null;
                $value = $this->castStepValue($action, $rawValue);
                $devices = $this->findDevicesForStep($step, $action->id)->get();

                if ($devices->isEmpty()) {
                    $skipped[] = [
                        'action' => $actionName,
                        'target' => $this->describeStepTarget($step),
                        'reason' => 'No matching devices',
                    ];
                    continue;
                }

                foreach ($devices as $device) {
                    $nextState = $this->applyActionToState((array) $device->state, $actionName, $value);
                    $device->update(['state' => $nextState]);

                    if ($userId) {
                        History::create([
                            'user_id' => $userId,
                            'room_id' => $device->room_id,
                            'device_id' => $device->id,
                            'action_id' => $action->id,
                            'value' => $value,
                        ]);
                    }

                    $applied[] = [
                        'device_id' => $device->id,
                        'device_name' => $device->name,
                        'room' => $device->room?->name,
                        'action' => $actionName,
                        'value' => $value,
                    ];
                }
            }

            $routineModel->activated_count = (int) $routineModel->activated_count + 1;
            $routineModel->last_activated_at = now();
            $routineModel->save();
        });

        $routineModel->refresh();

        return response()->json([
            'message' => sprintf("Routine '%s' activated", $routineModel->title),
            'routine' => $this->normalizeRoutine($routineModel),
            'applied_count' => count($applied),
            'skipped_count' => count($skipped),
            'applied' => $applied,
            'skipped' => $skipped,
        ]);
    }

    private function findRoutine($identifier)
    {
        $query = Routine::query();

        if (is_numeric($identifier)) {
            return $query->where('id', (int) $identifier)->first();
        }

        return $query->whereRaw('LOWER(slug) = ?', [strtolower(trim((string) $identifier))])->first();
    }

    private function normalizeRoutine(Routine $routine): array
    {
        $steps = $this->normalizeSteps($routine->steps);
        $changes = collect($steps)
            ->map(function ($step) {
                $summary = $step['summary'] ?? '';
                if (!empty($summary)) {
                    return $summary;
                }
                return $this->buildStepSummary($step);
            })
            ->filter(function ($line) {
                return !empty($line);
            })
            ->values()
            ->all();

        return [
            'id' => $routine->slug,
            'db_id' => $routine->id,
            'title' => $routine->title,
            'description' => $routine->description,
            'icon' => $routine->icon,
            'changes' => $changes,
            'change_count' => count($changes),
            'activated_count' => (int) $routine->activated_count,
            'last_activated_at' => $routine->last_activated_at?->toIso8601String(),
        ];
    }

    private function normalizeSteps($steps): array
    {
        if (!is_array($steps)) {
            return [];
        }

        return collect($steps)
            ->map(function ($step, $index) {
                if (!is_array($step)) {
                    return null;
                }

                return [
                    'position' => $step['position'] ?? $index + 1,
                    'summary' => $step['summary'] ?? null,
                    'room_name' => $step['room_name'] ?? $step['room'] ?? null,
                    'type_name' => $step['type_name'] ?? $step['type'] ?? null,
                    'device_name' => $step['device_name'] ?? $step['device'] ?? null,
                    'action_name' => $step['action_name'] ?? $step['action'] ?? null,
                    'value' => $step['value'] ?? null,
                ];
            })
            ->filter(function ($step) {
                return !empty($step['action_name']);
            })
            ->sortBy('position')
            ->values()
            ->all();
    }

    private function buildStepSummary(array $step): string
    {
        $parts = [];
        if (!empty($step['room_name'])) {
            $parts[] = $step['room_name'];
        }
        if (!empty($step['type_name'])) {
            $parts[] = strtoupper((string) $step['type_name']);
        }
        if (!empty($step['device_name'])) {
            $parts[] = $step['device_name'];
        }

        $target = empty($parts) ? 'All devices' : implode(': ', $parts);
        $action = strtoupper((string) ($step['action_name'] ?? ''));
        $value = $step['value'] ?? null;

        if ($value === null || $value === '') {
            return sprintf('%s -> %s', $target, $action);
        }

        return sprintf('%s -> %s (%s)', $target, $action, $value);
    }

    private function findDevicesForStep(array $step, int $actionId): Builder
    {
        $query = Device::query()
            ->with(['room', 'type'])
            ->whereHas('type.actions', function ($actionQuery) use ($actionId) {
                $actionQuery->where('actions.id', $actionId);
            });

        if (!empty($step['room_name'])) {
            $roomName = strtolower((string) $step['room_name']);
            $query->whereHas('room', function ($roomQuery) use ($roomName) {
                $roomQuery->whereRaw('LOWER(name) = ?', [$roomName]);
            });
        }

        if (!empty($step['type_name'])) {
            $typeName = strtoupper((string) $step['type_name']);
            $query->whereHas('type', function ($typeQuery) use ($typeName) {
                $typeQuery->whereRaw('UPPER(name) = ?', [$typeName]);
            });
        }

        if (!empty($step['device_name'])) {
            $deviceName = strtolower((string) $step['device_name']);
            $query->whereRaw('LOWER(name) = ?', [$deviceName]);
        }

        return $query;
    }

    private function castStepValue(Action $action, $rawValue)
    {
        $valueType = strtoupper((string) ($action->value_type ?? ''));

        if ($valueType === 'BOOLEAN') {
            $boolValue = filter_var($rawValue, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            return $boolValue ?? false;
        }

        if ($valueType === 'INT') {
            return (int) $rawValue;
        }

        if ($valueType === 'DECIMAL') {
            return (float) $rawValue;
        }

        if ($valueType === 'STRING') {
            return (string) $rawValue;
        }

        return $rawValue;
    }

    private function applyActionToState(array $state, string $actionName, $value): array
    {
        $state[$actionName] = $value;

        if ($actionName === 'TURN_ON') {
            $state['TURN_OFF'] = !((bool) $value);
        } elseif ($actionName === 'TURN_OFF') {
            $state['TURN_ON'] = !((bool) $value);
        }

        return $state;
    }

    private function describeStepTarget(array $step): string
    {
        $parts = [];
        if (!empty($step['room_name'])) {
            $parts[] = sprintf("room '%s'", $step['room_name']);
        }
        if (!empty($step['type_name'])) {
            $parts[] = sprintf("type '%s'", $step['type_name']);
        }
        if (!empty($step['device_name'])) {
            $parts[] = sprintf("device '%s'", $step['device_name']);
        }

        if (empty($parts)) {
            return 'all compatible devices';
        }

        return implode(', ', $parts);
    }
}
