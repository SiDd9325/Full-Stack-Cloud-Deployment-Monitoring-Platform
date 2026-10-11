import { Router } from 'express';
import authRoutes from './auth';
import projectRoutes from './projects';
import pipelineRoutes from './pipelines';
import deploymentRoutes from './deployments';
import logRoutes from './logs';
import monitoringRoutes from './monitoring';
import webhookRoutes from './webhooks';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/', pipelineRoutes);
router.use('/deployments', deploymentRoutes);
router.use('/logs', logRoutes);
router.use('/monitoring', monitoringRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
