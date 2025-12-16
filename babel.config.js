module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { chrome: "88" }, bugfixes: true }],
    ["@babel/preset-react", { runtime: "automatic" }]
  ],
  plugins: [
    ["@babel/plugin-transform-runtime", { helpers: true }]
  ]
};
