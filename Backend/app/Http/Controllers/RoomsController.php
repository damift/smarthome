<?php

namespace App\Http\Controllers;
use App\Models\Rooms;

use Illuminate\Http\Request;

class RoomsController extends Controller
{
    public function index()
    {
        return response()->json(Rooms::all());
    }
    
}
