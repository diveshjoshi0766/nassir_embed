// server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static('public'));

// Configure proxy with additional headers and options
const dutchieProxy = createProxyMiddleware({
    target: 'https://dutchie.com',
    changeOrigin: true,
    followRedirects: true,
    secure: true,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        'Cache-Control': 'max-age=0'
    },
    cookieDomainRewrite: {
        '*': ''
    },
    onProxyRes: function (proxyRes, req, res) {
      if (proxyRes.headers['set-cookie']) {
          const cookies = proxyRes.headers['set-cookie'].map(cookie =>
              cookie.replace(/Domain=[^;]+;/, '')
          );
          proxyRes.headers['set-cookie'] = cookies;
      }
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      delete proxyRes.headers['x-frame-options']; // Remove X-Frame-Options
      delete proxyRes.headers['content-security-policy']; // Remove CSP
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error');
    }
});

const planetnuggProxy = createProxyMiddleware({
  target: 'https://accessories.planetnugg.com',
  changeOrigin: true,
  followRedirects: true,
  secure: true,
  headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
  },
  cookieDomainRewrite: {
      '*': ''
  },
  onProxyRes: function (proxyRes, req, res) {
    if (proxyRes.headers['set-cookie']) {
        const cookies = proxyRes.headers['set-cookie'].map(cookie =>
            cookie.replace(/Domain=[^;]+;/, '')
        );
        proxyRes.headers['set-cookie'] = cookies;
    }

    // Remove security headers that block embedding in an iframe
    delete proxyRes.headers['x-frame-options'];
    if (proxyRes.headers['content-security-policy']) {
        proxyRes.headers['content-security-policy'] = proxyRes.headers['content-security-policy']
            .replace(/frame-ancestors [^;]+;/, ''); // Remove 'frame-ancestors' directive
    }

    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
}

});
app.use('/shopify', planetnuggProxy);


// Session middleware
app.use(require('express-session')({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Apply proxy middleware
app.use('/dutchie', dutchieProxy);
app.use('/planetnugg', planetnuggProxy);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});