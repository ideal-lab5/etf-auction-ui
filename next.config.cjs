/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: false,
  assetPrefix: '.',
  experiments: { asyncWebAssembly: true },
  output: webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
}

module.exports = nextConfig
