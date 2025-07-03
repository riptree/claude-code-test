import { getTransactions } from '@/lib/actions'

export default async function TransactionsPage() {
  try {
    const transactions = await getTransactions()
    
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Budget Tracker</h1>
        <p>Found {transactions.length} transactions</p>
        {transactions.map((transaction) => (
          <div key={transaction.id} style={{ padding: '0.5rem', border: '1px solid #ccc', margin: '0.5rem 0' }}>
            <strong>{transaction.title}</strong> - ¥{transaction.amount} ({transaction.type})
            {transaction.description && <p>{transaction.description}</p>}
            <small>Category: {transaction.category} | Date: {new Date(transaction.date).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    )
  } catch (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Error</h1>
        <p>Failed to load transactions: {String(error)}</p>
      </div>
    )
  }
}