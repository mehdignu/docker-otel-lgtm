const express = require('express');
const logger = require('./logger');
const { requestCounter, errorCounter, responseTimeHistogram } = require('./meter');
const tracer = require('./tracer');
const { trace, context, SpanStatusCode } = require('@opentelemetry/api');

const app = express();

// Middleware to track request count and response time
app.use((req, res, next) => {
  logger.info(`Received request for ${req.url}`);
  requestCounter.add(1, { method: req.method, route: req.path });

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    responseTimeHistogram.record(duration, { method: req.method, route: req.path, status_code: res.statusCode });
  });

  next();
});

// Simulate errors randomly
app.use((req, res, next) => {
  if (Math.random() < 0.5) {
    const errorMessage = 'Simulated server error';
    logger.error(errorMessage);

    errorCounter.add(1, { method: req.method, route: req.path });

    // Capture error in tracing
    const span = trace.getSpan(context.active());
    if (span) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage });
      span.recordException(new Error(errorMessage));
    }

    return res.status(500).send('Internal Server Error');
  }
  next();
});

// Define a simple route with tracing
app.get('/', (req, res) => {
  const span = tracer.startSpan('handle_root_request');

  setTimeout(() => {
    res.send('Hello, World!');
    span.end();
  }, 100);
});

// Express error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unexpected error: ${err.message}`);
  errorCounter.add(1, { method: req.method, route: req.path });

  const span = trace.getSpan(context.active());
  if (span) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
    span.recordException(err);
  }

  res.status(500).send('Internal Server Error');
});

// Start the server
app.listen(8081, () => {
  logger.info('Server is running on http://localhost:8081');
  console.log('Server is running on http://localhost:8081');
});
