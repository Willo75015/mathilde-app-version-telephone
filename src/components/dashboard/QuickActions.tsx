import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, Users, Flower, BarChart3, Settings } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface QuickActionsProps {
  navigate?: (page: string, params?: any) => void
  onCreateClient?: () => void
  onCreateEvent?: () => void
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  navigate, 
  onCreateClient, 
  onCreateEvent 
}) => {
  const handleAction = (actionType: string) => {
    console.log('🎯 Action du dashboard:', actionType)
    
    switch (actionType) {
      case 'new-event':
        if (onCreateEvent) {
          onCreateEvent()
        } else if (navigate) {
          navigate('events/create')
        } else {
          window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'events/create' } }))
        }
        break
        
      case 'new-client':
        if (onCreateClient) {
          onCreateClient()
        } else if (navigate) {
          navigate('clients/create')
        } else {
          window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'clients/create' } }))
        }
        break
        
      case 'flowers':
        if (navigate) {
          navigate('flowers')
        } else {
          window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'flowers' } }))
        }
        break
        
      case 'analytics':
        if (navigate) {
          navigate('analytics')
        } else {
          window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'analytics' } }))
        }
        break
        
      default:
        console.log('Action non reconnue:', actionType)
    }
  }

  const actions = [
    {
      title: 'Nouvel événement',
      description: 'Créer un événement',
      icon: Calendar,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: 'new-event'
    },
    {
      title: 'Nouveau client',
      description: 'Ajouter un client',
      icon: Users,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      action: 'new-client'
    },
    {
      title: 'Catalogue fleurs',
      description: 'Gérer les fleurs',
      icon: Flower,
      color: 'bg-rose-500 hover:bg-rose-600',
      action: 'flowers'
    },
    {
      title: 'Voir statistiques',
      description: 'Analytics & rapports',
      icon: BarChart3,
      color: 'bg-amber-500 hover:bg-amber-600',
      action: 'analytics'
    }
  ]
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Actions rapides</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <motion.button
              key={action.title}
              type="button"
              onClick={() => handleAction(action.action)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                ${action.color} text-white rounded-lg p-4 
                transition-all duration-200 shadow-lg hover:shadow-xl
                block w-full text-left border-none cursor-pointer
              `}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {action.title}
                  </p>
                  <p className="text-sm opacity-90 truncate">
                    {action.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
        
        {/* Action principale */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button 
            className="w-full" 
            size="lg"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Créer un nouvel événement
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuickActions