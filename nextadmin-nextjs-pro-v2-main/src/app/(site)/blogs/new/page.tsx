import Link from "next/link";
import BlogEditor from "@/components/Blog/BlogEditor";

export const metadata = {
  title: "Yeni Blog Yazısı",
};

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/blogs" className="text-sm text-gray-500 hover:text-primary">
          ← Blog
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-dark dark:text-white">Yeni yazı</h1>
      </div>
      <BlogEditor />
    </div>
  );
}
