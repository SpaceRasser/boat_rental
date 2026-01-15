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
        'start_time',
        'end_time',
        'booking_date',
        'status',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'start_time' => 'string',
        'end_time' => 'string',
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
}
