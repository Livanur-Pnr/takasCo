<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trade extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'offered_product_id',
        'requested_product_id',
        'status'
    ];
//gönderen kim
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
//teklif giden ürün ne
    public function offeredProduct()
    {
        return $this->belongsTo(Product::class, 'offered_product_id');
    }
//takasta istenen ürün ne
    public function requestedProduct()
    {
        return $this->belongsTo(Product::class, 'requested_product_id');
    }
}
