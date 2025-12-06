import { Client, Event, EventStatus } from '@/types'

// Fonction pour générer des clients d'exemple
export const generateSampleClients = (): Client[] => {
  const sampleClients: Client[] = [
    {
      id: 'client-1',
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@email.com',
      phone: '06 12 34 56 78',
      address: {
        street: '15 Rue des Roses',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      },
      preferences: {
        favoriteColors: ['Rose', 'Blanc', 'Crème'],
        favoriteFlowers: ['Roses', 'Pivoines', 'Lisianthus'],
        budget: {
          min: 200,
          max: 800,
          currency: 'EUR'
        }
      },
      comments: 'Cliente fidèle, préfère les compositions classiques et romantiques. Très attentive aux détails.',
      managerPayment: 150,
      freelancePayment: 200,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-06-20')
    },
    {
      id: 'client-2',
      firstName: 'Pierre',
      lastName: 'Dubois',
      email: 'pierre.dubois@entreprise.fr',
      phone: '06 87 65 43 21',
      address: {
        street: '42 Avenue des Lilas',
        city: 'Lyon',
        postalCode: '69002',
        country: 'France'
      },
      preferences: {
        favoriteColors: ['Bleu', 'Blanc', 'Argent'],
        favoriteFlowers: ['Hortensias', 'Delphiniums', 'Eucalyptus'],
        budget: {
          min: 500,
          max: 1500,
          currency: 'EUR'
        }
      },
      comments: 'Entreprise avec événements réguliers. Budget confortable, privilégie le prestige et l\'élégance.',
      managerPayment: 300,
      freelancePayment: 400,
      createdAt: new Date('2024-02-08'),
      updatedAt: new Date('2024-06-18')
    },
    {
      id: 'client-3',
      firstName: 'Emma',
      lastName: 'Leroy',
      email: 'emma.leroy@gmail.com',
      phone: '07 11 22 33 44',
      address: {
        street: '8 Impasse des Tulipes',
        city: 'Bordeaux',
        postalCode: '33000',
        country: 'France'
      },
      preferences: {
        favoriteColors: ['Jaune', 'Orange', 'Rouge'],
        favoriteFlowers: ['Tournesols', 'Gerberas', 'Chrysanthèmes'],
        budget: {
          min: 150,
          max: 400,
          currency: 'EUR'
        }
      },
      comments: 'Jeune maman dynamique, adore les couleurs vives et les compositions originales. Budget serré mais créative.',
      managerPayment: 80,
      freelancePayment: 120,
      createdAt: new Date('2024-03-12'),
      updatedAt: new Date('2024-06-25')
    },
    {
      id: 'client-4',
      firstName: 'Marie-Claire',
      lastName: 'Fontaine',
      email: 'mc.fontaine@hotmail.fr',
      phone: '06 55 44 33 22',
      address: {
        street: '23 Boulevard des Jardins',
        city: 'Nice',
        postalCode: '06000',
        country: 'France'
      },
      preferences: {
        favoriteColors: ['Violet', 'Mauve', 'Blanc'],
        favoriteFlowers: ['Lavande', 'Iris', 'Freesias'],
        allergies: ['Pollen de graminées'],
        budget: {
          min: 300,
          max: 1000,
          currency: 'EUR'
        }
      },
      comments: 'Dame âgée très raffinée, passion pour la lavande. Attention aux allergies ! Paiements toujours ponctuels.',
      managerPayment: 180,
      freelancePayment: 250,
      createdAt: new Date('2024-04-03'),
      updatedAt: new Date('2024-06-22')
    }
  ]

  return sampleClients
}

// Fonction pour générer des événements d'exemple liés aux clients
export const generateSampleEvents = (): Event[] => {
  const sampleEvents: Event[] = [
    {
      id: 'event-1',
      title: 'Mariage Sophie & Thomas',
      description: 'Bouquet de mariée et décorations florales pour la cérémonie',
      date: new Date('2024-07-20'),
      time: '14:00',
      location: 'Château de Versailles',
      clientId: 'client-1',
      budget: 650,
      status: EventStatus.CONFIRMED,
      flowers: [
        { flowerId: 'flower-1', quantity: 24 },
        { flowerId: 'flower-2', quantity: 12 }
      ],
      notes: 'Prévoir transport réfrigéré. Livraison à 13h30.',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-06-15')
    },
    {
      id: 'event-2',
      title: 'Anniversaire Entreprise Dubois',
      description: 'Compositions florales pour les 25 ans de l\'entreprise',
      date: new Date('2024-08-15'),
      time: '18:00',
      location: 'Hôtel Intercontinental Lyon',
      clientId: 'client-2',
      budget: 1200,
      status: EventStatus.IN_PROGRESS,
      flowers: [
        { flowerId: 'flower-3', quantity: 15 },
        { flowerId: 'flower-4', quantity: 8 }
      ],
      notes: 'Décorations sur le thème corporate. Couleurs : bleu et blanc.',
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-06-20')
    },
    {
      id: 'event-3',
      title: 'Baby Shower Emma',
      description: 'Arrangements floraux pour baby shower',
      date: new Date('2024-07-30'),
      time: '15:00',
      location: 'Jardin Botanique de Bordeaux',
      clientId: 'client-3',
      budget: 280,
      status: EventStatus.DRAFT,
      flowers: [
        { flowerId: 'flower-5', quantity: 6 },
        { flowerId: 'flower-6', quantity: 10 }
      ],
      notes: 'Thème ensoleillé, privilégier les couleurs vives.',
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-06-25')
    }
  ]

  return sampleEvents
}

// Fonction pour initialiser les données d'exemple
export const initializeSampleData = () => {
  // Vérifier si des données existent déjà
  const existingClients = localStorage.getItem('mathilde_clients')
  const existingEvents = localStorage.getItem('mathilde_events')
  
  if (!existingClients || JSON.parse(existingClients).length === 0) {
    const sampleClients = generateSampleClients()
    localStorage.setItem('mathilde_clients', JSON.stringify(sampleClients))
    console.log('🌸 Clients d\'exemple ajoutés:', sampleClients.length)
  }
  
  if (!existingEvents || JSON.parse(existingEvents).length === 0) {
    const sampleEvents = generateSampleEvents()
    localStorage.setItem('mathilde_events', JSON.stringify(sampleEvents))
    console.log('🌸 Événements d\'exemple ajoutés:', sampleEvents.length)
  }
}
