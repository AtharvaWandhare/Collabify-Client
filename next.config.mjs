/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://localhost:8000/api/:path*' // Proxy to backend
            }
        ];
    }
};

export default nextConfig;
