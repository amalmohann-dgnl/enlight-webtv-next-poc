const { merge } = require('webpack-merge');
const { withNx } = require('@nrwl/webpack');
const path = require('path');

module.exports = (config, context) => {
  const isProduction = context.configurationName === 'production';

  const nxConfig = withNx(config);

  return merge(nxConfig, {
    mode: isProduction ? 'production' : 'development',
    entry: path.resolve(__dirname, 'src/index.ts'),
    output: {
      libraryTarget: 'module',
      filename: 'libs/network.mjs',
      chunkFormat: 'module',
    },
    experiments: {
      outputModule: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      alias: {
        '@enlight-webtv/network-requestor': path.resolve(__dirname, '../../libs/network/src/index.ts'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx'],

    },
    externals: {
      react: 'react',
      'react-dom': 'react-dom',
    },
    target: 'web'
  });
};
