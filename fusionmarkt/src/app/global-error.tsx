"use client";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // _error is available for logging if needed
  void _error;
  return (
    <html lang="tr">
      <body className="bg-[#0a0a0f] text-white min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-[80px] md:text-[120px] font-bold leading-none bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Hata
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white/90">
            Bir şeyler yanlış gitti
          </h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00FF77] to-[#79FFB7] text-black font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  );
}

