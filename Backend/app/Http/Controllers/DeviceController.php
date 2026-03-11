<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Action;
use App\Models\History;
use Illuminate\Support\Str;

class DeviceController extends Controller
{
public function index()
{
    $actor = auth('sanctum')->user();
    $devicesQuery = Device::with(['type.actions', 'room']);

    if ($actor && Str::lower((string) $actor->role) !== 'admin') {
        $devicesQuery->whereHas('usersWithAccess', function ($query) use ($actor) {
            $query->where('users.id', $actor->id);
        });
    }

    $devices = $devicesQuery->get();

    $devices->each(function ($device) {

        // Add actions directly on device
        $device->actions = $device->type?->actions ?? [];

        // Convert relations to simple values
        $device->type = $device->type?->name;
        $device->room = $device->room?->name;
        $device->status = $this->deriveStatusFromState((array) $device->state);
    });

    return response()->json($devices);
}
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type_id' => 'required|exists:types,id',
            'room_id' => 'required|exists:rooms,id',
            'status' => 'required|string|in:ON,OFF',
        ]);

        $device = Device::create([
            'name' => $request->name,
            'type_id' => $request->type_id,
            'room_id' => $request->room_id,
        ]);

        $status = strtoupper((string) $request->input('status', 'OFF'));
        $nextState = $this->applyRequestedStatusToState((array) $device->state, $status);
        $device->update(['state' => $nextState]);
        $device->refresh();

        // load relation and convert to string for response
        $device->load(['type', 'room']);
        $device->type = $device->type?->name;
        $device->room = $device->room?->name;
        $device->status = $this->deriveStatusFromState((array) $device->state);

        return response()->json([
            'message' => 'Device created successfully',
            'device' => $device
        ], 201);
    }

    public function show($id)
    {
        $device = Device::with('type', 'room')->find($id);

        if (!$device) {
            return response()->json(['message' => 'Device not found'], 404);
        }

        // convert relations to names
        $device->type = $device->type?->name;
        $device->room = $device->room?->name;
        $device->status = $this->deriveStatusFromState((array) $device->state);

        return response()->json($device);
    }

    public function update(Request $request, $id)
    {
        $device = Device::find($id);

        if (!$device) {
            return response()->json(['message' => 'Device not found'], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type_id' => 'sometimes|required|exists:types,id',
            'room_id' => 'sometimes|required|exists:rooms,id',
            'status' => 'sometimes|required|string|in:ON,OFF',
        ]);

        $device->update($request->only(['name', 'type_id', 'room_id']));

        if ($request->filled('status')) {
            $status = strtoupper((string) $request->input('status'));
            $nextState = $this->applyRequestedStatusToState((array) $device->state, $status);
            $device->update(['state' => $nextState]);
        }

        $device->refresh();

        // reload relationship
        $device->load(['type', 'room']);
        $device->type = $device->type?->name;
        $device->room = $device->room?->name;
        $device->status = $this->deriveStatusFromState((array) $device->state);

        return response()->json([
            'message' => 'Device updated successfully',
            'device' => $device
        ]);
    }

    public function destroy($id)
    {
        $device = Device::find($id);

        if (!$device) {
            return response()->json(['message' => 'Device not found'], 404);
        }

        $device->delete();

        return response()->json([
            'message' => 'Device deleted successfully'
        ]);
    }

    private function deriveStatusFromState(array $state): string
    {
        if (($state['TURN_ON'] ?? null) === true && ($state['TURN_OFF'] ?? null) !== true) {
            return 'ON';
        }

        if (($state['TURN_OFF'] ?? null) === true && ($state['TURN_ON'] ?? null) !== true) {
            return 'OFF';
        }

        return ($state['TURN_ON'] ?? false) ? 'ON' : 'OFF';
    }

    private function applyRequestedStatusToState(array $state, string $status): array
    {
        $isOn = strtoupper($status) === 'ON';
        $state['TURN_ON'] = $isOn;
        $state['TURN_OFF'] = !$isOn;

        return $state;
    }


public function execute(Request $request, Device $device)
{
    $actor = $request->user();
    if (!$actor) {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    if (Str::lower((string) $actor->role) !== 'admin') {
        $hasAccess = $device->usersWithAccess()->where('users.id', $actor->id)->exists();
        if (!$hasAccess) {
            return response()->json(['message' => 'Geen toegang tot dit device'], 403);
        }
    }

    $validated = $request->validate([
        'action_id' => 'required|exists:actions,id',
        'value'     => 'required',
    ]);

    $action = Action::findOrFail($validated['action_id']);

    $isValidAction = DB::table('type_action')
        ->where('type_id', $device->type_id)
        ->where('action_id', $action->id)
        ->exists();

    if (!$isValidAction) {
        return response()->json([
            'error' => 'Deze actie is niet mogelijk voor dit type apparaat'
        ], 422);
    }

    return DB::transaction(function () use ($device, $action, $validated, $request) {
        $state = (array) $device->state;
        $actionName = strtoupper((string) $action->name);
        $value = $validated['value'];

        // Houd TURN_ON/TURN_OFF in sync zodat er 1 consistente power-state is.
        if ($actionName === 'TURN_ON' || $actionName === 'TURN_OFF') {
            $boolValue = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($boolValue !== null) {
                $value = $boolValue;
            }
        }

        $state[$action->name] = $value;

        if ($actionName === 'TURN_ON' && $value === true) {
            $state['TURN_OFF'] = false;
        } elseif ($actionName === 'TURN_ON' && $value === false) {
            $state['TURN_OFF'] = true;
        } elseif ($actionName === 'TURN_OFF' && $value === true) {
            $state['TURN_ON'] = false;
        } elseif ($actionName === 'TURN_OFF' && $value === false) {
            $state['TURN_ON'] = true;
        }

        $device->update(['state' => $state]);

        // 👇 Log the action
        History::create([
            'user_id' => $request->user()?->id,
            'room_id'   => $device->room_id,
            'device_id' => $device->id,
            'action_id' => $action->id,
            'value'     => $value,
        ]);

        return response()->json([
            'message'    => 'Actie succesvol uitgevoerd',
            'device_name' => $device->name,
            'new_status' => $state,
            'device_id'  => $device->id,
            'action_id'  => $action->name,
        ]);
    });
}
}
