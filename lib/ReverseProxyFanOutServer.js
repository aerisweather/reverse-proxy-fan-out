const http = require('http');
const request = require('request');

function ReverseProxyFanOutServer({
  backends,
  backendResponder,
  port
}) {
  const reverseProxyServer = http
    .createServer()
    .listen(port, () => {
      console.log(`Reverse proxy server listening on ${reverseProxyServer.address().port}`);
    });

  if (!backendResponder) {
    throw new Error(`Backend responder must be configured`);
  }
  if (!backends.includes(backendResponder)) {
    throw new Error(`Backend reponder ${backendResponder} is not configured as a backend`);
  }

  reverseProxyServer
    .on('request', handleRequest)
    .on('error', err => {
      logError(err.stack);
      process.exit(1);
    });

  function handleRequest(req, res) {
    backends.forEach(be => {
      const beReq = request(be + req.url)
        .on('error', logError);
      const beRes = req.pipe(beReq)
        .on('error', logError);

      if (be === backendResponder) {
        beRes
          .pipe(res)
          .on('error', logError);
      }
    });
  }

  return reverseProxyServer
}

function logError(err) {
  console.error(err.stack);
}

module.exports = ReverseProxyFanOutServer;