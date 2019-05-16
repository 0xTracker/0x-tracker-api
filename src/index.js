const path = require('path');

process.env.NODE_CONFIG_DIR = path.join(__dirname, 'config');

// Load environment variables from .env in development and throw an
// error if any required variables are missing in production
require('dotenv-safe').config({
  example:
    process.env.NODE_ENV === 'production'
      ? '.env.prod.example'
      : '.env.example',
});

const config = require('config');

const { logError } = require('./util/error-logger');
const app = require('./app');

app
  .initialise()
  .then(() => {
    app.start(config.get('port'));
  })
  .catch(logError);
