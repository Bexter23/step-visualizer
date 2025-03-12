/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.experiments = {
            asyncWebAssembly: true,
            layers: true,
        };

        // Configure WASM loading
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'asset/resource',
            generator: {
                filename: 'static/wasm/[name][ext]'
            }
        });

        return config;
    },
    // Add WASM MIME type
    async headers() {
        return [
            {
                source: '/static/wasm/:path*',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/wasm'
                    }
                ]
            }
        ];
    }
};

export default nextConfig; 