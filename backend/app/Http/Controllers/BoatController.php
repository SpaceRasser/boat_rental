<?php

namespace App\Http\Controllers;

use App\Models\Boat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $offset = ($page - 1) * $limit;

        $boats = Boat::orderBy('id_boat', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get()
            ->map(function ($boat) {
                return [
                    'id_boat' => $boat->id_boat,
                    'name' => $boat->name,
                    'description' => $boat->description,
                    'image_url' => $boat->image_url,
                    'available' => $boat->available,
                    'quantity' => $boat->quantity,
                    'price' => $boat->price,
                    'price_discount' => $boat->price_discount,
                    'available_days' => $boat->available_days,
                    'available_time_start' => $boat->available_time_start,
                    'available_time_end' => $boat->available_time_end,
                    'created_at' => $boat->created_at->format('d.m.Y H:i'),
                ];
            });

        $total = Boat::count();

        return response()->json([
            'success' => true,
            'data' => [
                'boats' => $boats,
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
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url|max:500',
            'available' => 'nullable|boolean',
            'quantity' => 'nullable|integer|min:1',
            'price_discount' => 'nullable|numeric|min:0',
            'available_days' => 'nullable|string',
            'available_time_start' => 'nullable|string',
            'available_time_end' => 'nullable|string',
            'owner_id' => 'nullable|exists:owners,id_owner',
        ]);

        $boat = Boat::create([
            'name' => $request->name,
            'description' => $request->description,
            'image_url' => $request->image_url,
            'available' => $request->available ?? true,
            'quantity' => $request->quantity ?? 1,
            'price' => $request->price,
            'price_discount' => $request->price_discount,
            'available_days' => $request->available_days ?? 'Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье',
            'available_time_start' => $request->available_time_start ?? '09:00',
            'available_time_end' => $request->available_time_end ?? '18:00',
            'owner_id' => $request->owner_id,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id_boat' => $boat->id_boat,
                'name' => $boat->name,
                'description' => $boat->description,
                'image_url' => $boat->image_url,
                'available' => $boat->available,
                'quantity' => $boat->quantity,
                'price' => $boat->price,
                'price_discount' => $boat->price_discount,
                'available_days' => $boat->available_days,
                'available_time_start' => $boat->available_time_start,
                'available_time_end' => $boat->available_time_end,
                'created_at' => $boat->created_at->format('d.m.Y H:i'),
            ]
        ], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $id = $request->input('id') ?? $request->query('id');
        
        if (!$id) {
            return response()->json([
                'success' => false,
                'error' => 'Boat ID is required'
            ], 400);
        }

        $boat = Boat::find($id);

        if (!$boat) {
            return response()->json([
                'success' => false,
                'error' => 'Boat not found'
            ], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url|max:500',
            'available' => 'nullable|boolean',
            'quantity' => 'nullable|integer|min:1',
            'price_discount' => 'nullable|numeric|min:0',
            'available_days' => 'nullable|string',
            'available_time_start' => 'nullable|string',
            'available_time_end' => 'nullable|string',
            'owner_id' => 'nullable|exists:owners,id_owner',
        ]);

        $boat->update($request->only([
            'name', 'description', 'image_url', 'available', 'quantity',
            'price', 'price_discount', 'available_days',
            'available_time_start', 'available_time_end', 'owner_id'
        ]));

        return response()->json([
            'success' => true,
            'data' => [
                'id_boat' => $boat->id_boat,
                'name' => $boat->name,
                'description' => $boat->description,
                'image_url' => $boat->image_url,
                'available' => $boat->available,
                'quantity' => $boat->quantity,
                'price' => $boat->price,
                'price_discount' => $boat->price_discount,
                'available_days' => $boat->available_days,
                'available_time_start' => $boat->available_time_start,
                'available_time_end' => $boat->available_time_end,
                'created_at' => $boat->created_at->format('d.m.Y H:i'),
            ]
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $id = $request->query('id');
        
        if (!$id) {
            return response()->json([
                'success' => false,
                'error' => 'Boat ID is required'
            ], 400);
        }

        $boat = Boat::find($id);

        if (!$boat) {
            return response()->json([
                'success' => false,
                'error' => 'Boat not found'
            ], 404);
        }

        $boat->delete();

        return response()->json([
            'success' => true,
            'message' => 'Boat deleted successfully'
        ]);
    }
}
