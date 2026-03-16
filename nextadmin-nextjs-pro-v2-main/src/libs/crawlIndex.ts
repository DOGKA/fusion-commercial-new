/**
 * Algolia indexleme devre dışı bırakıldı.
 * Eğer Algolia kullanmak isterseniz:
 * 1. .env dosyasına NEXT_PUBLIC_ALGOLIA_PROJECT_ID, NEXT_PUBLIC_ALGOLIA_API_KEY, NEXT_PUBLIC_ALGOLIA_INDEX ekleyin
 * 2. Bu dosyayı tekrar aktifleştirin
 */

export const structuredAlgoliaHtmlData = async ({
  pageUrl = "",
  htmlString = "",
  title = "",
  type = "",
  imageURL = "",
}: {
  pageUrl?: string;
  htmlString?: string;
  title?: string;
  type?: string;
  imageURL?: string;
}) => {
  // Algolia devre dışı - sadece log at
  if (process.env.NODE_ENV === "development") {
    console.log("[Algolia Disabled] Would index:", { pageUrl, title, type });
  }
  
  return {
    objectID: pageUrl,
    title: title,
    url: pageUrl,
    content: htmlString?.slice(0, 100) || "",
    type: type,
    imageURL: imageURL,
    updatedAt: new Date().toISOString(),
  };
};
