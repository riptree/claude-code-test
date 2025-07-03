import { Container } from '@mantine/core'
import { createTransactionFromJSON } from '@/lib/actions'
import { redirect } from 'next/navigation'
import TransactionFormServer from '@/components/TransactionFormServer'

export default function NewTransactionPage() {
  const handleSubmit = async (formData: FormData) => {
    'use server'
    
    const dateValue = formData.get('date') as string
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      amount: formData.get('amount') as string,
      type: formData.get('type') as 'income' | 'expense',
      category: formData.get('category') as string,
      date: dateValue ? new Date(dateValue + 'T00:00:00').toISOString() : new Date().toISOString(),
    }

    const result = await createTransactionFromJSON(data)
    
    if (result.success) {
      redirect('/transactions')
    } else {
      console.error('Failed to create transaction:', result.errors || result.message)
    }
  }

  return (
    <Container size="md" py="xl">
      <TransactionFormServer action={handleSubmit} />
    </Container>
  )
}