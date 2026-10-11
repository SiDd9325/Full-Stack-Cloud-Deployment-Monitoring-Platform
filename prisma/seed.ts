import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding DevOpsHub Database...');

  // Clean existing data
  await prisma.auditEvent.deleteMany();
  await prisma.applicationLog.deleteMany();
  await prisma.deployment.deleteMany();
  await prisma.pipelineStage.deleteMany();
  await prisma.pipelineRun.deleteMany();
  await prisma.pipeline.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@devopshub.io',
      name: 'Alex Rivera (Admin)',
      passwordHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
  });

  const devUser = await prisma.user.create({
    data: {
      email: 'dev@devopshub.io',
      name: 'Sarah Chen (Lead Dev)',
      passwordHash,
      role: 'DEVELOPER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    },
  });

  console.log(`Created users: Admin (${adminUser.email}), Dev (${devUser.email})`);

  // Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'ecommerce-microservice',
      description: 'Core REST microservice for processing product catalog and checkout flows.',
      repoUrl: 'https://github.com/devopshub-demo/ecommerce-microservice',
      ownerId: adminUser.id,
      status: 'ACTIVE',
      members: {
        create: [
          { userId: adminUser.id, role: 'ADMIN' },
          { userId: devUser.id, role: 'DEVELOPER' },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'payment-gateway-api',
      description: 'High-throughput payment orchestration engine integrated with Stripe and PayPal.',
      repoUrl: 'https://github.com/devopshub-demo/payment-gateway-api',
      ownerId: devUser.id,
      status: 'ACTIVE',
      members: {
        create: [{ userId: devUser.id, role: 'DEVELOPER' }],
      },
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'analytics-pipeline',
      description: 'Real-time event streaming and metrics aggregation pipeline.',
      repoUrl: 'https://github.com/devopshub-demo/analytics-pipeline',
      ownerId: adminUser.id,
      status: 'DEGRADED',
      members: {
        create: [{ userId: adminUser.id, role: 'ADMIN' }],
      },
    },
  });

  // Pipelines
  const pipeline1 = await prisma.pipeline.create({
    data: {
      projectId: project1.id,
      name: 'Main Production CI/CD',
      gitBranch: 'main',
      provider: 'GITHUB_ACTIONS',
      workflowFile: '.github/workflows/ci-cd.yml',
    },
  });

  const pipeline2 = await prisma.pipeline.create({
    data: {
      projectId: project2.id,
      name: 'Jenkins EKS Release Pipeline',
      gitBranch: 'release/v2.4',
      provider: 'JENKINS',
      jenkinsJobName: 'payment-gateway-prod-deploy',
    },
  });

  // Stages template for 9-stage standard workflow
  const stageNames = [
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

  // Pipeline Runs
  const run1 = await prisma.pipelineRun.create({
    data: {
      pipelineId: pipeline1.id,
      provider: 'GITHUB_ACTIONS',
      status: 'SUCCESS',
      commitSha: 'a7b3c9f2d1e8',
      commitMessage: 'feat(cart): add redis session caching & retry policies',
      branch: 'main',
      durationMs: 142000,
      startedAt: new Date(Date.now() - 3600000),
      finishedAt: new Date(Date.now() - 3600000 + 142000),
      triggeredById: devUser.id,
      stages: {
        create: stageNames.map((name, index) => ({
          name,
          order: index + 1,
          status: 'SUCCESS',
          durationMs: Math.floor(10000 + Math.random() * 15000),
          logOutput: `[${name}] Stage completed successfully with exit code 0.`,
          startedAt: new Date(Date.now() - 3600000 + index * 15000),
          finishedAt: new Date(Date.now() - 3600000 + (index + 1) * 15000),
        })),
      },
    },
  });

  const run2 = await prisma.pipelineRun.create({
    data: {
      pipelineId: pipeline2.id,
      provider: 'JENKINS',
      status: 'FAILED',
      commitSha: '8f9e1a2b3c4d',
      commitMessage: 'fix(auth): update JWT verification algorithm',
      branch: 'release/v2.4',
      durationMs: 85000,
      startedAt: new Date(Date.now() - 1800000),
      finishedAt: new Date(Date.now() - 1800000 + 85000),
      triggeredById: adminUser.id,
      stages: {
        create: stageNames.map((name, index) => ({
          name,
          order: index + 1,
          status: index < 3 ? 'SUCCESS' : index === 3 ? 'FAILED' : 'QUEUED',
          durationMs: index <= 3 ? 20000 : 0,
          logOutput:
            index === 3
              ? '[Unit & Integration Tests] Error: 2 test assertions failed in PaymentGatewaySpec.ts'
              : `[${name}] Log initialized.`,
        })),
      },
    },
  });

  // Deployments
  const dep1 = await prisma.deployment.create({
    data: {
      projectId: project1.id,
      pipelineRunId: run1.id,
      environment: 'PRODUCTION',
      version: 'v1.4.2',
      imageTag: 'ecommerce-microservice:v1.4.2-a7b3c9f',
      status: 'SUCCESS',
      deployedById: devUser.id,
      healthCheckPassed: true,
      startedAt: new Date(Date.now() - 3400000),
      finishedAt: new Date(Date.now() - 3380000),
      durationMs: 20000,
    },
  });

  const dep2 = await prisma.deployment.create({
    data: {
      projectId: project2.id,
      pipelineRunId: run2.id,
      environment: 'STAGING',
      version: 'v2.4.0-rc1',
      imageTag: 'payment-gateway-api:v2.4.0-rc1',
      status: 'FAILED',
      deployedById: adminUser.id,
      healthCheckPassed: false,
      errorDetails: 'Health check failed: DB Connection Timeout on port 5432 after 30s',
      startedAt: new Date(Date.now() - 1700000),
      finishedAt: new Date(Date.now() - 1670000),
      durationMs: 30000,
    },
  });

  // Application Logs
  await prisma.applicationLog.createMany({
    data: [
      {
        projectId: project1.id,
        deploymentId: dep1.id,
        service: 'ecommerce-api',
        level: 'INFO',
        message: 'Application started cleanly on port 3000. Connected to PostgreSQL pool.',
        timestamp: new Date(Date.now() - 3300000),
      },
      {
        projectId: project1.id,
        deploymentId: dep1.id,
        service: 'ecommerce-api',
        level: 'INFO',
        message: 'HTTP GET /api/v1/products 200 OK - 42ms',
        timestamp: new Date(Date.now() - 2400000),
      },
      {
        projectId: project1.id,
        deploymentId: dep1.id,
        service: 'ecommerce-api',
        level: 'WARN',
        message: 'Redis cache miss for product_catalog_key_8819. Fetching from DB fallback.',
        timestamp: new Date(Date.now() - 1200000),
      },
      {
        projectId: project2.id,
        deploymentId: dep2.id,
        service: 'payment-gateway',
        level: 'ERROR',
        message: 'FATAL: Unable to resolve hostname payment-db.internal.eks.amazonaws.com',
        timestamp: new Date(Date.now() - 1690000),
      },
    ],
  });

  // Audit Logs
  await prisma.auditEvent.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'PROJECT_CREATED',
        details: 'Created project ecommerce-microservice',
        ipAddress: '127.0.0.1',
      },
      {
        userId: devUser.id,
        action: 'PIPELINE_TRIGGERED',
        details: 'Triggered pipeline run a7b3c9f2d1e8 on main branch',
        ipAddress: '192.168.1.45',
      },
      {
        userId: devUser.id,
        action: 'DEPLOYMENT_COMPLETED',
        details: 'Successfully deployed version v1.4.2 to PRODUCTION',
        ipAddress: '192.168.1.45',
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
