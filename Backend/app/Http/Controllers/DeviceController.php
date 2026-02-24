<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        $devices = Device::all();
        return response()->json($devices);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:LIGHT,THERMOSTAT,CAMERA,OUTLET,SENSOR',
            'room' => 'required|string|max:255',
            'status' => 'required|string|in:ON,OFF',
            'icon' => 'nullable|string|max:10',
        ]);

        $device = Device::create([
            'name' => $request->name,
            'type' => $request->type,
            'room' => $request->room,
            'status' => $request->status,
            'icon' => $request->icon ?? $this->getDefaultIcon($request->type),
        ]);

        return response()->json([
            'message' => 'Device created successfully',
            'device' => $device
        ], 201);
    }

    public function show($id)
    {
        $device = Device::find($id);

        if (!$device) {
            return response()->json(['message' => 'Device not found'], 404);
        }

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
            'type' => 'sometimes|required|string|in:LIGHT,THERMOSTAT,CAMERA,OUTLET,SENSOR',
            'room' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|in:ON,OFF',
            'icon' => 'nullable|string|max:10',
        ]);

        $device->update($request->only(['name', 'type', 'room', 'status', 'icon']));

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