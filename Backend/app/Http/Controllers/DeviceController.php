<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        // Voor nu gebruiken we een JSON bestand of array, later kun je dit naar database migreren
        $devices = [
            ['id' => 1, 'name' => 'Main Ceiling Light', 'type' => 'LIGHT', 'room' => 'Living Room', 'status' => 'ON', 'icon' => '💡'],
            ['id' => 2, 'name' => 'Corner Lamp', 'type' => 'LIGHT', 'room' => 'Living Room', 'status' => 'OFF', 'icon' => '💡'],
            ['id' => 3, 'name' => 'Living Room Thermostat', 'type' => 'THERMOSTAT', 'room' => 'Living Room', 'status' => 'ON', 'icon' => '🌡️'],
            ['id' => 4, 'name' => 'Security Camera', 'type' => 'CAMERA', 'room' => 'Living Room', 'status' => 'ON', 'icon' => '📷'],
        ];

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

        // Voor nu simuleren we het toevoegen
        $device = [
            'id' => rand(100, 999),
            'name' => $request->name,
            'type' => $request->type,
            'room' => $request->room,
            'status' => $request->status,
            'icon' => $request->icon ?? $this->getDefaultIcon($request->type),
        ];

        // Hier zou je normaal het device in database opslaan
        // Device::create($request->all());

        return response()->json([
            'message' => 'Device created successfully',
            'device' => $device
        ], 201);
    }

    public function show($id)
    {
        // Simuleer het ophalen van een specifiek device
        $devices = [
            ['id' => 1, 'name' => 'Main Ceiling Light', 'type' => 'LIGHT', 'room' => 'Living Room', 'status' => 'ON', 'icon' => '💡'],
            ['id' => 2, 'name' => 'Corner Lamp', 'type' => 'LIGHT', 'room' => 'Living Room', 'status' => 'OFF', 'icon' => '💡'],
            ['id' => 3, 'name' => 'Living Room Thermostat', 'type' => 'THERMOSTAT', 'room' => 'Living Room', 'status' => 'ON', 'icon' => '🌡️'],
            ['id' => 4, 'name' => 'Security Camera', 'type' => 'CAMERA', 'room' => 'Living Room', 'status' => 'ON', 'icon' => '📷'],
        ];

        $device = collect($devices)->firstWhere('id', (int)$id);

        if (!$device) {
            return response()->json(['message' => 'Device not found'], 404);
        }

        return response()->json($device);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|in:LIGHT,THERMOSTAT,CAMERA,OUTLET,SENSOR',
            'room' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|in:ON,OFF',
            'icon' => 'nullable|string|max:10',
        ]);

        // Simuleer update
        $device = [
            'id' => (int)$id,
            'name' => $request->name ?? 'Updated Device',
            'type' => $request->type ?? 'LIGHT',
            'room' => $request->room ?? 'Living Room',
            'status' => $request->status ?? 'OFF',
            'icon' => $request->icon ?? '🔌',
        ];

        return response()->json([
            'message' => 'Device updated successfully',
            'device' => $device
        ]);
    }

    public function destroy($id)
    {
        // Simuleer verwijdering
        // Hier zou je normaal Device::find($id)->delete() doen
        
        return response()->json([
            'message' => 'Device deleted successfully'
        ]);
    }

    public function toggleStatus($id)
    {
        // Toggle device status (ON/OFF)
        $newStatus = rand(0, 1) ? 'ON' : 'OFF';
        
        return response()->json([
            'message' => 'Device status updated',
            'status' => $newStatus
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