'use server'

import { db } from './db/index'
import { transactions, categories } from './db/schema'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const TransactionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
})

export async function createTransaction(formData: FormData) {
  const validatedFields = TransactionSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category'),
    date: formData.get('date') || new Date().toISOString(),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { title, description, amount, type, category, date } = validatedFields.data

  try {
    await db.insert(transactions).values({
      title,
      description,
      amount,
      type,
      category,
      date: new Date(date),
    })
  } catch (error) {
    return {
      message: 'Database Error: Failed to create transaction.',
    }
  }

  revalidatePath('/transactions')
  redirect('/transactions')
}

export async function updateTransaction(id: number, formData: FormData) {
  const validatedFields = TransactionSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category'),
    date: formData.get('date'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { title, description, amount, type, category, date } = validatedFields.data

  try {
    await db
      .update(transactions)
      .set({
        title,
        description: description || null,
        amount,
        type,
        category,
        date: new Date(date),
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
  } catch (error) {
    return {
      message: 'Database Error: Failed to update transaction.',
    }
  }

  revalidatePath('/transactions')
  redirect('/transactions')
}

export async function deleteTransaction(id: number) {
  try {
    await db.delete(transactions).where(eq(transactions.id, id))
  } catch (error) {
    return {
      message: 'Database Error: Failed to delete transaction.',
    }
  }

  revalidatePath('/transactions')
}

export async function getTransactions() {
  try {
    const data = await db.select().from(transactions).orderBy(transactions.date)
    return data
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch transactions.')
  }
}

export async function getTransactionById(id: number) {
  try {
    const data = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
    
    return data[0] || null
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch transaction.')
  }
}

export async function getCategories() {
  try {
    const data = await db.select().from(categories).orderBy(categories.name)
    return data
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch categories.')
  }
}

export async function createTransactionFromJSON(data: {
  title: string
  description?: string
  amount: string
  type: 'income' | 'expense'
  category: string
  date: string
}) {
  const validatedFields = TransactionSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { title, description, amount, type, category, date } = validatedFields.data

  try {
    const [newTransaction] = await db.insert(transactions).values({
      title,
      description: description || null,
      amount,
      type,
      category,
      date: new Date(date),
    }).returning()

    revalidatePath('/transactions')
    return { success: true, transaction: newTransaction }
  } catch (error) {
    return {
      success: false,
      message: 'Database Error: Failed to create transaction.',
    }
  }
}

export async function updateTransactionFromJSON(
  id: number,
  data: {
    title: string
    description?: string
    amount: string
    type: 'income' | 'expense'
    category: string
    date: string
  }
) {
  const validatedFields = TransactionSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { title, description, amount, type, category, date } = validatedFields.data

  try {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        title,
        description: description || null,
        amount,
        type,
        category,
        date: new Date(date),
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning()

    if (!updatedTransaction) {
      return {
        success: false,
        message: 'Transaction not found.',
      }
    }

    revalidatePath('/transactions')
    return { success: true, transaction: updatedTransaction }
  } catch (error) {
    return {
      success: false,
      message: 'Database Error: Failed to update transaction.',
    }
  }
}

export async function deleteTransactionAction(id: number) {
  try {
    const [deletedTransaction] = await db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning()

    if (!deletedTransaction) {
      return {
        success: false,
        message: 'Transaction not found.',
      }
    }

    revalidatePath('/transactions')
    return { success: true, message: 'Transaction deleted successfully.' }
  } catch (error) {
    return {
      success: false,
      message: 'Database Error: Failed to delete transaction.',
    }
  }
}