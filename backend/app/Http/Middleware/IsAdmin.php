<?php
//admin kontrolü
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    //gelen isteği işleme
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || auth()->user()->is_admin !== 1) {
            return response()->json(['message' => 'Yetkisiz erişim. Sadece adminler bu işlemi yapabilir.'], 403);
        }//adminse geçişe izin ver
        return $next($request);
    }
}
