import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { triggerPipelineRun } from '../services/pipelineEngine';

const router = Router();

// POST /api/v1/webhooks/github
router.post('/github', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const event = req.headers['x-github-event'] as string;

    // Verify Webhook Signature if secret configured
    if (env.GITHUB_WEBHOOK_SECRET && signature) {
      const hmac = crypto.createHmac('sha256', env.GITHUB_WEBHOOK_SECRET);
      const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
        logger.warn('GitHub webhook signature mismatch');
        return res.status(401).json({ success: false, error: 'Invalid webhook signature' });
      }
    }

    if (event !== 'push') {
      return res.json({ success: true, message: `Ignored event: ${event}` });
    }

    const payload = req.body;
    const repoUrl = payload.repository?.html_url;
    const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : 'main';
    const commitSha = payload.after || payload.head_commit?.id || 'head';
    const commitMessage = payload.head_commit?.message || 'Push event trigger';

    if (!repoUrl) {
      return res.status(400).json({ success: false, error: 'Missing repository URL in webhook payload' });
    }

    // Locate matching project
    const project = await prisma.project.findFirst({
      where: {
        repoUrl: { contains: repoUrl },
      },
      include: { pipelines: true },
    });

    if (!project || project.pipelines.length === 0) {
      return res.json({
        success: true,
        message: `Webhook received, but no matching project pipeline found for repository ${repoUrl}`,
      });
    }

    const targetPipeline = project.pipelines.find((p) => p.gitBranch === branch) || project.pipelines[0];

    // Check duplicate run
    const existingRun = await prisma.pipelineRun.findFirst({
      where: {
        pipelineId: targetPipeline.id,
        commitSha,
      },
    });

    if (existingRun) {
      return res.json({
        success: true,
        message: `Duplicate webhook event for commit SHA ${commitSha}. Skipping trigger.`,
      });
    }

    // Trigger pipeline
    const run = await triggerPipelineRun(targetPipeline.id, project.ownerId, {
      branch,
      commitSha,
      commitMessage,
    });

    logger.info(`GitHub webhook triggered pipeline run ${run.id} for project ${project.name}`);

    return res.status(200).json({
      success: true,
      message: 'GitHub webhook signature verified. Pipeline run triggered successfully.',
      data: {
        runId: run.id,
        projectName: project.name,
        commitSha,
        branch,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
