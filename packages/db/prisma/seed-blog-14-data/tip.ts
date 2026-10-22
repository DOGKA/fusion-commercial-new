export interface BlogInput {
  slug: string;
  title: string;
  excerpt: string;
  category: "Enerji" | "Solar" | "Teknik" | "Rehber" | "Karşılaştırma" | "Karavan";
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  content: string;
}
