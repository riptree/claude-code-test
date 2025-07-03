import { pgTable, serial, text, decimal, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense'])

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  category: text('category').notNull(),
  date: timestamp('date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
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