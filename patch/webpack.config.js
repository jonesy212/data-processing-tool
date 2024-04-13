import TerserPlugin from "terser-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

export default function (webpackEnv) {
  const isEnvDevelopment = webpackEnv === "development";
  const isEnvProduction = webpackEnv === "production";
  const isEnvDevelopmentProfile =
    isEnvDevelopment && process.argv.includes("--profile");

  const shouldUseSourceMap = true; // Utilize shouldUseSourceMap
  const imageInlineSizeLimit = parseInt(
    process.env.IMAGE_INLINE_SIZE_LIMIT || "10000"
  );

  const webpackConfig = {
    // Other Webpack configuration options...

    module: {
      rules: [
        // Other rules...
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { targets: "defaults" }],
                "@babel/preset-react",
                "@babel/preset-typescript", // Add TypeScript preset
              ],
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|bmp)$/i,
          loader: "file-loader",
          options: {
            name: "images/[name].[hash].[ext]",
            limit: imageInlineSizeLimit,
          },
        },
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // Don't type-check files during build for performance
            },
          },
          resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.d.ts'], 
          },
        }
        
      ],
    },

    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              comparisons: false,
            },
            output: {
              comments: false,
            },
            sourceMap: shouldUseSourceMap,
          },
        }),
      ],
      splitChunks: {
        chunks: "async",
        minSize: 20000,
        maxSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: "~",
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },

    plugins: [
      // Other plugins...
      isEnvDevelopmentProfile &&
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: "webpack-bundle-analyzer-report.html",
          openAnalyzer: false,
        }),
    ].filter(Boolean),
  };

  return webpackConfig;
};
