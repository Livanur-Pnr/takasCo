<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\ProductImage;


class Product extends Model
{
    use  SoftDeletes;

    protected $dates = ['deleted_at'];
    public function images()
{
    // Bir ürünün birden fazla resmi olabilir
    return $this->hasMany(ProductImage::class, 'product_id');
}
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'condition',
        'product_id', 
        'image_path', 
        'is_primary', 
        'sort_order',
        'swap_expectation',
        'status',
        'city',
        'district'
    ];

    protected $casts = [
        'image_path' => 'array',
    ];
    public function product()
{
    // Her resim sadece bir ürüne aittir
    return $this->belongsTo(Product::class, 'product_id');
}    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

}
