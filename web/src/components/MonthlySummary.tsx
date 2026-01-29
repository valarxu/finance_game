'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setBudget, addIncome } from '@/actions/finance'
import { MinimalCard, MinimalButton } from './ui/MinimalComponents'
import { format, getDaysInMonth, startOfMonth, addDays, isSameDay, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Settings, TrendingUp, Calendar as CalendarIcon, Wallet, Shield, Sword } from 'lucide-react'

interface MonthlySummaryProps {
  month: string // YYYY-MM
  budget: { fixedBudget: number; flexibleBudget: number } | null
  incomes: any[]
  expenses: any[]
}

export function MonthlySummary({ month, budget, incomes, expenses }: MonthlySummaryProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  // Budget Form State
  const [fixedBudget, setFixedBudget] = useState(budget?.fixedBudget || 0)
  const [flexibleBudget, setFlexibleBudget] = useState(budget?.flexibleBudget || 0)

  // Income Form State
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeDesc, setIncomeDesc] = useState('')

  const router = useRouter()

  const handleSaveBudget = async () => {
    await setBudget(month, Number(fixedBudget), Number(flexibleBudget))
    setShowSettings(false)
    router.refresh()
  }

  const handleAddIncome = async () => {
    if (!incomeAmount) return
    await addIncome({
      amount: parseFloat(incomeAmount),
      date: new Date(), // Defaults to today, could be month-based
      description: incomeDesc,
    })
    setIncomeAmount('')
    setIncomeDesc('')
    setShowIncomeForm(false)
    router.refresh()
  }

  // Calendar Logic
  const startDate = parseISO(`${month}-01`)
  const daysInMonth = getDaysInMonth(startDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => addDays(startDate, i))

  const dailyFlexibleLimit = (budget?.flexibleBudget || 0) / daysInMonth
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
  const totalBudget = (budget?.fixedBudget || 0) + (budget?.flexibleBudget || 0)
  const fixedSpent = expenses.filter(e => e.categoryL2 === 'Fixed').reduce((sum, e) => sum + e.amount, 0)
  const flexibleSpent = expenses.filter(e => e.categoryL2 === 'Flexible').reduce((sum, e) => sum + e.amount, 0)

  const getDayStatus = (day: Date) => {
    const dayExpenses = expenses.filter(
      (e) => isSameDay(new Date(e.date), day) && e.categoryL2 === 'Flexible'
    )
    const totalSpent = dayExpenses.reduce((sum, e) => sum + e.amount, 0)
    
    if (totalSpent === 0) return 'neutral'
    return totalSpent > dailyFlexibleLimit ? 'danger' : 'success'
  }

  const getDayDetails = (day: Date) => {
    return expenses.filter((e) => isSameDay(new Date(e.date), day))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Survival': return 'bg-min-danger'
      case 'Social': return 'bg-min-accent'
      case 'Enjoyment': return 'bg-min-secondary'
      case 'Development': return 'bg-min-success'
      default: return 'bg-min-muted'
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MinimalCard className="p-4 flex items-center gap-4" color="highlight">
          <div className="p-3 bg-min-accent/10 rounded-full text-min-accent">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-min-muted uppercase">Loot Stash</p>
            <p className="text-2xl font-bold text-min-text">¥{totalIncome.toLocaleString()}</p>
          </div>
        </MinimalCard>

        <MinimalCard className="p-4 flex items-center gap-4" color="default">
          <div className="p-3 bg-min-primary/10 rounded-full text-min-primary">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-min-muted uppercase">Campaign Funds</p>
            <p className="text-2xl font-bold text-min-text">¥{totalBudget.toLocaleString()}</p>
          </div>
        </MinimalCard>

        <MinimalCard className="p-4 flex items-center gap-4" color="default">
          <div className="p-3 bg-min-secondary/10 rounded-full text-min-secondary">
            <Sword size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-min-muted uppercase">Quest Spent</p>
            <p className="text-2xl font-bold text-min-text">¥{(fixedSpent + flexibleSpent).toLocaleString()}</p>
          </div>
        </MinimalCard>
        
        <div className="flex gap-2">
           <button 
             onClick={() => setShowSettings(true)}
             className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-min-muted hover:text-min-primary hover:border-min-primary transition-colors"
           >
             <Settings size={20} className="mb-1" />
             <span className="text-xs font-bold">Config</span>
           </button>
           <button 
             onClick={() => setShowIncomeForm(true)}
             className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-min-muted hover:text-min-success hover:border-min-success transition-colors"
           >
             <Plus size={20} className="mb-1" />
             <span className="text-xs font-bold">Income</span>
           </button>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MinimalCard color="secondary">
           <div className="flex justify-between items-center mb-2">
             <span className="font-bold text-min-secondary flex items-center gap-2"><Shield size={16} /> Rigid Shield (Fixed)</span>
             <span className="text-xs font-bold text-min-muted">{((fixedSpent / (budget?.fixedBudget || 1)) * 100).toFixed(0)}%</span>
           </div>
           <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
             <div 
               className="h-full bg-min-secondary rounded-full transition-all duration-500"
               style={{ width: `${Math.min(100, (fixedSpent / (budget?.fixedBudget || 1)) * 100)}%` }}
             />
           </div>
           <div className="flex justify-between mt-1 text-xs text-min-muted font-medium">
             <span>¥{fixedSpent} used</span>
             <span>¥{budget?.fixedBudget} max</span>
           </div>
        </MinimalCard>

        <MinimalCard color="success">
           <div className="flex justify-between items-center mb-2">
             <span className="font-bold text-min-success flex items-center gap-2"><Sword size={16} /> Elastic Sword (Flexible)</span>
             <span className="text-xs font-bold text-min-muted">{((flexibleSpent / (budget?.flexibleBudget || 1)) * 100).toFixed(0)}%</span>
           </div>
           <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
             <div 
               className="h-full bg-min-success rounded-full transition-all duration-500"
               style={{ width: `${Math.min(100, (flexibleSpent / (budget?.flexibleBudget || 1)) * 100)}%` }}
             />
           </div>
           <div className="flex justify-between mt-1 text-xs text-min-muted font-medium">
             <span>¥{flexibleSpent} used</span>
             <span>¥{budget?.flexibleBudget} max</span>
           </div>
        </MinimalCard>
      </div>

      {/* Forms Modal/Overlay (Simplified inline for minimal look) */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <MinimalCard className="w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Budget Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-min-muted uppercase">Fixed Budget</label>
                  <input
                    type="number"
                    value={fixedBudget}
                    onChange={(e) => setFixedBudget(Number(e.target.value))}
                    className="min-input w-full p-3 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-min-muted uppercase">Flexible Budget</label>
                  <input
                    type="number"
                    value={flexibleBudget}
                    onChange={(e) => setFlexibleBudget(Number(e.target.value))}
                    className="min-input w-full p-3 mt-1"
                  />
                </div>
                <div className="flex gap-2 mt-6">
                  <MinimalButton variant="ghost" onClick={() => setShowSettings(false)} className="flex-1">Cancel</MinimalButton>
                  <MinimalButton onClick={handleSaveBudget} className="flex-1">Save Changes</MinimalButton>
                </div>
              </div>
           </MinimalCard>
        </div>
      )}

      {showIncomeForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <MinimalCard className="w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Add Income</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-min-muted uppercase">Amount</label>
                  <input
                    type="number"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    className="min-input w-full p-3 mt-1"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-min-muted uppercase">Source</label>
                  <input
                    type="text"
                    value={incomeDesc}
                    onChange={(e) => setIncomeDesc(e.target.value)}
                    className="min-input w-full p-3 mt-1"
                    placeholder="e.g. Salary"
                  />
                </div>
                <div className="flex gap-2 mt-6">
                  <MinimalButton variant="ghost" onClick={() => setShowIncomeForm(false)} className="flex-1">Cancel</MinimalButton>
                  <MinimalButton variant="success" onClick={handleAddIncome} className="flex-1">Add Income</MinimalButton>
                </div>
              </div>
           </MinimalCard>
        </div>
      )}

      {/* Calendar */}
      <MinimalCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="font-bold text-xl text-min-text">Adventure Map</h2>
            <p className="text-sm text-min-muted">Click a day to view your loot details</p>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-xs font-bold text-min-muted mb-2 uppercase tracking-wide">
              {d}
            </div>
          ))}
          {days.map((day) => {
            const status = getDayStatus(day)
            const isToday = isSameDay(day, new Date())
            const isSelected = selectedDay && isSameDay(day, selectedDay)
            
            return (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(day)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-bold relative transition-all duration-200
                  ${status === 'success' ? 'bg-min-success/10 text-min-success hover:bg-min-success/20' : ''}
                  ${status === 'danger' ? 'bg-min-danger/10 text-min-danger hover:bg-min-danger/20' : ''}
                  ${status === 'neutral' ? 'bg-gray-50 text-gray-400 hover:bg-gray-100' : ''}
                  ${isSelected ? 'ring-2 ring-min-primary ring-offset-2' : ''}
                `}
              >
                <span>{format(day, 'd')}</span>
                {isToday && <div className="w-1.5 h-1.5 bg-min-primary rounded-full mt-1" />}
              </motion.button>
            )
          })}
        </div>

        {/* Day Details Popup/Panel */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 border-t border-gray-100 pt-6"
            >
              <h4 className="font-bold text-min-text mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-min-primary rounded-full"></span>
                Activity Log: {format(selectedDay, 'MMM d, yyyy')}
              </h4>
              <div className="space-y-3">
                {getDayDetails(selectedDay).length === 0 ? (
                  <p className="text-sm text-min-muted italic pl-3">No activity recorded for this day.</p>
                ) : (
                  getDayDetails(selectedDay).map((e) => (
                    <div key={e.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(e.categoryL1)}`} />
                        <span className="font-medium text-min-text">{e.description || e.categoryL1}</span>
                      </div>
                      <span className="font-bold text-min-text">-¥{e.amount}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </MinimalCard>
    </div>
  )
}
