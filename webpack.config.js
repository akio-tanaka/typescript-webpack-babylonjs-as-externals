const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: path.resolve(appDirectory, "src/viewer.ts"),
  output: {
    clean: true,
    filename: "js/viewer.js",
    library: "viewer",
    libraryTarget: "var",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  devServer: {
    static: path.resolve(appDirectory, "dist"),
    compress: true,
    open: true,
    port: 8080,
    historyApiFallback: true,
    hot: true,
    devMiddleware: {
      publicPath: "/",
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.json",
          },
        },
      },
      {
        test: /\.(frag|vert|glsl)$/,
        exclude: "/node_modules/",
        use: ["raw-loader", "glslify-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      template: path.resolve(appDirectory, "public/index.html"),
    }),
    new CopyPlugin({
      patterns: [{ from: "public/assets", to: "assets" }],
    }),
  ],
  externals: {
    lodash: "_",
    "@babylonjs/core": "BABYLON",
    "@babylonjs/loaders": "BABYLONLOADERS",
    "@babylonjs/gui": "BABYLON.GUI",
  },
};
