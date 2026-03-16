"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Hata
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white/80">
          Bir şeyler yanlış gitti
        </h2>
        <p className="text-white/50 mb-8 max-w-md mx-auto">
          {error.message || "Beklenmedik bir hata oluştu."}
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-gradient-to-r from-[#00FF77] to-[#79FFB7] text-black font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}

