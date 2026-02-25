'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addAsset, addLiability, updateAsset, updateLiability, deleteAsset, deleteLiability } from '@/actions/finance'
import { MinimalCard, MinimalButton } from './ui/MinimalComponents'
import { TrendingUp, TrendingDown, Plus, Wallet, PiggyBank, Pencil, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BalanceSheetProps {
  assets: any[]
  liabilities: any[]
}

export function BalanceSheet({ assets, liabilities }: BalanceSheetProps) {
  const router = useRouter()
  const [showAssetForm, setShowAssetForm] = useState(false)
  const [showLiabilityForm, setShowLiabilityForm] = useState(false)

  // Asset Form
  const [editingAssetId, setEditingAssetId] = useState<number | null>(null)
  const [assetName, setAssetName] = useState('')
  const [assetAmount, setAssetAmount] = useState('')

  // Liability Form
  const [editingLiabilityId, setEditingLiabilityId] = useState<number | null>(null)
  const [liabilityName, setLiabilityName] = useState('')
  const [liabilityAmount, setLiabilityAmount] = useState('')
  const [liabilityRate, setLiabilityRate] = useState('')

  const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0)
  const netWorth = totalAssets - totalLiabilities

  // Asset Handlers
  const openAddAsset = () => {
    setEditingAssetId(null)
    setAssetName('')
    setAssetAmount('')
    setShowAssetForm(true)
  }

  const openEditAsset = (asset: any) => {
    setEditingAssetId(asset.id)
    setAssetName(asset.name)
    setAssetAmount(asset.amount.toString())
    setShowAssetForm(true)
  }

  const handleSaveAsset = async () => {
    if (!assetName || !assetAmount) return

    if (editingAssetId) {
      await updateAsset(editingAssetId, assetName, parseFloat(assetAmount))
    } else {
      await addAsset(assetName, parseFloat(assetAmount))
    }
    
    setAssetName('')
    setAssetAmount('')
    setShowAssetForm(false)
    setEditingAssetId(null)
    router.refresh()
  }

  const handleDeleteAsset = async (id: number) => {
    if (confirm('确定要删除这个资产吗？')) {
      await deleteAsset(id)
      router.refresh()
    }
  }

  // Liability Handlers
  const openAddLiability = () => {
    setEditingLiabilityId(null)
    setLiabilityName('')
    setLiabilityAmount('')
    setLiabilityRate('')
    setShowLiabilityForm(true)
  }

  const openEditLiability = (liab: any) => {
    setEditingLiabilityId(liab.id)
    setLiabilityName(liab.name)
    setLiabilityAmount(liab.amount.toString())
    setLiabilityRate(liab.interestRate?.toString() || '')
    setShowLiabilityForm(true)
  }

  const handleSaveLiability = async () => {
    if (!liabilityName || !liabilityAmount) return

    if (editingLiabilityId) {
      await updateLiability(
        editingLiabilityId,
        liabilityName, 
        parseFloat(liabilityAmount), 
        parseFloat(liabilityRate) || 0
      )
    } else {
      await addLiability(
        liabilityName, 
        parseFloat(liabilityAmount), 
        parseFloat(liabilityRate) || 0
      )
    }

    setLiabilityName('')
    setLiabilityAmount('')
    setLiabilityRate('')
    setShowLiabilityForm(false)
    setEditingLiabilityId(null)
    router.refresh()
  }

  const handleDeleteLiability = async (id: number) => {
    if (confirm('确定要删除这个负债吗？')) {
      await deleteLiability(id)
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Net Worth Banner */}
      <MinimalCard className="text-center py-10 relative overflow-hidden" color="highlight">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-min-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-min-secondary/5 rounded-full blur-3xl" />

        <h2 className="text-min-muted font-bold text-sm uppercase tracking-widest mb-4">总评分 (净值)</h2>
        
        <motion.div 
          key={netWorth}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-6xl font-display font-bold mb-4 ${netWorth >= 0 ? 'text-min-text' : 'text-min-danger'}`}
        >
          ¥{netWorth.toLocaleString()}
        </motion.div>

        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${
          netWorth > 0 ? 'bg-min-success/10 text-min-success' : 'bg-min-accent/10 text-min-accent'
        }`}>
          {netWorth > 0 ? (
            <>
              <TrendingUp size={16} /> 状态：传说
            </>
          ) : (
            <>
              <TrendingDown size={16} /> 状态：新手
            </>
          )}
        </div>
      </MinimalCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets Column */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="flex items-center gap-2 font-bold text-xl text-min-text">
              <div className="p-2 bg-green-50 rounded-lg text-min-success">
                <PiggyBank size={20} />
              </div>
              强化道具 (资产)
            </h3>
            <span className="font-bold text-min-success text-lg">¥{totalAssets.toLocaleString()}</span>
          </div>

          <MinimalCard className="min-h-[300px]" color="default">
            <button
              onClick={openAddAsset}
              className="w-full mb-4 py-3 border border-dashed border-gray-200 rounded-2xl text-min-muted font-bold hover:border-min-success hover:text-min-success hover:bg-green-50/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} /> 添加资产
            </button>

            <AnimatePresence>
              {showAssetForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 space-y-3 overflow-hidden p-4 bg-gray-50 rounded-2xl relative"
                >
                  <button onClick={() => setShowAssetForm(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                  <h4 className="text-sm font-bold text-min-text mb-2">{editingAssetId ? '编辑资产' : '新资产'}</h4>
                  <input
                    placeholder="资产名称"
                    value={assetName}
                    onChange={e => setAssetName(e.target.value)}
                    className="min-input w-full p-3 text-sm font-medium"
                  />
                  <input
                    type="number"
                    placeholder="价值"
                    value={assetAmount}
                    onChange={e => setAssetAmount(e.target.value)}
                    className="min-input w-full p-3 text-sm font-bold"
                  />
                  <MinimalButton variant="success" size="sm" onClick={handleSaveAsset} className="w-full mt-2">
                    {editingAssetId ? '更新资产' : '保存资产'}
                  </MinimalButton>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.id} className="group flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-min-success rounded-full" />
                    <span className="font-bold text-min-text">{asset.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-min-success">¥{asset.amount.toLocaleString()}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditAsset(asset)} className="text-min-muted hover:text-min-primary transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDeleteAsset(asset.id)} className="text-min-muted hover:text-min-danger transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </MinimalCard>
        </div>

        {/* Liabilities Column */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="flex items-center gap-2 font-bold text-xl text-min-text">
              <div className="p-2 bg-red-50 rounded-lg text-min-danger">
                <Wallet size={20} />
              </div>
              负面状态 (负债)
            </h3>
            <span className="font-bold text-min-danger text-lg">¥{totalLiabilities.toLocaleString()}</span>
          </div>

          <MinimalCard className="min-h-[300px]" color="default">
            <button
              onClick={openAddLiability}
              className="w-full mb-4 py-3 border border-dashed border-gray-200 rounded-2xl text-min-muted font-bold hover:border-min-danger hover:text-min-danger hover:bg-red-50/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} /> 添加负债
            </button>

            <AnimatePresence>
              {showLiabilityForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 space-y-3 overflow-hidden p-4 bg-gray-50 rounded-2xl relative"
                >
                  <button onClick={() => setShowLiabilityForm(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                  <h4 className="text-sm font-bold text-min-text mb-2">{editingLiabilityId ? '编辑债务' : '新债务'}</h4>
                  <input
                    placeholder="债务名称"
                    value={liabilityName}
                    onChange={e => setLiabilityName(e.target.value)}
                    className="min-input w-full p-3 text-sm font-medium"
                  />
                  <input
                    type="number"
                    placeholder="金额"
                    value={liabilityAmount}
                    onChange={e => setLiabilityAmount(e.target.value)}
                    className="min-input w-full p-3 text-sm font-bold"
                  />
                  <input
                    type="number"
                    placeholder="利率 %"
                    value={liabilityRate}
                    onChange={e => setLiabilityRate(e.target.value)}
                    className="min-input w-full p-3 text-sm font-medium"
                  />
                  <MinimalButton variant="danger" size="sm" onClick={handleSaveLiability} className="w-full mt-2">
                    {editingLiabilityId ? '更新债务' : '保存债务'}
                  </MinimalButton>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {liabilities.map((liab) => (
                <div key={liab.id} className="group p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-min-danger rounded-full" />
                      <span className="font-bold text-min-text">{liab.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-min-danger">¥{liab.amount.toLocaleString()}</span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditLiability(liab)} className="text-min-muted hover:text-min-primary transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDeleteLiability(liab.id)} className="text-min-muted hover:text-min-danger transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {liab.interestRate > 0 && (
                    <div className="ml-5 text-xs text-min-muted font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                      {liab.interestRate}% 利息
                    </div>
                  )}
                </div>
              ))}
            </div>
          </MinimalCard>
        </div>
      </div>
    </div>
  )
}
