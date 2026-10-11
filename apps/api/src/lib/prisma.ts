import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If using PostgreSQL in production, use process.env.DATABASE_URL directly
  if (envUrl && envUrl.startsWith('postgres')) {
    return envUrl;
  }

  // Absolute path to dev.db in workspace root
  const rootDbPath = path.resolve(process.cwd(), 'prisma/dev.db');
  const parentDbPath = path.resolve(process.cwd(), '../prisma/dev.db');
  const relativeDbPath = path.resolve(__dirname, '../../../prisma/dev.db');
  const hardcodedDbPath = 'E:/PROJECTS/devopshub/prisma/dev.db';

  let activeDbPath = relativeDbPath;

  if (fs.existsSync(hardcodedDbPath)) {
    activeDbPath = hardcodedDbPath;
  } else if (fs.existsSync(rootDbPath)) {
    activeDbPath = rootDbPath;
  } else if (fs.existsSync(parentDbPath)) {
    activeDbPath = parentDbPath;
  }

  const formattedPath = activeDbPath.replace(/\\/g, '/');
  return `file:${formattedPath}`;
}

const resolvedDbUrl = getDatabaseUrl();

// Explicitly set process.env.DATABASE_URL so Prisma Rust Query Engine receives the absolute URL
process.env.DATABASE_URL = resolvedDbUrl;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: resolvedDbUrl,
    },
  },
});
