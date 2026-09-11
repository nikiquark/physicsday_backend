import type { MetadataRoute } from "next";

const SITE_URL = process.env.SITE_URL ?? "https://physicsday.ru";

/** Раньше карту сайта генерировал next-sitemap на этапе сборки.
 *  При серверном рендере она отдаётся маршрутом, как обычная страница. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ["", "/masters", "/olympiads", "/excursions", "/contest"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }));
}
