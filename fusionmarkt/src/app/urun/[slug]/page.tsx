import SingleProductView from "@/components/product/SingleProductView";

interface Props {
  params: { slug: string };
}

export default function ProductPage({ params }: Props) {
  return <SingleProductView slug={params.slug} />;
}

// Dinamik metadata için
export async function generateMetadata({ params }: Props) {
  // TODO: Ürün bilgisini çekip meta title/description oluşturabilirsiniz
  return {
    title: `Ürün Detayı | FusionMarkt`,
    description: "Ürün detay sayfası",
  };
}
