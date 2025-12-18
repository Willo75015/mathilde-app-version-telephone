/**
 * 🌐 MATHILDE FLEURS - CLIENT API INTELLIGENT
 * Client HTTP robuste avec retry, cache et gestion d'erreurs
 */

import { API_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants'

// Types pour l'API
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  timestamp: number
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

export interface ApiError {
  message: string
  code: string
  status: number
  timestamp: number
  details?: any
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
  cache?: boolean
  cacheTTL?: number
  auth?: boolean
}

export interface ApiClientConfig {
  baseUrl: string
  timeout: number
  retries: number
  headers: Record<string, string>
  interceptors: {
    request: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>>
    response: Array<(response: ApiResponse) => ApiResponse | Promise<ApiResponse>>
    error: Array<(error: ApiError) => ApiError | Promise<ApiError>>
  }
}

/**
 * Client API intelligent avec fonctionnalités avancées
 */
export class ApiClient {
  private config: ApiClientConfig
  private abortControllers = new Map<string, AbortController>()

  constructor(config?: Partial<ApiClientConfig>) {
    this.config = {
      baseUrl: API_CONFIG.baseUrl,
      timeout: API_CONFIG.timeout,
      retries: API_CONFIG.retryAttempts,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': '1.0.0',
        'X-Client-Name': 'Mathilde Fleurs PWA'
      },
      interceptors: {
        request: [],
        response: [],
        error: []
      },
      ...config
    }

    // Intercepteurs par défaut
    this.setupDefaultInterceptors()
  }

  /**
   * Configuration des intercepteurs par défaut
   */
  private setupDefaultInterceptors(): void {
    // Intercepteur de requête pour l'authentification
    this.config.interceptors.request.push(async (config) => {
      const token = localStorage.getItem('auth_token')
      if (token && config.auth !== false) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        }
      }
      return config
    })

    // Intercepteur de réponse pour le logging
    this.config.interceptors.response.push(async (response) => {
      console.log(`✅ API Response: ${response.success ? 'Success' : 'Error'}`, response)
      return response
    })

    // Intercepteur d'erreur pour la gestion globale
    this.config.interceptors.error.push(async (error) => {
      console.error('❌ API Error:', error)
      
      // Gestion des erreurs d'authentification
      if (error.status === 401) {
        await this.handleAuthError()
      }
      
      return error
    })
  }

  /**
   * Faire une requête HTTP
   */
  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId()
    const url = this.buildUrl(endpoint)
    
    try {
      // Vérifier le cache si activé
      if (config.cache && config.method === 'GET') {
        const cached = await this.getFromCache<T>(url)
        if (cached) {
          console.log('📦 Cache hit:', url)
          return cached
        }
      }

      // Préparer la configuration de la requête
      const requestConfig = await this.prepareRequest(config)
      
      // Créer AbortController pour timeout
      const abortController = new AbortController()
      this.abortControllers.set(requestId, abortController)

      // Timeout
      const timeoutId = setTimeout(() => {
        abortController.abort()
      }, requestConfig.timeout || this.config.timeout)

      // Faire la requête avec retry
      const response = await this.makeRequestWithRetry<T>(
        url,
        requestConfig,
        abortController.signal,
        requestConfig.retries || this.config.retries
      )

      clearTimeout(timeoutId)
      this.abortControllers.delete(requestId)

      // Mettre en cache si nécessaire
      if (config.cache && config.method === 'GET') {
        await this.setCache<T>(url, response, config.cacheTTL)
      }

      return response
    } catch (error) {
      this.abortControllers.delete(requestId)
      throw await this.handleError(error)
    }
  }

  /**
   * Faire une requête avec retry automatique
   */
  private async makeRequestWithRetry<T>(
    url: string,
    config: RequestConfig,
    signal: AbortSignal,
    retries: number
  ): Promise<ApiResponse<T>> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: config.method || 'GET',
          headers: config.headers,
          body: config.body ? JSON.stringify(config.body) : undefined,
          signal
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        // Appliquer les intercepteurs de réponse
        let result: ApiResponse<T> = {
          data,
          success: true,
          timestamp: Date.now()
        }

        for (const interceptor of this.config.interceptors.response) {
          result = await interceptor(result)
        }

        return result
      } catch (error) {
        if (attempt === retries) {
          throw error
        }

        // Attendre avant de retry (backoff exponentiel)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        await this.delay(delay)
        
        console.log(`🔄 Retry attempt ${attempt + 1}/${retries} for ${url}`)
      }
    }

    throw new Error('Maximum retries exceeded')
  }

  /**
   * Préparer la configuration de la requête
   */
  private async prepareRequest(config: RequestConfig): Promise<RequestConfig> {
    let preparedConfig: RequestConfig = {
      ...config,
      headers: {
        ...this.config.headers,
        ...config.headers
      }
    }

    // Appliquer les intercepteurs de requête
    for (const interceptor of this.config.interceptors.request) {
      preparedConfig = await interceptor(preparedConfig)
    }

    return preparedConfig
  }

  /**
   * Construire l'URL complète
   */
  private buildUrl(endpoint: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '')
    const cleanEndpoint = endpoint.replace(/^\//, '')
    return `${baseUrl}/${cleanEndpoint}`
  }

  /**
   * Gérer les erreurs
   */
  private async handleError(error: any): Promise<ApiError> {
    let apiError: ApiError = {
      message: ERROR_MESSAGES.networkError,
      code: 'NETWORK_ERROR',
      status: 0,
      timestamp: Date.now()
    }

    if (error.name === 'AbortError') {
      apiError = {
        message: ERROR_MESSAGES.timeout,
        code: 'TIMEOUT',
        status: 408,
        timestamp: Date.now()
      }
    } else if (error.message?.includes('HTTP')) {
      const statusMatch = error.message.match(/HTTP (\d+)/)
      if (statusMatch) {
        const status = parseInt(statusMatch[1])
        apiError = {
          message: this.getErrorMessage(status),
          code: this.getErrorCode(status),
          status,
          timestamp: Date.now()
        }
      }
    }

    // Appliquer les intercepteurs d'erreur
    for (const interceptor of this.config.interceptors.error) {
      apiError = await interceptor(apiError)
    }

    return apiError
  }

  /**
   * Obtenir le message d'erreur selon le statut HTTP
   */
  private getErrorMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'Requête invalide',
      401: ERROR_MESSAGES.unauthorized,
      403: ERROR_MESSAGES.forbidden,
      404: ERROR_MESSAGES.notFound,
      429: ERROR_MESSAGES.rateLimitExceeded,
      500: ERROR_MESSAGES.serverError,
      502: 'Service temporairement indisponible',
      503: 'Service en maintenance',
      504: ERROR_MESSAGES.timeout
    }

    return messages[status] || ERROR_MESSAGES.serverError
  }

  /**
   * Obtenir le code d'erreur selon le statut HTTP
   */
  private getErrorCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT'
    }

    return codes[status] || 'UNKNOWN_ERROR'
  }

  /**
   * Gérer les erreurs d'authentification
   */
  private async handleAuthError(): Promise<void> {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')

    // Rediriger vers la page de connexion
    window.location.href = '/login'
  }

  /**
   * Gestion du cache
   */
  private async getFromCache<T>(url: string): Promise<ApiResponse<T> | null> {
    try {
      const cacheKey = `api_cache_${this.hashUrl(url)}`
      const cached = sessionStorage.getItem(cacheKey)
      if (!cached) return null

      const parsed = JSON.parse(cached)
      // Vérifier l'expiration
      if (parsed.expiration && Date.now() > parsed.expiration) {
        sessionStorage.removeItem(cacheKey)
        return null
      }
      return parsed.data as ApiResponse<T>
    } catch (error) {
      console.warn('Cache read error:', error)
      return null
    }
  }

  private async setCache<T>(
    url: string,
    response: ApiResponse<T>,
    ttl: number = 300000 // 5 minutes par défaut
  ): Promise<void> {
    try {
      const cacheKey = `api_cache_${this.hashUrl(url)}`
      const cacheData = {
        data: response,
        expiration: Date.now() + ttl
      }
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Cache write error:', error)
    }
  }

  /**
   * Hasher une URL pour le cache
   */
  private hashUrl(url: string): string {
    let hash = 0
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  /**
   * Générer un ID unique pour la requête
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Attendre un délai
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Méthodes de convenance
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data })
  }

  async put<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data })
  }

  async patch<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body: data })
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }

  /**
   * Annuler toutes les requêtes en cours
   */
  cancelAllRequests(): void {
    for (const [id, controller] of this.abortControllers) {
      controller.abort()
      this.abortControllers.delete(id)
    }
  }

  /**
   * Ajouter un intercepteur de requête
   */
  addRequestInterceptor(
    interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  ): void {
    this.config.interceptors.request.push(interceptor)
  }

  /**
   * Ajouter un intercepteur de réponse
   */
  addResponseInterceptor(
    interceptor: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>
  ): void {
    this.config.interceptors.response.push(interceptor)
  }

  /**
   * Ajouter un intercepteur d'erreur
   */
  addErrorInterceptor(
    interceptor: (error: ApiError) => ApiError | Promise<ApiError>
  ): void {
    this.config.interceptors.error.push(interceptor)
  }
}

// Instance par défaut
export const apiClient = new ApiClient()

// API spécialisée pour Mathilde Fleurs
export const MathildeAPI = {
  // Authentification
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/auth/login', credentials),
    
    logout: () =>
      apiClient.post('/auth/logout'),
    
    refresh: () =>
      apiClient.post('/auth/refresh'),
    
    profile: () =>
      apiClient.get('/auth/profile')
  },

  // Événements
  events: {
    list: (params?: { page?: number; limit?: number; status?: string }) =>
      apiClient.get('/events', { cache: true, cacheTTL: 60000 }),
    
    get: (id: string) =>
      apiClient.get(`/events/${id}`, { cache: true }),
    
    create: (event: any) =>
      apiClient.post('/events', event),
    
    update: (id: string, event: any) =>
      apiClient.put(`/events/${id}`, event),
    
    delete: (id: string) =>
      apiClient.delete(`/events/${id}`),
    
    byClient: (clientId: string) =>
      apiClient.get(`/events/client/${clientId}`, { cache: true }),
    
    byDateRange: (start: string, end: string) =>
      apiClient.get(`/events/range?start=${start}&end=${end}`, { cache: true })
  },

  // Clients
  clients: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      apiClient.get('/clients', { cache: true, cacheTTL: 120000 }),
    
    get: (id: string) =>
      apiClient.get(`/clients/${id}`, { cache: true }),
    
    create: (client: any) =>
      apiClient.post('/clients', client),
    
    update: (id: string, client: any) =>
      apiClient.put(`/clients/${id}`, client),
    
    delete: (id: string) =>
      apiClient.delete(`/clients/${id}`),
    
    search: (query: string) =>
      apiClient.get(`/clients/search?q=${encodeURIComponent(query)}`, { cache: true, cacheTTL: 30000 })
  },

  // Fleurs
  flowers: {
    catalog: () =>
      apiClient.get('/flowers', { cache: true, cacheTTL: 300000 }),
    
    get: (id: string) =>
      apiClient.get(`/flowers/${id}`, { cache: true }),
    
    bySeason: (season: string) =>
      apiClient.get(`/flowers/season/${season}`, { cache: true }),
    
    byCategory: (category: string) =>
      apiClient.get(`/flowers/category/${category}`, { cache: true }),
    
    updateStock: (id: string, quantity: number) =>
      apiClient.patch(`/flowers/${id}/stock`, { quantity })
  },

  // Analytics
  analytics: {
    dashboard: () =>
      apiClient.get('/analytics/dashboard', { cache: true, cacheTTL: 60000 }),
    
    events: (period: string) =>
      apiClient.get(`/analytics/events?period=${period}`, { cache: true }),
    
    revenue: (period: string) =>
      apiClient.get(`/analytics/revenue?period=${period}`, { cache: true }),
    
    clients: () =>
      apiClient.get('/analytics/clients', { cache: true, cacheTTL: 120000 })
  },

  // Upload de fichiers
  upload: {
    image: (file: File, type: 'event' | 'client' | 'flower') => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      
      return apiClient.request('/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          // Ne pas définir Content-Type pour FormData
        },
        timeout: 30000 // 30 secondes pour les uploads
      })
    },
    
    document: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      return apiClient.request('/upload/document', {
        method: 'POST',
        body: formData,
        headers: {},
        timeout: 60000 // 1 minute pour les documents
      })
    }
  },

  // Synchronisation
  sync: {
    push: (data: any) =>
      apiClient.post('/sync/push', data),
    
    pull: (lastSync?: string) =>
      apiClient.get(`/sync/pull${lastSync ? `?since=${lastSync}` : ''}`)
  }
}

// Export par défaut
export default apiClient
