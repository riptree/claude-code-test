import { getTransactions } from '@/lib/actions'
import { Container, Title, Text, Card, Group, Badge, Button, Stack, Flex } from '@mantine/core'
import { IconPlus, IconUser, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'
import Link from 'next/link'

export default async function TransactionsPage() {
  try {
    const transactions = await getTransactions()
    
    return (
      <Container size="lg" py="xl">
        <Flex justify="space-between" align="center" mb="xl">
          <div>
            <Title order={1} size="h1" mb="xs">Budget Tracker</Title>
            <Text size="lg" c="dimmed">
              {transactions.length} transactions found
            </Text>
          </div>
          <Group>
            <Button
              component={Link}
              href="/auth/register"
              variant="light"
              leftSection={<IconUser size={16} />}
            >
              Register
            </Button>
            <Button
              component={Link}
              href="/transactions/new"
              leftSection={<IconPlus size={16} />}
            >
              Add Transaction
            </Button>
          </Group>
        </Flex>

        <Stack gap="md">
          {transactions.map((transaction) => (
            <Card key={transaction.id} shadow="sm" padding="lg" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="lg">{transaction.title}</Text>
                <Group gap="xs">
                  <Badge
                    color={transaction.type === 'income' ? 'green' : 'red'}
                    variant="light"
                    leftSection={
                      transaction.type === 'income' ? (
                        <IconTrendingUp size={12} />
                      ) : (
                        <IconTrendingDown size={12} />
                      )
                    }
                  >
                    {transaction.type}
                  </Badge>
                  <Text fw={700} size="lg" c={transaction.type === 'income' ? 'green' : 'red'}>
                    ¥{transaction.amount.toLocaleString()}
                  </Text>
                </Group>
              </Group>

              {transaction.description && (
                <Text size="sm" c="dimmed" mb="xs">
                  {transaction.description}
                </Text>
              )}

              <Group justify="space-between" mt="md">
                <Badge variant="outline">{transaction.category}</Badge>
                <Text size="sm" c="dimmed">
                  {new Date(transaction.date).toLocaleDateString('ja-JP')}
                </Text>
              </Group>
            </Card>
          ))}
        </Stack>
      </Container>
    )
  } catch (error) {
    return (
      <Container size="lg" py="xl">
        <Title order={1} c="red" mb="md">Error</Title>
        <Text>Failed to load transactions: {String(error)}</Text>
      </Container>
    )
  }
}