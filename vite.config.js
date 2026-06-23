import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      proxy: {
        '/api/finnhub': {
          target: 'https://finnhub.io/api/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/finnhub/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const token = env.VITE_FINNHUB_API_KEY;
              if (token) {
                const sep = proxyReq.path.includes('?') ? '&' : '?';
                proxyReq.path += `${sep}token=${token}`;
              }
            });
          },
        },
      },
    },
  };
});
