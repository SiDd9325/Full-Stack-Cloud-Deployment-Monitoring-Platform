import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { AuthTokenPayload, UserRole } from '@devopshub/shared';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined;

    // Check HTTP-only cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.',
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token.',
    });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have permission to perform this operation.',
      });
    }

    next();
  };
}

export async function requireProjectAccess(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const projectId = req.params.id || req.params.projectId;

    if (!projectId) {
      return next();
    }

    // ADMIN has full access across all projects
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // DEVELOPER must be owner or project member
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    const isOwner = project.ownerId === req.user.userId;
    const isMember = project.members.some((m) => m.userId === req.user?.userId);

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You are not authorized to view or manage this project.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Authorization check failed.' });
  }
}
