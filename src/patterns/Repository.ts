import { Event, Client, Flower } from '@/types'

// Interface Repository générique
export interface Repository<T> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  update(id: string, entity: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}

// Repository concret pour les événements
export class EventRepository implements Repository<Event> {
  private readonly storageKey = 'mathilde_events'
  
  async findAll(): Promise<Event[]> {
    const data = localStorage.getItem(this.storageKey)
    if (!data) return []
    
    return JSON.parse(data).map((event: any) => ({
      ...event,
      date: new Date(event.date),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt)
    }))
  }
  
  async findById(id: string): Promise<Event | null> {
    const events = await this.findAll()
    return events.find(event => event.id === id) || null
  }
  
  async create(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const event: Event = {
      ...eventData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const events = await this.findAll()
    events.push(event)
    
    localStorage.setItem(this.storageKey, JSON.stringify(events))
    return event
  }
  
  async update(id: string, eventData: Partial<Event>): Promise<Event> {
    const events = await this.findAll()
    const index = events.findIndex(event => event.id === id)
    
    if (index === -1) {
      throw new Error(`Event with id ${id} not found`)
    }
    
    events[index] = {
      ...events[index],
      ...eventData,
      updatedAt: new Date()
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(events))
    return events[index]
  }
  
  async delete(id: string): Promise<void> {
    const events = await this.findAll()
    const filteredEvents = events.filter(event => event.id !== id)
    localStorage.setItem(this.storageKey, JSON.stringify(filteredEvents))
  }
  
  // Méthodes spécifiques aux événements
  async findByClient(clientId: string): Promise<Event[]> {
    const events = await this.findAll()
    return events.filter(event => event.clientId === clientId)
  }
  
  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    const events = await this.findAll()
    return events.filter(event => 
      event.date >= startDate && event.date <= endDate
    )
  }
}

// Repository pour les clients
export class ClientRepository implements Repository<Client> {
  private readonly storageKey = 'mathilde_clients'
  
  async findAll(): Promise<Client[]> {
    const data = localStorage.getItem(this.storageKey)
    if (!data) return []
    
    return JSON.parse(data).map((client: any) => ({
      ...client,
      createdAt: new Date(client.createdAt),
      updatedAt: new Date(client.updatedAt)
    }))
  }
  
  async findById(id: string): Promise<Client | null> {
    const clients = await this.findAll()
    return clients.find(client => client.id === id) || null
  }
  
  async create(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const client: Client = {
      ...clientData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const clients = await this.findAll()
    clients.push(client)
    
    localStorage.setItem(this.storageKey, JSON.stringify(clients))
    return client
  }
  
  async update(id: string, clientData: Partial<Client>): Promise<Client> {
    const clients = await this.findAll()
    const index = clients.findIndex(client => client.id === id)
    
    if (index === -1) {
      throw new Error(`Client with id ${id} not found`)
    }
    
    clients[index] = {
      ...clients[index],
      ...clientData,
      updatedAt: new Date()
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(clients))
    return clients[index]
  }
  
  async delete(id: string): Promise<void> {
    const clients = await this.findAll()
    const filteredClients = clients.filter(client => client.id !== id)
    localStorage.setItem(this.storageKey, JSON.stringify(filteredClients))
  }
  
  async findByEmail(email: string): Promise<Client | null> {
    const clients = await this.findAll()
    return clients.find(client => client.email === email) || null
  }
}