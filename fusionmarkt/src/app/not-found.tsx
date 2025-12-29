import Link from "next/link";

// Force dynamic rendering to avoid SSG issues
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Number */}
        <h1 className="text-[100px] md:text-[160px] font-bold leading-none bg-gradient-to-r from-[#00FF77] via-[#79FFB7] to-[#A5FFCF] bg-clip-text text-transparent">
          404
        </h1>
        
        {/* Message */}
        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white/80">
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
    </div>
  );
}
