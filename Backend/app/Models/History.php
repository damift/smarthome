<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class History extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'room_id', 'device_id', 'action_id', 'value'
    ];

    protected $casts = ['value' => 'array'];

    public function user()   { return $this->belongsTo(User::class); }
    public function room()   { return $this->belongsTo(Room::class); }
    public function device() { return $this->belongsTo(Device::class); }
    public function action() { return $this->belongsTo(Action::class); }
}
