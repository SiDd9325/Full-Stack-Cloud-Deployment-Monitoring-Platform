import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// GET /api/v1/logs
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const {
      projectId,
      deploymentId,
      service,
      level,
      search,
      startTime,
      endTime,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};

    if (projectId) whereClause.projectId = projectId as string;
    if (deploymentId) whereClause.deploymentId = deploymentId as string;
    if (service) whereClause.service = service as string;
    if (level) whereClause.level = level as string;

    if (search) {
      whereClause.message = { contains: search as string };
    }

    if (startTime || endTime) {
      whereClause.timestamp = {};
      if (startTime) whereClause.timestamp.gte = new Date(startTime as string);
      if (endTime) whereClause.timestamp.lte = new Date(endTime as string);
    }

    const [logs, total] = await Promise.all([
      prisma.applicationLog.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { timestamp: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          deployment: { select: { id: true, environment: true, version: true } },
        },
      }),
      prisma.applicationLog.count({ where: whereClause }),
    ]);

    const formatted = logs.map((log) => ({
      ...log,
      projectName: log.project ? log.project.name : 'system-service',
      timestamp: log.timestamp.toISOString(),
    }));

    return res.json({
      success: true,
      data: formatted,
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

// GET /api/v1/logs/:id
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const log = await prisma.applicationLog.findUnique({
      where: { id: req.params.id },
      include: {
        project: true,
        deployment: true,
      },
    });

    if (!log) {
      return res.status(404).json({ success: false, error: 'Log entry not found.' });
    }

    return res.json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
});

export default router;
