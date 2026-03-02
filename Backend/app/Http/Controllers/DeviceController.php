<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Type;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        // include related type and room so frontend can display names
        $devices = Device::with(['type', 'room'])->get();

        // convert relationship objects into simple strings for compatibility
        $devices->each(function ($d) {
            $d->type = $d->type?->name;
            $d->room = $d->room?->name;
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
            'icon' => 'nullable|string|max:10',
        ]);

        $device = Device::create([
            'name' => $request->name,
            'type_id' => $request->type_id,
            'room_id' => $request->room_id,
            'status' => $request->status,
            'icon' => $request->icon ?? $this->getDefaultIcon(Type::find($request->type_id)?->name ?? ''),
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
            'icon' => 'nullable|string|max:10',
        ]);

        $device->update($request->only(['name', 'type_id', 'room_id', 'status', 'icon']));

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

    public function toggleStatus($id)
    {
        $device = Device::find($id);

        if (!$device) {
            return response()->json(['message' => 'Device not found'], 404);
        }

        $device->status = $device->status === 'ON' ? 'OFF' : 'ON';
        $device->save();

        // include type name in response
        $device->load('type');
        $device->type = $device->type?->name;

        return response()->json([
            'message' => 'Device status updated',
            'device' => $device
        ]);
    }

    private function getDefaultIcon($type)
    {
        return match($type) {
            'LIGHT' => '💡',
            'THERMOSTAT' => '🌡️',
            'CAMERA' => '📷',
            'OUTLET' => '🔌',
            'SENSOR' => '📡',
            default => '🔌'
        };
    }
}