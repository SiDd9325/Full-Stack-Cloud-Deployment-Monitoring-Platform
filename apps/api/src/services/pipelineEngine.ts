import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { pipelineRunCounter, activeBuildsGauge } from '../lib/metrics';

const STAGE_NAMES = [
  'Checkout',
  'Dependency Installation',
  'Static Analysis & Security',
  'Unit & Integration Tests',
  'Docker Image Build',
  'Container Scan (Trivy)',
  'Image Push (Amazon ECR)',
  'Deployment (AWS EKS)',
  'Post-Deployment Health Check',
];

export async function triggerPipelineRun(
  pipelineId: string,
  userId: string,
  options?: { branch?: string; commitSha?: string; commitMessage?: string }
) {
  const pipeline = await prisma.pipeline.findUnique({
    where: { id: pipelineId },
    include: { project: true },
  });

  if (!pipeline) {
    throw new Error('Pipeline not found');
  }

  const commitSha = options?.commitSha || Math.random().toString(36).substring(2, 10);
  const commitMessage = options?.commitMessage || `manual trigger: run pipeline on ${pipeline.gitBranch}`;
  const branch = options?.branch || pipeline.gitBranch;

  // Create initial PipelineRun in QUEUED status with 9 stages
  const run = await prisma.pipelineRun.create({
    data: {
      pipelineId: pipeline.id,
      provider: pipeline.provider,
      status: 'QUEUED',
      commitSha,
      commitMessage,
      branch,
      durationMs: 0,
      startedAt: new Date(),
      triggeredById: userId,
      stages: {
        create: STAGE_NAMES.map((name, index) => ({
          name,
          order: index + 1,
          status: 'QUEUED',
          durationMs: 0,
          logOutput: `[${name}] Waiting in build queue...`,
        })),
      },
    },
    include: { stages: true, pipeline: { include: { project: true } } },
  });

  // Track metrics
  pipelineRunCounter.inc({ provider: pipeline.provider, status: 'QUEUED' });
  activeBuildsGauge.inc();

  // Asynchronously execute stages in background engine
  executePipelineAsync(run.id).catch((err) => {
    logger.error(`Error in async pipeline run ${run.id}:`, err);
  });

  return run;
}

async function executePipelineAsync(runId: string) {
  try {
    // Set status to RUNNING
    await prisma.pipelineRun.update({
      where: { id: runId },
      data: { status: 'RUNNING' },
    });

    const run = await prisma.pipelineRun.findUnique({
      where: { id: runId },
      include: { stages: { orderBy: { order: 'asc' } }, pipeline: { include: { project: true } } },
    });

    if (!run) return;

    const startTime = Date.now();
    let overallSuccess = true;

    for (const stage of run.stages) {
      if (!overallSuccess) {
        // Skip remaining stages if a stage failed
        await prisma.pipelineStage.update({
          where: { id: stage.id },
          data: {
            status: 'CANCELLED',
            logOutput: `[${stage.name}] Skipped due to previous stage failure.`,
          },
        });
        continue;
      }

      // Mark stage as RUNNING
      const stageStart = Date.now();
      await prisma.pipelineStage.update({
        where: { id: stage.id },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
          logOutput: `[${stage.name}] Executing stage step on runner host...`,
        },
      });

      // Simulate realistic execution time (500ms for demo speed)
      await new Promise((resolve) => setTimeout(resolve, 600));

      // 95% pass rate for demo reliability
      const stageSuccess = Math.random() > 0.05;
      const stageDuration = Date.now() - stageStart;

      if (stageSuccess) {
        await prisma.pipelineStage.update({
          where: { id: stage.id },
          data: {
            status: 'SUCCESS',
            durationMs: stageDuration,
            finishedAt: new Date(),
            logOutput: `[${stage.name}] Completed successfully in ${stageDuration}ms. Exit Code 0.`,
          },
        });
      } else {
        overallSuccess = false;
        await prisma.pipelineStage.update({
          where: { id: stage.id },
          data: {
            status: 'FAILED',
            durationMs: stageDuration,
            finishedAt: new Date(),
            logOutput: `[${stage.name}] Process exited with status 1. Security policy check or test assertion error.`,
          },
        });
      }
    }

    const totalDuration = Date.now() - startTime;
    const finalStatus = overallSuccess ? 'SUCCESS' : 'FAILED';

    await prisma.pipelineRun.update({
      where: { id: runId },
      data: {
        status: finalStatus,
        durationMs: totalDuration,
        finishedAt: new Date(),
      },
    });

    activeBuildsGauge.dec();
    pipelineRunCounter.inc({ provider: run.provider, status: finalStatus });

    // If pipeline run succeeded, trigger automatic deployment record
    if (overallSuccess && run.pipeline?.project) {
      const versionStr = `v1.0.${Math.floor(Math.random() * 90 + 10)}`;
      const imageTagStr = `${run.pipeline.project.name}:${versionStr}-${run.commitSha.substring(0, 7)}`;

      const deployment = await prisma.deployment.create({
        data: {
          projectId: run.pipeline.projectId,
          pipelineRunId: run.id,
          environment: 'STAGING',
          version: versionStr,
          imageTag: imageTagStr,
          status: 'SUCCESS',
          deployedById: run.triggeredById,
          healthCheckPassed: true,
          startedAt: new Date(),
          finishedAt: new Date(),
          durationMs: 15000,
        },
      });

      // Generate application log for deployment
      await prisma.applicationLog.create({
        data: {
          projectId: run.pipeline.projectId,
          deploymentId: deployment.id,
          service: run.pipeline.project.name,
          level: 'INFO',
          message: `Deployment ${versionStr} initialized successfully on STAGING environment. Image: ${imageTagStr}`,
        },
      });
    }
  } catch (error) {
    logger.error(`Error running pipeline execution ${runId}:`, error);
    activeBuildsGauge.dec();
  }
}
