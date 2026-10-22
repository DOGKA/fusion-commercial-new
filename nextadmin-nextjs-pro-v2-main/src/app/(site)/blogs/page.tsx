import BlogListe from "@/components/Blog/BlogListe";

export const metadata = {
  title: "Blog Yazıları",
};

export default function BlogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Blog Yazıları</h1>
        <p className="text-gray-500">Yazıları oluşturun, düzenleyin, kapak görseli üretin ve yayına alın.</p>
      </div>
      <BlogListe />
    </div>
  );
}
