<?php

namespace App\Http\Controllers;

use App\Models\Boat;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoatOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $offset = ($page - 1) * $limit;
        
        $orders = Booking::with(['boat', 'product', 'user', 'owner'])
            ->orderBy('id_booking', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get()
            ->map(function ($order) {
                return [
                    'id_order' => $order->id_booking,
                    'boat_id' => $order->boat_id,
                    'boat_name' => $order->boat?->name,
                    'product_id' => $order->product_id,
                    'product_name' => $order->product?->name,
                    'user_id' => $order->user_id,
                    'user_name' => $order->user?->name,
                    'owner_id' => $order->owner_id,
                    'owner_name' => $order->owner?->name,
                    'booking_date' => $order->booking_date?->format('Y-m-d'),
                    'start_time' => $order->start_time,
                    'end_time' => $order->end_time,
                    'status' => $order->status,
                    'available_days' => $order->available_days,
                    'available_time_start' => $order->available_time_start,
                    'available_time_end' => $order->available_time_end,
                    'quantity' => $order->quantity,
                    'price' => $order->price,
                    'price_discount' => $order->price_discount,
                    'created_at' => $order->created_at->format('d.m.Y H:i'),
                ];
            });

        $total = Booking::count();

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $orders,
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
            'boat_id' => 'required|exists:boats,id_boat',
            'product_id' => 'nullable|exists:products,id_product',
            'price' => 'nullable|numeric|min:0',
            'booking_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        $boat = Boat::find($request->boat_id);
        $order = Booking::create([
            'user_id' => $request->input('user_id'),
            'owner_id' => $request->input('owner_id', $boat?->owner_id),
            'boat_id' => $request->boat_id,
            'product_id' => $request->product_id,
            'booking_date' => $request->booking_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'quantity' => $request->input('quantity', 1),
            'price' => $request->input('price', $boat?->price),
            'price_discount' => $request->input('price_discount', $boat?->price_discount),
            'available_days' => $request->input('available_days', $boat?->available_days),
            'available_time_start' => $request->input('available_time_start', $boat?->available_time_start),
            'available_time_end' => $request->input('available_time_end', $boat?->available_time_end),
            'status' => $request->input('status', 'ожидание'),
        ]);
        return response()->json(['success' => true, 'data' => $order], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $id = $request->input('id') ?? $request->query('id');
        if (!$id) {
            return response()->json(['success' => false, 'error' => 'Order ID is required'], 400);
        }
        $order = Booking::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'error' => 'Order not found'], 404);
        }
        $order->update($request->only([
            'user_id',
            'owner_id',
            'boat_id',
            'product_id',
            'booking_date',
            'start_time',
            'end_time',
            'quantity',
            'price',
            'price_discount',
            'available_days',
            'available_time_start',
            'available_time_end',
            'status',
        ]));
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $id = $request->query('id');
        if (!$id) {
            return response()->json(['success' => false, 'error' => 'Order ID is required'], 400);
        }
        $order = Booking::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'error' => 'Order not found'], 404);
        }
        $order->delete();
        return response()->json(['success' => true, 'message' => 'Order deleted successfully']);
    }
}
