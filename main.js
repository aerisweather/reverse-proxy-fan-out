const config = require('./lib/config');
const ReverseProxyFanOutServer = require('./lib/ReverseProxyFanOutServer');

ReverseProxyFanOutServer(config);