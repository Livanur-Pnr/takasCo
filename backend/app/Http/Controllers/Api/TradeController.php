<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trade;
use App\Models\Product;

class TradeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $incoming = Trade::where('receiver_id', $user->id)
            ->with(['sender', 'offeredProduct', 'requestedProduct'])
            ->latest()
            ->get();

        $outgoing = Trade::where('sender_id', $user->id)
            ->with(['receiver', 'offeredProduct', 'requestedProduct'])
            ->latest()
            ->get();

        return response()->json([
            'incoming' => $incoming,
            'outgoing' => $outgoing
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'offered_product_id' => 'required|exists:products,id',
            'requested_product_id' => 'required|exists:products,id',
        ]);

        $sender = $request->user();
        $requestedProduct = Product::findOrFail($request->requested_product_id);
        $offeredProduct = Product::findOrFail($request->offered_product_id);

        if ($requestedProduct->user_id === $sender->id) {
            return response()->json(['message' => 'Kendi ürününüze teklif veremezsiniz.'], 400);
        }

        if ($offeredProduct->user_id !== $sender->id) {
            return response()->json(['message' => 'Sadece kendi ürününüzü teklif edebilirsiniz.'], 403);
        }

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

        if ($trade->receiver_id !== $request->user()->id) {
            return response()->json(['message' => 'Bu işlemi yapmaya yetkiniz yok.'], 403);
        }

        // Teklifi onayla
        $trade->update(['status' => 'onaylandı']);

        // İlgili iki ürünü Takaslandı (3) yap
        $offeredProduct = Product::find($trade->offered_product_id);
        $requestedProduct = Product::find($trade->requested_product_id);

        if ($offeredProduct) $offeredProduct->update(['status' => 3]);
        if ($requestedProduct) $requestedProduct->update(['status' => 3]);

        // Bu ürünlere gelen diğer tüm beklemedeki teklifleri iptal et
        Trade::where('id', '!=', $trade->id)
            ->where('status', 'beklemede')
            ->where(function ($query) use ($offeredProduct, $requestedProduct) {
                $query->whereIn('requested_product_id', [$offeredProduct->id, $requestedProduct->id])
                      ->orWhereIn('offered_product_id', [$offeredProduct->id, $requestedProduct->id]);
            })
            ->update(['status' => 'reddedildi']);

        // İletişim bilgisi paylaşımı
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
