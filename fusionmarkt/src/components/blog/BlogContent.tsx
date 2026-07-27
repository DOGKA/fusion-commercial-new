interface BlogContentProps {
  /** `prepareBlogContent` çıktısı — temizleme ve başlık çapaları sunucuda yapılır. */
  html: string;
}

export default function BlogContent({ html }: BlogContentProps) {
  if (!html) {
    return (
      <div className="blog-content">
        <p className="text-[var(--foreground-tertiary)] italic">
          Bu yazının içeriği henüz eklenmemiş.
        </p>
      </div>
    );
  }

  return (
    <div className="blog-content" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
