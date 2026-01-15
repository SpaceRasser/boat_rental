<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $offset = ($page - 1) * $limit;

        $products = Product::orderBy('id_product', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get()
            ->map(function ($product) {
                return [
                    'id_product' => $product->id_product,
                    'name' => $product->name,
                    'description' => $product->description,
                    'category' => $product->category,
                    'image_url' => $product->image_url,
                    'available' => $product->available,
                    'quantity' => $product->quantity,
                    'price' => $product->price,
                    'price_discount' => $product->price_discount,
                    'created_at' => $product->created_at->format('d.m.Y H:i'),
                ];
            });

        $total = Product::count();

        return response()->json([
            'success' => true,
            'data' => ['products' => $products, 'pagination' => [
                'page' => $page, 'limit' => $limit, 'total' => $total, 'pages' => ceil($total / $limit),
            ]]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'image_url' => 'nullable|url|max:500',
            'available' => 'nullable|boolean',
            'quantity' => 'nullable|integer|min:0',
            'price_discount' => 'nullable|numeric|min:0',
        ]);

        $product = Product::create($request->all());

        return response()->json(['success' => true, 'data' => $product], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $id = $request->input('id') ?? $request->query('id');
        if (!$id) {
            return response()->json(['success' => false, 'error' => 'Product ID is required'], 400);
        }
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'error' => 'Product not found'], 404);
        }
        $product->update($request->all());
        return response()->json(['success' => true, 'data' => $product]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $id = $request->query('id');
        if (!$id) {
            return response()->json(['success' => false, 'error' => 'Product ID is required'], 400);
        }
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'error' => 'Product not found'], 404);
        }
        $product->delete();
        return response()->json(['success' => true, 'message' => 'Product deleted successfully']);
    }
}
