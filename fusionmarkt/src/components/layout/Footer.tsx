"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  Shield,
  ChevronDown
} from "lucide-react";

const footerLinks = {
  kurumsal: {
    title: "Kurumsal",
    links: [
      { name: "Hakkımızda", href: "/hakkimizda" },
      { name: "İletişim", href: "/iletisim" },
      { name: "Kariyer", href: "/kariyer" },
      { name: "Blog", href: "/blog" },
      { name: "Basında Biz", href: "/basinda-biz" },
    ],
  },
  destek: {
    title: "Müşteri Hizmetleri",
    links: [
      { name: "Sıkça Sorulan Sorular", href: "/sikca-sorulan-sorular" },
      { name: "Sipariş Takibi", href: "/siparis-takibi" },
      { name: "İade ve Değişim", href: "/iade-politikasi" },
      { name: "Garanti Koşulları", href: "/garanti" },
      { name: "Kullanım Kılavuzları", href: "/kilavuzlar" },
    ],
  },
  kullaniciPolitikalari: {
    title: "Kullanıcı Politikaları",
    links: [
      { name: "Çerez Politikası", href: "/cerez-politikasi" },
      { name: "Gizlilik Politikası ve Güvenlik", href: "/gizlilik-politikasi" },
      { name: "Kullanıcı Sözleşmesi", href: "/kullanici-sozlesmesi" },
      { name: "Site Kullanım Şartları", href: "/kullanim-kosullari" },
      { name: "Ücretlendirme Politikası", href: "/ucretlendirme-politikasi" },
    ],
  },
  satisOdeme: {
    title: "Satış ve Ödeme Bilgileri",
    links: [
      { name: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
      { name: "Ödeme Seçenekleri", href: "/odeme-secenekleri" },
      { name: "Gönderim Yerleri", href: "/gonderim-yerleri" },
      { name: "İade Politikası", href: "/iade-politikasi" },
    ],
  },
};

const paymentMethods = ["Visa", "Mastercard", "Amex", "Troy"];

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setOpenSection(openSection === key ? null : key);
  };

  return (
    <footer className="relative bg-[var(--background-secondary)] border-t border-[var(--glass-border)]">
      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP FOOTER - lg ve üstü (>1024px)
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block">
        <div className="container px-6" style={{ paddingTop: '40px', paddingBottom: '48px' }}>
          <div className="flex gap-12 justify-between">
            {/* Brand Column */}
            <div className="min-w-[200px] max-w-[280px]">
              <Link href="/" className="relative inline-block mb-6 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/5 via-white/8 to-white/5 rounded-lg blur-sm opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                <svg width="180" height="36" viewBox="20 220 890 150" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                  <g id="MAIN-LOGO">
                    <path d="M389.574 274.948C388.319 278.012 387.068 280.622 385.693 283.165C385.3 283.892 384.545 284.426 385.122 283.815C371.257 272.447 358.15 260.623 343.897 250.365C333.004 242.526 320.509 237.084 306.435 237.094C293.475 237.105 286.449 244.313 286.914 257.173C286.986 259.164 287.081 261.282 287.793 263.101C290.844 270.906 289.198 277.361 282.496 282.374C272.264 266.957 270.774 236.288 291.356 227.88C300.932 223.969 310.881 224.317 320.466 226.957C348.969 234.806 371.002 252.206 389.574 274.948Z" fill="#dd0000" />
                    <path d="M401.423 277.653C403.244 269.865 405.812 262.601 406.214 255.221C406.872 243.175 400.465 237.194 388.299 236.972C384.965 236.913 381.296 236.709 378.343 237.919C370.282 241.221 365.37 237.028 359.993 231.657C371.956 225.517 384.229 223.84 396.719 226.059C411.656 228.713 420.11 243.079 418.169 260.429C416.575 274.676 411.561 287.833 403.323 299.289C394.782 311.164 384.993 322.213 375.155 333.095C368.674 340.264 366.824 339.828 358.181 332.606C375.851 317.01 392.044 300.254 401.423 277.653Z" fill="#ffffff" />
                    <path d="M355.138 358.545C337.818 349.987 323.19 338.681 310.213 325.211C302.39 317.09 302.413 316.932 309.438 307.316C317.202 314.864 324.609 322.777 332.768 329.835C345.91 341.202 360.562 350.181 377.819 354.19C399.273 359.174 410.968 348.288 405.197 327.344C402.858 318.854 406.83 314.688 411.462 308.661C417.445 321.774 420.427 334.491 416.623 347.956C413.61 358.615 402.83 366.038 391.305 366.745C378.549 367.526 366.923 363.951 355.138 358.545Z" fill="#ffcc00" />
                    <path d="M300.575 354.733C305.577 354.657 310.113 354.89 314.465 354.108C324.928 352.226 324.893 352.034 333.802 360.343C319.344 366.487 305.097 370.221 290.307 363.369C278.372 357.841 273.225 344.33 275.772 329.038C278.508 312.614 285.597 298.085 295.49 284.996C302.185 276.136 309.901 267.997 317.554 259.901C325.032 251.994 325.886 252.162 335.051 258.709C328.204 265.839 321.078 272.789 314.493 280.212C301.146 295.257 290.316 311.718 287.217 332.093C285.482 343.508 289.953 351.257 300.575 354.733Z" fill="#ffffff" />
                  </g>
                  <g id="LANDMARK">
                    <path d="M25.0822 234.364L42.9433 234.364L42.9433 363.74L25.0822 363.74L25.0822 234.364ZM71.2065 292.025L71.2065 306.698L35.0925 306.698L35.0925 292.025L71.2065 292.025ZM78.6643 234.364L78.6643 249.451L34.5037 249.451L34.5037 234.364L78.6643 234.364Z" fill="#ffffff" />
                    <path d="M130.48 342.659L130.48 234.364L148.341 234.364L148.341 345.553C148.341 351.478 146.869 355.99 143.925 359.09C140.981 362.19 136.304 363.74 129.891 363.74L116.938 363.74L116.938 348.653L124.789 348.653C127.144 348.653 128.681 348.239 129.401 347.413C130.121 346.585 130.48 345.002 130.48 342.659ZM107.516 234.364L107.516 342.659C107.516 345.002 107.909 346.585 108.694 347.413C109.479 348.239 111.049 348.653 113.405 348.653L119.489 348.653L119.489 363.74L108.105 363.74C101.694 363.74 97.0157 362.19 94.0715 359.09C91.1286 355.99 89.6565 351.478 89.6565 345.553L89.6565 234.364L107.516 234.364Z" fill="#ffffff" />
                    <path d="M203.494 342.659L203.494 311.038C203.494 308.558 203.133 306.94 202.413 306.182C201.694 305.425 200.157 305.045 197.801 305.045L183.277 305.045C176.997 305.045 172.45 303.461 169.637 300.292C166.823 297.123 165.416 292.577 165.416 286.652L165.416 252.551C165.416 246.626 166.888 242.114 169.833 239.014C172.777 235.914 177.389 234.364 183.67 234.364L202.905 234.364C209.316 234.364 213.961 235.914 216.84 239.014C219.718 242.114 221.158 246.626 221.158 252.551L221.158 271.565L203.297 271.565L203.297 255.444C203.297 252.965 202.937 251.346 202.218 250.587C201.498 249.83 199.895 249.451 197.41 249.451L189.166 249.451C186.81 249.451 185.24 249.83 184.455 250.587C183.67 251.346 183.277 252.965 183.277 255.444L183.277 284.172C183.277 286.514 183.67 288.098 184.455 288.925C185.24 289.752 186.81 290.165 189.166 290.165L203.494 290.165C209.774 290.165 214.354 291.715 217.232 294.815C220.111 297.915 221.551 302.427 221.551 308.352L221.551 345.553C221.551 351.478 220.079 355.99 217.135 359.09C214.19 362.19 209.578 363.74 203.297 363.74L184.062 363.74C177.782 363.74 173.17 362.19 170.226 359.09C167.281 355.99 165.809 351.478 165.809 345.553L165.809 326.539L183.67 326.539L183.67 342.659C183.67 345.002 184.062 346.585 184.848 347.413C185.633 348.239 187.203 348.653 189.558 348.653L197.801 348.653C200.157 348.653 201.694 348.239 202.413 347.413C203.133 346.585 203.494 345.002 203.494 342.659Z" fill="#ffffff" />
                    <path d="M240.786 234.364L258.45 234.364L258.45 363.74L240.786 363.74L240.786 234.364Z" fill="#ffffff" />
                    <path d="M476.175 230.802L492.718 230.802L492.718 360.121L474.581 360.121L448.271 266.954L448.271 360.121L431.728 360.121L431.728 230.802L450.663 230.802L476.175 321.491L476.175 230.802Z" fill="#ffffff" />
                    <path d="M562.677 332.026L546.333 332.026L529.192 265.714L529.192 360.121L513.446 360.121L513.446 230.802L533.179 230.802L554.504 310.955L575.831 230.802L595.564 230.802L595.564 360.121L579.818 360.121L579.818 265.508L562.677 332.026Z" fill="#ffffff" />
                    <path d="M664.526 315.087L664.526 330.168L623.666 330.168L623.666 315.087L664.526 315.087ZM680.271 360.121L662.134 360.121L643.399 246.915L626.457 360.121L608.32 360.121L630.443 230.802L656.553 230.802L680.271 360.121Z" fill="#ffffff" />
                    <path d="M734.484 286.992L734.484 251.874C734.484 249.394 734.118 247.776 733.388 247.019C732.658 246.262 731.03 245.883 728.505 245.883L695.419 245.883L695.419 230.802L733.886 230.802C740.397 230.802 745.148 232.351 748.138 235.45C751.127 238.548 752.621 243.059 752.621 248.981L752.621 289.472C752.621 295.531 751.127 300.11 748.138 303.208C745.148 306.307 740.397 307.857 733.886 307.857L701.797 307.857L701.797 292.983L728.505 292.983C731.03 292.983 732.658 292.57 733.388 291.744C734.118 290.918 734.484 289.333 734.484 286.992ZM693.028 230.802L710.965 230.802L710.965 360.121L693.028 360.121L693.028 230.802ZM718.14 300.42L736.477 300.42L759 360.121L739.467 360.121L718.14 300.42Z" fill="#ffffff" />
                    <path d="M791.089 295.669L810.023 295.669L835.935 360.121L816.402 360.121L791.089 295.669ZM810.023 295.669L791.089 295.669L816.8 230.802L836.333 230.802L810.023 295.669ZM771.955 230.802L789.894 230.802L789.894 360.121L771.955 360.121L771.955 230.802Z" fill="#ffffff" />
                    <path d="M860.052 233.281L877.989 233.281L877.989 360.121L860.052 360.121L860.052 233.281ZM898.918 230.802L898.918 245.883L839.123 245.883L839.123 230.802L898.918 230.802Z" fill="#ffffff" />
                    <path d="M347.648 285.472L347.648 285.472C354.811 285.472 360.618 291.265 360.618 298.412L360.618 298.473C360.618 305.619 354.811 311.412 347.648 311.412L347.648 311.412C340.484 311.412 334.678 305.619 334.678 298.473L334.678 298.412C334.678 291.265 340.484 285.472 347.648 285.472Z" fill="#ffffff" />
                  </g>
                </svg>
              </Link>
              <p className="text-sm text-[var(--foreground-tertiary)] mb-6 max-w-[260px]">
                FusionMarkt, teknolojiyi estetikle buluşturan benzersiz ürünleriyle kullanıcılarına farklı bir alışveriş deneyimi sunar.
              </p>
              <div className="space-y-3">
                <a href="tel:+908508406160" className="flex items-center gap-3 text-sm text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors">
                  <Phone className="w-4 h-4" />
                  +90 850 840 6160
                </a>
                <a href="mailto:info@fusionmarkt.com" className="flex items-center gap-3 text-sm text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors">
                  <Mail className="w-4 h-4" />
                  info@fusionmarkt.com
                </a>
                <div className="flex items-center gap-3 text-sm text-[var(--foreground-tertiary)]">
                  <MapPin className="w-4 h-4" />
                  <span>Ankara, Türkiye</span>
                </div>
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key} className="min-w-[140px]">
                <h4 className="font-semibold mb-4 text-sm whitespace-nowrap">{section.title}</h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-sm text-[var(--foreground-tertiary)] hover:text-[var(--fusion-primary)] transition-colors block whitespace-nowrap">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Bottom Bar */}
        <div className="border-t border-[var(--glass-border)]">
          <div className="container px-6 py-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--foreground-muted)]">
                FusionMarkt © {new Date().getFullYear()}. Tüm Hakları Saklıdır.
              </p>
              <div className="flex items-center gap-3">
                {paymentMethods.map((method) => (
                  <div key={method} className="h-7 px-2 rounded bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center">
                    <span className="text-[10px] font-medium text-[var(--foreground-secondary)]">{method}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                  <Shield className="w-3.5 h-3.5 text-[var(--fusion-success)]" />
                  SSL
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                  <CreditCard className="w-3.5 h-3.5 text-[var(--fusion-primary)]" />
                  3D Secure
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE FOOTER - lg altı (<1024px) - Accordion Design
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Bölüm 1: Marka Kimliği */}
        <div className="py-8 px-4 text-center border-b border-[var(--glass-border)]">
          <Link href="/" className="inline-block mb-4">
            <svg width="160" height="32" viewBox="20 220 890 150" xmlns="http://www.w3.org/2000/svg">
              <g id="MAIN-LOGO">
                <path d="M389.574 274.948C388.319 278.012 387.068 280.622 385.693 283.165C385.3 283.892 384.545 284.426 385.122 283.815C371.257 272.447 358.15 260.623 343.897 250.365C333.004 242.526 320.509 237.084 306.435 237.094C293.475 237.105 286.449 244.313 286.914 257.173C286.986 259.164 287.081 261.282 287.793 263.101C290.844 270.906 289.198 277.361 282.496 282.374C272.264 266.957 270.774 236.288 291.356 227.88C300.932 223.969 310.881 224.317 320.466 226.957C348.969 234.806 371.002 252.206 389.574 274.948Z" fill="#dd0000" />
                <path d="M401.423 277.653C403.244 269.865 405.812 262.601 406.214 255.221C406.872 243.175 400.465 237.194 388.299 236.972C384.965 236.913 381.296 236.709 378.343 237.919C370.282 241.221 365.37 237.028 359.993 231.657C371.956 225.517 384.229 223.84 396.719 226.059C411.656 228.713 420.11 243.079 418.169 260.429C416.575 274.676 411.561 287.833 403.323 299.289C394.782 311.164 384.993 322.213 375.155 333.095C368.674 340.264 366.824 339.828 358.181 332.606C375.851 317.01 392.044 300.254 401.423 277.653Z" fill="#ffffff" />
                <path d="M355.138 358.545C337.818 349.987 323.19 338.681 310.213 325.211C302.39 317.09 302.413 316.932 309.438 307.316C317.202 314.864 324.609 322.777 332.768 329.835C345.91 341.202 360.562 350.181 377.819 354.19C399.273 359.174 410.968 348.288 405.197 327.344C402.858 318.854 406.83 314.688 411.462 308.661C417.445 321.774 420.427 334.491 416.623 347.956C413.61 358.615 402.83 366.038 391.305 366.745C378.549 367.526 366.923 363.951 355.138 358.545Z" fill="#ffcc00" />
                <path d="M300.575 354.733C305.577 354.657 310.113 354.89 314.465 354.108C324.928 352.226 324.893 352.034 333.802 360.343C319.344 366.487 305.097 370.221 290.307 363.369C278.372 357.841 273.225 344.33 275.772 329.038C278.508 312.614 285.597 298.085 295.49 284.996C302.185 276.136 309.901 267.997 317.554 259.901C325.032 251.994 325.886 252.162 335.051 258.709C328.204 265.839 321.078 272.789 314.493 280.212C301.146 295.257 290.316 311.718 287.217 332.093C285.482 343.508 289.953 351.257 300.575 354.733Z" fill="#ffffff" />
              </g>
              <g id="LANDMARK">
                <path d="M25.0822 234.364L42.9433 234.364L42.9433 363.74L25.0822 363.74L25.0822 234.364ZM71.2065 292.025L71.2065 306.698L35.0925 306.698L35.0925 292.025L71.2065 292.025ZM78.6643 234.364L78.6643 249.451L34.5037 249.451L34.5037 234.364L78.6643 234.364Z" fill="#ffffff" />
                <path d="M130.48 342.659L130.48 234.364L148.341 234.364L148.341 345.553C148.341 351.478 146.869 355.99 143.925 359.09C140.981 362.19 136.304 363.74 129.891 363.74L116.938 363.74L116.938 348.653L124.789 348.653C127.144 348.653 128.681 348.239 129.401 347.413C130.121 346.585 130.48 345.002 130.48 342.659ZM107.516 234.364L107.516 342.659C107.516 345.002 107.909 346.585 108.694 347.413C109.479 348.239 111.049 348.653 113.405 348.653L119.489 348.653L119.489 363.74L108.105 363.74C101.694 363.74 97.0157 362.19 94.0715 359.09C91.1286 355.99 89.6565 351.478 89.6565 345.553L89.6565 234.364L107.516 234.364Z" fill="#ffffff" />
                <path d="M203.494 342.659L203.494 311.038C203.494 308.558 203.133 306.94 202.413 306.182C201.694 305.425 200.157 305.045 197.801 305.045L183.277 305.045C176.997 305.045 172.45 303.461 169.637 300.292C166.823 297.123 165.416 292.577 165.416 286.652L165.416 252.551C165.416 246.626 166.888 242.114 169.833 239.014C172.777 235.914 177.389 234.364 183.67 234.364L202.905 234.364C209.316 234.364 213.961 235.914 216.84 239.014C219.718 242.114 221.158 246.626 221.158 252.551L221.158 271.565L203.297 271.565L203.297 255.444C203.297 252.965 202.937 251.346 202.218 250.587C201.498 249.83 199.895 249.451 197.41 249.451L189.166 249.451C186.81 249.451 185.24 249.83 184.455 250.587C183.67 251.346 183.277 252.965 183.277 255.444L183.277 284.172C183.277 286.514 183.67 288.098 184.455 288.925C185.24 289.752 186.81 290.165 189.166 290.165L203.494 290.165C209.774 290.165 214.354 291.715 217.232 294.815C220.111 297.915 221.551 302.427 221.551 308.352L221.551 345.553C221.551 351.478 220.079 355.99 217.135 359.09C214.19 362.19 209.578 363.74 203.297 363.74L184.062 363.74C177.782 363.74 173.17 362.19 170.226 359.09C167.281 355.99 165.809 351.478 165.809 345.553L165.809 326.539L183.67 326.539L183.67 342.659C183.67 345.002 184.062 346.585 184.848 347.413C185.633 348.239 187.203 348.653 189.558 348.653L197.801 348.653C200.157 348.653 201.694 348.239 202.413 347.413C203.133 346.585 203.494 345.002 203.494 342.659Z" fill="#ffffff" />
                <path d="M240.786 234.364L258.45 234.364L258.45 363.74L240.786 363.74L240.786 234.364Z" fill="#ffffff" />
                <path d="M476.175 230.802L492.718 230.802L492.718 360.121L474.581 360.121L448.271 266.954L448.271 360.121L431.728 360.121L431.728 230.802L450.663 230.802L476.175 321.491L476.175 230.802Z" fill="#ffffff" />
                <path d="M562.677 332.026L546.333 332.026L529.192 265.714L529.192 360.121L513.446 360.121L513.446 230.802L533.179 230.802L554.504 310.955L575.831 230.802L595.564 230.802L595.564 360.121L579.818 360.121L579.818 265.508L562.677 332.026Z" fill="#ffffff" />
                <path d="M664.526 315.087L664.526 330.168L623.666 330.168L623.666 315.087L664.526 315.087ZM680.271 360.121L662.134 360.121L643.399 246.915L626.457 360.121L608.32 360.121L630.443 230.802L656.553 230.802L680.271 360.121Z" fill="#ffffff" />
                <path d="M734.484 286.992L734.484 251.874C734.484 249.394 734.118 247.776 733.388 247.019C732.658 246.262 731.03 245.883 728.505 245.883L695.419 245.883L695.419 230.802L733.886 230.802C740.397 230.802 745.148 232.351 748.138 235.45C751.127 238.548 752.621 243.059 752.621 248.981L752.621 289.472C752.621 295.531 751.127 300.11 748.138 303.208C745.148 306.307 740.397 307.857 733.886 307.857L701.797 307.857L701.797 292.983L728.505 292.983C731.03 292.983 732.658 292.57 733.388 291.744C734.118 290.918 734.484 289.333 734.484 286.992ZM693.028 230.802L710.965 230.802L710.965 360.121L693.028 360.121L693.028 230.802ZM718.14 300.42L736.477 300.42L759 360.121L739.467 360.121L718.14 300.42Z" fill="#ffffff" />
                <path d="M791.089 295.669L810.023 295.669L835.935 360.121L816.402 360.121L791.089 295.669ZM810.023 295.669L791.089 295.669L816.8 230.802L836.333 230.802L810.023 295.669ZM771.955 230.802L789.894 230.802L789.894 360.121L771.955 360.121L771.955 230.802Z" fill="#ffffff" />
                <path d="M860.052 233.281L877.989 233.281L877.989 360.121L860.052 360.121L860.052 233.281ZM898.918 230.802L898.918 245.883L839.123 245.883L839.123 230.802L898.918 230.802Z" fill="#ffffff" />
                <path d="M347.648 285.472L347.648 285.472C354.811 285.472 360.618 291.265 360.618 298.412L360.618 298.473C360.618 305.619 354.811 311.412 347.648 311.412L347.648 311.412C340.484 311.412 334.678 305.619 334.678 298.473L334.678 298.412C334.678 291.265 340.484 285.472 347.648 285.472Z" fill="#ffffff" />
              </g>
            </svg>
          </Link>
          <p className="text-xs text-[var(--foreground-tertiary)] max-w-[280px] mx-auto leading-relaxed">
            FusionMarkt, teknolojiyi estetikle buluşturan benzersiz ürünleriyle kullanıcılarına farklı bir alışveriş deneyimi sunar.
          </p>
        </div>

        {/* Bölüm 2: Accordion Menü */}
        <div className="divide-y divide-[var(--glass-border)]">
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between px-4 py-4 text-left"
              >
                <span className="text-[15px] font-semibold text-white">{section.title}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-[var(--foreground-tertiary)] transition-transform duration-200 ${
                    openSection === key ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openSection === key ? 'max-h-[400px] pb-4' : 'max-h-0'
                }`}
              >
                <ul className="px-4 space-y-1">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="block py-2.5 text-[14px] text-[var(--foreground-tertiary)] hover:text-[var(--fusion-primary)] transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bölüm 3: İletişim ve Aksiyon */}
        <div className="py-6 px-4 border-t border-[var(--glass-border)] space-y-4">
          <a 
            href="tel:+908508406160" 
            className="flex items-center gap-4 py-3 px-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--fusion-primary)]/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-[var(--fusion-primary)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--foreground-tertiary)]">Bizi Arayın</p>
              <p className="text-sm font-medium text-white">+90 850 840 6160</p>
            </div>
          </a>
          
          <a 
            href="mailto:info@fusionmarkt.com" 
            className="flex items-center gap-4 py-3 px-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--fusion-primary)]/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[var(--fusion-primary)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--foreground-tertiary)]">E-posta Gönderin</p>
              <p className="text-sm font-medium text-white">info@fusionmarkt.com</p>
            </div>
          </a>
          
          <a 
            href="https://maps.google.com/?q=Ankara,Turkey" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 py-3 px-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--fusion-primary)]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[var(--fusion-primary)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--foreground-tertiary)]">Adresimiz</p>
              <p className="text-sm font-medium text-white">Ankara, Türkiye</p>
            </div>
          </a>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="py-5 px-4 border-t border-[var(--glass-border)] text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            {paymentMethods.map((method) => (
              <div key={method} className="h-6 px-2 rounded bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center">
                <span className="text-[9px] font-medium text-[var(--foreground-secondary)]">{method}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-[var(--foreground-muted)]">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-[var(--fusion-success)]" />
              SSL
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-[var(--fusion-primary)]" />
              3D Secure
            </div>
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            © {new Date().getFullYear()} FusionMarkt
          </p>
        </div>
      </div>
    </footer>
  );
}
