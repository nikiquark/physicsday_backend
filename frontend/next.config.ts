import type { NextConfig } from "next";

// Адрес Django внутри docker-сети, без хвоста /api.
const backendOrigin = (
  process.env.API_URL_INTERNAL ?? "http://backend:8000/api"
).replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  // standalone вместо export: содержимое приходит из админки Django,
  // и правка текста не должна требовать пересборки сайта.
  output: "standalone",

  async rewrites() {
    // Картинки и статика админки отдаются с того же домена, что и сайт,
    // поэтому в API они приходят относительными путями (/media/...).
    //
    // На проде эти пути обычно перехватывает nginx и читает файлы
    // с диска — тогда сюда запросы вообще не доходят. Правила ниже
    // нужны для разработки и как страховка, если в nginx блоков
    // /media/ и /static/ нет: без них картинки уходили бы в Next
    // и возвращали 404.
    return [
      { source: "/media/:path*", destination: `${backendOrigin}/media/:path*` },
      { source: "/static/:path*", destination: `${backendOrigin}/static/:path*` },
    ];
  },
};

export default nextConfig;
