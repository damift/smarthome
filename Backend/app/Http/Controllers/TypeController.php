<?php

namespace App\Http\Controllers;

use App\Models\Type;
use Illuminate\Http\Request;

class TypeController extends Controller
{
    public function index(Request $request)
    {
        $types = Type::all();
        return response()->json($types);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:types,name|max:255',
        ]);

        $type = Type::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Type created successfully',
            'type' => $type
        ], 201);
    }

    public function show($id)
    {
        $type = Type::find($id);

        if (!$type) {
            return response()->json(['message' => 'Type not found'], 404);
        }

        return response()->json($type);
    }

    public function update(Request $request, $id)
    {
        $type = Type::find($id);

        if (!$type) {
            return response()->json(['message' => 'Type not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|unique:types,name,' . $id . '|max:255',
        ]);

        $type->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Type updated successfully',
            'type' => $type
        ]);
    }

    public function destroy($id)
    {
        $type = Type::find($id);

        if (!$type) {
            return response()->json(['message' => 'Type not found'], 404);
        }

        // Optional check: prevents deleting a type if devices are assigned to it
        if ($type->devices()->exists()) {
             return response()->json(['message' => 'Cannot delete type: It is still assigned to devices'], 400);
        }

        $type->delete();

        return response()->json([
            'message' => 'Type deleted successfully'
        ]);
    }
}