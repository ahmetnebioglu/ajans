import { z } from "zod";

export const HeroSectionSchema = z.object({
  title: z.string().default(""),
  subtitle: z.string().default(""),
  image: z.string().default(""),
  ctaText: z.string().default(""),
  ctaLink: z.string().default(""),
});

export const ContentSectionSchema = z.object({
  title: z.string().default(""),
  body: z.string().default(""),
  image: z.string().default(""),
});

export const FeaturesSectionSchema = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
  items: z.array(z.object({
    icon: z.string().default(""),
    title: z.string().default(""),
    description: z.string().default(""),
  })).default([]),
});

export const BlogFeedSectionSchema = z.object({
  title: z.string().default(""),
  category: z.string().default(""),
  limit: z.number().default(3),
});

export const SectionSchemas = {
  SLIDER: HeroSectionSchema,
  HERO: HeroSectionSchema,
  CONTENT: ContentSectionSchema,
  FEATURES: FeaturesSectionSchema,
  BLOG_FEED: BlogFeedSectionSchema,
};

export type SectionType = keyof typeof SectionSchemas;

export function parseSectionContent(type: string, content: any) {
  const schema = SectionSchemas[type as SectionType];
  if (!schema) return content;
  
  // Eğer content null veya undefined ise default değerleri dön
  if (!content) return schema.parse({});
  
  // Mevcut veriyi şemaya göre parse et (eksik alanları default ile doldurur)
  try {
    return schema.parse(content);
  } catch (e) {
    // Eğer parse edilemezse (yanlış tip vb) güvenli bir şekilde default dön
    return schema.parse({});
  }
}
