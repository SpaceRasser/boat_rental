<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoatOrder extends Model
{
    use HasFactory;

    protected $table = 'boat_orders';
    protected $primaryKey = 'id_order';
    public $timestamps = true;

    protected $fillable = [
        'boat_id',
        'product_id',
        'status',
        'available',
        'available_days',
        'available_time_start',
        'available_time_end',
        'quantity',
        'price',
        'price_discount',
    ];

    protected $casts = [
        'available' => 'boolean',
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'price_discount' => 'decimal:2',
        'available_time_start' => 'string',
        'available_time_end' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function boat()
    {
        return $this->belongsTo(Boat::class, 'boat_id', 'id_boat');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id_product');
    }

    public function getAvailableTimeStartAttribute($value)
    {
        if (!$value) return '09:00';
        return is_string($value) && strlen($value) > 5 ? substr($value, 0, 5) : $value;
    }

    public function getAvailableTimeEndAttribute($value)
    {
        if (!$value) return '18:00';
        return is_string($value) && strlen($value) > 5 ? substr($value, 0, 5) : $value;
    }
}
