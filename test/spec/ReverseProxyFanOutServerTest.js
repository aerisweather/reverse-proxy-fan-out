const assert = require('assert');
const supertest = require('supertest');
const co = require('co');
const http = require('http');

describe('ReverseProxyFanOutServer', () => {

  // Self-cleaning wrapper around RPFOServer
  var __rpfoServer;
  function ReverseProxyFanOutServer(config) {
     return __rpfoServer = require('../../lib/ReverseProxyFanOutServer')(config);
  }
  afterEach(() => {
    if (__rpfoServer) {
      __rpfoServer.close();
    }
  });

  it('should send requests to each backend server, and response via backendResponder', () => co(function*() {
    // Create 3 backend servers
    const [serverA, serverB, serverC] = yield ['A', 'B', 'C']
      .map(n => createServer((req, res) => {
        // Check that request matches client request
        assert.strictEqual(req.url, '/posted/path');
        assert.strictEqual(req.method, 'POST');
        assert.strictEqual(req.body, 'client request');
        assert.strictEqual(req.headers['x-request-header'], 'reqHeaderVal');
        //setTimeout(() => {
          res.end(`backend${n} response`)
        //}, 100);
      }));

    const backends = [serverA, serverB, serverC]
      .map(serv => `http://localhost:${serv.address().port}`);

    // Make serverB the responder
    const backendResponder = backends[1];

    const proxyServer = ReverseProxyFanOutServer({
      port: 0,
      backends,
      backendResponder
    });

    const proxyRes = yield cb => supertest(proxyServer)
      .post('/posted/path')
      .send('client request')
      .set('x-request-header', 'reqHeaderVal')
      .end(cb);

    assert.strictEqual(proxyRes.res.text, 'backendB response', 'should get response from responder');
  }));

});

function createServer(reqHandler) {
  return new Promise((resolve, reject) => {
    const server = http.createServer().listen(0, (err) => {
      if (err) { return reject(err); }

      server.on('request', (req, res) => {
        readMessage(req)
          .then(body => reqHandler(Object.assign(req, { body }), res))
          .catch(err => {
            setImmediate(() => { throw err; });
          })
      });

      resolve(server);
    })
      .on('error', reject);
  });
}

function readMessage(msg) {
  return new Promise((resolve, reject) => {
    var data = [];

    msg
      .on('data', d => data.push(d))
      .on('error', reject)
      .on('end', () => resolve(
        data
          .map(d => d.toString('utf8'))
          .join('')
      ));
  });
}