const http = require('http');
const express = require('express');
const request = require('request');

const reverseProxyServer = http.createServer().listen(3000);
const appA = express();
const appB = express();

appA.listen(3001, () => console.log('targetA listening'));
appB.listen(3002, () => console.log('targetB listening'));

appA.post('/', (req, res) => {
  req
    .on('data', data => {
      console.log(`targetA got "${data}"`);
      res.end(`targetA got "${data}"`)
    });
});
appB.post('/', (req, res) => {
  req
    .on('data', data => {
      console.log(`targetB got "${data}"`);
      res.end(`targetB got "${data}"`);
    });
});

reverseProxyServer.on('request', (req, res) => {
  req.pipe(request('http://localhost:3001')).pipe(res);
  req.pipe(request('http://localhost:3002'));
})
  .on('error', console.error);