/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Suppress warnings for React Native dependencies (not needed for web)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'react-native': false,
        'pino-pretty': false,
        'lokijs': false,
        'encoding': false,
      };
    }
    
    // Ignore specific warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
      { module: /node_modules\/pino/ },
      { module: /node_modules\/@walletconnect/ },
      { message: /Can't resolve '@react-native-async-storage\/async-storage'/ },
      { message: /Can't resolve 'pino-pretty'/ },
      { message: /Can't resolve 'lokijs'/ },
      { message: /Can't resolve 'encoding'/ },
    ];
    
    return config;
  },
  
  // Suppress external package warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
