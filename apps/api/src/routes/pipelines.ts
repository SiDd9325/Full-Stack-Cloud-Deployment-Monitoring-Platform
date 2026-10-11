import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireProjectAccess, AuthenticatedRequest } from '../middleware/auth';
import { triggerPipelineRun } from '../services/pipelineEngine';

const router = Router();

const createPipelineSchema = z.object({
  name: z.string().min(2, 'Pipeline name required'),
  gitBranch: z.string().default('main'),
  provider: z.enum(['GITHUB_ACTIONS', 'JENKINS']).default('GITHUB_ACTIONS'),
  jenkinsJobName: z.string().optional(),
  workflowFile: z.string().optional().default('.github/workflows/ci-cd.yml'),
});

const triggerSchema = z.object({
  branch: z.string().optional(),
  commitSha: z.string().optional(),
  commitMessage: z.string().optional(),
});

router.use(authenticateToken);

// GET /api/v1/projects/:id/pipelines
router.get('/projects/:id/pipelines', requireProjectAccess, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pipelines = await prisma.pipeline.findMany({
      where: { projectId: req.params.id },
      include: {
        runs: {
          orderBy: { startedAt: 'desc' },
          take: 1,
          include: { stages: true, triggeredBy: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = pipelines.map((p) => ({
      ...p,
      lastRun: p.runs[0] || null,
    }));

    return res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/projects/:id/pipelines
router.post('/projects/:id/pipelines', requireProjectAccess, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = createPipelineSchema.parse(req.body);

    const pipeline = await prisma.pipeline.create({
      data: {
        projectId: req.params.id,
        ...data,
      },
    });

    return res.status(201).json({
      success: true,
      data: pipeline,
      message: 'Pipeline configured successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/pipelines/:id/runs (Trigger build)
router.post('/pipelines/:id/runs', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const body = triggerSchema.parse(req.body);

    const pipeline = await prisma.pipeline.findUnique({
      where: { id: req.params.id },
    });

    if (!pipeline) {
      return res.status(404).json({ success: false, error: 'Pipeline not found.' });
    }

    const run = await triggerPipelineRun(pipeline.id, req.user!.userId, body);

    await prisma.auditEvent.create({
      data: {
        userId: req.user!.userId,
        action: 'PIPELINE_TRIGGERED',
        details: `Triggered pipeline ${pipeline.name} (Run ID: ${run.id})`,
        ipAddress: req.ip,
      },
    });

    return res.status(201).json({
      success: true,
      data: run,
      message: `Build run triggered successfully on ${pipeline.provider}.`,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/pipelines/:id/runs
router.get('/pipelines/:id/runs', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [runs, total] = await Promise.all([
      prisma.pipelineRun.findMany({
        where: { pipelineId: req.params.id },
        skip,
        take: limitNum,
        orderBy: { startedAt: 'desc' },
        include: {
          stages: { orderBy: { order: 'asc' } },
          triggeredBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      }),
      prisma.pipelineRun.count({ where: { pipelineId: req.params.id } }),
    ]);

    return res.json({
      success: true,
      data: runs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/pipeline-runs/:runId
router.get('/pipeline-runs/:runId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const run = await prisma.pipelineRun.findUnique({
      where: { id: req.params.runId },
      include: {
        stages: { orderBy: { order: 'asc' } },
        pipeline: { include: { project: true } },
        triggeredBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    if (!run) {
      return res.status(404).json({ success: false, error: 'Pipeline run not found.' });
    }

    return res.json({ success: true, data: run });
  } catch (error) {
    next(error);
  }
});

export default router;
