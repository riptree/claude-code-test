import { pgTable, serial, text, decimal, timestamp, integer } from 'drizzle-orm/pg-core'

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull(),
  date: timestamp('date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').notNull().default('#3b82f6'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert