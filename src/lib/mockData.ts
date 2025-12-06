import { Event, Client, EventStatus } from '@/types'

// Données de test pour les événements - LOGIQUE KANBAN RESPECTÉE
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Séminaire BNP',
    description: 'Décoration florale pour séminaire d\'entreprise',
    date: new Date('2025-07-10'), // AUJOURD'HUI pour tester "En cours"
    time: '08:00',
    location: 'BNP Paribas',
    clientId: '1',
    clientName: 'Sophie Martin',
    budget: 2800,
    status: EventStatus.CONFIRMED, // ✅ CONFIRMED = 3/3 fleuristes confirmés
    flowers: [
      { flowerId: '1', quantity: 25 },
      { flowerId: '2', quantity: 15 }
    ],
    floristsRequired: 3,
    assignedFlorists: [
      {
        floristId: '1',
        floristName: 'Marie Dubois',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-01')
      },
      {
        floristId: '2',
        floristName: 'Paul Renault',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-01')
      },
      {
        floristId: '3',
        floristName: 'Lucas Martin',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-02')
      }
    ],
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: '2',
    title: 'Mariage express',
    description: 'Bouquet et décoration pour cérémonie',
    date: new Date('2025-07-07'),
    time: '11:00',
    location: 'Mairie du 7ème',
    clientId: '2',
    clientName: 'Julie Petit',
    budget: 250,
    status: EventStatus.DRAFT, // ✅ DRAFT = 0/1 fleuristes assignés
    flowers: [
      { flowerId: '3', quantity: 12 },
      { flowerId: '4', quantity: 8 }
    ],
    floristsRequired: 1,
    assignedFlorists: [], // Pas d'assignations pour l'instant
    createdAt: new Date('2025-07-02'),
    updatedAt: new Date('2025-07-02')
  },
  {
    id: '3',
    title: 'Événement corporate',
    description: 'Décoration hall d\'accueil',
    date: new Date('2025-07-08'),
    endDate: new Date('2025-07-10'), // ÉVÉNEMENT MULTI-JOURS pour test
    time: '14:00',
    endTime: '18:00',
    location: 'La Défense',
    clientId: '3',
    clientName: 'Marie Leclerc',
    budget: 1200,
    status: EventStatus.IN_PROGRESS, // ✅ IN_PROGRESS = 1/2 fleuristes mais pas confirmé
    flowers: [
      { flowerId: '1', quantity: 30 }
    ],
    floristsRequired: 2,
    assignedFlorists: [
      {
        floristId: '3',
        floristName: 'Jean Moreau',
        isConfirmed: false, // ⚠️ Pas confirmé = IN_PROGRESS
        status: 'pending',
        assignedAt: new Date('2025-07-03')
      }
    ],
    createdAt: new Date('2025-07-03'),
    updatedAt: new Date('2025-07-03')
  },
  {
    id: '4',
    title: 'Anniversaire Marc',
    description: 'Bouquet d\'anniversaire et décoration de table',
    date: new Date('2025-07-18'),
    time: '15:00',
    location: 'Domicile Marc Dubois',
    clientId: '5',
    clientName: 'Marc Dubois',
    budget: 450,
    status: EventStatus.CONFIRMED, // ✅ CONFIRMED = 1/1 fleuriste confirmé
    flowers: [
      { flowerId: '2', quantity: 20 },
      { flowerId: '3', quantity: 10 }
    ],
    floristsRequired: 1,
    assignedFlorists: [
      {
        floristId: '4',
        floristName: 'Sophie Durand',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-10')
      }
    ],
    createdAt: new Date('2025-07-10'),
    updatedAt: new Date('2025-07-10')
  },
  {
    id: '5',
    title: 'Réception Marc - Weekend',
    description: 'Grande réception familiale',
    date: new Date('2025-07-26'),
    time: '18:00',
    endTime: '23:00',
    location: 'Maison de Marc Dubois',
    clientId: '5',
    clientName: 'Marc Dubois',
    budget: 1200,
    status: EventStatus.CONFIRMED, // ✅ CONFIRMED = 3/3 fleuristes confirmés
    flowers: [
      { flowerId: '1', quantity: 30 },
      { flowerId: '2', quantity: 25 },
      { flowerId: '3', quantity: 15 }
    ],
    floristsRequired: 3,
    assignedFlorists: [
      {
        floristId: '1',
        floristName: 'Marie Dubois',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-15')
      },
      {
        floristId: '4',
        floristName: 'Sophie Durand',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-15')
      },
      {
        floristId: '5',
        floristName: 'Jean Martin',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-15')
      }
    ],
    createdAt: new Date('2025-07-15'),
    updatedAt: new Date('2025-07-15')
  },
  {
    id: '6',
    title: 'Événement Sophie Martin BNP',
    description: 'Réunion clients BNP avec décoration',
    date: new Date('2025-07-22'),
    time: '14:00',
    location: 'Siège BNP Paribas',
    clientId: '1',
    clientName: 'Sophie Martin',
    budget: 600,
    status: EventStatus.CONFIRMED, // ✅ CONFIRMED = 2/2 fleuristes confirmés
    flowers: [
      { flowerId: '1', quantity: 20 }
    ],
    floristsRequired: 2,
    assignedFlorists: [
      {
        floristId: '4',
        floristName: 'Sophie Durand',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-18')
      },
      {
        floristId: '1',
        floristName: 'Marie Dubois',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-18')
      },
      {
        floristId: '5',
        floristName: 'Jean Martin',
        isConfirmed: false,
        status: 'not_selected', // 🆕 Jean Martin en "Non retenu" car équipe complète
        assignedAt: new Date('2025-07-18')
      }
    ],
    createdAt: new Date('2025-07-18'),
    updatedAt: new Date('2025-07-18')
  },
  {
    id: '7',
    title: 'Mariage Julie',
    description: 'Décoration complète mariage',
    date: new Date('2025-07-15'),
    time: '16:00',
    location: 'Château de Malmaison',
    clientId: '2',
    clientName: 'Julie Petit',
    budget: 2500,
    status: EventStatus.IN_PROGRESS, // 🔄 CORRIGÉ : IN_PROGRESS = 2/4 fleuristes assignés mais pas complet
    flowers: [
      { flowerId: '1', quantity: 50 },
      { flowerId: '2', quantity: 30 }
    ],
    floristsRequired: 4,
    assignedFlorists: [
      {
        floristId: '1',
        floristName: 'Marie Dubois',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-01')
      },
      {
        floristId: '2',
        floristName: 'Paul Renault',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-01')
      }
      // ❌ MANQUE 2 fleuristes = STATUS IN_PROGRESS au lieu de CONFIRMED
    ],
    createdAt: new Date('2025-06-15'),
    updatedAt: new Date('2025-07-01')
  },
  // 🆕 AJOUT D'UN EXEMPLE PARFAIT CONFIRMED
  {
    id: '8',
    title: 'Baptême Emma',
    description: 'Décoration baptême avec arrangements floraux',
    date: new Date('2025-07-20'),
    time: '14:00',
    location: 'Église Saint-Sulpice',
    clientId: '3',
    clientName: 'Marie Leclerc',
    budget: 800,
    status: EventStatus.CONFIRMED, // ✅ CONFIRMED = 2/2 fleuristes confirmés
    flowers: [
      { flowerId: '3', quantity: 15 },
      { flowerId: '4', quantity: 10 }
    ],
    floristsRequired: 2,
    assignedFlorists: [
      {
        floristId: '3',
        floristName: 'Jean Moreau',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-12')
      },
      {
        floristId: '4',
        floristName: 'Sophie Durand',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-12')
      }
    ],
    createdAt: new Date('2025-07-12'),
    updatedAt: new Date('2025-07-12')
  },
  // 🆕 ÉVÉNEMENT MULTI-JOURS pour tester l'affichage calendrier
  {
    id: '100',
    title: '🎪 Festival des Fleurs - Weekend',
    description: 'Festival multi-jours avec décoration complète',
    date: new Date('2025-07-12'), // Samedi
    endDate: new Date('2025-07-14'), // Lundi (3 jours)
    time: '09:00',
    endTime: '18:00',
    location: 'Parc des Expositions',
    clientId: '3',
    clientName: 'Marie Leclerc',
    budget: 5000,
    status: EventStatus.CONFIRMED, // ✅ CONFIRMED = couleur jaune
    flowers: [
      { flowerId: '1', quantity: 100 },
      { flowerId: '2', quantity: 75 },
      { flowerId: '3', quantity: 50 }
    ],
    floristsRequired: 4,
    assignedFlorists: [
      {
        floristId: '1',
        floristName: 'Marie Dubois',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-05')
      },
      {
        floristId: '2',
        floristName: 'Paul Renault',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-05')
      },
      {
        floristId: '3',
        floristName: 'Jean Moreau',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-05')
      },
      {
        floristId: '4',
        floristName: 'Sophie Durand',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-05')
      }
    ],
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-05')
  },
  // 🆕 ÉVÉNEMENT TERMINÉ POUR TESTER LE WORKFLOW DE FACTURATION
  {
    id: '99',
    title: '🎯 TEST - Événement Terminé',
    description: 'Événement test terminé pour tester le workflow de facturation',
    date: new Date('2025-07-10'), // Hier
    time: '14:00',
    location: 'Location Test',
    clientId: '1',
    clientName: 'Sophie Martin',
    budget: 1500,
    status: EventStatus.COMPLETED, // ✅ STATUT TERMINÉ
    flowers: [
      { flowerId: '1', quantity: 10 },
      { flowerId: '2', quantity: 5 }
    ],
    floristsRequired: 2,
    assignedFlorists: [
      {
        floristId: '1',
        floristName: 'Marie Dubois',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-09')
      },
      {
        floristId: '2',
        floristName: 'Pierre Garnier',
        isConfirmed: true,
        status: 'confirmed',
        assignedAt: new Date('2025-07-09')
      }
    ],
    completedDate: new Date('2025-07-10'), // Date de fin
    invoiced: false, // Pas encore facturé
    paid: false,     // Pas encore payé
    createdAt: new Date('2025-07-09'),
    updatedAt: new Date('2025-07-10')
  }
]

// Données de test pour les clients
export const mockClients: Client[] = [
  {
    id: '1',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@bnp.fr',
    phone: '+33623456789',
    address: {
      street: '16 Boulevard des Italiens',
      city: 'Paris',
      postalCode: '75009',
      country: 'France'
    },
    createdAt: new Date('2025-06-15'),
    updatedAt: new Date('2025-06-15')
  },
  {
    id: '2',
    firstName: 'Julie',
    lastName: 'Petit',
    email: 'julie.petit@gmail.com',
    phone: '+33634567890',
    address: {
      street: '45 Rue de Rivoli',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    },
    createdAt: new Date('2025-06-20'),
    updatedAt: new Date('2025-06-20')
  },
  {
    id: '3',
    firstName: 'Marie',
    lastName: 'Leclerc',
    email: 'marie.leclerc@corporate.com',
    phone: '+33645678901',
    address: {
      street: '1 Parvis de la Défense',
      city: 'Puteaux',
      postalCode: '92800',
      country: 'France'
    },
    createdAt: new Date('2025-06-25'),
    updatedAt: new Date('2025-06-25')
  },
  {
    id: '4',
    firstName: 'Pierre',
    lastName: 'Dubois',
    email: 'pierre.dubois@email.fr',
    phone: '+33656789012',
    address: {
      street: '23 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France'
    },
    createdAt: new Date('2025-06-28'),
    updatedAt: new Date('2025-06-28')
  },
  {
    id: '5',
    firstName: 'Marc',
    lastName: 'Dubois',
    email: 'marc.dubois@gmail.com',
    phone: '+33667890123',
    address: {
      street: '42 Rue de la République',
      city: 'Lyon',
      postalCode: '69002',
      country: 'France'
    },
    createdAt: new Date('2025-07-10'),
    updatedAt: new Date('2025-07-10')
  }
]