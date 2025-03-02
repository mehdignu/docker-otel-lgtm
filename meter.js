const { MeterProvider } = require('@opentelemetry/sdk-metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// Prometheus Exporter for metrics
const prometheusExporter = new PrometheusExporter({
  port: 9464,             // Port where metrics will be exposed
  endpoint: '/metrics',   // Endpoint for Prometheus to scrape
}, () => {
  console.log('Prometheus scrape endpoint: http://localhost:9464/metrics');
});

// Create a MeterProvider
const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'hello-world-app',
  }),
});

// Bind the PrometheusExporter as a MetricReader
meterProvider.addMetricReader(prometheusExporter);

// Create a meter instance
const meter = meterProvider.getMeter('hello-world-meter');

// Define metric counters
const requestCounter = meter.createCounter('http_requests', {
  description: 'Counts HTTP requests',
});

const errorCounter = meter.createCounter('http_errors_total', {
  description: 'Counts HTTP errors',
});

// Define a histogram to track response time
const responseTimeHistogram = meter.createHistogram('http_response_time', {
  description: 'Measures response time of requests',
});

module.exports = { meter, requestCounter, errorCounter, responseTimeHistogram };
