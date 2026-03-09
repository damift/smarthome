<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Throwable;

class DeviceAccessController extends Controller
{
    public function index(Request $request)
    {
        if (($forbidden = $this->ensureAdmin($request)) !== null) {
            return $forbidden;
        }

        if (!Schema::hasTable('device_user_access')) {
            return response()->json([
                'message' => "Database niet up-to-date: tabel 'device_user_access' ontbreekt. Draai migrations.",
            ], 500);
        }

        try {
            $users = User::query()
                ->select(['id', 'name', 'email', 'role'])
                ->with(['accessibleDevices:id'])
                ->orderBy('name')
                ->get();

            $devices = Device::query()
                ->with(['room:id,name'])
                ->orderBy('name')
                ->get(['id', 'name', 'room_id']);

            $userDeviceMap = $users
                ->mapWithKeys(function ($user) {
                    return [
                        (string) $user->id => $user->accessibleDevices->pluck('id')->values(),
                    ];
                });

            return response()->json([
                'users' => $users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                    ];
                })->values(),
                'devices' => $devices->map(function ($device) {
                    return [
                        'id' => $device->id,
                        'name' => $device->name,
                        'room' => $device->room?->name,
                    ];
                })->values(),
                'user_device_map' => $userDeviceMap,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Device access ophalen is mislukt.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, int $userId)
    {
        if (($forbidden = $this->ensureAdmin($request)) !== null) {
            return $forbidden;
        }

        if (!Schema::hasTable('device_user_access')) {
            return response()->json([
                'message' => "Database niet up-to-date: tabel 'device_user_access' ontbreekt. Draai migrations.",
            ], 500);
        }

        $validated = $request->validate([
            'device_ids' => ['required', 'array'],
            'device_ids.*' => ['integer', 'exists:devices,id'],
        ]);

        $user = User::findOrFail($userId);
        $deviceIds = array_values(array_unique($validated['device_ids']));

        $user->accessibleDevices()->sync($deviceIds);

        return response()->json([
            'message' => 'Device access bijgewerkt',
            'user_id' => $user->id,
            'device_ids' => $deviceIds,
        ]);
    }

    private function ensureAdmin(Request $request)
    {
        $actor = $request->user();

        if (!$actor || strtolower((string) $actor->role) !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        return null;
    }
}
