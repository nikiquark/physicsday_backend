import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone вместо export: содержимое приходит из админки Django,
  // и правка текста не должна требовать пересборки сайта.
  output: "standalone",
};

export default nextConfig;
