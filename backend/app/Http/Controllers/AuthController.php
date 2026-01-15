<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)
            ->where('password', md5($request->password))
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid email or password'
            ], 401);
        }

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

    public function getCurrent(Request $request): JsonResponse
    {
        $userId = $request->query('user_id');

        if (!$userId) {
            return response()->json([
                'success' => false,
                'error' => 'User ID is required'
            ], 400);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not found'
            ], 404);
        }

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
}
