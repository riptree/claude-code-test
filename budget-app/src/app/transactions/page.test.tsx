import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import TransactionsPage from './page'

const mockTransactions = [
  {
    id: 1,
    title: 'Grocery Shopping',
    description: 'Weekly groceries',
    amount: '120.50',
    type: 'expense' as const,
    category: 'Food',
    date: new Date('2024-01-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    title: 'Salary',
    description: 'Monthly salary',
    amount: '3000.00',
    type: 'income' as const,
    category: 'Work',
    date: new Date('2024-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

global.fetch = vi.fn()

const renderWithMantine = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  )
}

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockTransactions,
    } as Response)
  })

  it('should display transactions list', async () => {
    renderWithMantine(<TransactionsPage />)

    await waitFor(() => {
      expect(screen.getByText('Budget Tracker')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Grocery Shopping')).toBeInTheDocument()
      expect(screen.getByText('Salary')).toBeInTheDocument()
    })
  })

  it('should show loading state initially', () => {
    renderWithMantine(<TransactionsPage />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display transaction amounts correctly', async () => {
    renderWithMantine(<TransactionsPage />)

    await waitFor(() => {
      expect(screen.getByText('¥120.50')).toBeInTheDocument()
      expect(screen.getByText('¥3,000.00')).toBeInTheDocument()
    })
  })

  it('should display income and expense badges', async () => {
    renderWithMantine(<TransactionsPage />)

    await waitFor(() => {
      expect(screen.getByText('Income')).toBeInTheDocument()
      expect(screen.getByText('Expense')).toBeInTheDocument()
    })
  })

  it('should show add transaction button', async () => {
    renderWithMantine(<TransactionsPage />)

    await waitFor(() => {
      expect(screen.getByText('Add Transaction')).toBeInTheDocument()
    })
  })
})