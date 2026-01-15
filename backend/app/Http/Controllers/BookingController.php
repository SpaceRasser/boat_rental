<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::with(['user', 'owner'])
            ->orderBy('id_booking', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id_booking' => $booking->id_booking,
                    'user_id' => $booking->user_id,
                    'user_name' => $booking->user?->name,
                    'owner_id' => $booking->owner_id,
                    'owner_name' => $booking->owner?->name,
                    'start_time' => $booking->start_time,
                    'end_time' => $booking->end_time,
                    'booking_date' => $booking->booking_date->format('Y-m-d'),
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
            'owner_id' => 'required|exists:owners,id_owner',
            'start_time' => 'required',
            'end_time' => 'required',
            'booking_date' => 'required|date',
        ]);

        $booking = Booking::create($request->all());
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
        $booking->update($request->all());
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
