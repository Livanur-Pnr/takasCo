<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductImage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Facades\Storage;


class ProductController extends Controller
{
    public function index()
    {
        $products = Product::where('status', 1)->with(['user', 'category', 'images'])->latest()->get();
        return response()->json($products);
    }

    public function store(Request $request)
{
    try {
        $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|integer',
            'description' => 'required|string',
            'condition' => 'required|string',
            'swap_expectation' => 'required|string',
            'city' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'images' => 'required|array|min:1|max:3',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'title.required' => 'Lütfen başlık girin.',
            'category_id.required' => 'Lütfen kategori seçin.',
            'images.required' => 'Lütfen en az bir fotoğraf yükleyin.',
            'images.max' => 'En fazla 3 fotoğraf yükleyebilirsiniz.',
        ]);

        $paths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                
                $manager = new ImageManager(new Driver());
                $image = $manager->decode($file->getRealPath());
                $image->cover(800, 800); // Resmi kare yapıp optimize ediyoruz
                
                Storage::disk('public')->makeDirectory('products');
                $image->save(storage_path('app/public/products/' . $fileName));
                
                $paths[] = 'products/' . $fileName;
            }
        }

        // 1. ÜRÜNÜ OLUŞTUR (Artık image_path sütunu burada yok!)
        $product = Product::create([
            'user_id' => $request->user()->id, 
            'category_id' => $request->category_id,
            'title' => $request->title,
            'description' => $request->description,
            'condition' => $request->condition,
            'swap_expectation' => $request->swap_expectation,
            'city' => $request->city ?? $request->user()->city,
            'district' => $request->district ?? $request->user()->district,
            'status' => 1,
        ]);

        // 2. RESİMLERİ İLİŞKİLİ TABLOYA KAYDET
        if (count($paths) > 0) {
            foreach ($paths as $index => $path) {
                $product->images()->create([
                    'image_path' => $path,
                    'is_primary' => ($index === 0), // İlk resim otomatik kapak olur
                    'sort_order' => $index
                ]);
            }
        }

        return response()->json([
            'message' => 'İlanınız başarıyla oluşturuldu!',
            'product' => $product->load('images') // Yeni resimlerle beraber döndür
        ], 201);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json(['errors' => $e->errors()], 422);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Bir hata oluştu.', 'error' => $e->getMessage()], 500);
    }
}

    public function approve($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['status' => 1]);
        return response()->json(['message' => 'İlan onaylandı.']);
    }

    public function show($id)
    {
        $product = Product::with(['user', 'category', 'images'])->findOrFail($id);
    return response()->json($product);
    }

    public function myProducts(Request $request)
    {
        $products = Product::where('user_id', $request->user()->id)->with('category')->latest()->get();
        return response()->json($products);
    }

    
    public function toggleFavorite(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $user = $request->user();

        $exists = \Illuminate\Support\Facades\DB::table('favorites')
            ->where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($exists) {
            \Illuminate\Support\Facades\DB::table('favorites')
                ->where('user_id', $user->id)
                ->where('product_id', $product->id)
                ->delete();
            return response()->json(['message' => 'Favorilerden çıkarıldı', 'is_favorite' => false]);
        } else {
            \Illuminate\Support\Facades\DB::table('favorites')->insert([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            return response()->json(['message' => 'Favorilere eklendi', 'is_favorite' => true]);
        }
    }

    public function favorites(Request $request)
    {
        $favoriteProductIds = \Illuminate\Support\Facades\DB::table('favorites')
            ->where('user_id', $request->user()->id)
            ->pluck('product_id');

        $products = Product::whereIn('id', $favoriteProductIds)->with('category')->get();
        return response()->json($products);
    }
    
    public function destroy(Request $request, $id)
    {
        try {
            // Ürünü bul, yoksa otomatik 404 döner
            $product = Product::findOrFail($id);
    
            // GÜVENLİK KONTROLÜ: Giriş yapan kullanıcı ile ürün sahibi aynı mı?
            // $request->user()->id kullanmak Sanctum üzerinden gelen güvenli ID'yi verir.
            if ($product->user_id != $request->user()->id) {
                return response()->json(['message' => 'Bu ilanı silme yetkiniz bulunmamaktadır.'], 403);
            }
    
            $product->delete();
            return response()->json(['message' => 'İlan başarıyla silindi.'], 200);
    
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'İlan bulunamadı.'], 404);
        } catch (\Exception $e) {
            // dd() yerine JSON hata mesajı dönüyoruz ki uygulama çökmesin
            return response()->json([
                'message' => 'Bir hata oluştu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // 1. Ürünü ve mevcut resimlerini bul (Eager Loading)
            $product = Product::with('images')->findOrFail($id);
    
            // 🛡️ SİBER GÜVENLİK KONTROLÜ: IDOR Engelleme
            if ($product->user_id != $request->user()->id) {
                return response()->json(['message' => 'Bu ilanı güncelleme yetkiniz bulunmamaktadır.'], 403);
            }
    
            // 2. Metin alanlarını güncelle (Kısa ve temiz yol)
            $product->update($request->only(['title', 'description', 'city', 'district', 'condition']));
    
            // 3. FOTOĞRAF YÖNETİMİ (Yeni tabloya geçiş)
            if ($request->has('images')) {
                
                // Postman'dan gelen veriyi diziye normalize edelim
                $newImages = $request->has('images') 
                    ? (array) $request->images
                    : [] ;
                    
    
                // ESKİ RESİMLERİ SİLELİM (Temiz bir başlangıç için)
                // Not: Eğer resimleri korumak istersen burayı özelleştirebiliriz.
                $product->images()->delete();
    
                // YENİ RESİMLERİ EKLEYELİM
                if(!empty($newImages)){
                    foreach ($newImages as $index => $path) {
                        $product->images()->create([
                            'image_path' => $path,
                            'is_primary' => ($index === 0), // İlk resim kapak olsun
                            'sort_order' => $index,
                        ]);
                    }
                }
            }
    
            return response()->json([
                'message' => 'İlan ve fotoğraflar başarıyla güncellendi!',
                'product' => $product->load('images') // Güncel resimlerle birlikte geri döndür
            ], 200);
    
        } catch (\Exception $e) {
            // Hata olursa sebebini Postman'da görebilmen için:
            return response()->json([
                'message' => 'Bir hata oluştu!',
                'error' => $e->getMessage()
            ], 500);
        }
        }
        public function deleteImage(Request $request, $imageId)
{
    try {
        $image = ProductImage::findOrFail($imageId);
        $product = $image->product; // Resmin bağlı olduğu ürünü bul

        // 🛡️ SİBER GÜVENLİK: Sadece ürün sahibi resmini silebilir (IDOR Koruması)
        if ($product->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Bu resmi silme yetkiniz yok.'], 403);
        }

        // 1. Fiziksel dosyayı sunucudan (storage) sil
        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }

        // 2. Veritabanı kaydını sil
        $image->delete();

        return response()->json(['message' => 'Resim başarıyla imha edildi.']);

    } catch (\Exception $e) {
        return response()->json(['error' => 'Silme başarısız.'], 500);
    }
}
    }



