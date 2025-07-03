import { 
  Stack, 
  TextInput, 
  Textarea, 
  Select, 
  Button, 
  Group,
  Paper,
  Title
} from '@mantine/core'
import Link from 'next/link'

interface TransactionFormServerProps {
  action: (formData: FormData) => Promise<void>
  initialData?: {
    title?: string
    description?: string
    amount?: string
    type?: 'income' | 'expense'
    category?: string
    date?: Date
  }
}

const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Health & Fitness',
  'Travel',
  'Education',
  'Business',
  'Personal Care',
  'Gifts & Donations',
  'Investments',
  'Other'
]

export default function TransactionFormServer({ 
  action,
  initialData
}: TransactionFormServerProps) {
  return (
    <Paper p="md" shadow="sm" radius="md">
      <Title order={3} mb="md">
        {initialData ? 'Edit Transaction' : 'Add New Transaction'}
      </Title>
      
      <form action={action}>
        <Stack gap="md">
          <TextInput
            label="Title"
            name="title"
            placeholder="Enter transaction title"
            defaultValue={initialData?.title || ''}
            required
          />

          <Textarea
            label="Description"
            name="description"
            placeholder="Enter description (optional)"
            defaultValue={initialData?.description || ''}
          />

          <TextInput
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            defaultValue={initialData?.amount || ''}
            required
          />

          <Select
            label="Type"
            name="type"
            data={[
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' }
            ]}
            defaultValue={initialData?.type || 'expense'}
            required
          />

          <Select
            label="Category"
            name="category"
            placeholder="Select a category"
            data={categories.map(cat => ({ value: cat, label: cat }))}
            searchable
            defaultValue={initialData?.category || ''}
            required
          />

          <TextInput
            label="Date"
            name="date"
            type="date"
            defaultValue={initialData?.date ? initialData.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button 
              variant="light" 
              component={Link}
              href="/transactions"
            >
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Save'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  )
}