import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="tr">
      <body className="bg-[#0a0a0f] text-white min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          {/* 404 Number */}
          <h1 className="text-[120px] md:text-[180px] font-bold leading-none bg-gradient-to-r from-[#00FF77] via-[#79FFB7] to-[#A5FFCF] bg-clip-text text-transparent">
            404
          </h1>
          
          {/* Message */}
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white/90">
            Sayfa Bulunamadı
          </h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
          
          {/* Back to Home Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00FF77] to-[#79FFB7] text-black font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Ana Sayfaya Dön
          </Link>
        </div>
      </body>
    </html>
  );
}

