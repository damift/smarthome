<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'room_id',
        'type_id',
        'state',
    ];

    protected $casts = [
        'state' => 'array',
    ];

    /**
     * Deze functie bouwt de standaard state op basis van type_action
     */
    public function generateDefaultState()
    {
        // Haal de actie-namen op die gekoppeld zijn aan dit type
        $actionNames = DB::table('type_action')
            ->join('actions', 'type_action.action_id', '=', 'actions.id')
            ->where('type_action.type_id', $this->type_id)
            ->pluck('actions.name');

        $defaultState = [];
        
        foreach ($actionNames as $name) {
            // Vul de state met logische startwaarden
            if (str_contains($name, 'TURN')) {
                $defaultState[$name] = false;
            } elseif (str_contains($name, 'TEMPERATURE')) {
                $defaultState[$name] = 20; // Standaard 20 graden
            } else {
                $defaultState[$name] = 0;
            }
        }

        return $defaultState;
    }

    protected static function booted()
    {
        static::creating(function ($device) {
            if (empty($device->state)) {
                $device->state = $device->generateDefaultState();
            }
        });
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}