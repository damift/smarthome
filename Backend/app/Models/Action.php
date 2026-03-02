<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Action extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'value_type',
    ];

    // Many-to-Many relatie naar DeviceType
    public function deviceTypes()
    {
        return $this->belongsToMany(Type::class, 'types');
    }
}