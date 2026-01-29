import { getBudget, getExpenses, getIncomes, getAssets, getLiabilities } from '@/actions/finance'
import { DailyAction } from '@/components/DailyAction'
import { MonthlySummary } from '@/components/MonthlySummary'
import { BalanceSheet } from '@/components/BalanceSheet'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const today = new Date()
  const currentMonth = format(today, 'yyyy-MM')
  
  // Parallel Data Fetching
  const [budget, expenses, incomes, assets, liabilities] = await Promise.all([
    getBudget(currentMonth),
    getExpenses(currentMonth),
    getIncomes(currentMonth),
    getAssets(),
    getLiabilities(),
  ])

  // Calculate Daily Budget Status
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const dailyFlexibleBudget = (budget?.flexibleBudget || 0) / daysInMonth
  
  // Filter today's flexible expenses
  const todayStr = format(today, 'yyyy-MM-dd')
  const todayFlexibleSpent = expenses
    .filter(e => 
      format(e.date, 'yyyy-MM-dd') === todayStr && 
      e.categoryL2 === 'Flexible'
    )
    .reduce((sum, e) => sum + e.amount, 0)
    
  const remainingDailyBudget = Math.max(0, dailyFlexibleBudget - todayFlexibleSpent)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-12 pb-24 relative">
      {/* Header */}
      <header className="text-center space-y-3 mb-12 pt-8">
        <h1 className="text-5xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-min-primary via-min-purple to-min-pink">
          Finance Game
        </h1>
        <p className="text-min-muted font-medium text-lg">
          Level up your wealth, one coin at a time. 🎮
        </p>
      </header>

      {/* 1. Daily Action (Focus Mode) */}
      <section className="max-w-md mx-auto relative z-10">
        <DailyAction dailyBudget={remainingDailyBudget} month={currentMonth} />
      </section>

      {/* 2. Monthly Dashboard */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-display font-bold text-min-text">
            Monthly Quest
          </h2>
          <div className="h-px bg-gray-200 flex-1" />
        </div>
        <MonthlySummary 
          month={currentMonth}
          budget={budget}
          incomes={incomes}
          expenses={expenses}
        />
      </section>

      {/* 3. Wealth Status */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-display font-bold text-min-text">
            Character Stats
          </h2>
          <div className="h-px bg-gray-200 flex-1" />
        </div>
        <BalanceSheet 
          assets={assets}
          liabilities={liabilities}
        />
      </section>

      <footer className="text-center text-min-muted text-sm mt-12 pb-8">
        <p>© 2026 Finance Game • Play to Win</p>
      </footer>
    </main>
  )
}
