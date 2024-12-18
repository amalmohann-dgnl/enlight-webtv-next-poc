const { merge } = require('webpack-merge');
const { withNx } = require('@nrwl/webpack');
const path = require('path');

module.exports = (config, context) => {
  const isProduction = context.configurationName === 'production';
  return merge(withNx(config), {
    mode: isProduction ? 'production' : 'development',
    entry: path.resolve(__dirname, 'src/index.ts'), // Explicitly define the entry point
    output: {
      libraryTarget: 'module', // Use ES6 module format
      filename: 'libs/services.mjs', // Output filename with .mjs extension
      chunkFormat: 'module', // Ensure chunks are in ES module format
    },
    experiments: {
      outputModule: true, // Enable output as ES modules
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
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    externals: {
      react: 'react',
      'react-dom': 'react-dom',
    },
  });
};
