'use client'

import { useState } from 'react'
import { 
  Stack, 
  TextInput, 
  Textarea, 
  Select, 
  Button, 
  Group,
  NumberInput,
  Paper,
  Title
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { Transaction } from '@/lib/db/schema'

interface TransactionFormData {
  title: string
  description: string
  amount: string
  type: 'income' | 'expense'
  category: string
  date: Date
}

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void
  onCancel: () => void
  initialData?: Transaction
  loading?: boolean
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

export default function TransactionForm({ 
  onSubmit, 
  onCancel, 
  initialData,
  loading = false 
}: TransactionFormProps) {
  const form = useForm<TransactionFormData>({
    initialValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      amount: initialData?.amount || '',
      type: initialData?.type || 'expense',
      category: initialData?.category || '',
      date: initialData?.date ? new Date(initialData.date) : new Date(),
    },
    validate: {
      title: (value) => !value.trim() ? 'Title is required' : null,
      amount: (value) => {
        if (!value.trim()) return 'Amount is required'
        if (!/^\d+(\.\d{1,2})?$/.test(value)) return 'Please enter a valid amount'
        return null
      },
      category: (value) => !value.trim() ? 'Category is required' : null,
      date: (value) => !value ? 'Date is required' : null,
    },
  })

  const handleSubmit = (values: TransactionFormData) => {
    onSubmit(values)
  }

  return (
    <Paper p="md" shadow="sm" radius="md">
      <Title order={3} mb="md">
        {initialData ? 'Edit Transaction' : 'Add New Transaction'}
      </Title>
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Enter transaction title"
            {...form.getInputProps('title')}
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter description (optional)"
            {...form.getInputProps('description')}
          />

          <NumberInput
            label="Amount"
            placeholder="0.00"
            prefix="¥"
            decimalScale={2}
            fixedDecimalScale
            thousandSeparator=","
            {...form.getInputProps('amount')}
            required
          />

          <Select
            label="Type"
            data={[
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' }
            ]}
            {...form.getInputProps('type')}
            required
          />

          <Select
            label="Category"
            placeholder="Select a category"
            data={categories.map(cat => ({ value: cat, label: cat }))}
            searchable
            {...form.getInputProps('category')}
            required
          />

          <DateInput
            label="Date"
            placeholder="Select date"
            {...form.getInputProps('date')}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button 
              variant="light" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              loading={loading}
            >
              {initialData ? 'Update' : 'Save'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  )
}