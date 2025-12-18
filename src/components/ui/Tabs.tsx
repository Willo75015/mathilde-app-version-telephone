import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface Tab {
  id: string
  label: string
  content?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  activeTab?: string
  onChange?: (tabId: string) => void
  className?: string
  variant?: 'default' | 'pills' | 'underline'
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  className,
  variant = 'default'
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id)

  // Support controlled and uncontrolled modes
  const activeTab = controlledActiveTab ?? internalActiveTab
  const setActiveTab = onChange ?? setInternalActiveTab

  const currentTab = tabs.find(tab => tab.id === activeTab)
  
  const tabVariants = {
    default: {
      base: 'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
      active: 'border-primary-500 text-primary-600 dark:text-primary-400',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
    },
    pills: {
      base: 'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
      active: 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300',
      inactive: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
    },
    underline: {
      base: 'px-1 py-2 text-sm font-medium border-b-2 transition-colors',
      active: 'border-primary-500 text-primary-600 dark:text-primary-400',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
    }
  }
  
  return (
    <div className={clsx('w-full', className)}>
      {/* Tab Navigation */}
      <div className={clsx(
        'flex space-x-1',
        variant === 'default' && 'border-b border-gray-200 dark:border-gray-700',
        variant === 'underline' && 'border-b border-gray-200 dark:border-gray-700'
      )}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <motion.button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              className={clsx(
                tabVariants[variant].base,
                activeTab === tab.id
                  ? tabVariants[variant].active
                  : tabVariants[variant].inactive,
                tab.disabled && 'opacity-50 cursor-not-allowed',
                'flex items-center gap-2'
              )}
              whileHover={!tab.disabled ? { scale: 1.02 } : {}}
              whileTap={!tab.disabled ? { scale: 0.98 } : {}}
              disabled={tab.disabled}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
            </motion.button>
          )
        })}
      </div>
      
      {/* Tab Content - Only render if content is provided */}
      {currentTab?.content && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4"
        >
          {currentTab.content}
        </motion.div>
      )}
    </div>
  )
}

export default Tabs