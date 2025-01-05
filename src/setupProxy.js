const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/proxy/dutchie',
    createProxyMiddleware({
      target: 'https://dutchie.com',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/proxy/dutchie': '/kiosks/high-class-cannabis'
      },
      onProxyReq: function(proxyReq, req, res) {
        // Add required headers
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8');
        proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
        proxyReq.setHeader('Connection', 'keep-alive');
        proxyReq.setHeader('Upgrade-Insecure-Requests', '1');
        
        // Copy cookies from original request
        if (req.headers.cookie) {
          proxyReq.setHeader('Cookie', req.headers.cookie);
        }
      },
      onProxyRes: function(proxyRes, req, res) {
        // Copy cookies from the proxied response
        const cookies = proxyRes.headers['set-cookie'];
        if (cookies) {
          // Modify cookie path to work with proxy
          const modifiedCookies = cookies.map(cookie =>
            cookie.replace(/(Path=\/)/, '$1proxy/dutchie/')
          );
          proxyRes.headers['set-cookie'] = modifiedCookies;
        }

        // Remove security headers that prevent framing
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
        
        // Add CORS headers
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      },
      // Add cookie handling
      cookieDomainRewrite: {
        '*': '' // Rewrite all cookie domains to the current domain
      },
      cookiePathRewrite: {
        '*': '/' // Rewrite all cookie paths to root
      }
    })
  );

  // Similar setup for planetnugg
  app.use(
    '/proxy/planetnugg',
    createProxyMiddleware({
      target: 'https://accessories.planetnugg.com',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/proxy/planetnugg': ''
      },
      onProxyReq: function(proxyReq, req, res) {
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8');
        proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
        proxyReq.setHeader('Connection', 'keep-alive');
        proxyReq.setHeader('Upgrade-Insecure-Requests', '1');
        
        if (req.headers.cookie) {
          proxyReq.setHeader('Cookie', req.headers.cookie);
        }
      },
      onProxyRes: function(proxyRes, req, res) {
        const cookies = proxyRes.headers['set-cookie'];
        if (cookies) {
          const modifiedCookies = cookies.map(cookie =>
            cookie.replace(/(Path=\/)/, '$1proxy/planetnugg/')
          );
          proxyRes.headers['set-cookie'] = modifiedCookies;
        }

        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      },
      cookieDomainRewrite: {
        '*': ''
      },
      cookiePathRewrite: {
        '*': '/'
      }
    })
  );
};

