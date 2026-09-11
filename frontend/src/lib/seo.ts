import type { Metadata } from "next";

import { getSiteContent, type PageSeo } from "./content";

const SITE_URL = process.env.SITE_URL ?? "https://physicsday.ru";

const PATHS: Record<string, string> = {
  home: "/",
  masters: "/masters",
  workshops: "/masters",
  olympiads: "/olympiads",
  excursions: "/excursions",
  contest: "/contest",
};

/**
 * Собирает метаданные страницы из админки.
 *
 * Раньше «ФизФест 2025» был прописан в четырёх файлах и каждый год
 * правился руками; теперь заголовки и описания живут в разделе
 * «SEO страниц». Если бэкенд молчит, берутся значения из аргумента.
 */
export async function buildMetadata(
  slug: string,
  fallback: { title: string; description: string },
): Promise<Metadata> {
  const content = await getSiteContent();
  const seo: PageSeo | undefined = content.seo?.[slug];

  const title = seo?.title || fallback.title;
  const description = seo?.description || fallback.description;
  const path = PATHS[slug] ?? "/";

  return {
    title,
    description,
    keywords: seo?.keywords ? seo.keywords.split(",").map((k) => k.trim()) : undefined,
    openGraph: {
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      url: `${SITE_URL}${path}`,
      siteName: "ФизФест НГУ",
      locale: "ru_RU",
      type: "website",
    },
    alternates: { canonical: `${SITE_URL}${path}` },
  };
}
