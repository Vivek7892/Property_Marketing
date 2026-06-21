const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      onError: (err, req, res) => {
        console.error('[Proxy Error]', err.message);
        res.status(502).json({ error: 'Backend unreachable' });
      },
    })
  );
};
