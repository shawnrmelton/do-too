// backend/src/middleware/requestLogger.js
const morgan = require('morgan');

// Custom token for response time in a more readable format
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom format for development
const devFormat = ':method :url :status :response-time-ms - :res[content-length]';

// Custom format for production
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms';

const requestLogger = process.env.NODE_ENV === 'production' 
  ? morgan(prodFormat)
  : morgan(devFormat);

module.exports = requestLogger;
