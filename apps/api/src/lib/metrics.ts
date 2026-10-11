import client from 'prom-client';

// Collect default metrics (CPU, memory, garbage collection, event loop lag)
client.collectDefaultMetrics({ prefix: 'devopshub_' });

export const httpRequestCounter = new client.Counter({
  name: 'devopshub_http_requests_total',
  help: 'Total number of HTTP requests processed by DevOpsHub API',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDurationHistogram = new client.Histogram({
  name: 'devopshub_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2.5, 5, 10],
});

export const deploymentsCounter = new client.Counter({
  name: 'devopshub_deployments_total',
  help: 'Total deployments triggered',
  labelNames: ['environment', 'status'],
});

export const pipelineRunCounter = new client.Counter({
  name: 'devopshub_pipeline_runs_total',
  help: 'Total pipeline runs executed',
  labelNames: ['provider', 'status'],
});

export const activeBuildsGauge = new client.Gauge({
  name: 'devopshub_active_builds',
  help: 'Number of currently active pipeline builds',
});

export { client as prometheusClient };
