import { defineConfig } from 'vite';
import yaml from '@rollup/plugin-yaml';

export default defineConfig({
  plugins: [yaml()],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'APIEngine',
      formats: ['es', 'cjs', 'iife'], // ✅ remove iife
      fileName: (format) => {
        if (format === 'es') return 'index.js';
        if (format === 'cjs') return 'index.cjs';
        return `api-engine.${format}.js`;
      }
    }
  }  
  // server: {
  //   port: 3000,
  //   open: true,
  //   proxy: {
  //     '/api-proxy': {
  //       target: 'https://www.prochat.dev',
  //       changeOrigin: true,
  //       secure: false,
  //       rewrite: (path) => path.replace(/^\/api-proxy/, ''),
  //       // This is the CRITICAL part for custom headers like Authorization
  //       configure: (proxy) => {
  //         proxy.on('proxyRes', (proxyRes, req, res) => {
  //           // Overwrite headers coming back from the server to trick the browser
  //           proxyRes.headers['access-control-allow-origin'] = '*';
  //           proxyRes.headers['access-control-allow-headers'] = '*';
  //           proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  //         });

  //         // Handle the Preflight (OPTIONS) request locally so it never hits the remote server
  //         proxy.on('proxyReq', (proxyReq, req, res) => {
  //           if (req.method === 'OPTIONS') {
  //             res.writeHead(200, {
  //               'Access-Control-Allow-Origin': '*',
  //               'Access-Control-Allow-Headers': '*',
  //               'Access-Control-Allow-Methods': '*',
  //             });
  //             res.end();
  //           }
  //         });
  //       }
  //     }
  //   }
  // }
});