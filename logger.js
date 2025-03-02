const winston = require('winston');
const LokiTransport = require('winston-loki');

// Define custom log levels supported by Winston
const customLevels = {
  levels: {
    error: 0,   // Critical errors
    warn: 1,    // Warnings
    info: 2,    // General application logs
    http: 3,    // HTTP requests
    verbose: 4, // Detailed logs
    debug: 5,   // Debugging information
    silly: 6    // Extremely detailed logs
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'grey'
  }
};

// Configure Winston to send logs to Loki with all levels
const logger = winston.createLogger({
  levels: customLevels.levels,  // Use custom log levels
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to logs
    winston.format.json()       // Use JSON format for structured logs
  ),
  transports: [
    new winston.transports.Console({  // Console transport for local debugging
      format: winston.format.combine(
        winston.format.colorize(),  // Colorize logs for readability
        winston.format.simple()
      )
    }),
    new LokiTransport({
      host: 'http://loki:3100', // Assuming Loki is accessible at this URL
      labels: { job: 'loki-service' },  // Custom labels
      json: true,  
      batching: true,
      interval: 5,  // Send logs in batches every 5 seconds
      level: 'silly',  // Send all log levels (lowest level)
    }),
  ],
});

// Apply colors to console logs
winston.addColors(customLevels.colors);

module.exports = logger;
