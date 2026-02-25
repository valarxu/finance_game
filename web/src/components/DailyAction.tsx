'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addExpense, addIncome, transferFunds } from '@/actions/finance'
import { MinimalCard, MinimalButton } from './ui/MinimalComponents'
import { CheckCircle, Coffee, Heart, Smile, Zap, CreditCard, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Asset {
  id: number
  name: string
  amount: number
}

interface Liability {
  id: number
  name: string
  amount: number
}

interface DailyActionProps {
  dailyBudget: number
  month: string
  assets: Asset[]
  liabilities: Liability[]
}

type TabType = 'expense' | 'income' | 'transfer'

export function DailyAction({ dailyBudget, month, assets, liabilities }: DailyActionProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('expense')
  
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  
  // Expense State
  const [categoryL1, setCategoryL1] = useState('Survival')
  const [categoryL2, setCategoryL2] = useState('Flexible')
  const [expenseAccountId, setExpenseAccountId] = useState<string>('')
  const [expenseAccountType, setExpenseAccountType] = useState<'Asset' | 'Liability'>('Asset')

  // Income State
  const [incomeAssetId, setIncomeAssetId] = useState<string>('')

  // Transfer State
  const [fromId, setFromId] = useState<string>('')
  const [fromType, setFromType] = useState<'Asset' | 'Liability'>('Asset')
  const [toId, setToId] = useState<string>('')
  const [toType, setToType] = useState<'Asset' | 'Liability'>('Asset')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return
    setIsSubmitting(true)

    const numAmount = parseFloat(amount)
    const date = new Date()

    try {
      if (activeTab === 'expense') {
        await addExpense({
          amount: numAmount,
          date,
          description,
          categoryL1,
          categoryL2,
          accountId: expenseAccountId ? parseInt(expenseAccountId) : undefined,
          accountType: expenseAccountId ? expenseAccountType : undefined,
        })
      } else if (activeTab === 'income') {
        await addIncome({
          amount: numAmount,
          date,
          description,
          assetId: incomeAssetId ? parseInt(incomeAssetId) : undefined,
        })
      } else if (activeTab === 'transfer') {
        if (!fromId || !toId) {
          alert('请选择转出和转入账户')
          setIsSubmitting(false)
          return
        }
        await transferFunds({
          amount: numAmount,
          date,
          fromId: parseInt(fromId),
          fromType,
          toId: parseInt(toId),
          toType,
          description,
        })
      }

      setIsSubmitting(false)
      setAmount('')
      setDescription('')
      setShowSuccess(true)
      router.refresh()
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error(error)
      setIsSubmitting(false)
      alert('操作失败，请重试')
    }
  }

  const categories = [
    { name: 'Survival', icon: Zap, label: '生存', color: 'bg-min-danger', text: 'text-min-danger', shadow: 'shadow-min-danger/30' },
    { name: 'Social', icon: Heart, label: '社交', color: 'bg-min-accent', text: 'text-min-accent', shadow: 'shadow-min-accent/30' },
    { name: 'Enjoyment', icon: Smile, label: '享受', color: 'bg-min-secondary', text: 'text-min-secondary', shadow: 'shadow-min-secondary/30' },
    { name: 'Development', icon: Coffee, label: '成长', color: 'bg-min-success', text: 'text-min-success', shadow: 'shadow-min-success/30' },
  ]

  return (
    <MinimalCard className="w-full relative overflow-hidden" color="pink">
      {/* Subtle Background Circle */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-min-pink/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Tabs */}
      <div className="mb-8 relative z-10">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-sm font-bold text-min-pink uppercase tracking-wider mb-1">每日任务</h2>
            <div className="text-4xl font-display font-bold text-min-text">
              {activeTab === 'expense' ? '今日战利品' : activeTab === 'income' ? '收获满满' : '资产调配'}
            </div>
          </div>
          <div className="text-right">
            <span className="block text-xs text-min-muted font-bold mb-1">HP (预算)</span>
            <span className="text-3xl font-bold text-min-pink">¥{dailyBudget.toFixed(0)}</span>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(['expense', 'income', 'transfer'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-white text-min-text shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'expense' && <span className="flex items-center justify-center gap-2"><TrendingDown size={16}/> 支出</span>}
              {tab === 'income' && <span className="flex items-center justify-center gap-2"><TrendingUp size={16}/> 收入</span>}
              {tab === 'transfer' && <span className="flex items-center justify-center gap-2"><ArrowRightLeft size={16}/> 转账</span>}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
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

        {/* Expense Specific Fields */}
        {activeTab === 'expense' && (
          <div className="space-y-6">
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
                  {type === 'Flexible' ? '灵活 (享乐)' : '固定 (必须)'}
                </button>
              ))}
            </div>

            {/* Account Selector */}
            <div>
              <label className="block text-xs font-bold text-min-muted mb-2 uppercase">支付账户</label>
              <select
                value={expenseAccountId}
                onChange={(e) => {
                  setExpenseAccountId(e.target.value)
                  const selectedOption = e.target.selectedOptions[0]
                  setExpenseAccountType(selectedOption.getAttribute('data-type') as 'Asset' | 'Liability')
                }}
                className="w-full p-3 bg-gray-50 rounded-xl text-min-text font-bold outline-none focus:ring-2 focus:ring-min-pink/20"
              >
                <option value="">选择账户 (可选)</option>
                <optgroup label="资产 (余额减少)">
                  {assets.map(a => (
                    <option key={`asset-${a.id}`} value={a.id} data-type="Asset">{a.name} (¥{a.amount})</option>
                  ))}
                </optgroup>
                <optgroup label="负债 (欠款增加)">
                  {liabilities.map(l => (
                    <option key={`liability-${l.id}`} value={l.id} data-type="Liability">{l.name} (¥{l.amount})</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        )}

        {/* Income Specific Fields */}
        {activeTab === 'income' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-min-muted mb-2 uppercase">存入账户</label>
              <select
                value={incomeAssetId}
                onChange={(e) => setIncomeAssetId(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl text-min-text font-bold outline-none focus:ring-2 focus:ring-min-pink/20"
              >
                <option value="">选择账户 (可选)</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} (¥{a.amount})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Transfer Specific Fields */}
        {activeTab === 'transfer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-min-muted mb-2 uppercase">从 (转出)</label>
                <select
                  value={fromId}
                  onChange={(e) => {
                    setFromId(e.target.value)
                    const selectedOption = e.target.selectedOptions[0]
                    setFromType(selectedOption.getAttribute('data-type') as 'Asset' | 'Liability')
                  }}
                  className="w-full p-3 bg-gray-50 rounded-xl text-min-text font-bold outline-none focus:ring-2 focus:ring-min-pink/20 text-sm"
                >
                  <option value="">选择账户</option>
                  <optgroup label="资产">
                    {assets.map(a => (
                      <option key={`asset-${a.id}`} value={a.id} data-type="Asset">{a.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="负债">
                    {liabilities.map(l => (
                      <option key={`liability-${l.id}`} value={l.id} data-type="Liability">{l.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-min-muted mb-2 uppercase">到 (转入)</label>
                <select
                  value={toId}
                  onChange={(e) => {
                    setToId(e.target.value)
                    const selectedOption = e.target.selectedOptions[0]
                    setToType(selectedOption.getAttribute('data-type') as 'Asset' | 'Liability')
                  }}
                  className="w-full p-3 bg-gray-50 rounded-xl text-min-text font-bold outline-none focus:ring-2 focus:ring-min-pink/20 text-sm"
                >
                  <option value="">选择账户</option>
                  <optgroup label="资产">
                    {assets.map(a => (
                      <option key={`asset-${a.id}`} value={a.id} data-type="Asset">{a.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="负债">
                    {liabilities.map(l => (
                      <option key={`liability-${l.id}`} value={l.id} data-type="Liability">{l.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="relative">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="添加备注..."
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
          {isSubmitting ? '处理中...' : '确认操作'} <CreditCard size={18} />
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
              <h3 className="text-2xl font-bold text-min-text mb-1">操作成功！</h3>
              <p className="text-min-muted">
                {activeTab === 'expense' ? '保持好习惯。' : activeTab === 'income' ? '继续加油！' : '资产已更新。'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MinimalCard>
  )
}
