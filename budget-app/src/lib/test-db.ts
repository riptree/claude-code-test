import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers'

let container: StartedPostgreSqlContainer

export async function setupTestDatabase() {
  container = await new PostgreSqlContainer('postgres:15')
    .withDatabase('test_budget_app')
    .withUsername('test_user')
    .withPassword('test_password')
    .start()

  const connectionString = container.getConnectionUri()
  const sql = postgres(connectionString)
  const db = drizzle(sql, { schema })

  // Run migrations or create tables
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#3b82f6',
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      description TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      category TEXT NOT NULL,
      date TIMESTAMP DEFAULT NOW() NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `

  // Insert test categories
  await sql`
    INSERT INTO categories (name, color) VALUES 
    ('Food', '#ef4444'),
    ('Transport', '#3b82f6'),
    ('Test Category', '#8b5cf6')
    ON CONFLICT (name) DO NOTHING
  `

  return { db, sql }
}

export async function teardownTestDatabase() {
  if (container) {
    await container.stop()
  }
}

export function getTestContainer() {
  return container
}