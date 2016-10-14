const env = require('./env');

const config = {
  // Hostnames of backends, where requests will be sent
  backends: requireAppEnv('BACKENDS').split(','),
  // Hostname of the backend which will be responsible
  // for responding to requests.
  // Defaults to the first backend
  backendResponser: getAppEnv('BACKEND_RESPONSER'),
  port: parseInt(getAppEnv('PORT') || 80)
};

config.backendResponser || (config.backendResponser = config.backends[0]);

const appKeyPrefix = `REVERSE_PROXY_FAN_OUT`;
function getAppEnv(key) {
  const appKey = `${appKeyPrefix}_${key}`;
  return env[appKey];
}

function requireAppEnv(key) {
  const val = getAppEnv(key);
  
  if (val === undefined) {
    throw new Error(`Missing env: ${appKeyPrefix}_${key}`);
  }
  
  return val;
}

module.exports = config;
