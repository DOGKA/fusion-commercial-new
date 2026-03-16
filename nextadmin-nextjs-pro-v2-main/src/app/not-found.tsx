import { ArrowLeftIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";

const FrownIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default function NotFoundPage() {
  return (
    <div className="rounded-[10px] bg-white px-5 py-10 dark:bg-gray-dark sm:py-17.5">
      <div className="mx-auto w-full max-w-[575px] px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 lg:pt-15 xl:pt-20 2xl:pt-[187px]">
          <div className="absolute left-0 top-0 -z-1">
            <Image
              src="/images/grids/grid-01.svg"
              role="presentation"
              alt=""
              width={575}
              height={460}
              className="dark:opacity-20"
            />
          </div>

          <div className="text-center">
            <div className="mx-auto mb-10 flex h-28.5 w-full max-w-[114px] items-center justify-center rounded-full border border-stroke bg-white text-dark shadow-error dark:border-dark-3 dark:bg-dark-2 dark:text-white">
              <FrownIcon />
            </div>

            <h1 className="mb-5 text-heading-4 font-black text-dark dark:text-white lg:text-heading-3">
              Sayfa bulunamadı
            </h1>

            <p className="mx-auto w-full max-w-[355px]">
              Aradığınız sayfa mevcut değil. Ana sayfaya dönebilirsiniz.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-[7px] bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
            >
              <ArrowLeftIcon />
              <span>Ana Sayfaya Dön</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
