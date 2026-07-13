/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proposal pitch HTML is rendered in a sandboxed iframe via srcdoc — no
  // remote images are proxied through Next image optimization.
  images: { unoptimized: true },
};

module.exports = nextConfig;
