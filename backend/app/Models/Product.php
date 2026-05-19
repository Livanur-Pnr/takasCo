<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\ProductImage;


class Product extends Model
{
    use  SoftDeletes;

    protected $dates = ['deleted_at'];
    protected $with = ['images'];
    protected $appends = ['image_path'];

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

    public function getImagePathAttribute($value)
    {
        // First, check the new 'images' relation
        if ($this->relationLoaded('images') && $this->images->count() > 0) {
            $primaryImage = $this->images->where('is_primary', true)->first() ?? $this->images->first();
            return $primaryImage->image_path;
        }
        
        // Fallback to old database column
        if ($value) {
            // Because it might be a JSON string like '["products/foo.jpg"]' 
            // We just return it as is, frontend already handles the startsWith('[') check.
            if (is_array($value)) {
                 return json_encode($value);
            }
            return $value;
        }
        return null;
    }

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
