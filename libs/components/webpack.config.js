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
      filename: 'libs/components.mjs', // Output filename with .mjs extension
      chunkFormat: 'module', // Ensure chunks are in ES module format
    },
    experiments: {
      outputModule: true, // Enable output as ES modules
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.scss', '.css'], // Added .scss and .css
    },
    externals: {
      react: 'react',
      'react-dom': 'react-dom',
    },
    module: {
      rules: [
        // Babel loader for TypeScript and JavaScript files
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env', // Transforms ES6+ syntax
                '@babel/preset-react', // Transforms JSX
                '@babel/preset-typescript', // Supports TypeScript
              ],
            },
          },
        },
        // SCSS loader with CSS Modules support
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true, // Enable CSS Modules for files ending with .module.scss
                  localIdentName: '[name]__[local]___[hash:base64:5]', // Customize class naming
                },
              },
            },
            'sass-loader',
          ],
        },
        // CSS loader for global CSS
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
  });
};
