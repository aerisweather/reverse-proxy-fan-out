const path = require('path');

const relEnvFile = process.REVERSE_PROXY_FAN_OUT_ENV_PATH || '.env';
const envFile = path.resolve(process.cwd(), relEnvFile);

require('dotenv')
  .config({
    path: envFile
  });

module.exports = process.env;