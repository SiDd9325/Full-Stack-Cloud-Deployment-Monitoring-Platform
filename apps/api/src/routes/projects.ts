import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireProjectAccess, AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '@devopshub/shared';

const router = Router();

const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name is required').regex(/^[a-zA-Z0-9_-]+$/, 'Project name must contain only alphanumeric, dash, or underscore'),
  description: z.string().default(''),
  repoUrl: z.string().url('Must be a valid repository URL'),
});

const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  repoUrl: z.string().url().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'DEGRADED', 'MAINTENANCE']).optional(),
});

const addMemberSchema = z.object({
  email: z.string().email('Valid email required'),
  role: z.enum(['ADMIN', 'DEVELOPER']).default('DEVELOPER'),
});

// All project routes require authentication
router.use(authenticateToken);

// GET /api/v1/projects
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Filter projects based on user role and membership
    const whereClause: any = {};

    if (req.user?.role !== 'ADMIN') {
      whereClause.OR = [
        { ownerId: req.user?.userId },
        { members: { some: { userId: req.user?.userId } } },
      ];
    }

    if (status) {
      whereClause.status = status as string;
    }

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: search as string } },
            { description: { contains: search as string } },
          ],
        },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: { select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true } },
          members: {
            include: {
              user: { select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true } },
            },
          },
          pipelines: { select: { id: true } },
          deployments: {
            orderBy: { startedAt: 'desc' },
            take: 1,
            select: { status: true, startedAt: true, environment: true, version: true },
          },
        },
      }),
      prisma.project.count({ where: whereClause }),
    ]);

    const formattedProjects = projects.map((p) => ({
      ...p,
      pipelinesCount: p.pipelines.length,
      deploymentsCount: p.deployments.length,
      lastDeploymentStatus: p.deployments[0]?.status || null,
      lastDeploymentAt: p.deployments[0]?.startedAt ? p.deployments[0].startedAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return res.json({
      success: true,
      data: formattedProjects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    } as ApiResponse<any>);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/projects
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, repoUrl } = createProjectSchema.parse(req.body);

    const existing = await prisma.project.findFirst({ where: { name } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'A project with this name already exists.' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        repoUrl,
        ownerId: req.user!.userId,
        status: 'ACTIVE',
        members: {
          create: [{ userId: req.user!.userId, role: req.user!.role }],
        },
      },
      include: {
        owner: { select: { id: true, email: true, name: true, role: true } },
      },
    });

    // Create default GitHub Actions pipeline for new project
    await prisma.pipeline.create({
      data: {
        projectId: project.id,
        name: 'Main CI/CD Pipeline',
        gitBranch: 'main',
        provider: 'GITHUB_ACTIONS',
        workflowFile: '.github/workflows/ci-cd.yml',
      },
    });

    // Create audit log
    await prisma.auditEvent.create({
      data: {
        userId: req.user!.userId,
        action: 'PROJECT_CREATED',
        details: `Created project ${project.name} (${project.id})`,
        ipAddress: req.ip,
      },
    });

    return res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/projects/:id
router.get('/:id', requireProjectAccess, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true } },
        members: {
          include: {
            user: { select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true } },
          },
        },
        pipelines: {
          include: {
            runs: {
              orderBy: { startedAt: 'desc' },
              take: 5,
              include: { stages: true, triggeredBy: { select: { id: true, name: true, email: true } } },
            },
          },
        },
        deployments: {
          orderBy: { startedAt: 'desc' },
          take: 5,
          include: { deployedBy: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    return res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/projects/:id
router.patch('/:id', requireProjectAccess, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updateData = updateProjectSchema.parse(req.body);

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return res.json({
      success: true,
      data: project,
      message: 'Project updated successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/projects/:id (Archives project)
router.delete('/:id', requireProjectAccess, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { status: 'ARCHIVED' },
    });

    await prisma.auditEvent.create({
      data: {
        userId: req.user!.userId,
        action: 'PROJECT_ARCHIVED',
        details: `Archived project ${project.name} (${project.id})`,
        ipAddress: req.ip,
      },
    });

    return res.json({
      success: true,
      data: project,
      message: 'Project archived successfully. Pipeline run & deployment history preserved.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/projects/:id/members
router.get('/:id/members', requireProjectAccess, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId: req.params.id },
      include: {
        user: { select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true } },
      },
    });

    return res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/projects/:id/members
router.post('/:id/members', requireProjectAccess, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email, role } = addMemberSchema.parse(req.body);

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User with this email not found.' });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: req.params.id,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ success: false, error: 'User is already a member of this project.' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: req.params.id,
        userId: targetUser.id,
        role,
      },
      include: {
        user: { select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true } },
      },
    });

    return res.status(201).json({
      success: true,
      data: member,
      message: 'Team member added successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/projects/:id/members/:userId
router.delete('/:id/members/:userId', requireProjectAccess, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.projectMember.deleteMany({
      where: {
        projectId: req.params.id,
        userId: req.params.userId,
      },
    });

    return res.json({
      success: true,
      message: 'Team member removed from project.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
