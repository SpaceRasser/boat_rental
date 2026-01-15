<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Boat extends Model
{
    use HasFactory;

    protected $table = 'boats';
    protected $primaryKey = 'id_boat';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'description',
        'image_url',
        'available',
        'quantity',
        'price',
        'price_discount',
        'available_days',
        'available_time_start',
        'available_time_end',
        'owner_id',
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

    public function owner()
    {
        return $this->belongsTo(Owner::class, 'owner_id', 'id_owner');
    }

    public function orders()
    {
        return $this->hasMany(BoatOrder::class, 'boat_id', 'id_boat');
    }

    protected $attributes = [
        'available_time_start' => '09:00:00',
        'available_time_end' => '18:00:00',
    ];

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
