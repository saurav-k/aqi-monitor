// next.config.js
import type { NextConfig } from 'next';
const withTM = require('next-transpile-modules')([
  'rc-util',
  'antd',
  'rc-pagination',
  'rc-picker',
  '@ant-design/icons',
  '@ant-design/icons-svg',
  'rc-input', // Add this package to be transpiled
]);

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

module.exports = withTM(nextConfig);
