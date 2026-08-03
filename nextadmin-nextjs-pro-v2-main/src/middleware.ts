/**
 * Admin Panel Middleware
 * Tüm sayfalarda ve Admin API'lerinde giriş zorunlu
 * Sadece ADMIN ve SUPER_ADMIN rolündeki kullanıcılar erişebilir
 *
 * ⚠️ DOSYA KONUMU KRİTİK (F2-71): Bu dosya 31 Tem'e kadar **proje kökünde**
 * duruyordu ve Next.js onu hiç yüklemiyordu. Uygulama `src/` dizini
 * kullandığında Next middleware'i yalnızca `src/middleware.ts` yolunda arar;
 * kökteki kopya sessizce yok sayılır — ne uyarı verir ne hata. Sonuç: 96 admin
 * sayfasının 95'i hiçbir yetki kontrolünden geçmiyordu ve `/customers`
 * oturumsuz olarak gerçek müşteri e-postalarını döndürüyordu.
 *
 * Taşımayı bozacak bir düzenleme yapmadan önce `.next/server/
 * middleware-manifest.json` içindeki `middleware` anahtarına bakın: boşsa
 * middleware yine devre dışı demektir.
 */

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/**
 * Giriş sayfasına **göreli** yönlendirme üretir.
 *
 * `NextResponse.redirect(new URL(..., request.url))` kullanılamaz: `request.url`
 * gelen `Host` başlığından türetiliyor ve nginx paneli `proxy_pass
 * http://localhost:3001` ile beslediği için başlık `localhost:3001` oluyordu.
 * Sonuç: admin.fusionmarkt.com'a giren herkes `https://localhost:3001/auth/signin`
 * adresine atılıyordu. Yalnızca yol içeren bir `Location` başlığı (RFC 7231'de
 * geçerli) tarayıcı tarafından mevcut origin'e göre çözülür, yani ters vekilin
 * başlıklarına hiç bağlı kalmayız.
 */
function redirectToSignIn(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return new NextResponse(null, {
    status: 307,
    headers: { Location: `/auth/signin${query ? `?${query}` : ""}` },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`\n🔍 MIDDLEWARE: ${request.method} ${pathname}`);

  // Public paths - bunlara herkes erişebilir
  const publicPaths = [
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/error",
  ];

  // Public path kontrolü - sadece auth sayfaları
  const isAuthPage = publicPaths.some(path => pathname.startsWith(path));
  
  // Admin API kontrolü - bunlar da korunmalı!
  const isAdminAPI = pathname.startsWith("/api/admin");
  
  // Public API'ler - bunlara herkes erişebilir (NextAuth vb.)
  const isPublicAPI = pathname.startsWith("/api/auth") || 
                      pathname.startsWith("/api/public");
  
  /**
   * Statik dosya kontrolü (F2-69).
   *
   * Eskiden kural `pathname.includes(".")` idi: yolunda nokta geçen **her**
   * istek statik sayılıp yetki kontrolünü atlıyordu. Bu, `.pdf` ile biten
   * fatura ucunun oturum aranmadan çalışmasına yol açmıştı. Kural artık
   * bilinen uzantılarla sınırlı ve `/api/` altındaki hiçbir yol statik
   * sayılmıyor — bir API ucu ne kadar dosya gibi görünürse görünsün.
   *
   * `/storage` de bilerek listeden çıkarıldı: orada duran fatura PDF'leri
   * müşteri adı, adresi ve vergi bilgisi taşıyor, admin alan adından
   * oturumsuz indirilmeleri gerekmiyor (F2-70). Aynı klasördeki avatarlar
   * `.png` / `.jpg` uzantısıyla listeden geçtiği için panel görselleri
   * etkilenmiyor. `.pdf` uzantısı da listede yok.
   */
  const isApiPath = pathname.startsWith("/api");
  const hasStaticExtension =
    /\.(?:png|jpe?g|gif|svg|webp|avif|ico|bmp|css|js|mjs|map|woff2?|ttf|otf|eot|txt|xml|webmanifest)$/i
      .test(pathname);
  const isStaticFile =
    !isApiPath &&
    (hasStaticExtension ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/images"));

  // Public veya static ise geç (ama Admin API hariç!)
  if ((isAuthPage || isStaticFile || isPublicAPI) && !isAdminAPI) {
    console.log(`   ➡️ Public/Static path, skipping auth check`);
    return NextResponse.next();
  }

  // Token al - Admin panel için özel cookie adı
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "admin-session-token",
  });

  // Token yoksa
  if (!token) {
    console.log(`🔒 No token: ${pathname}`);
    
    // API için JSON response — yalnızca /api/admin değil, korunan her API yolu.
    // `fetch` ile çağrılan bir uca giriş sayfasının HTML'ini döndürmek
    // çağıranı yanıltıyordu.
    if (isApiPath) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
    
    // Sayfa için redirect
    return redirectToSignIn({ callbackUrl: pathname });
  }

  // Rol kontrolü - sadece ADMIN ve SUPER_ADMIN
  const userRole = token.role as string;

  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    console.warn(`⛔ Unauthorized: ${token.email} (role: ${userRole}) tried to access ${pathname}`);
    
    // API için JSON response
    if (isApiPath) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok", code: "FORBIDDEN" },
        { status: 403 }
      );
    }
    
    // Sayfa için redirect
    const response = redirectToSignIn({
      error: "AccessDenied",
      message: "Bu panele erişim yetkiniz yok. Sadece yöneticiler giriş yapabilir.",
    });

    // Session'ı temizle
    response.cookies.delete("admin-session-token");
    response.cookies.delete("__Secure-admin-session-token");
    
    return response;
  }

  console.log(`✅ Access granted: ${token.email} (${userRole}) -> ${pathname}`);
  return NextResponse.next();
}

// Middleware'in çalışacağı yollar
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next (Next.js internals)
     * - Static files with extensions
     * 
     * NOT: /api/admin/* korunuyor, /api/auth/* public
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
