const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 5000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Proxy middleware for Dutchie
app.use('/dutchie', createProxyMiddleware({
  target: 'https://dutchie.com',
  changeOrigin: true,
  followRedirects: true,
  secure: true,
  cookieDomainRewrite: {
      '*': '' // Rewrite cookies for localhost
  },
  onProxyRes: function (proxyRes) {
      if (proxyRes.headers['set-cookie']) {
          proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie =>
              cookie.replace(/Domain=[^;]+;/, '')
          );
      }
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
  }
}));
// Proxy middleware for PlanetNugg
app.use('/planetnugg', createProxyMiddleware({
    target: 'https://accessories.planetnugg.com',
    changeOrigin: true,
    followRedirects: true,
    secure: true,
    onProxyRes: function (proxyRes) {
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
    }
}));

// Fallback to index.html for other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
