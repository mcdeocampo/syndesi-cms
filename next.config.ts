import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB. Media Library allows up to 10MB per image and
      // supports multi-file batches in one upload, so the request body
      // needs headroom for several images at once -- see
      // lib/actions/media.ts's MAX_SIZE_BYTES.
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
