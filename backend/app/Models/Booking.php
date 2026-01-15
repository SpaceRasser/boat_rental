<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $table = 'bookings';
    protected $primaryKey = 'id_booking';
    public $timestamps = true;

    protected $fillable = [
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
    ];

    protected $casts = [
        'booking_date' => 'date',
        'start_time' => 'string',
        'end_time' => 'string',
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'price_discount' => 'decimal:2',
        'available_time_start' => 'string',
        'available_time_end' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id_user');
    }

    public function owner()
    {
        return $this->belongsTo(Owner::class, 'owner_id', 'id_owner');
    }

    public function boat()
    {
        return $this->belongsTo(Boat::class, 'boat_id', 'id_boat');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id_product');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'booking_id', 'id_booking');
    }

    public function getStartTimeAttribute($value)
    {
        if (!$value) return '09:00';
        return is_string($value) && strlen($value) > 5 ? substr($value, 0, 5) : $value;
    }

    public function getEndTimeAttribute($value)
    {
        if (!$value) return '18:00';
        return is_string($value) && strlen($value) > 5 ? substr($value, 0, 5) : $value;
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
