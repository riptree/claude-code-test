import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestDatabase, teardownTestDatabase } from './test-db'
import { transactions, categories } from './schema'
import { eq } from 'drizzle-orm'

describe('Database Actions', () => {
  let db: any
  let sql: any

  beforeAll(async () => {
    const testDb = await setupTestDatabase()
    db = testDb.db
    sql = testDb.sql
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    // Clean up transactions before each test
    await sql`DELETE FROM transactions`
  })

  describe('Transactions', () => {
    it('should create a transaction', async () => {
      const newTransaction = {
        description: 'Test transaction',
        amount: '25.50',
        category: 'Food',
        date: new Date(),
      }

      const result = await db.insert(transactions).values(newTransaction).returning()
      
      expect(result).toHaveLength(1)
      expect(result[0].description).toBe('Test transaction')
      expect(result[0].amount).toBe('25.50')
      expect(result[0].category).toBe('Food')
    })

    it('should fetch all transactions', async () => {
      // Insert test data
      await db.insert(transactions).values([
        {
          description: 'Transaction 1',
          amount: '10.00',
          category: 'Food',
          date: new Date(),
        },
        {
          description: 'Transaction 2',
          amount: '20.00',
          category: 'Transport',
          date: new Date(),
        },
      ])

      const result = await db.select().from(transactions)
      
      expect(result).toHaveLength(2)
      expect(result[0].description).toBe('Transaction 1')
      expect(result[1].description).toBe('Transaction 2')
    })

    it('should update a transaction', async () => {
      // Insert test transaction
      const [inserted] = await db.insert(transactions).values({
        description: 'Original description',
        amount: '15.00',
        category: 'Food',
        date: new Date(),
      }).returning()

      // Update the transaction
      await db
        .update(transactions)
        .set({
          description: 'Updated description',
          amount: '25.00',
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, inserted.id))

      // Fetch updated transaction
      const [updated] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, inserted.id))

      expect(updated.description).toBe('Updated description')
      expect(updated.amount).toBe('25.00')
    })

    it('should delete a transaction', async () => {
      // Insert test transaction
      const [inserted] = await db.insert(transactions).values({
        description: 'To be deleted',
        amount: '30.00',
        category: 'Food',
        date: new Date(),
      }).returning()

      // Delete the transaction
      await db.delete(transactions).where(eq(transactions.id, inserted.id))

      // Verify deletion
      const result = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, inserted.id))

      expect(result).toHaveLength(0)
    })
  })

  describe('Categories', () => {
    it('should fetch all categories', async () => {
      const result = await db.select().from(categories)
      
      expect(result.length).toBeGreaterThan(0)
      expect(result.some((cat: any) => cat.name === 'Food')).toBe(true)
      expect(result.some((cat: any) => cat.name === 'Transport')).toBe(true)
    })
  })
})