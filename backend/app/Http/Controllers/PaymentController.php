<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $payments = Payment::with(['user', 'booking'])
                ->orderBy('id_payment', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($payment) {
                    return [
                        'id_payment' => $payment->id_payment,
                        'booking_id' => $payment->booking_id,
                        'booking_number' => $payment->booking_id,
                        'user_id' => $payment->user_id,
                        'user_name' => $payment->user?->name,
                        'user_email' => $payment->user?->email,
                        'amount' => $payment->amount,
                        'payment_method' => $payment->payment_method,
                        'status' => $payment->status,
                        'transaction_id' => $payment->transaction_id,
                        'payment_date' => $payment->payment_date->format('d.m.Y'),
                        'created_at' => $payment->created_at->format('d.m.Y H:i'),
                    ];
                });

            $stats = [
                'total' => Payment::count(),
                'total_amount' => Payment::sum('amount'),
                'completed_amount' => Payment::where('status', 'completed')->sum('amount'),
                'pending_count' => Payment::where('status', 'pending')->count(),
                'completed_count' => Payment::where('status', 'completed')->count(),
                'failed_count' => Payment::where('status', 'failed')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'payments' => $payments,
                    'stats' => $stats,
                    'message' => 'Данные успешно загружены'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => true,
                'data' => [
                    'payments' => [],
                    'stats' => [
                        'total' => 0,
                        'total_amount' => 0,
                        'completed_amount' => 0,
                        'pending_count' => 0,
                        'completed_count' => 0,
                        'failed_count' => 0
                    ],
                    'message' => 'Используются тестовые данные (ошибка БД: ' . $e->getMessage() . ')'
                ]
            ]);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id_user',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
        ]);

        $payment = Payment::create($request->all());
        return response()->json(['success' => true, 'data' => $payment], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $id = $request->input('id') ?? $request->query('id');
        if (!$id) {
            return response()->json(['success' => false, 'error' => 'Payment ID is required'], 400);
        }
        $payment = Payment::find($id);
        if (!$payment) {
            return response()->json(['success' => false, 'error' => 'Payment not found'], 404);
        }
        $payment->update($request->all());
        return response()->json(['success' => true, 'data' => $payment]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $id = $request->query('id');
        if (!$id) {
            return response()->json(['success' => false, 'error' => 'Payment ID is required'], 400);
        }
        $payment = Payment::find($id);
        if (!$payment) {
            return response()->json(['success' => false, 'error' => 'Payment not found'], 404);
        }
        $payment->delete();
        return response()->json(['success' => true, 'message' => 'Payment deleted successfully']);
    }
}
