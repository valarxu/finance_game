'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// --- Income ---
export async function addIncome(data: { amount: number; date: Date; description?: string }) {
  await prisma.income.create({
    data: {
      amount: data.amount,
      date: data.date,
      description: data.description,
    },
  })
  revalidatePath('/')
}

export async function getIncomes(month: string) {
  // month format YYYY-MM
  const startDate = new Date(`${month}-01`)
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
  
  return await prisma.income.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'desc' },
  })
}

// --- Budget ---
export async function setBudget(month: string, fixed: number, flexible: number) {
  await prisma.budget.upsert({
    where: { month },
    update: { fixedBudget: fixed, flexibleBudget: flexible },
    create: { month, fixedBudget: fixed, flexibleBudget: flexible },
  })
  revalidatePath('/')
}

export async function getBudget(month: string) {
  return await prisma.budget.findUnique({
    where: { month },
  })
}

// --- Expense ---
export async function addExpense(data: {
  amount: number
  date: Date
  description?: string
  categoryL1: string
  categoryL2: string
}) {
  await prisma.expense.create({
    data: {
      amount: data.amount,
      date: data.date,
      description: data.description,
      categoryL1: data.categoryL1,
      categoryL2: data.categoryL2,
    },
  })
  revalidatePath('/')
}

export async function getExpenses(month: string) {
  const startDate = new Date(`${month}-01`)
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

  return await prisma.expense.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'desc' },
  })
}

export async function getDailyExpenses(date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return await prisma.expense.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  })
}

// --- Asset & Liability ---
export async function addAsset(name: string, amount: number) {
  await prisma.$transaction(async (tx) => {
    const asset = await tx.asset.create({ data: { name, amount } })
    await tx.assetHistory.create({
      data: { assetId: asset.id, amount: asset.amount }
    })
  })
  revalidatePath('/')
}

export async function updateAsset(id: number, name: string, amount: number) {
  await prisma.$transaction(async (tx) => {
    const asset = await tx.asset.update({
      where: { id },
      data: { name, amount },
    })
    await tx.assetHistory.create({
      data: { assetId: asset.id, amount: asset.amount }
    })
  })
  revalidatePath('/')
}

export async function deleteAsset(id: number) {
  await prisma.asset.delete({ where: { id } })
  revalidatePath('/')
}

export async function getAssets() {
  return await prisma.asset.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function addLiability(name: string, amount: number, interestRate: number) {
  await prisma.$transaction(async (tx) => {
    const liability = await tx.liability.create({ data: { name, amount, interestRate } })
    await tx.liabilityHistory.create({
      data: { liabilityId: liability.id, amount: liability.amount }
    })
  })
  revalidatePath('/')
}

export async function updateLiability(id: number, name: string, amount: number, interestRate: number) {
  await prisma.$transaction(async (tx) => {
    const liability = await tx.liability.update({
      where: { id },
      data: { name, amount, interestRate },
    })
    await tx.liabilityHistory.create({
      data: { liabilityId: liability.id, amount: liability.amount }
    })
  })
  revalidatePath('/')
}

export async function deleteLiability(id: number) {
  await prisma.liability.delete({ where: { id } })
  revalidatePath('/')
}

export async function getLiabilities() {
  return await prisma.liability.findMany({ orderBy: { createdAt: 'desc' } })
}
