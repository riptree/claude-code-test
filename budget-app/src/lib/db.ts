import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || 'postgresql://budget_user:budget_password@localhost:5432/budget_app'

export const sql = postgres(connectionString)
export const db = drizzle(sql, { schema })