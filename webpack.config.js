const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? false : "cheap-source-map",

  entry: {
    popup: "./src/popup/index.js",
    content: "./src/content/content.js",
    background: "./src/background/background.js"
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { targets: { chrome: "88" }, bugfixes: true }],
              ["@babel/preset-react", { runtime: "automatic" }]
            ]
          }
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[name][ext]"
        }
      }
    ]
  },

  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      react: path.resolve(__dirname, 'node_modules/react')
    }
  },

  plugins: [
    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: "./src/popup/popup.html",
      filename: "popup.html",
      chunks: ["popup"],
      inject: "body"
    }),

    new CopyWebpackPlugin({
      patterns: [
        { from: "manifest.json", to: "." },
        { from: "src/assets/icons", to: "icons", noErrorOnMissing: true },
      ]
    })
  ],

  optimization: {
    minimize: isProduction
  }
};