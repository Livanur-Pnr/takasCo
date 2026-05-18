<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use Illuminate\Support\Facades\Storage;

$products = Product::all();
Storage::disk('public')->makeDirectory('products');

$keywordMap = [
    'iPhone 13' => 'iphone',
    'AirPods Pro' => 'airpods',
    'Logitech Mouse' => 'mouse',
    'Apple Watch 7' => 'applewatch',
    'Powerbank 20k' => 'powerbank',
    'Deri Ceket' => 'leather,jacket',
    'Nike Air Force' => 'sneakers',
    'Güneş Gözlüğü' => 'sunglasses',
    'Sırt Çantası' => 'backpack',
    'Kaşe Palto' => 'coat',
    'Akustik Gitar' => 'guitar',
    'Mikrofon' => 'microphone',
    'Amfi' => 'amplifier',
    'Ukulele' => 'ukulele',
    'Nota Sehpası' => 'music,stand',
    'HP Kitap Seti' => 'books',
    'Kindle E-Okuyucu' => 'kindle',
    'Klasik Romanlar' => 'books',
    'Çizim Seti' => 'drawing',
    'Satranç Takımı' => 'chess',
    'Dambıl Seti' => 'dumbbell',
    'Pilates Matı' => 'pilates',
    'Tenis Raketi' => 'tennis',
    'Basketbol Topu' => 'basketball',
    'Spor Çantası' => 'gym,bag',
    'Kahve Makinesi' => 'coffee,machine',
    'Lambader' => 'lamp',
    'Dekoratif Tablo' => 'painting',
    'Nevresim Takımı' => 'bedding',
    'Vazo Seti' => 'vase',
    'PS5 Kolu' => 'playstation',
    'Gaming Kulaklık' => 'headset',
    'Mekanik Klavye' => 'keyboard',
    'Oyun CD Seti' => 'cd',
    'Yayıncı Işığı' => 'ringlight',
    'Şövale' => 'easel',
    'Akrilik Boya Seti' => 'paint',
    'Eskiz Defteri' => 'sketchbook',
    'Fırça Seti' => 'paintbrush',
    'Heykel Çamuru' => 'clay',
    'Kamp Çadırı' => 'tent',
    'Kamp Sandalyesi' => 'camping,chair',
    'Termos 1L' => 'thermos',
    'Kafa Lambası' => 'headlamp',
    'Sırt Çantası 60L' => 'backpack',
    'Eski Pullar' => 'stamps',
    'Pikap' => 'turntable',
    'Plak - Sezen Aksu' => 'vinyl',
    'Analog Kamera' => 'camera',
    'Daktilo' => 'typewriter'
];

foreach ($products as $product) {
    echo "Processing {$product->title}...\n";
    $keyword = $keywordMap[$product->title] ?? 'object';
    
    // Fetch image from Unsplash Source / LoremFlickr
    $url = "https://loremflickr.com/800/800/" . urlencode($keyword);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $imageData = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($imageData && $httpCode == 200) {
        $fileName = time() . '_' . uniqid() . '.jpg';
        Storage::disk('public')->put('products/' . $fileName, $imageData);
        
        $path = 'products/' . $fileName;
        $product->image_path = json_encode([$path]);
        $product->save();
        echo "Saved {$path} for {$product->title}\n";
    } else {
        echo "Failed to fetch image for {$product->title} (HTTP $httpCode)\n";
    }
}
echo "Done!\n";
