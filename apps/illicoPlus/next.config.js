//@ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  distDir: './../../dist/apps/illicoPlus',
  productionBrowserSourceMaps: true,
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  disablePerformanceMetrics: true, // Stops performance tracking
  transpilePackages: ['uuid'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'core-js': require.resolve('core-js'),
      'regenerator-runtime': require.resolve('regenerator-runtime'),
    };
    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
