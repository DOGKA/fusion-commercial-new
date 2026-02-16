/**
 * FusionMarkt SEO Module
 * Tüm SEO araçlarının tek noktadan export edilmesi
 */

// Config
export { siteConfig, titleTemplates, categoryDescriptions, brandDescriptions } from "./config";

// Metadata Helpers
export {
  generateMetadata,
  generateProductMetadata,
  generateCategoryMetadata,
  generateBrandMetadata,
  generateBlogMetadata,
  staticPageMetadata,
  type ProductMetaParams,
  type CategoryMetaParams,
  type BrandMetaParams,
  type BlogMetaParams,
} from "./metadata";

// JSON-LD Schemas
export {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateWebPageSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateArticleSchema,
  generateLocalBusinessSchema,
  generateItemListSchema,
  generateHowToSchema,
  type ProductSchemaParams,
  type BreadcrumbItem,
  type FAQItem,
  type ArticleSchemaParams,
  type ItemListParams,
  type HowToStep,
  type HowToSchemaParams,
  type WebPageSchemaParams,
} from "./json-ld";

