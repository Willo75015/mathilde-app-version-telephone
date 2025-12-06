/**
 * Service Supabase pour Mathilde Fleurs
 * Gère les opérations CRUD et la synchronisation temps réel
 */

import { supabase, isSupabaseEnabled } from './supabase'
import type {
  Event,
  Client,
  Florist,
  EventFlorist,
  FlowerSelection,
  Expense,
  EventTemplate
} from '@/types'

// =====================================================
// TYPES POUR LA CONVERSION DB <-> APP
// =====================================================

interface DbEvent {
  id: string
  title: string
  description: string | null
  date: string
  end_date: string | null
  time: string | null
  end_time: string | null
  location: string | null
  client_id: string | null
  client_name: string | null
  client_phone: string | null
  budget: number
  status: string
  notes: string | null
  images: string[] | null
  invoiced: boolean
  invoice_date: string | null
  completed_date: string | null
  paid: boolean
  paid_date: string | null
  payment_method: string | null
  archived: boolean
  cancelled_at: string | null
  archived_at: string | null
  florists_required: number
  created_at: string
  updated_at: string
}

interface DbClient {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  favorite_colors: string[] | null
  favorite_flowers: string[] | null
  allergies: string[] | null
  comments: string | null
  manager_payment: number | null
  freelance_payment: number | null
  created_at: string
  updated_at: string
}

interface DbFlorist {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  experience: number
  rating: number
  hourly_rate: number
  availability: string
  location: string | null
  completed_events: number
  avatar: string | null
  skills: string[] | null
  languages: string[] | null
  certifications: string[] | null
  comments: string | null
  unavailability_periods: any
  created_at: string
  updated_at: string
}

interface DbEventFlorist {
  id: string
  event_id: string
  florist_id: string
  florist_name: string | null
  is_confirmed: boolean
  is_refused: boolean
  status: string
  assigned_at: string
  confirmed_at: string | null
  role: string | null
  notes: string | null
  pre_written_message: string | null
}

interface DbExpense {
  id: string
  event_id: string
  category: string
  description: string | null
  amount: number
  date: string
  receipt: string | null
  created_at: string
}

interface DbEventFlower {
  id: string
  event_id: string
  flower_id: string
  quantity: number
  notes: string | null
}

// =====================================================
// FONCTIONS DE CONVERSION
// =====================================================

function dbToEvent(db: DbEvent, florists?: EventFlorist[], flowers?: FlowerSelection[], expenses?: Expense[]): Event {
  return {
    id: db.id,
    title: db.title,
    description: db.description || '',
    date: new Date(db.date),
    endDate: db.end_date ? new Date(db.end_date) : undefined,
    time: db.time || '',
    endTime: db.end_time || undefined,
    location: db.location || '',
    clientId: db.client_id || '',
    clientName: db.client_name || undefined,
    clientPhone: db.client_phone || undefined,
    budget: db.budget,
    status: db.status as Event['status'],
    notes: db.notes || undefined,
    images: db.images || undefined,
    invoiced: db.invoiced,
    invoiceDate: db.invoice_date ? new Date(db.invoice_date) : undefined,
    completedDate: db.completed_date ? new Date(db.completed_date) : undefined,
    paid: db.paid,
    paidDate: db.paid_date ? new Date(db.paid_date) : undefined,
    paymentMethod: db.payment_method as Event['paymentMethod'],
    archived: db.archived,
    cancelledAt: db.cancelled_at ? new Date(db.cancelled_at) : undefined,
    archivedAt: db.archived_at ? new Date(db.archived_at) : undefined,
    floristsRequired: db.florists_required,
    flowers: flowers || [],
    assignedFlorists: florists || [],
    expenses: expenses || [],
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at)
  }
}

function eventToDb(event: Partial<Event>): Partial<DbEvent> {
  const db: Record<string, any> = {}

  if (event.id !== undefined) db.id = event.id
  if (event.title !== undefined) db.title = event.title
  if (event.description !== undefined) db.description = event.description
  if (event.date !== undefined) db.date = event.date instanceof Date ? event.date.toISOString().split('T')[0] : event.date
  if (event.endDate !== undefined) db.end_date = event.endDate instanceof Date ? event.endDate.toISOString().split('T')[0] : event.endDate
  if (event.time !== undefined) db.time = event.time
  if (event.endTime !== undefined) db.end_time = event.endTime
  if (event.location !== undefined) db.location = event.location
  if (event.clientId !== undefined) db.client_id = event.clientId
  if (event.clientName !== undefined) db.client_name = event.clientName
  if (event.clientPhone !== undefined) db.client_phone = event.clientPhone
  if (event.budget !== undefined) db.budget = event.budget
  if (event.status !== undefined) db.status = event.status
  if (event.notes !== undefined) db.notes = event.notes
  if (event.images !== undefined) db.images = event.images
  if (event.invoiced !== undefined) db.invoiced = event.invoiced
  if (event.invoiceDate !== undefined) db.invoice_date = event.invoiceDate instanceof Date ? event.invoiceDate.toISOString() : event.invoiceDate
  if (event.completedDate !== undefined) db.completed_date = event.completedDate instanceof Date ? event.completedDate.toISOString() : event.completedDate
  if (event.paid !== undefined) db.paid = event.paid
  if (event.paidDate !== undefined) db.paid_date = event.paidDate instanceof Date ? event.paidDate.toISOString() : event.paidDate
  if (event.paymentMethod !== undefined) db.payment_method = event.paymentMethod
  if (event.archived !== undefined) db.archived = event.archived
  if (event.cancelledAt !== undefined) db.cancelled_at = event.cancelledAt instanceof Date ? event.cancelledAt.toISOString() : event.cancelledAt
  if (event.archivedAt !== undefined) db.archived_at = event.archivedAt instanceof Date ? event.archivedAt.toISOString() : event.archivedAt
  if (event.floristsRequired !== undefined) db.florists_required = event.floristsRequired

  return db
}

function dbToClient(db: DbClient): Client {
  return {
    id: db.id,
    firstName: db.first_name,
    lastName: db.last_name,
    email: db.email || '',
    phone: db.phone || '',
    address: {
      street: db.address_street || '',
      city: db.address_city || '',
      postalCode: db.address_postal_code || '',
      country: db.address_country || 'France'
    },
    preferences: {
      favoriteColors: db.favorite_colors || [],
      favoriteFlowers: db.favorite_flowers || [],
      allergies: db.allergies || []
    },
    comments: db.comments || undefined,
    managerPayment: db.manager_payment || undefined,
    freelancePayment: db.freelance_payment || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at)
  }
}

function clientToDb(client: Partial<Client>): Record<string, any> {
  const db: Record<string, any> = {}

  if (client.id !== undefined) db.id = client.id
  if (client.firstName !== undefined) db.first_name = client.firstName
  if (client.lastName !== undefined) db.last_name = client.lastName
  if (client.email !== undefined) db.email = client.email
  if (client.phone !== undefined) db.phone = client.phone
  if (client.address) {
    if (client.address.street !== undefined) db.address_street = client.address.street
    if (client.address.city !== undefined) db.address_city = client.address.city
    if (client.address.postalCode !== undefined) db.address_postal_code = client.address.postalCode
    if (client.address.country !== undefined) db.address_country = client.address.country
  }
  if (client.preferences) {
    if (client.preferences.favoriteColors !== undefined) db.favorite_colors = client.preferences.favoriteColors
    if (client.preferences.favoriteFlowers !== undefined) db.favorite_flowers = client.preferences.favoriteFlowers
    if (client.preferences.allergies !== undefined) db.allergies = client.preferences.allergies
  }
  if (client.comments !== undefined) db.comments = client.comments
  if (client.managerPayment !== undefined) db.manager_payment = client.managerPayment
  if (client.freelancePayment !== undefined) db.freelance_payment = client.freelancePayment

  return db
}

function dbToFlorist(db: DbFlorist): Florist {
  return {
    id: db.id,
    firstName: db.first_name,
    lastName: db.last_name,
    email: db.email || '',
    phone: db.phone || '',
    experience: db.experience,
    rating: db.rating,
    hourlyRate: db.hourly_rate,
    availability: db.availability as Florist['availability'],
    location: db.location || '',
    completedEvents: db.completed_events,
    avatar: db.avatar || '',
    skills: db.skills || [],
    languages: db.languages || [],
    certifications: db.certifications || [],
    comments: db.comments || undefined,
    unavailabilityPeriods: db.unavailability_periods || [],
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at)
  }
}

function floristToDb(florist: Partial<Florist>): Record<string, any> {
  const db: Record<string, any> = {}

  if (florist.id !== undefined) db.id = florist.id
  if (florist.firstName !== undefined) db.first_name = florist.firstName
  if (florist.lastName !== undefined) db.last_name = florist.lastName
  if (florist.email !== undefined) db.email = florist.email
  if (florist.phone !== undefined) db.phone = florist.phone
  if (florist.experience !== undefined) db.experience = florist.experience
  if (florist.rating !== undefined) db.rating = florist.rating
  if (florist.hourlyRate !== undefined) db.hourly_rate = florist.hourlyRate
  if (florist.availability !== undefined) db.availability = florist.availability
  if (florist.location !== undefined) db.location = florist.location
  if (florist.completedEvents !== undefined) db.completed_events = florist.completedEvents
  if (florist.avatar !== undefined) db.avatar = florist.avatar
  if (florist.skills !== undefined) db.skills = florist.skills
  if (florist.languages !== undefined) db.languages = florist.languages
  if (florist.certifications !== undefined) db.certifications = florist.certifications
  if (florist.comments !== undefined) db.comments = florist.comments
  if (florist.unavailabilityPeriods !== undefined) db.unavailability_periods = florist.unavailabilityPeriods

  return db
}

// =====================================================
// SERVICE SUPABASE
// =====================================================

export const supabaseService = {
  // =====================================================
  // EVENTS
  // =====================================================

  async getEvents(): Promise<Event[]> {
    if (!isSupabaseEnabled() || !supabase) return []

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching events:', error)
      return []
    }

    // Charger les fleuristes et fleurs pour chaque événement
    const eventIds = events.map(e => e.id)

    const [floristsRes, flowersRes, expensesRes] = await Promise.all([
      supabase.from('event_florists').select('*').in('event_id', eventIds),
      supabase.from('event_flowers').select('*').in('event_id', eventIds),
      supabase.from('expenses').select('*').in('event_id', eventIds)
    ])

    const floristsByEvent = new Map<string, EventFlorist[]>()
    const flowersByEvent = new Map<string, FlowerSelection[]>()
    const expensesByEvent = new Map<string, Expense[]>()

    floristsRes.data?.forEach((ef: DbEventFlorist) => {
      const list = floristsByEvent.get(ef.event_id) || []
      list.push({
        floristId: ef.florist_id,
        floristName: ef.florist_name || undefined,
        isConfirmed: ef.is_confirmed,
        isRefused: ef.is_refused,
        status: ef.status as EventFlorist['status'],
        assignedAt: new Date(ef.assigned_at),
        confirmedAt: ef.confirmed_at ? new Date(ef.confirmed_at) : undefined,
        role: ef.role || undefined,
        notes: ef.notes || undefined,
        preWrittenMessage: ef.pre_written_message || undefined
      })
      floristsByEvent.set(ef.event_id, list)
    })

    flowersRes.data?.forEach((f: DbEventFlower) => {
      const list = flowersByEvent.get(f.event_id) || []
      list.push({
        flowerId: f.flower_id,
        quantity: f.quantity,
        notes: f.notes || undefined
      })
      flowersByEvent.set(f.event_id, list)
    })

    expensesRes.data?.forEach((e: DbExpense) => {
      const list = expensesByEvent.get(e.event_id) || []
      list.push({
        id: e.id,
        category: e.category as Expense['category'],
        description: e.description || '',
        amount: e.amount,
        date: new Date(e.date),
        receipt: e.receipt || undefined
      })
      expensesByEvent.set(e.event_id, list)
    })

    return events.map((e: DbEvent) => dbToEvent(
      e,
      floristsByEvent.get(e.id) || [],
      flowersByEvent.get(e.id) || [],
      expensesByEvent.get(e.id) || []
    ))
  },

  async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event | null> {
    if (!isSupabaseEnabled() || !supabase) return null

    const dbEvent = eventToDb(event)

    const { data, error } = await supabase
      .from('events')
      .insert(dbEvent)
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return null
    }

    // Ajouter les fleuristes assignés
    if (event.assignedFlorists && event.assignedFlorists.length > 0) {
      await supabase.from('event_florists').insert(
        event.assignedFlorists.map(f => ({
          event_id: data.id,
          florist_id: f.floristId,
          florist_name: f.floristName,
          is_confirmed: f.isConfirmed,
          is_refused: f.isRefused || false,
          status: f.status || 'pending',
          role: f.role,
          notes: f.notes
        }))
      )
    }

    // Ajouter les fleurs sélectionnées
    if (event.flowers && event.flowers.length > 0) {
      await supabase.from('event_flowers').insert(
        event.flowers.map(f => ({
          event_id: data.id,
          flower_id: f.flowerId,
          quantity: f.quantity,
          notes: f.notes
        }))
      )
    }

    return dbToEvent(data, event.assignedFlorists, event.flowers, [])
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    if (!isSupabaseEnabled() || !supabase) return null

    const dbUpdates = eventToDb(updates)

    const { data, error } = await supabase
      .from('events')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return null
    }

    // Mettre à jour les fleuristes si fournis
    if (updates.assignedFlorists !== undefined) {
      await supabase.from('event_florists').delete().eq('event_id', id)
      if (updates.assignedFlorists.length > 0) {
        await supabase.from('event_florists').insert(
          updates.assignedFlorists.map(f => ({
            event_id: id,
            florist_id: f.floristId,
            florist_name: f.floristName,
            is_confirmed: f.isConfirmed,
            is_refused: f.isRefused || false,
            status: f.status || 'pending',
            role: f.role,
            notes: f.notes
          }))
        )
      }
    }

    // Mettre à jour les fleurs si fournies
    if (updates.flowers !== undefined) {
      await supabase.from('event_flowers').delete().eq('event_id', id)
      if (updates.flowers.length > 0) {
        await supabase.from('event_flowers').insert(
          updates.flowers.map(f => ({
            event_id: id,
            flower_id: f.flowerId,
            quantity: f.quantity,
            notes: f.notes
          }))
        )
      }
    }

    // Mettre à jour les dépenses si fournies
    if (updates.expenses !== undefined) {
      await supabase.from('expenses').delete().eq('event_id', id)
      if (updates.expenses.length > 0) {
        await supabase.from('expenses').insert(
          updates.expenses.map(e => ({
            event_id: id,
            category: e.category,
            description: e.description,
            amount: e.amount,
            date: e.date instanceof Date ? e.date.toISOString().split('T')[0] : e.date,
            receipt: e.receipt
          }))
        )
      }
    }

    return dbToEvent(data)
  },

  async deleteEvent(id: string): Promise<boolean> {
    if (!isSupabaseEnabled() || !supabase) return false

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting event:', error)
      return false
    }

    return true
  },

  // =====================================================
  // CLIENTS
  // =====================================================

  async getClients(): Promise<Client[]> {
    if (!isSupabaseEnabled() || !supabase) return []

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('last_name', { ascending: true })

    if (error) {
      console.error('Error fetching clients:', error)
      return []
    }

    return data.map((c: DbClient) => dbToClient(c))
  },

  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client | null> {
    if (!isSupabaseEnabled() || !supabase) return null

    const dbClient = clientToDb(client)

    const { data, error } = await supabase
      .from('clients')
      .insert(dbClient)
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return null
    }

    return dbToClient(data)
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    if (!isSupabaseEnabled() || !supabase) return null

    const dbUpdates = clientToDb(updates)

    const { data, error } = await supabase
      .from('clients')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating client:', error)
      return null
    }

    return dbToClient(data)
  },

  async deleteClient(id: string): Promise<boolean> {
    if (!isSupabaseEnabled() || !supabase) return false

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting client:', error)
      return false
    }

    return true
  },

  // =====================================================
  // FLORISTS
  // =====================================================

  async getFlorists(): Promise<Florist[]> {
    if (!isSupabaseEnabled() || !supabase) return []

    const { data, error } = await supabase
      .from('florists')
      .select('*')
      .order('last_name', { ascending: true })

    if (error) {
      console.error('Error fetching florists:', error)
      return []
    }

    return data.map((f: DbFlorist) => dbToFlorist(f))
  },

  async createFlorist(florist: Omit<Florist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Florist | null> {
    if (!isSupabaseEnabled() || !supabase) return null

    const dbFlorist = floristToDb(florist)

    const { data, error } = await supabase
      .from('florists')
      .insert(dbFlorist)
      .select()
      .single()

    if (error) {
      console.error('Error creating florist:', error)
      return null
    }

    return dbToFlorist(data)
  },

  async updateFlorist(id: string, updates: Partial<Florist>): Promise<Florist | null> {
    if (!isSupabaseEnabled() || !supabase) return null

    const dbUpdates = floristToDb(updates)

    const { data, error } = await supabase
      .from('florists')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating florist:', error)
      return null
    }

    return dbToFlorist(data)
  },

  async deleteFlorist(id: string): Promise<boolean> {
    if (!isSupabaseEnabled() || !supabase) return false

    const { error } = await supabase
      .from('florists')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting florist:', error)
      return false
    }

    return true
  },

  // =====================================================
  // REALTIME SUBSCRIPTIONS
  // =====================================================

  subscribeToEvents(callback: (events: Event[]) => void): (() => void) | null {
    if (!isSupabaseEnabled() || !supabase) return null

    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        async () => {
          // Recharger tous les événements quand il y a un changement
          const events = await supabaseService.getEvents()
          callback(events)
        }
      )
      .subscribe()

    // Retourner la fonction de désinscription
    return () => {
      supabase.removeChannel(channel)
    }
  },

  subscribeToClients(callback: (clients: Client[]) => void): (() => void) | null {
    if (!isSupabaseEnabled() || !supabase) return null

    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        async () => {
          const clients = await supabaseService.getClients()
          callback(clients)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  subscribeToFlorists(callback: (florists: Florist[]) => void): (() => void) | null {
    if (!isSupabaseEnabled() || !supabase) return null

    const channel = supabase
      .channel('florists-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'florists' },
        async () => {
          const florists = await supabaseService.getFlorists()
          callback(florists)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  // =====================================================
  // MIGRATION DEPUIS LOCALSTORAGE
  // =====================================================

  async migrateFromLocalStorage(data: {
    events: Event[],
    clients: Client[],
    florists: Florist[]
  }): Promise<{ success: boolean, message: string }> {
    if (!isSupabaseEnabled() || !supabase) {
      return { success: false, message: 'Supabase non configuré' }
    }

    try {
      // Migrer les clients en premier (car les événements en dépendent)
      for (const client of data.clients) {
        const dbClient = clientToDb(client)
        dbClient.id = client.id // Garder le même ID
        await supabase.from('clients').upsert(dbClient)
      }

      // Migrer les fleuristes
      for (const florist of data.florists) {
        const dbFlorist = floristToDb(florist)
        dbFlorist.id = florist.id
        await supabase.from('florists').upsert(dbFlorist)
      }

      // Migrer les événements
      for (const event of data.events) {
        const dbEvent = eventToDb(event)
        dbEvent.id = event.id
        await supabase.from('events').upsert(dbEvent)

        // Migrer les fleuristes de l'événement
        if (event.assignedFlorists && event.assignedFlorists.length > 0) {
          await supabase.from('event_florists').delete().eq('event_id', event.id)
          await supabase.from('event_florists').insert(
            event.assignedFlorists.map(f => ({
              event_id: event.id,
              florist_id: f.floristId,
              florist_name: f.floristName,
              is_confirmed: f.isConfirmed,
              is_refused: f.isRefused || false,
              status: f.status || 'pending',
              role: f.role,
              notes: f.notes
            }))
          )
        }

        // Migrer les fleurs de l'événement
        if (event.flowers && event.flowers.length > 0) {
          await supabase.from('event_flowers').delete().eq('event_id', event.id)
          await supabase.from('event_flowers').insert(
            event.flowers.map(f => ({
              event_id: event.id,
              flower_id: f.flowerId,
              quantity: f.quantity,
              notes: f.notes
            }))
          )
        }

        // Migrer les dépenses de l'événement
        if (event.expenses && event.expenses.length > 0) {
          await supabase.from('expenses').delete().eq('event_id', event.id)
          await supabase.from('expenses').insert(
            event.expenses.map(e => ({
              id: e.id,
              event_id: event.id,
              category: e.category,
              description: e.description,
              amount: e.amount,
              date: e.date instanceof Date ? e.date.toISOString().split('T')[0] : e.date,
              receipt: e.receipt
            }))
          )
        }
      }

      return {
        success: true,
        message: `Migration réussie : ${data.clients.length} clients, ${data.florists.length} fleuristes, ${data.events.length} événements`
      }
    } catch (error) {
      console.error('Migration error:', error)
      return { success: false, message: `Erreur de migration: ${error}` }
    }
  }
}

export default supabaseService
