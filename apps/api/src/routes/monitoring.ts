import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { prometheusClient } from '../lib/metrics';
import { SystemMetricsOverview, HealthCheckResponse } from '@devopshub/shared';

const router = Router();
const startTime = Date.now();

// GET /api/v1/monitoring/overview
router.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalProjects,
      activeProjects,
      totalDeployments,
      successfulDeployments,
      failedDeployments,
      activePipelinesCount,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.deployment.count(),
      prisma.deployment.count({ where: { status: 'SUCCESS' } }),
      prisma.deployment.count({ where: { status: 'FAILED' } }),
      prisma.pipelineRun.count({ where: { status: 'RUNNING' } }),
    ]);

    const deploymentSuccessRate =
      totalDeployments > 0 ? Math.round((successfulDeployments / totalDeployments) * 100) : 100;

    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    const metrics: SystemMetricsOverview = {
      totalProjects,
      activeProjects,
      totalDeployments,
      successfulDeployments,
      failedDeployments,
      deploymentSuccessRate,
      avgDeploymentDurationMs: 14500,
      activePipelinesCount,
      systemUptimeSeconds: uptimeSeconds,
      requestRatePerMin: Math.floor(45 + Math.random() * 20),
      errorRatePercentage: totalDeployments > 0 ? Number(((failedDeployments / totalDeployments) * 100).toFixed(1)) : 0,
      avgLatencyMs: Math.floor(35 + Math.random() * 15),
      cpuUsagePercent: Math.floor(18 + Math.random() * 12),
      memoryUsagePercent: Math.floor(42 + Math.random() * 10),
      isDemoMode: true,
    };

    return res.json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/monitoring/health (Liveness / Readiness Probes)
router.get('/health', async (req: Request, res: Response) => {
  let dbStatus: 'up' | 'down' = 'up';
  let dbLatency = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
  } catch {
    dbStatus = 'down';
  }

  const health: HealthCheckResponse = {
    status: dbStatus === 'up' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: '1.0.0',
    services: {
      database: { status: dbStatus, latencyMs: dbLatency },
      prometheus: { status: 'up' },
      jenkins: { status: 'demo_mode' },
      github: { status: 'demo_mode' },
    },
  };

  const statusCode = dbStatus === 'up' ? 200 : 503;
  return res.status(statusCode).json(health);
});

// GET /metrics (Prometheus Scrape Endpoint)
router.get('/prometheus', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', prometheusClient.register.contentType);
    const metrics = await prometheusClient.register.metrics();
    return res.send(metrics);
  } catch (error) {
    return res.status(500).send('Error generating prometheus metrics');
  }
});

export default router;
