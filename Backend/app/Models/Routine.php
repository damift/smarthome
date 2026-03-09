<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Routine extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'description',
        'icon',
        'steps',
        'is_active',
        'activated_count',
        'last_activated_at',
    ];

    protected $casts = [
        'steps' => 'array',
        'is_active' => 'boolean',
        'activated_count' => 'integer',
        'last_activated_at' => 'datetime',
    ];
}
