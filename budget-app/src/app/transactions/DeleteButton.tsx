'use client'

import { ActionIcon } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { deleteTransactionAction } from '@/lib/actions'

interface DeleteButtonProps {
  id: number
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      const result = await deleteTransactionAction(id)
      if (!result.success && result.message) {
        console.error(result.message)
      }
    }
  }

  return (
    <ActionIcon 
      variant="subtle" 
      color="red" 
      size="sm"
      onClick={handleDelete}
    >
      <IconTrash size={16} />
    </ActionIcon>
  )
}