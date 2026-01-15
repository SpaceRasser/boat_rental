<?php

namespace App\Http\Controllers;

use App\Models\BoatOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoatOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $offset = ($page - 1) * $limit;
        
        $orders = BoatOrder::with(['boat', 'product'])
            ->orderBy('id_order', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get()
            ->map(function ($order) {
                return [
                    'id_order' => $order->id_order,
                    'boat_id' => $order->boat_id,
                    'boat_name' => $order->boat?->name,
                    'product_id' => $order->product_id,
                    'product_name' => $order->product?->name,
                    'status' => $order->status,
                    'available' => $order->available,
                    'available_days' => $order->available_days,
                    'available_time_start' => $order->available_time_start,
                    'available_time_end' => $order->available_time_end,
                    'quantity' => $order->quantity,
                    'price' => $order->price,
                    'price_discount' => $order->price_discount,
                    'created_at' => $order->created_at->format('d.m.Y H:i'),
                ];
            });

        $total = BoatOrder::count();

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
            'price' => 'required|numeric|min:0',
        ]);

        $order = BoatOrder::create($request->all());
        return response()->json(['success' => true, 'data' => $order], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $id = $request->input('id') ?? $request->query('id');
        if (!$id) {
            return response()->json(['success' => false, 'error' => 'Order ID is required'], 400);
        }
        $order = BoatOrder::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'error' => 'Order not found'], 404);
        }
        $order->update($request->all());
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $id = $request->query('id');
        if (!$id) {
            return response()->json(['success' => false, 'error' => 'Order ID is required'], 400);
        }
        $order = BoatOrder::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'error' => 'Order not found'], 404);
        }
        $order->delete();
        return response()->json(['success' => true, 'message' => 'Order deleted successfully']);
    }
}
