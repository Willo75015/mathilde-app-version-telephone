import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Flower, Plus, Minus } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Flower as FlowerType, FlowerCategory, Season } from '@/types'

interface FlowerSelectorProps {
  selectedFlowers: string[]
  onSelectionChange: (flowerIds: string[]) => void
}

// Mock data pour les fleurs (en attendant l'API)
const mockFlowers: FlowerType[] = [
  {
    id: '1',
    name: 'Rose Rouge',
    category: FlowerCategory.ROSES,
    color: 'Rouge',
    seasonality: [Season.SPRING, Season.SUMMER],
    pricePerUnit: 3.50,
    stock: 150,
    description: 'Rose rouge classique, parfaite pour les mariages'
  },
  {
    id: '2',
    name: 'Tulipe Rose',
    category: FlowerCategory.TULIPS,
    color: 'Rose',
    seasonality: [Season.SPRING],
    pricePerUnit: 2.20,
    stock: 80,
    description: 'Tulipe délicate aux tons rosés'
  },
  {
    id: '3',
    name: 'Lys Blanc',
    category: FlowerCategory.LILIES,
    color: 'Blanc',
    seasonality: [Season.SPRING, Season.SUMMER, Season.AUTUMN],
    pricePerUnit: 4.80,
    stock: 60,
    description: 'Lys blanc élégant pour cérémonies'
  }
]

const FlowerSelector: React.FC<FlowerSelectorProps> = ({
  selectedFlowers,
  onSelectionChange
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FlowerCategory | 'all'>('all')
  
  // Filtrer les fleurs
  const filteredFlowers = mockFlowers.filter(flower => {
    const matchesSearch = flower.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || flower.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  const toggleFlowerSelection = (flowerId: string) => {
    if (selectedFlowers.includes(flowerId)) {
      onSelectionChange(selectedFlowers.filter(id => id !== flowerId))
    } else {
      onSelectionChange([...selectedFlowers, flowerId])
    }
  }
  
  const categoryOptions = [
    { value: 'all', label: 'Toutes' },
    { value: FlowerCategory.ROSES, label: 'Roses' },
    { value: FlowerCategory.TULIPS, label: 'Tulipes' },
    { value: FlowerCategory.LILIES, label: 'Lys' },
    { value: FlowerCategory.ORCHIDS, label: 'Orchidées' },
    { value: FlowerCategory.CARNATIONS, label: 'Œillets' },
    { value: FlowerCategory.SEASONAL, label: 'Saisonnières' },
    { value: FlowerCategory.EXOTIC, label: 'Exotiques' }
  ]
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
          <Flower className="w-5 h-5" />
          <span>Sélection des fleurs</span>
        </h3>
        
        <Badge variant="info">
          {selectedFlowers.length} sélectionnée(s)
        </Badge>
      </div>
      
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher une fleur..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map(option => (
            <Button
              key={option.value}
              size="sm"
              variant={selectedCategory === option.value ? 'primary' : 'ghost'}
              onClick={() => setSelectedCategory(option.value as FlowerCategory | 'all')}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Grille des fleurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFlowers.map(flower => {
          const isSelected = selectedFlowers.includes(flower.id)
          
          return (
            <motion.div
              key={flower.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                clickable
                onClick={() => toggleFlowerSelection(flower.id)}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'hover:shadow-md'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {flower.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {flower.description}
                      </p>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary" size="sm">
                          {flower.color}
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {flower.pricePerUnit}€/unité
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: {flower.stock} disponibles
                      </p>
                    </div>
                    
                    <div className="ml-3">
                      {isSelected ? (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <Minus className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-primary-500">
                          <Plus className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
      
      {filteredFlowers.length === 0 && (
        <div className="text-center py-8">
          <Flower className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Aucune fleur trouvée pour "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  )
}

export default FlowerSelector