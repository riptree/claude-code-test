import { Container, Text } from '@mantine/core'
import { getTransactionById, updateTransactionFromJSON } from '@/lib/actions'
import { redirect } from 'next/navigation'
import TransactionFormServer from '@/components/TransactionFormServer'

export default async function EditTransactionPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const transaction = await getTransactionById(parseInt(id))

  if (!transaction) {
    return (
      <Container size="md" py="xl">
        <Text ta="center" c="red">
          Transaction not found
        </Text>
      </Container>
    )
  }

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

    const result = await updateTransactionFromJSON(parseInt(id), data)
    
    if (result.success) {
      redirect('/transactions')
    } else {
      console.error('Failed to update transaction:', result.errors || result.message)
    }
  }

  return (
    <Container size="md" py="xl">
      <TransactionFormServer 
        action={handleSubmit}
        initialData={{
          title: transaction.title,
          description: transaction.description || '',
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: new Date(transaction.date)
        }}
      />
    </Container>
  )
}