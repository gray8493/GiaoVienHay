/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@giaovienhay/shared-types'],

  // Tối ưu hình ảnh: ưu tiên AVIF (nhỏ hơn WebP 20%), fallback WebP
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Tối ưu production bundle
  compiler: {
    // Xóa console.log/warn trong production → giảm bundle size
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  // Bảo mật: ẩn header X-Powered-By
  poweredByHeader: false,

  // Tối ưu headers cho static assets
  async headers() {
    return [
      {
        // Aggressive cache cho static assets (font, images, js/css bundles)
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff|woff2|ttf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
