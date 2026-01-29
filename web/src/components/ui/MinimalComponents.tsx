import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'
import React from 'react'

interface MinimalCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  color?: 'default' | 'primary' | 'secondary' | 'accent' | 'highlight' | 'pink' | 'orange' | 'success'
}

export function MinimalCard({ children, className, color = 'default', ...props }: MinimalCardProps) {
  // Using soft gradients or solid colors for minimal look
  const bgColors = {
    default: 'bg-white',
    primary: 'bg-white border-l-4 border-l-min-primary',
    secondary: 'bg-white border-l-4 border-l-min-secondary',
    accent: 'bg-white border-l-4 border-l-min-accent',
    highlight: 'bg-gradient-to-br from-min-purple/5 to-min-purple/10 border-none',
    pink: 'bg-gradient-to-br from-min-pink/5 to-min-pink/10 border-none',
    orange: 'bg-gradient-to-br from-min-accent/5 to-min-accent/10 border-none',
    success: 'bg-white border-l-4 border-l-min-success',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('min-card p-6 md:p-8', bgColors[color], className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface MinimalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function MinimalButton({ children, className, variant = 'primary', size = 'md', ...props }: MinimalButtonProps) {
  const variants = {
    primary: 'bg-min-primary text-white shadow-lg shadow-min-primary/30',
    secondary: 'bg-min-secondary text-white shadow-lg shadow-min-secondary/30',
    danger: 'bg-min-danger text-white shadow-lg shadow-min-danger/30',
    success: 'bg-min-success text-white shadow-lg shadow-min-success/30',
    outline: 'bg-transparent border border-gray-200 text-min-text hover:bg-gray-50',
    ghost: 'bg-transparent text-min-text hover:bg-gray-100 shadow-none',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      className={cn(
        'min-btn flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
