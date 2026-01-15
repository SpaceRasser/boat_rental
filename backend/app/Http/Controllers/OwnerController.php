<?php

namespace App\Http\Controllers;

use App\Models\Owner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $owners = Owner::orderBy('id_owner', 'desc')
            ->get()
            ->map(function ($owner) {
                return [
                    'id_owner' => $owner->id_owner,
                    'name' => $owner->name,
                    'email' => $owner->email,
                    'created_at' => $owner->created_at->format('d.m.Y H:i'),
                ];
            });
        return response()->json(['success' => true, 'data' => ['owners' => $owners]]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:owners,email',
            'password' => 'required|string',
        ]);

        $owner = Owner::create($request->all());
        return response()->json(['success' => true, 'data' => $owner], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $id = $request->input('id') ?? $request->query('id');
        if (!$id) {
            return response()->json(['success' => false, 'error' => 'Owner ID is required'], 400);
        }
        $owner = Owner::find($id);
        if (!$owner) {
            return response()->json(['success' => false, 'error' => 'Owner not found'], 404);
        }
        $owner->update($request->all());
        return response()->json(['success' => true, 'data' => $owner]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $id = $request->query('id');
        if (!$id) {
            return response()->json(['success' => false, 'error' => 'Owner ID is required'], 400);
        }
        $owner = Owner::find($id);
        if (!$owner) {
            return response()->json(['success' => false, 'error' => 'Owner not found'], 404);
        }
        $owner->delete();
        return response()->json(['success' => true, 'message' => 'Owner deleted successfully']);
    }
}
