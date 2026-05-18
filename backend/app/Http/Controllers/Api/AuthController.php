<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Facades\Storage;



class AuthController extends Controller
{
    public function register(Request $request){
        // 1. Gelen veriyi doğrula (Siber Güvenlik Savunması)
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone_number' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
    }
    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'phone_number' => $request->phone_number,
        'password' => Hash::make($request->password), // Şifreyi asla açık metin tutma![cite: 1]
        'is_admin' => false,
    ]);
    // 3. Mobil uygulama için erişim anahtarı (Token) oluştur[cite: 1]
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Kullanıcı başarıyla oluşturuldu.',
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => $user
    ]);
}
public function login(Request $request)
{
    // 1. Gelen giriş bilgilerini doğrula
    $validator = Validator::make($request->all(), [
        'email' => 'required|string|email',
        'password' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json($validator->errors(), 422);
    }

    // 2. Kullanıcıyı bul
    $user = User::where('email', $request->email)->first();

    // 3. Kullanıcı var mı ve şifre doğru mu? (Hash kontrolü)
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'Giriş bilgileri hatalı!'
        ], 401);
    }

    // 4. Yeni bir anahtar (Token) üret
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Giriş başarılı!',
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => $user // Mobil uygulama için kullanıcı bilgilerini de gönderelim
    ]);
}

public function updateProfile(Request $request)
{
    $user = $request->user();

    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        'phone_number' => 'required|string',
        'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    if ($validator->fails()) {
        return response()->json($validator->errors(), 422);
    }

    $user->name = $request->name;
    $user->email = $request->email;
    $user->phone_number = $request->phone_number;

    if ($request->hasFile('profile_photo')) {
        $file = $request->file('profile_photo');
        $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        
        $manager = new ImageManager(new Driver());
        $image = $manager->decode($file->getRealPath());
        $image->cover(400, 400); // Profil fotoğrafı kare olmalı
        
        Storage::disk('public')->makeDirectory('profiles');
        $image->save(storage_path('app/public/profiles/' . $fileName));
        
        // Eski fotoğraf varsa silebiliriz (isteğe bağlı)
        if ($user->profile_photo_path && Storage::disk('public')->exists($user->profile_photo_path)) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $user->profile_photo_path = 'profiles/' . $fileName;
    }

    $user->save();

    return response()->json([
        'message' => 'Profil başarıyla güncellendi.',
        'user' => $user
    ]);
}

public function updatePassword(Request $request)
{
    $request->validate([
        'current_password' => 'required',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $user = $request->user();

    if (!Hash::check($request->current_password, $user->password)) {
        return response()->json([
            'message' => 'Mevcut şifreniz yanlış.'
        ], 400);
    }

    $user->password = Hash::make($request->password);
    $user->save();

    return response()->json([
        'message' => 'Şifreniz başarıyla güncellendi.'
    ]);
}

    public function updateAddress(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'address_title' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'district' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user->address_title = $request->address_title;
        $user->city = $request->city;
        $user->district = $request->district;
        $user->save();

        return response()->json([
            'message' => 'Adres bilgileriniz başarıyla güncellendi.',
            'user' => $user
        ]);
    }
}
    //

