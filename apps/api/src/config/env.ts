import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('file:../../prisma/dev.db'),
  JWT_SECRET: z.string().default('devopshub_super_secret_jwt_key_2026_change_in_prod'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JENKINS_URL: z.string().optional().default(''),
  JENKINS_USER: z.string().optional().default(''),
  JENKINS_TOKEN: z.string().optional().default(''),
  GITHUB_WEBHOOK_SECRET: z.string().optional().default('devopshub_webhook_secret_key'),
});

export const env = envSchema.parse(process.env);
