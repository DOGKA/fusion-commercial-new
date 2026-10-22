import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { blogCover } from "@/lib/blog/cover";
import "./HomeBlog.css";

export interface HomeBlogCard {
  slug: string;
  title: string;
  category: string | null;
  readingTime: number;
  featuredImage: string | null;
}

interface HomeBlogProps {
  recent: HomeBlogCard[];
  popular: HomeBlogCard[];
}

function HomeBlogRow({ label, cards }: { label: string; cards: HomeBlogCard[] }) {
  return (
    <div className="home-blog__row">
      <h3 className="home-blog__row-title">{label}</h3>
      {/* Dar ekranda liste yatay kayar. */}
      <ul className="home-blog__grid">
        {cards.map((card) => {
          const cover = blogCover(card.featuredImage);
          return (
            <li key={card.slug}>
              <Link href={`/blog/${card.slug}`} className="home-blog__card">
                <span className="home-blog__media">
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover.src}
                      srcSet={cover.srcSet}
                      sizes="(max-width: 900px) 80vw, 340px"
                      width={800}
                      height={450}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </span>
                <span className="home-blog__body">
                  {card.category && (
                    <span className="home-blog__category">{card.category}</span>
                  )}
                  <span className="home-blog__card-title">{card.title}</span>
                  <span className="home-blog__meta">
                    <Clock aria-hidden="true" />
                    {card.readingTime} dk okuma
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function HomeBlog({ recent, popular }: HomeBlogProps) {
  if (recent.length === 0) return null;

  return (
    <section className="home-blog" aria-labelledby="home-blog-title">
      <div className="home-blog__bg" aria-hidden="true" />
      <div className="container home-blog__inner">
        <div className="home-blog__header">
          <span className="text-eyebrow mb-3 block">Blogdan</span>
          <h2 id="home-blog-title" className="text-display mb-4">
            Doğru Güç Kaynağını <span className="home-blog__accent">Seçmek</span>
          </h2>
          <p className="text-lead max-w-2xl mx-auto">
            Doğru güç kaynağını seçmek ve verimli kullanmak için rehberler.
          </p>
        </div>

        <HomeBlogRow label="En Yeni" cards={recent} />
        {popular.length > 0 && <HomeBlogRow label="En Çok Okunan" cards={popular} />}

        <div className="home-blog__footer">
          <Link href="/blog" className="home-blog__all">
            Tüm yazılar
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
