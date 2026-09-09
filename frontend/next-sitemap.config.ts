// next-sitemap.config.ts
import type { IConfig } from 'next-sitemap';

const config: IConfig = {
  siteUrl: 'https://physicsday.ru',
  outDir: 'out',
  generateRobotsTxt: true, 
  sitemapSize: 7000, 
  exclude: ['/api'], // Исключённые пути
  changefreq: 'daily',
  priority: 0.7,
  transform: async (config, path) => {
    return {
      loc: path, 
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(), 
    };
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api'],
        
      },
    ],
    additionalSitemaps: [
      'https://physicsday.ru/sitemap.xml',
    ],
  },
};

export default config;