import TerserPlugin from "terser-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import path from "path";

export default function (webpackEnv) {
  const isEnvDevelopment = webpackEnv === "development";
  const isEnvProduction = webpackEnv === "production";
  const isEnvDevelopmentProfile =
    isEnvDevelopment && process.argv.includes("--profile");

  const shouldUseSourceMap = true;
  const imageInlineSizeLimit = parseInt(
    process.env.IMAGE_INLINE_SIZE_LIMIT || "10000"
  );

   // Get absolute paths
  const currentDir = __dirname;
  const projectRoot = path.resolve(currentDir, "../.."); // Goes up two levels from config dir
  const srcPath = path.resolve(projectRoot, "src");
  const outputPath = path.resolve(projectRoot, "dist"); // Define outputPath

  const webpackConfig = {
    mode: isEnvProduction ? "production" : "development",
    
    // Use shouldUseSourceMap variable here
    devtool: isEnvProduction 
      ? shouldUseSourceMap ? "source-map" : false
      : isEnvDevelopment ? "cheap-module-source-map" : false,

        output: {
      filename: isEnvProduction 
        ? "static/js/[name].[contenthash:8].js"
        : "static/js/[name].js",
      path: outputPath,
      publicPath: "/",
      clean: true,
    },

    entry: path.resolve(srcPath, "index.ts"),
    
    output: {
      filename: "static/js/[name].[contenthash:8].js",
      path: path.resolve(projectRoot, "dist"), // Absolute output path
      publicPath: "/",
      clean: true,
    },

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      alias: {
        'react-native$': 'react-native-web',
        // This is the key - maps @/ to your src folder
        '@': srcPath,
        // You can add more aliases for common folders
        '@/components': path.resolve(srcPath, "components"),
        '@/utils': path.resolve(srcPath, "utils"),
        '@/styles': path.resolve(srcPath, "styles"),
        '@/hooks': path.resolve(srcPath, "hooks"),
      }
    },

    externals: {
      "react-native": "react-native",
      // Add other externals if needed
    },

    module: {
      rules: [
        // TypeScript/JavaScript rule
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { 
                  targets: {
                    browsers: [
                      "last 2 versions",
                      "not ie < 11",
                      "not dead"
                    ]
                  },
                  useBuiltIns: "entry",
                  corejs: 3
                }],
                "@babel/preset-react",
                "@babel/preset-typescript",
              ],
              plugins: [
                isEnvDevelopment && "react-refresh/babel",
              ].filter(Boolean),
            },
          },
        },

        // Image assets rule
        {
          test: /\.(png|jpe?g|gif|bmp|webp|svg)$/i,
          type: "asset",
          parser: {
            dataUrlCondition: {
              maxSize: imageInlineSizeLimit,
            },
          },
          generator: {
            filename: "static/media/[name].[hash:8][ext]",
          },
        },

        // CSS rule (if needed)
        {
          test: /\.css$/i,
          use: [
            "style-loader",
            "css-loader",
          ],
        },

        // Fonts and other assets
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
          generator: {
            filename: "static/fonts/[name].[hash:8][ext]",
          },
        },
      ],
    },

    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
        }),
      ],
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 20,
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
      runtimeChunk: {
        name: "runtime",
      },
    },

    plugins: [
      // Remove duplicate plugins array and use proper plugin configuration
      isEnvDevelopmentProfile &&
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: "webpack-bundle-analyzer-report.html",
          openAnalyzer: false,
        }),
    ].filter(Boolean),

    // Development server configuration
    devServer: isEnvDevelopment ? {
      static: {
        directory: outputPath,
      },
      compress: true,
      port: 3000,
      hot: true,
      historyApiFallback: true,
    } : undefined,

    // Performance hints
    performance: {
      maxAssetSize: 512000,
      maxEntrypointSize: 512000,
      hints: isEnvProduction ? "warning" : false,
    },
  };

  return webpackConfig;
}