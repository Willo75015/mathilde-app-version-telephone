import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, X, Users } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface Florist {
  id: string
  name: string
  phone: string
  specialty?: string
}

interface FloristListProps {
  florists: Florist[]
  onCall: (phone: string) => void
  maxVisible?: number
  className?: string
}

const FloristList: React.FC<FloristListProps> = ({ 
  florists, 
  onCall, 
  maxVisible = 5,
  className = '' 
}) => {
  const [showModal, setShowModal] = useState(false)
  
  if (!florists || florists.length === 0) {
    return null
  }
  
  const visibleFlorists = florists.slice(0, maxVisible)
  const hiddenCount = florists.length - maxVisible
  
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {visibleFlorists.map((florist) => (
          <div
            key={florist.id}
            className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs"
          >
            <span className="font-medium">{florist.name}</span>
            <button
              onClick={() => onCall(florist.phone)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title={`Appeler ${florist.name}`}
            >
              <Phone className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {hiddenCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModal(true)}
            leftIcon={<Users className="w-3 h-3" />}
            className="text-xs px-2 py-1 h-auto"
          >
            +{hiddenCount} autres
          </Button>
        )}
      </div>
      
      {/* Modal avec tous les fleuristes */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Fleuristes assignés"
        size="md"
      >
        <div className="space-y-3">
          {florists.map((florist) => (
            <motion.div
              key={florist.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {florist.name}
                </h4>
                {florist.specialty && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {florist.specialty}
                  </p>
                )}
                <button
                  onClick={() => onCall(florist.phone)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {florist.phone}
                </button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Phone className="w-4 h-4" />}
                onClick={() => onCall(florist.phone)}
              >
                Appeler
              </Button>
            </motion.div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default FloristList