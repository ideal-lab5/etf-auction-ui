/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: false,
  assetPrefix: '.',
  experiments: { syncWebAssembly: true },
  output: webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
}

module.exports = nextConfig
