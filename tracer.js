const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { trace } = require('@opentelemetry/api');
const dotenv = require("dotenv");

dotenv.config();

// Create an OTLP Trace Exporter
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT, // Ensure this is correctly set
});

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

// Start the SDK
sdk.start();

// Get the tracer instance
const tracer = trace.getTracer('hello-world-app');

// Export the tracer instance
module.exports = tracer;
