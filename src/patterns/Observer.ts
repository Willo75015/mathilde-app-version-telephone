import { AppState, Theme } from '@/types'

// Pattern Observer pour la gestion d'état réactive
export interface Observer<T> {
  update(data: T): void
}

export interface Subject<T> {
  subscribe(observer: Observer<T>): void
  unsubscribe(observer: Observer<T>): void
  notify(data: T): void
}

export class EventEmitter<T> implements Subject<T> {
  private observers: Observer<T>[] = []
  
  subscribe(observer: Observer<T>): void {
    this.observers.push(observer)
  }
  
  unsubscribe(observer: Observer<T>): void {
    this.observers = this.observers.filter(obs => obs !== observer)
  }
  
  notify(data: T): void {
    this.observers.forEach(observer => observer.update(data))
  }
}

// Store global utilisant le pattern Observer
export class AppStore {
  private static instance: AppStore
  private eventEmitter = new EventEmitter<AppState>()
  private state: AppState = {
    user: null,
    events: [],
    clients: [],
    flowers: [],
    isLoading: false,
    error: null,
    theme: Theme.SYSTEM
  }
  
  static getInstance(): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore()
    }
    return AppStore.instance
  }
  
  getState(): AppState {
    return { ...this.state }
  }
  
  setState(newState: Partial<AppState>): void {
    this.state = { ...this.state, ...newState }
    this.eventEmitter.notify(this.state)
  }
  
  subscribe(observer: Observer<AppState>): void {
    this.eventEmitter.subscribe(observer)
  }
  
  unsubscribe(observer: Observer<AppState>): void {
    this.eventEmitter.unsubscribe(observer)
  }
}