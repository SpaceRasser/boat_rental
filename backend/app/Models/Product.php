<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';
    protected $primaryKey = 'id_product';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'description',
        'category',
        'image_url',
        'available',
        'quantity',
        'price',
        'price_discount',
    ];

    protected $casts = [
        'available' => 'boolean',
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'price_discount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function orders()
    {
        return $this->hasMany(BoatOrder::class, 'product_id', 'id_product');
    }
}
