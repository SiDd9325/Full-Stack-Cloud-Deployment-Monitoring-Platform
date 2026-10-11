# DevOpsHub — Full-Stack Cloud Deployment & Monitoring Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.10-indigo.svg)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-blue.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-EKS-326CE5.svg)](https://kubernetes.io/)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC.svg)](https://www.terraform.io/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Metrics-E6522C.svg)](https://prometheus.io/)

**DevOpsHub** is a production-grade full-stack web application designed for developers and DevOps engineers to manage software projects, trigger and observe 9-stage CI/CD pipelines, track container deployment histories across environments (DEV, STAGING, PROD), perform automated immutable image rollbacks, inspect application logs, and monitor real-time telemetry metrics from a centralized dark-mode dashboard.

---

## 🏗️ Architecture Overview

```
devopshub/
├── apps/
│   ├── web/               # React + TypeScript + Vite + Tailwind CSS + Lucide + Recharts
│   └── api/               # Express + TypeScript + Zod + JWT + Prometheus instrumentation
├── packages/
│   └── shared/            # Shared DTOs, Enums, Interfaces, and API response wrappers
├── prisma/
│   ├── schema.prisma      # Normalized PostgreSQL schema (User, Project, Pipeline, Deployment, Log, Audit)
│   └── seed.ts            # Local demo seed script (Admin & Developer users, mock projects/pipelines)
├── docker/
│   ├── Dockerfile.web     # Multi-stage non-root Nginx container for frontend
│   └── Dockerfile.api     # Multi-stage non-root container for Node API
├── .github/
│   └── workflows/
│       └── ci-cd.yml      # Declarative 9-Stage GitHub Actions Workflow
├── jenkins/
│   └── Jenkinsfile        # Declarative 9-Stage Jenkins CI/CD Pipeline script
├── infrastructure/
│   └── terraform/         # AWS Terraform modules (VPC, ECR, EKS/ECS, IAM, Security Groups)
├── kubernetes/            # K8s Deployment, Service, Ingress, HPA, ConfigMap manifests
├── monitoring/
│   ├── prometheus/        # prometheus.yml config & scrape rules
│   └── grafana/           # Operational dashboard JSON specifications
├── tests/                 # Backend Vitest unit tests & Playwright E2E test specs
├── docker-compose.yml     # Local multi-container orchestrator (Web, API, Postgres, Prometheus, Grafana)
└── package.json           # Root npm workspaces configuration
```

---

## ✨ Key Features & Capabilities

1. **Unified SaaS Dashboard**:
   - Polished dark-mode developer aesthetic inspired by Linear and Vercel.
   - 13 fully functional pages: Overview Dashboard, Projects, Project Details, Pipelines, Deployments, Logs, Monitoring, Infrastructure, Team & Access Control, Settings, Login, Registration, 404 Error.
   - Interactive role switcher (`ADMIN` vs `DEVELOPER`) with single-click demo login buttons.

2. **Sequential 9-Stage CI/CD Pipeline Engine**:
   - 9 Stages: Checkout &rarr; Dependency Installation &rarr; Static Analysis & Security &rarr; Unit Tests &rarr; Docker Image Build &rarr; Container Vulnerability Scan (Trivy) &rarr; Image Push (Amazon ECR) &rarr; Deployment (AWS EKS) &rarr; Post-Deployment Health Check.
   - Built-in GitHub Actions & Jenkins adapters with live stage duration counters and background stage execution.

3. **Deployment Operations & Immutable Image Rollbacks**:
   - Filter deployment records across `DEVELOPMENT`, `STAGING`, and `PRODUCTION` environments.
   - Genuine rollback engine allowing admins to revert cluster workloads to prior stable immutable image tags with audit logging.

4. **Observability & Prometheus Instrumentation**:
   - Live Prometheus metrics scrape endpoint (`/metrics`) tracking HTTP request rates, P95/P99 duration histograms (`devopshub_http_request_duration_seconds`), and active builds gauge.
   - Application liveness (`/health`) and readiness checks with PostgreSQL latency monitoring.

5. **Cloud Infrastructure & Security**:
   - Multi-stage non-root Docker containers (`runAsUser: 10001`).
   - Terraform IaC modules for AWS VPC, ECR, EKS, and IAM least-privilege roles.
   - Kubernetes manifests including Horizontal Pod Autoscaler (HPA), Ingress rules, and resource limits.
   - GitHub Webhook endpoint with HMAC SHA-256 signature verification.

---

## 🚀 Quick Local Setup Guide

### 1. Prerequisites
- Node.js (v18 or v20) & npm
- Docker & Docker Compose (optional for full container stack)

### 2. Installation
Clone the repository and install dependencies:
```bash
# Navigate to project directory
cd C:\Users\TZZS\.gemini\antigravity\scratch\devopshub

# Install monorepo dependencies across packages and apps
npm install
```

### 3. Database Migration & Seeding
Initialize the SQLite / PostgreSQL database and populate realistic demo data:
```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations
npx prisma migrate dev --name init

# Seed database with demo projects, users, pipelines, and deployment logs
npx ts-node prisma/seed.ts
```

### 4. Start Development Servers
Start both backend API and React Vite frontend in parallel:
```bash
# Start backend API (Port 4000)
npm run dev:api

# Start React frontend (Port 5173) in a second terminal
npm run dev:web
```

Open your browser at `http://localhost:5173`.

---

## 🔑 Demo Login Credentials

The seed script provides pre-configured credentials for quick testing:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@devopshub.io` | `Password123!` | Full control plane access, rollback triggers, team role management |
| **DEVELOPER** | `dev@devopshub.io` | `Password123!` | Trigger authorized pipelines, view logs & telemetry |

*Tip: Use the **"Switch Role"** toggle in the top header to instantly switch between Admin and Developer modes.*

---

## 📡 REST API Reference (`/api/v1`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user & set HTTP-only JWT cookie | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | JWT Cookie / Bearer |
| `GET` | `/api/v1/projects` | List projects (supports search & status filtering) | Required |
| `POST` | `/api/v1/projects` | Initialize new DevOps project & default pipeline | Required |
| `GET` | `/api/v1/projects/:id` | Fetch project details, pipeline runs & members | Required |
| `POST` | `/api/v1/pipelines/:id/runs` | Trigger a 9-stage CI/CD pipeline build | Required |
| `GET` | `/api/v1/deployments` | List deployments (filter by DEV/STAGING/PROD) | Required |
| `POST` | `/api/v1/deployments/:id/rollback` | Execute immutable image rollback | Admin Only |
| `GET` | `/api/v1/logs` | Search and filter application logs | Required |
| `GET` | `/api/v1/monitoring/overview` | Platform telemetry & metrics overview | Public |
| `GET` | `/metrics` | Prometheus metrics scrape endpoint | Public |
| `POST` | `/api/v1/webhooks/github` | GitHub webhook handler (HMAC SHA-256 verified) | Signature |

---

## 🐳 Docker Compose Local Stack

To run the complete platform including API, Web, PostgreSQL, Prometheus, and Grafana in containers:

```bash
# Launch multi-container stack
docker-compose up -d --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Prometheus UI**: http://localhost:9090
- **Grafana Dashboards**: http://localhost:3001 (admin/admin)

---

## 🧪 Automated Testing

```bash
# Run backend API unit & integration tests
npm run test
```
