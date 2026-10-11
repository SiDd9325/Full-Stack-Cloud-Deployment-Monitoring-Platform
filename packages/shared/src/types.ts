export type UserRole = 'ADMIN' | 'DEVELOPER';

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'DEGRADED' | 'MAINTENANCE';

export type PipelineProvider = 'GITHUB_ACTIONS' | 'JENKINS';

export type PipelineStatus = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export type DeploymentEnv = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';

export type DeploymentStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: UserRole;
  user?: UserWithoutPassword;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  repoUrl: string;
  ownerId: string;
  owner?: UserWithoutPassword;
  status: ProjectStatus;
  members?: ProjectMember[];
  pipelinesCount?: number;
  deploymentsCount?: number;
  lastDeploymentStatus?: DeploymentStatus;
  lastDeploymentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  runId: string;
  name: string;
  order: number;
  status: PipelineStatus;
  durationMs: number;
  logOutput?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  pipelineName?: string;
  projectId: string;
  projectName?: string;
  provider: PipelineProvider;
  status: PipelineStatus;
  commitSha: string;
  commitMessage?: string;
  branch: string;
  durationMs: number;
  startedAt: string;
  finishedAt?: string;
  triggeredById: string;
  triggeredBy?: UserWithoutPassword;
  stages: PipelineStage[];
}

export interface Pipeline {
  id: string;
  projectId: string;
  projectName?: string;
  name: string;
  gitBranch: string;
  provider: PipelineProvider;
  jenkinsJobName?: string;
  workflowFile?: string;
  lastRun?: PipelineRun;
  createdAt: string;
  updatedAt: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  projectName?: string;
  pipelineRunId: string;
  environment: DeploymentEnv;
  version: string;
  imageTag: string;
  status: DeploymentStatus;
  deployedById: string;
  deployedBy?: UserWithoutPassword;
  healthCheckPassed: boolean;
  rollbackFromId?: string;
  startedAt: string;
  finishedAt?: string;
  durationMs: number;
  errorDetails?: string;
}

export interface ApplicationLog {
  id: string;
  projectId?: string;
  projectName?: string;
  deploymentId?: string;
  service: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AuditEvent {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface SystemMetricsOverview {
  totalProjects: number;
  activeProjects: number;
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  deploymentSuccessRate: number; // 0 - 100 percentage
  avgDeploymentDurationMs: number;
  activePipelinesCount: number;
  systemUptimeSeconds: number;
  requestRatePerMin: number;
  errorRatePercentage: number;
  avgLatencyMs: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  isDemoMode: boolean;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: { status: 'up' | 'down'; latencyMs: number };
    prometheus: { status: 'up' | 'down' | 'mocked' };
    jenkins: { status: 'up' | 'down' | 'demo_mode' };
    github: { status: 'up' | 'down' | 'demo_mode' };
  };
}

// Request DTOs
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  repoUrl: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  repoUrl?: string;
  status?: ProjectStatus;
}

export interface CreatePipelineDto {
  name: string;
  gitBranch: string;
  provider: PipelineProvider;
  jenkinsJobName?: string;
  workflowFile?: string;
}

export interface TriggerPipelineDto {
  branch?: string;
  commitSha?: string;
  commitMessage?: string;
}

export interface RollbackDeploymentDto {
  targetImageTag?: string;
  reason?: string;
}

export interface AddProjectMemberDto {
  email: string;
  role: UserRole;
}

export interface LogFilterParams {
  projectId?: string;
  deploymentId?: string;
  service?: string;
  level?: LogLevel;
  search?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
