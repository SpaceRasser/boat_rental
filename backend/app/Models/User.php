<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class User extends Model
{
    use HasFactory;

    protected $table = 'users';
    protected $primaryKey = 'id_user';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'email',
        'password',
        'birth_date',
        'role',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = md5($value); // Сохраняем совместимость с текущей БД
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'user_id', 'id_user');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'user_id', 'id_user');
    }
}
