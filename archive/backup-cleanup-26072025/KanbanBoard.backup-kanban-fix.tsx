import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { EventStatus, KANBAN_COLUMNS, canTransitionTo } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import EventCard from '@/components/events/EventCard'
import Button from '@/components/ui/Button'

interface KanbanBoardProps {
  events: any[]
  onEventStatusChange: (eventId: string, newStatus: EventStatus) => void
  onEventEdit?: (event: any) => void
  onEventDelete?: (event: any) => void
  onCreateEvent?: (status: EventStatus) => void
  showCreateButtons?: boolean
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  events,
  onEventStatusChange,
  onEventEdit,
  onEventDelete,
  onCreateEvent,
  showCreateButtons = true
}) => {
  const [draggedEvent, setDraggedEvent] = useState<any>(null)
  const [dragOverColumn, setDragOverColumn] = useState<EventStatus | null>(null)

  const handleDragStart = (event: any) => {
    setDraggedEvent(event)
  }

  const handleDragEnd = () => {
    setDraggedEvent(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnStatus: EventStatus) => {
    e.preventDefault()
    if (draggedEvent && canTransitionTo(draggedEvent.status, columnStatus)) {
      setDragOverColumn(columnStatus)
    }
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, columnStatus: EventStatus) => {
    e.preventDefault()
    if (draggedEvent && canTransitionTo(draggedEvent.status, columnStatus)) {
      onEventStatusChange(draggedEvent.id, columnStatus)
    }
    setDraggedEvent(null)
    setDragOverColumn(null)
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {KANBAN_COLUMNS.filter(col => col.status !== EventStatus.CANCELLED).map((column) => {
        const columnEvents = events.filter(event => event.status === column.status)
        const isDropTarget = dragOverColumn === column.status

        return (
          <motion.div
            key={column.id}
            className={`
              flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4
              ${isDropTarget ? 'ring-2 ring-primary-500 bg-primary-50' : ''}
              transition-all duration-200
            `}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {/* Header de colonne */}
            <div className={`
              flex items-center justify-between p-3 rounded-lg mb-4
              ${column.headerColor}
            `}>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{column.emoji}</span>
                <h3 className={`font-semibold ${column.textColor}`}>
                  {column.title}
                </h3>
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${column.bgColor} ${column.textColor}
                `}>
                  {columnEvents.length}
                </span>
              </div>

              {showCreateButtons && onCreateEvent && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Plus className="w-3 h-3" />}
                  onClick={() => onCreateEvent(column.status)}
                  className="opacity-70 hover:opacity-100"
                />
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">
              {column.description}
            </p>

            {/* Cartes d'événements */}
            <div className="space-y-3 min-h-[200px]">
              <AnimatePresence>
                {columnEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <EventCard
                      event={event}
                      view="kanban"
                      onEdit={onEventEdit}
                      onDelete={onEventDelete}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedEvent?.id === event.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {columnEvents.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Aucun événement</p>
                  <p className="text-xs mt-1">{column.description}</p>
                </div>
              )}
            </div>

            {/* Zone de drop */}
            {isDropTarget && draggedEvent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 border-2 border-dashed border-primary-400 rounded-lg bg-primary-50"
              >
                <p className="text-sm text-primary-700 text-center">
                  Déplacer "{draggedEvent.title}" vers {column.title}
                </p>
              </motion.div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export default KanbanBoard