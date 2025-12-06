import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'

interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
  disabled?: boolean
}

interface AccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  defaultOpen?: string[]
  className?: string
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className
}) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen)
  
  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      if (allowMultiple) {
        return prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      } else {
        return prev.includes(id) ? [] : [id]
      }
    })
  }
  
  return (
    <div className={clsx('space-y-2', className)}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id)
        
        return (
          <div
            key={item.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <motion.button
              onClick={() => !item.disabled && toggleItem(item.id)}
              className={clsx(
                'w-full px-4 py-3 text-left flex items-center justify-between',
                'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
              whileHover={!item.disabled ? { backgroundColor: 'rgba(0,0,0,0.05)' } : {}}
              disabled={item.disabled}
            >
              <span className="font-medium text-gray-900 dark:text-white">
                {item.title}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export default Accordion