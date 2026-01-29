'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addExpense } from '@/actions/finance'
import { MinimalCard, MinimalButton } from './ui/MinimalComponents'
import { CheckCircle, Coffee, Heart, Smile, Zap, CreditCard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DailyActionProps {
  dailyBudget: number
  month: string
}

export function DailyAction({ dailyBudget, month }: DailyActionProps) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryL1, setCategoryL1] = useState('Survival')
  const [categoryL2, setCategoryL2] = useState('Flexible')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return
    setIsSubmitting(true)

    await addExpense({
      amount: parseFloat(amount),
      date: new Date(),
      description,
      categoryL1,
      categoryL2,
    })

    setIsSubmitting(false)
    setAmount('')
    setDescription('')
    setShowSuccess(true)
    router.refresh()
    setTimeout(() => setShowSuccess(false), 2000)
  }

  const categories = [
    { name: 'Survival', icon: Zap, label: 'Survival', color: 'bg-min-danger', text: 'text-min-danger', shadow: 'shadow-min-danger/30' },
    { name: 'Social', icon: Heart, label: 'Social', color: 'bg-min-accent', text: 'text-min-accent', shadow: 'shadow-min-accent/30' },
    { name: 'Enjoyment', icon: Smile, label: 'Enjoy', color: 'bg-min-secondary', text: 'text-min-secondary', shadow: 'shadow-min-secondary/30' },
    { name: 'Development', icon: Coffee, label: 'Growth', color: 'bg-min-success', text: 'text-min-success', shadow: 'shadow-min-success/30' },
  ]

  return (
    <MinimalCard className="w-full relative overflow-hidden" color="pink">
      {/* Subtle Background Circle */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-min-pink/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h2 className="text-sm font-bold text-min-pink uppercase tracking-wider mb-1">Daily Quest</h2>
          <div className="text-4xl font-display font-bold text-min-text">
            Today's Loot
          </div>
        </div>
        <div className="text-right">
          <span className="block text-xs text-min-muted font-bold mb-1">HP (BUDGET)</span>
          <span className="text-3xl font-bold text-min-pink">¥{dailyBudget.toFixed(0)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        {/* Amount Input */}
        <div className="relative group">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-min-muted font-bold">¥</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="min-input w-full pl-12 pr-6 py-6 text-5xl font-bold text-min-text bg-white shadow-sm focus:shadow-md transition-all placeholder:text-gray-200"
          />
        </div>

        {/* Level 1 Category */}
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setCategoryL1(cat.name)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 ${
                categoryL1 === cat.name
                  ? `${cat.color} text-white shadow-lg ${cat.shadow} scale-105`
                  : `bg-gray-50 ${cat.text} hover:bg-white hover:shadow-md`
              }`}
            >
              <cat.icon size={24} className="mb-2" />
              <span className="text-xs font-bold">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Level 2 Category */}
        <div className="flex p-1 bg-gray-100 rounded-full">
          {['Flexible', 'Fixed'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCategoryL2(type)}
              className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-200 ${
                categoryL2 === type
                  ? 'bg-white text-min-text shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {type === 'Flexible' ? 'Flexible (Fun)' : 'Fixed (Must)'}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="relative">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a note..."
            className="w-full px-0 py-3 bg-transparent border-b-2 border-gray-100 focus:border-min-pink outline-none text-lg transition-colors placeholder:text-gray-300"
          />
        </div>

        <MinimalButton 
          type="submit" 
          variant="primary" 
          size="lg" 
          className="w-full bg-min-pink shadow-min-pink/30 hover:bg-pink-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Track Expense'} <CreditCard size={18} />
        </MinimalButton>
      </form>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-20"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-min-text mb-1">Recorded!</h3>
              <p className="text-min-muted">Keep up the good habits.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MinimalCard>
  )
}
