// 🎯 STORAGE MANAGER - Gestion persistance et synchronisation
// Résout les problèmes de sync entre onglets et perte de données F5

export class StorageManager {
  private static instance: StorageManager
  private listeners: Set<(data: any) => void> = new Set()
  
  // Clés de stockage
  private static readonly EVENTS_KEY = 'mathilde_events'
  private static readonly CLIENTS_KEY = 'mathilde_clients'
  private static readonly SYNC_EVENT = 'mathilde_storage_sync'
  
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }
  
  constructor() {
    // Écouter les changements de localStorage (sync entre onglets)
    window.addEventListener('storage', this.handleStorageChange.bind(this))
    
    // Écouter les événements custom pour sync même onglet
    window.addEventListener(StorageManager.SYNC_EVENT, this.handleCustomSync.bind(this))
  }
  
  // 📥 CHARGEMENT DES DONNÉES
  loadEvents(): any[] {
    try {
      const stored = localStorage.getItem(StorageManager.EVENTS_KEY)
      if (!stored) return []
      
      const events = JSON.parse(stored)
      // Reconvertir les dates
      return events.map((event: any) => ({
        ...event,
        date: new Date(event.date),
        endDate: event.endDate ? new Date(event.endDate) : undefined,
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
        invoiceDate: event.invoiceDate ? new Date(event.invoiceDate) : undefined,
        paidDate: event.paidDate ? new Date(event.paidDate) : undefined,
        completedDate: event.completedDate ? new Date(event.completedDate) : undefined
      }))
    } catch (error) {
      console.error('❌ Erreur chargement events:', error)
      return []
    }
  }
  
  loadClients(): any[] {
    try {
      const stored = localStorage.getItem(StorageManager.CLIENTS_KEY)
      if (!stored) return []
      
      const clients = JSON.parse(stored)
      return clients.map((client: any) => ({
        ...client,
        createdAt: new Date(client.createdAt),
        updatedAt: new Date(client.updatedAt)
      }))
    } catch (error) {
      console.error('❌ Erreur chargement clients:', error)
      return []
    }
  }
  
  // 💾 SAUVEGARDE DES DONNÉES
  saveEvents(events: any[]): void {
    try {
      const serialized = JSON.stringify(events)
      localStorage.setItem(StorageManager.EVENTS_KEY, serialized)
      
      // Déclencher sync pour les autres composants du même onglet
      this.triggerSync('events', events)
      
      console.log('✅ Events sauvegardés:', events.length)
    } catch (error) {
      console.error('❌ Erreur sauvegarde events:', error)
    }
  }
  
  saveClients(clients: any[]): void {
    try {
      const serialized = JSON.stringify(clients)
      localStorage.setItem(StorageManager.CLIENTS_KEY, serialized)
      
      // Déclencher sync pour les autres composants du même onglet
      this.triggerSync('clients', clients)
      
      console.log('✅ Clients sauvegardés:', clients.length)
    } catch (error) {
      console.error('❌ Erreur sauvegarde clients:', error)
    }
  }
  
  // 🔄 SYNCHRONISATION ENTRE ONGLETS
  private handleStorageChange(event: StorageEvent): void {
    if (!event.key || !event.newValue) return
    
    try {
      let data: any
      
      if (event.key === StorageManager.EVENTS_KEY) {
        data = JSON.parse(event.newValue)
        // Reconvertir les dates
        data = data.map((event: any) => ({
          ...event,
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
          invoiceDate: event.invoiceDate ? new Date(event.invoiceDate) : undefined,
          paidDate: event.paidDate ? new Date(event.paidDate) : undefined,
          completedDate: event.completedDate ? new Date(event.completedDate) : undefined
        }))
        
        this.notifyListeners({ type: 'events', data })
        console.log('🔄 Events sync depuis autre onglet:', data.length)
      } 
      else if (event.key === StorageManager.CLIENTS_KEY) {
        data = JSON.parse(event.newValue)
        data = data.map((client: any) => ({
          ...client,
          createdAt: new Date(client.createdAt),
          updatedAt: new Date(client.updatedAt)
        }))
        
        this.notifyListeners({ type: 'clients', data })
        console.log('🔄 Clients sync depuis autre onglet:', data.length)
      }
    } catch (error) {
      console.error('❌ Erreur sync storage:', error)
    }
  }
  
  // 🔄 SYNCHRONISATION MÊME ONGLET
  private handleCustomSync(event: CustomEvent): void {
    const { type, data } = event.detail
    this.notifyListeners({ type, data })
    console.log('🔄 Sync même onglet:', type, data?.length || 'N/A')
  }
  
  private triggerSync(type: string, data: any): void {
    const event = new CustomEvent(StorageManager.SYNC_EVENT, {
      detail: { type, data }
    })
    window.dispatchEvent(event)
  }
  
  // 👂 GESTION DES LISTENERS
  addListener(callback: (data: any) => void): void {
    this.listeners.add(callback)
  }
  
  removeListener(callback: (data: any) => void): void {
    this.listeners.delete(callback)
  }
  
  private notifyListeners(data: any): void {
    this.listeners.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('❌ Erreur listener:', error)
      }
    })
  }
  
  // 🧹 UTILITAIRES
  clear(): void {
    localStorage.removeItem(StorageManager.EVENTS_KEY)
    localStorage.removeItem(StorageManager.CLIENTS_KEY)
    this.triggerSync('clear', null)
    console.log('🧹 Storage vidé')
  }
  
  // 📊 DEBUG
  getStorageInfo(): any {
    return {
      events: this.loadEvents().length,
      clients: this.loadClients().length,
      storageSize: this.getStorageSize(),
      listenersCount: this.listeners.size
    }
  }
  
  private getStorageSize(): string {
    let total = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length
      }
    }
    return `${(total / 1024).toFixed(2)} KB`
  }
}