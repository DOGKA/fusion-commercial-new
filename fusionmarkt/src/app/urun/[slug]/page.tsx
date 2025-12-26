import SingleProductView from "@/components/product/SingleProductView";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <SingleProductView slug={slug} />;
}

// Dinamik metadata için
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  // TODO: Ürün bilgisini çekip meta title/description oluşturabilirsiniz
  return {
    title: `Ürün Detayı | FusionMarkt`,
    description: "Ürün detay sayfası",
  };
}
