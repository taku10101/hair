/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // App Router (デフォルトで有効)
    appDir: true,
    // サーバーコンポーネントの最適化
    serverComponentsExternalPackages: ['three', '@tensorflow/tfjs'],
    // 並列ルートのサポート
    parallelRoutes: true,
  },
  // 画像最適化設定
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Webpack設定（Three.js対応）
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Three.jsのためのWebGL対応
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader', 'glslify-loader'],
    });

    // Web Workers対応
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: { 
        loader: 'worker-loader',
        options: { 
          filename: 'static/[hash].worker.js',
          publicPath: '/_next/'
        }
      },
    });

    // Node.js互換性（MediaPipe等）
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
  // 環境変数設定
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // TypeScript設定
  typescript: {
    // 型チェックエラーを無視（開発時のみ）
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  // ESLint設定
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  // 圧縮設定
  compress: true,
  // パフォーマンス最適化
  swcMinify: true,
  // Bundle analyzer設定
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, options) => {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')();
      config.plugins.push(new BundleAnalyzerPlugin());
      return config;
    },
  }),
};

module.exports = nextConfig;