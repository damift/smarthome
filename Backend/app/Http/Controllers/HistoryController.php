<?php

namespace App\Http\Controllers;

use App\Models\History;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
 public function index(Request $request)
    {
        $logs = History::with(['user', 'room', 'device', 'action'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }}
