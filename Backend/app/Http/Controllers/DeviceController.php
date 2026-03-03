<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Action;

class DeviceController extends Controller
{
public function index()
{
    $devices = Device::with(['type.actions', 'room'])->get();

    $devices->each(function ($device) {

        // Add actions directly on device
        $device->actions = $device->type?->actions ?? [];

        // Convert relations to simple values
        $device->type = $device->type?->name;
        $device->room = $device->room?->name;
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
            'status' => $request->status,
        ]);

        // load relation and convert to string for response
        $device->load('type');
        $device->type = $device->type?->name;

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

        $device->update($request->only(['name', 'type_id', 'room_id', 'status', ]));

        // reload relationship
        $device->load('type');
        $device->type = $device->type?->name;

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

    
   public function execute(Request $request, Device $device)
{
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

return DB::transaction(function () use ($device, $action, $validated) {

    $state = (array) $device->state; // Always force array

    // Update the specific action key
    $state[$action->name] = $validated['value'];

    // Save to the correct column
    $device->update(['state' => $state]);

    return response()->json([
        'message' => 'Actie succesvol uitgevoerd',
        'device_name' => $device->name,
        'new_status' => $state
    ]);
});
}

}