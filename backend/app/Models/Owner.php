<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Owner extends Model
{
    use HasFactory;

    protected $table = 'owners';
    protected $primaryKey = 'id_owner';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = md5($value);
    }

    public function boats()
    {
        return $this->hasMany(Boat::class, 'owner_id', 'id_owner');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'owner_id', 'id_owner');
    }
}
