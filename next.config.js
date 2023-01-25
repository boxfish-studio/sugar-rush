/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['arweave.net', 'www.arweave.net'],
    },
    compiler: {
        styledComponents: true,
    },
}

module.exports = nextConfig
