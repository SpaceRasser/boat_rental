<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $offset = ($page - 1) * $limit;

        $users = User::select('id_user', 'name', 'email', 'birth_date', 'role', 'created_at')
            ->orderBy('id_user', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get()
            ->map(function ($user) {
                return [
                    'id_user' => $user->id_user,
                    'name' => $user->name,
                    'email' => $user->email,
                    'birth_date' => $user->birth_date?->format('Y-m-d'),
                    'role' => $user->role,
                    'created_at' => $user->created_at->format('d.m.Y H:i'),
                ];
            });

        $total = User::count();

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $users,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit),
                ]
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string',
            'birth_date' => 'nullable|date',
            'role' => 'nullable|in:client,owner,admin',
        ]);

        if ($request->role === 'client' && !$request->birth_date) {
            return response()->json([
                'success' => false,
                'error' => 'Birth date is required for clients'
            ], 400);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'birth_date' => $request->birth_date,
            'role' => $request->role ?? 'client',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id_user' => $user->id_user,
                'name' => $user->name,
                'email' => $user->email,
                'birth_date' => $user->birth_date?->format('Y-m-d'),
                'role' => $user->role,
                'created_at' => $user->created_at->format('d.m.Y H:i'),
            ]
        ], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $id = $request->input('id') ?? $request->query('id');
        
        if (!$id) {
            return response()->json([
                'success' => false,
                'error' => 'User ID is required'
            ], 400);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not found'
            ], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string',
            'email' => 'sometimes|required|email|unique:users,email,' . $id . ',id_user',
            'password' => 'sometimes|string',
            'birth_date' => 'nullable|date',
            'role' => 'sometimes|in:client,owner,admin',
        ]);

        $updateData = $request->only(['name', 'email', 'birth_date', 'role']);
        if ($request->has('password') && !empty($request->password)) {
            $updateData['password'] = $request->password;
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'data' => [
                'id_user' => $user->id_user,
                'name' => $user->name,
                'email' => $user->email,
                'birth_date' => $user->birth_date?->format('Y-m-d'),
                'role' => $user->role,
                'created_at' => $user->created_at->format('d.m.Y H:i'),
            ]
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $id = $request->query('id');
        
        if (!$id) {
            return response()->json([
                'success' => false,
                'error' => 'User ID is required'
            ], 400);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not found'
            ], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
