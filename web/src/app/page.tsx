import { getBudget, getExpenses, getIncomes, getAssets, getLiabilities } from '@/actions/finance'
import { DailyAction } from '@/components/DailyAction'
import { MonthlySummary } from '@/components/MonthlySummary'
import { BalanceSheet } from '@/components/BalanceSheet'
import { format, addMonths, subMonths, parse } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Home({ searchParams }: Props) {
  const awaitedSearchParams = await searchParams
  const today = new Date()
  const currentMonthStr = typeof awaitedSearchParams.month === 'string' ? awaitedSearchParams.month : format(today, 'yyyy-MM')
  
  // Validate month string format
  let dateObj = today
  try {
    dateObj = parse(currentMonthStr, 'yyyy-MM', new Date())
  } catch (e) {
    dateObj = today
  }
  
  const currentMonth = format(dateObj, 'yyyy-MM')
  const prevMonth = format(subMonths(dateObj, 1), 'yyyy-MM')
  const nextMonth = format(addMonths(dateObj, 1), 'yyyy-MM')
  
  // Parallel Data Fetching
  const [budget, expenses, incomes, assets, liabilities] = await Promise.all([
    getBudget(currentMonth),
    getExpenses(currentMonth),
    getIncomes(currentMonth),
    getAssets(),
    getLiabilities(),
  ])

  // Calculate Daily Budget Status
  const daysInMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate()
  const dailyFlexibleBudget = (budget?.flexibleBudget || 0) / daysInMonth
  
  // Filter today's flexible expenses (only if viewing current month)
  const isCurrentMonth = currentMonth === format(today, 'yyyy-MM')
  const todayStr = format(today, 'yyyy-MM-dd')
  
  const todayFlexibleSpent = expenses
    .filter(e => 
      format(e.date, 'yyyy-MM-dd') === todayStr && 
      e.categoryL2 === 'Flexible'
    )
    .reduce((sum, e) => sum + e.amount, 0)
    
  const remainingDailyBudget = isCurrentMonth 
    ? Math.max(0, dailyFlexibleBudget - todayFlexibleSpent)
    : 0 // Or strictly speaking, daily budget doesn't make sense for past/future months in the same way, but let's keep it simple or maybe hide DailyAction for non-current months?
        // Actually, for past months, "Daily Budget" isn't very useful. But let's leave it as is for now, maybe just 0.

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

      {/* 1. Daily Action (Focus Mode) - Only show for current month or maybe always show but it records for the *selected* month? 
          Actually DailyAction usually records for "today". 
          If I select last month, and add an expense, should it be for last month's date?
          The DailyAction component might rely on "today". Let's check DailyAction later. 
          For now, let's keep it visible.
      */}
      {isCurrentMonth && (
        <section className="max-w-md mx-auto relative z-10">
          <DailyAction dailyBudget={remainingDailyBudget} month={currentMonth} />
        </section>
      )}

      {/* 2. Monthly Dashboard */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-display font-bold text-min-text">
              Monthly Quest
            </h2>
            <div className="h-px bg-gray-200 w-12" />
          </div>
          
          <div className="flex items-center gap-2 bg-white rounded-full shadow-sm border border-gray-100 p-1">
            <Link 
              href={`/?month=${prevMonth}`}
              className="p-2 hover:bg-gray-50 rounded-full text-min-muted hover:text-min-primary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <span className="font-display font-bold text-min-text px-2 min-w-[100px] text-center">
              {format(dateObj, 'MMM yyyy')}
            </span>
            <Link 
              href={`/?month=${nextMonth}`}
              className="p-2 hover:bg-gray-50 rounded-full text-min-muted hover:text-min-primary transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
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
