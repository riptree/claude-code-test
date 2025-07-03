import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import TransactionForm from './TransactionForm'

const renderWithMantine = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  )
}

const mockOnSubmit = vi.fn()
const mockOnCancel = vi.fn()

describe('TransactionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render form fields', () => {
    renderWithMantine(
      <TransactionForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Date')).toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    
    renderWithMantine(
      <TransactionForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('Title'), 'Test Transaction')
    await user.type(screen.getByLabelText('Description'), 'Test Description')
    await user.type(screen.getByLabelText('Amount'), '100.50')
    await user.selectOptions(screen.getByLabelText('Type'), 'expense')
    await user.type(screen.getByLabelText('Category'), 'Food')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Transaction',
          description: 'Test Description',
          amount: '100.50',
          type: 'expense',
          category: 'Food',
        })
      )
    })
  })

  it('should show validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    
    renderWithMantine(
      <TransactionForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
      expect(screen.getByText('Amount is required')).toBeInTheDocument()
      expect(screen.getByText('Category is required')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should call onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    
    renderWithMantine(
      <TransactionForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should populate form with initial data when editing', () => {
    const initialData = {
      id: 1,
      title: 'Existing Transaction',
      description: 'Existing Description',
      amount: '50.00',
      type: 'income' as const,
      category: 'Salary',
      date: new Date('2024-01-15'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    renderWithMantine(
      <TransactionForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        initialData={initialData}
      />
    )

    expect(screen.getByDisplayValue('Existing Transaction')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('50.00')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Salary')).toBeInTheDocument()
  })

  it('should validate amount format', async () => {
    const user = userEvent.setup()
    
    renderWithMantine(
      <TransactionForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('Amount'), 'invalid-amount')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid amount')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
})