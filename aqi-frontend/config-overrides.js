const { override, addWebpackModuleRule } = require("customize-cra");

module.exports = override(
  addWebpackModuleRule({
    test: /\.js$/,
    enforce: "pre",
    use: ["source-map-loader"],
    exclude: [
      // Exclude problematic modules
      /node_modules\/@eunchurn\/react-windrose-chart/,
    ],
  })
);
