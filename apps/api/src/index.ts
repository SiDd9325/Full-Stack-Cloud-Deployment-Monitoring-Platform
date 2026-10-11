import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { logger } from './lib/logger';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { metricsMiddleware } from './middleware/metricsMiddleware';
import { apiRateLimiter } from './middleware/rateLimiter';
import { prometheusClient } from './lib/metrics';

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for local dev flexibility
  })
);

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Hub-Signature-256'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Observability metrics tracking middleware
app.use(metricsMiddleware);

// Rate limiter for API
app.use('/api', apiRateLimiter);

// Prometheus metrics scrape endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', prometheusClient.register.contentType);
    const metrics = await prometheusClient.register.metrics();
    return res.send(metrics);
  } catch (err) {
    return res.status(500).send('Error collecting metrics');
  }
});

// API Routes (versioned under /api/v1)
app.use('/api/v1', apiRoutes);

// Root health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'devopshub-api', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  logger.info(`🚀 DevOpsHub API Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  logger.info(`📊 Prometheus metrics available at http://localhost:${PORT}/metrics`);
});

export default app;
