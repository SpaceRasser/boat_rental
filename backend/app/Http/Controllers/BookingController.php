<?php

namespace App\Http\Controllers;

use App\Models\Boat;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::with(['user', 'owner', 'boat', 'product'])
            ->orderBy('id_booking', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id_booking' => $booking->id_booking,
                    'user_id' => $booking->user_id,
                    'user_name' => $booking->user?->name,
                    'user_email' => $booking->user?->email,
                    'owner_id' => $booking->owner_id,
                    'owner_name' => $booking->owner?->name,
                    'owner_email' => $booking->owner?->email,
                    'boat_id' => $booking->boat_id,
                    'boat_name' => $booking->boat?->name,
                    'product_id' => $booking->product_id,
                    'product_name' => $booking->product?->name,
                    'start_time' => $booking->start_time,
                    'end_time' => $booking->end_time,
                    'booking_date' => $booking->booking_date->format('Y-m-d'),
                    'quantity' => $booking->quantity,
                    'price' => $booking->price,
                    'price_discount' => $booking->price_discount,
                    'available_days' => $booking->available_days,
                    'available_time_start' => $booking->available_time_start,
                    'available_time_end' => $booking->available_time_end,
                    'status' => $booking->status,
                    'created_at' => $booking->created_at->format('d.m.Y H:i'),
                ];
            });

        return response()->json(['success' => true, 'data' => ['bookings' => $bookings]]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id_user',
            'owner_id' => 'nullable|exists:owners,id_owner',
            'boat_id' => 'required|exists:boats,id_boat',
            'product_id' => 'nullable|exists:products,id_product',
            'start_time' => 'required',
            'end_time' => 'required',
            'booking_date' => 'required|date',
            'price' => 'nullable|numeric|min:0',
        ]);

        $boat = Boat::find($request->boat_id);
        $booking = Booking::create([
            'user_id' => $request->user_id,
            'owner_id' => $request->owner_id ?? $boat?->owner_id,
            'boat_id' => $request->boat_id,
            'product_id' => $request->product_id,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'booking_date' => $request->booking_date,
            'quantity' => $request->input('quantity', 1),
            'price' => $request->input('price', $boat?->price),
            'price_discount' => $request->input('price_discount', $boat?->price_discount),
            'available_days' => $request->input('available_days', $boat?->available_days),
            'available_time_start' => $request->input('available_time_start', $boat?->available_time_start),
            'available_time_end' => $request->input('available_time_end', $boat?->available_time_end),
            'status' => $request->input('status', 'бронь'),
        ]);
        return response()->json(['success' => true, 'data' => $booking], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $id = $request->input('id') ?? $request->query('id');
        if (!$id) {
            return response()->json(['success' => false, 'error' => 'Booking ID is required'], 400);
        }
        $booking = Booking::find($id);
        if (!$booking) {
            return response()->json(['success' => false, 'error' => 'Booking not found'], 404);
        }
        $booking->update($request->only([
            'user_id',
            'owner_id',
            'boat_id',
            'product_id',
            'start_time',
            'end_time',
            'booking_date',
            'quantity',
            'price',
            'price_discount',
            'available_days',
            'available_time_start',
            'available_time_end',
            'status',
        ]));
        return response()->json(['success' => true, 'data' => $booking]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $id = $request->query('id');
        if (!$id) {
            return response()->json(['success' => false, 'error' => 'Booking ID is required'], 400);
        }
        $booking = Booking::find($id);
        if (!$booking) {
            return response()->json(['success' => false, 'error' => 'Booking not found'], 404);
        }
        $booking->delete();
        return response()->json(['success' => true, 'message' => 'Booking deleted successfully']);
    }
}
