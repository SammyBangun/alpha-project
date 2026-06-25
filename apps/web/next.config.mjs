/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the workspace TS packages we import from source.
  transpilePackages: ["@alpha/core", "@alpha/ui"],
};

export default nextConfig;
