<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trade;
use App\Models\Product;

class TradeController extends Controller
{
    //gelen giden tüm takas isteklerini listeler
    public function index(Request $request)
    {
        $user = $request->user();
        //alıscısı olan kullanıcıya gelen
        $incoming = Trade::where('receiver_id', $user->id)
            ->with(['sender', 'offeredProduct', 'requestedProduct'])// gönderen ve ürün bilgilerini bağlama
            ->latest()// en yeni tekliften en eskiye doğru sıralama
            ->get();
        //göndererni olan kullanıcı takas teklifi çekme
        $outgoing = Trade::where('sender_id', $user->id)
            ->with(['receiver', 'offeredProduct', 'requestedProduct'])
            ->latest()
            ->get();

        return response()->json([
            'incoming' => $incoming,
            'outgoing' => $outgoing
        ]);
    }
    //yeni takas teklifi oluşturma ve db kaydetme
    public function store(Request $request)
    {//ürün var mı kontrolü
        $request->validate([
            'offered_product_id' => 'required|exists:products,id',
            'requested_product_id' => 'required|exists:products,id',
        ]);

        $sender = $request->user();
        $requestedProduct = Product::findOrFail($request->requested_product_id);
        $offeredProduct = Product::findOrFail($request->offered_product_id);

        //kullanıcı kendi ürününe teklif veremez
        if ($requestedProduct->user_id === $sender->id) {
            return response()->json(['message' => 'Kendi ürününüze teklif veremezsiniz.'], 400);
        }
        //sadece kendi ürününü takaslayabilir
        if ($offeredProduct->user_id !== $sender->id) {
            return response()->json(['message' => 'Sadece kendi ürününüzü teklif edebilirsiniz.'], 403);
        }
        //buraya kadar ok'sa takas beklemeye alındı
        $trade = Trade::create([
            'sender_id' => $sender->id,
            'receiver_id' => $requestedProduct->user_id,
            'offered_product_id' => $offeredProduct->id,
            'requested_product_id' => $requestedProduct->id,
            'status' => 'beklemede'
        ]);

        return response()->json(['message' => 'Teklif başarıyla gönderildi.', 'trade' => $trade], 201);
    }

    public function accept(Request $request, $id)
    {
        $trade = Trade::findOrFail($id);
        //teklifi sadece ürünü isteyen (alıcı olan) kişi kabul edebilir
        if ($trade->receiver_id !== $request->user()->id) {
            return response()->json(['message' => 'Bu işlemi yapmaya yetkiniz yok.'], 403);//yetkisiz erişim
        }

        
        $trade->update(['status' => 'onaylandı']);

        // iki ürünü de Takaslandı (3) yap
        $offeredProduct = Product::find($trade->offered_product_id);
        $requestedProduct = Product::find($trade->requested_product_id);

        if ($offeredProduct) $offeredProduct->update(['status' => 3]);
        if ($requestedProduct) $requestedProduct->update(['status' => 3]);

        // ürünlere gelen diğer tüm beklemedeki teklifleri iptal et
        Trade::where('id', '!=', $trade->id)
            ->where('status', 'beklemede')
            ->where(function ($query) use ($offeredProduct, $requestedProduct) {
                $query->whereIn('requested_product_id', [$offeredProduct->id, $requestedProduct->id])
                      ->orWhereIn('offered_product_id', [$offeredProduct->id, $requestedProduct->id]);
            })
            ->update(['status' => 'reddedildi']);

        // iletişim bilgisi paylaşımı
        $sender = $trade->sender;

        return response()->json([
            'message' => 'Teklif kabul edildi. İletişim bilgileri paylaşıldı.',
            'contact' => [
                'partner_name' => $sender->name,
                'partner_phone' => $sender->phone_number,
                'partner_email' => $sender->email
            ]
        ]);
    }
}
