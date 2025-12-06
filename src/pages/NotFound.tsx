import React from 'react'
import { motion } from 'framer-motion'
import { 
  Home, ArrowLeft, Search, Flower2, Calendar, 
  Users, Mail, Phone, MapPin
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const NotFound: React.FC = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  }
  
  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
  
  const quickLinks = [
    {
      title: 'Tableau de bord',
      description: 'Vue d\'ensemble de vos activités',
      icon: Home,
      href: '/',
      color: 'bg-blue-500'
    },
    {
      title: 'Événements',
      description: 'Gérer vos événements fleuris',
      icon: Calendar,
      href: '/events',
      color: 'bg-green-500'
    },
    {
      title: 'Clients',
      description: 'Votre carnet d\'adresses',
      icon: Users,
      href: '/clients',
      color: 'bg-purple-500'
    },
    {
      title: 'Calendrier',
      description: 'Planning de vos rendez-vous',
      icon: Calendar,
      href: '/calendar',
      color: 'bg-orange-500'
    }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl w-full text-center space-y-8"
      >
        {/* 404 Illustration */}
        <motion.div variants={itemVariants} className="relative">
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="mx-auto w-64 h-64 relative"
          >
            {/* Large 404 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl font-bold text-gray-200 dark:text-gray-700 select-none">
                404
              </span>
            </div>
            
            {/* Floating flowers */}
            <motion.div
              animate={{
                rotate: [0, 360],
                transition: { duration: 20, repeat: Infinity, ease: "linear" }
              }}
              className="absolute inset-0"
            >
              <Flower2 className="absolute top-4 left-8 w-8 h-8 text-primary-400" />
              <Flower2 className="absolute top-16 right-12 w-6 h-6 text-secondary-400" />
              <Flower2 className="absolute bottom-8 left-16 w-7 h-7 text-green-400" />
              <Flower2 className="absolute bottom-16 right-8 w-5 h-5 text-yellow-400" />
              <Flower2 className="absolute top-1/2 left-4 w-4 h-4 text-purple-400" />
              <Flower2 className="absolute top-1/3 right-4 w-6 h-6 text-pink-400" />
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Error Message */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
            Page introuvable
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Oups ! Il semblerait que cette page ait fleuri ailleurs. 
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </motion.div>
        
        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Home className="w-5 h-5" />}
            href="/"
          >
            Retour à l'accueil
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            leftIcon={<ArrowLeft className="w-5 h-5" />}
            onClick={() => window.history.back()}
          >
            Page précédente
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            leftIcon={<Search className="w-5 h-5" />}
            onClick={() => {
              const searchTerm = prompt('Que recherchez-vous ?')
              if (searchTerm) {
                window.location.href = `/?search=${encodeURIComponent(searchTerm)}`
              }
            }}
          >
            Rechercher
          </Button>
        </motion.div>
        
        {/* Quick Links */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Raccourcis populaires
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <a href={link.href} className="block">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center`}>
                        <link.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </a>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Help Section */}
        <motion.div variants={itemVariants}>
          <Card className="p-8 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Besoin d'aide ?
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Si vous continuez à rencontrer des problèmes, n'hésitez pas à nous contacter. 
              Notre équipe est là pour vous aider !
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>mathilde@fleurs.com</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+33 6 12 34 56 78</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>123 Rue des Fleurs, Paris</span>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* Easter Egg */}
        <motion.div
          variants={itemVariants}
          className="text-xs text-gray-400 dark:text-gray-600"
        >
          <p>
            🌸 "Même les plus belles fleurs ont parfois besoin de retrouver leur chemin..." 🌸
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFound