import { db } from './db/index'
import { categories } from './db/schema'

async function seed() {
  try {
    // Insert default categories
    await db.insert(categories).values([
      { name: 'Food & Dining', color: '#ef4444' },
      { name: 'Transportation', color: '#3b82f6' },
      { name: 'Shopping', color: '#f59e0b' },
      { name: 'Entertainment', color: '#8b5cf6' },
      { name: 'Bills & Utilities', color: '#10b981' },
      { name: 'Health & Fitness', color: '#06b6d4' },
      { name: 'Travel', color: '#84cc16' },
      { name: 'Education', color: '#f97316' },
      { name: 'Business', color: '#6366f1' },
      { name: 'Personal Care', color: '#ec4899' },
      { name: 'Gifts & Donations', color: '#14b8a6' },
      { name: 'Investments', color: '#a855f7' },
      { name: 'Other', color: '#6b7280' },
    ]).onConflictDoNothing()

    console.log('Seed data inserted successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    process.exit(0)
  }
}

seed()