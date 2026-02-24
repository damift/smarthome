<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'type',
        'room',
        'status',
        'icon',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => 'string',
            'status' => 'string',
        ];
    }

    /**
     * Get the default icon for device type
     */
    public function getDefaultIconAttribute(): string
    {
        return match($this->type) {
            'LIGHT' => '💡',
            'THERMOSTAT' => '🌡️',
            'CAMERA' => '📷',
            'OUTLET' => '🔌',
            'SENSOR' => '📡',
            default => '🔌'
        };
    }
}
