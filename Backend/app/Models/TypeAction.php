<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class DeviceTypeAction extends Pivot
{
    // Pivot table is 'device_type_action'
    protected $table = 'type_action';

    protected $fillable = [
        'type_id',
        'action_id',
    ];

    // Timestamps zijn handig om te weten wanneer de koppeling is aangemaakt
    public $timestamps = true;

    // Optioneel: relaties naar DeviceType en Action
    public function deviceType()
    {
        return $this->belongsTo(Type::class);
    }

    public function action()
    {
        return $this->belongsTo(Action::class);
    }
}