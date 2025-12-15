/**
 * 🎨 MATHILDE FLEURS - UTILITAIRES DE FORMATAGE
 * Formatage intelligent des données pour l'affichage utilisateur
 */

import { EVENT_STATUS_LABELS, FLOWER_CATEGORY_LABELS, USER_ROLE_LABELS } from './constants'
import { DateUtils } from './date'

// Types pour le formatage
export type CurrencyCode = 'EUR' | 'USD' | 'GBP'
export type PhoneFormat = 'international' | 'national' | 'display'
export type TextCase = 'uppercase' | 'lowercase' | 'capitalize' | 'title'
export type NameFormat = 'first-last' | 'last-first' | 'initials' | 'formal'

export interface FormatOptions {
  locale?: string
  currency?: CurrencyCode
  decimals?: number
  showSymbol?: boolean
  compact?: boolean
}

/**
 * Classe principale pour le formatage des données
 */
export class DataFormatter {
  private static readonly DEFAULT_LOCALE = 'fr-FR'
  private static readonly DEFAULT_CURRENCY: CurrencyCode = 'EUR'

  /**
   * Formater un montant en devise
   */
  static currency(
    amount: number,
    options: FormatOptions = {}
  ): string {
    const {
      locale = this.DEFAULT_LOCALE,
      currency = this.DEFAULT_CURRENCY,
      decimals = 2,
      showSymbol = true,
      compact = false
    } = options

    if (isNaN(amount)) return '0,00 €'

    try {
      if (compact && Math.abs(amount) >= 1000) {
        return this.compactCurrency(amount, currency)
      }

      const formatter = new Intl.NumberFormat(locale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })

      return formatter.format(amount)
    } catch (error) {
      console.error('Currency formatting error:', error)
      return `${amount.toFixed(decimals)} €`
    }
  }

  /**
   * Formater un montant compact (1K, 1.5K, etc.)
   */
  private static compactCurrency(amount: number, currency: CurrencyCode): string {
    const symbols = {
      EUR: '€',
      USD: '$',
      GBP: '£'
    }

    const absAmount = Math.abs(amount)
    const sign = amount < 0 ? '-' : ''

    if (absAmount >= 1000000) {
      return `${sign}${(absAmount / 1000000).toFixed(1)}M ${symbols[currency]}`
    }
    if (absAmount >= 1000) {
      return `${sign}${(absAmount / 1000).toFixed(1)}K ${symbols[currency]}`
    }

    return `${sign}${absAmount.toFixed(0)} ${symbols[currency]}`
  }

  /**
   * Formater un pourcentage
   */
  static percentage(
    value: number,
    decimals: number = 1,
    locale: string = this.DEFAULT_LOCALE
  ): string {
    if (isNaN(value)) return '0%'

    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })

      return formatter.format(value / 100)
    } catch (error) {
      return `${value.toFixed(decimals)}%`
    }
  }

  /**
   * Formater un nombre avec séparateurs
   */
  static number(
    value: number,
    decimals: number = 0,
    locale: string = this.DEFAULT_LOCALE
  ): string {
    if (isNaN(value)) return '0'

    try {
      const formatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })

      return formatter.format(value)
    } catch (error) {
      return value.toFixed(decimals)
    }
  }

  /**
   * Formater un numéro de téléphone français
   */
  static phone(phone: string, format: PhoneFormat = 'display'): string {
    if (!phone) return ''

    // Nettoyer le numéro
    const cleaned = phone.replace(/\D/g, '')

    // Vérifier si c'est un numéro français valide
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      switch (format) {
        case 'international':
          return `+33 ${cleaned.substring(1, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`
        
        case 'national':
          return cleaned
        
        case 'display':
        default:
          return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`
      }
    }

    // Si numéro international avec +33
    if (cleaned.length === 11 && cleaned.startsWith('33')) {
      const national = '0' + cleaned.substring(2)
      return this.phone(national, format)
    }

    // Retourner tel quel si format non reconnu
    return phone
  }

  /**
   * Formater une adresse complète
   */
  static address(address: {
    street?: string
    city?: string
    postalCode?: string
    country?: string
  }): string {
    const parts = [
      address.street,
      address.postalCode && address.city ? `${address.postalCode} ${address.city}` : address.city,
      address.country && address.country !== 'France' ? address.country : null
    ].filter(Boolean)

    return parts.join(', ')
  }

  /**
   * Formater un nom complet
   */
  static fullName(
    firstName: string,
    lastName: string,
    format: NameFormat = 'first-last'
  ): string {
    if (!firstName && !lastName) return ''
    if (!firstName) return lastName
    if (!lastName) return firstName

    switch (format) {
      case 'first-last':
        return `${firstName} ${lastName}`
      
      case 'last-first':
        return `${lastName}, ${firstName}`
      
      case 'initials':
        return `${firstName.charAt(0).toUpperCase()}.${lastName.charAt(0).toUpperCase()}.`
      
      case 'formal':
        return `${lastName.toUpperCase()}, ${firstName}`
      
      default:
        return `${firstName} ${lastName}`
    }
  }

  /**
   * Formater le texte selon la casse
   */
  static textCase(text: string, format: TextCase): string {
    if (!text) return ''

    switch (format) {
      case 'uppercase':
        return text.toUpperCase()
      
      case 'lowercase':
        return text.toLowerCase()
      
      case 'capitalize':
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
      
      case 'title':
        return text
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      
      default:
        return text
    }
  }

  /**
   * Formater un email avec masquage partiel
   */
  static email(email: string, mask: boolean = false): string {
    if (!email) return ''

    if (!mask) return email

    const [local, domain] = email.split('@')
    if (!domain) return email

    const maskedLocal = local.length > 2 
      ? local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1)
      : local

    return `${maskedLocal}@${domain}`
  }

  /**
   * Formater la taille des fichiers
   */
  static fileSize(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 o'

    const k = 1024
    const sizes = ['o', 'Ko', 'Mo', 'Go', 'To']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
  }

  /**
   * Formater une durée en texte
   */
  static duration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds} ms`
    }

    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}j ${hours % 24}h ${minutes % 60}min`
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}min`
    }
    if (minutes > 0) {
      return `${minutes}min ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  /**
   * Formater un statut d'événement
   */
  static eventStatus(status: string): string {
    return EVENT_STATUS_LABELS[status as keyof typeof EVENT_STATUS_LABELS] || status
  }

  /**
   * Formater une catégorie de fleur
   */
  static flowerCategory(category: string): string {
    return FLOWER_CATEGORY_LABELS[category as keyof typeof FLOWER_CATEGORY_LABELS] || category
  }

  /**
   * Formater un rôle utilisateur
   */
  static userRole(role: string): string {
    return USER_ROLE_LABELS[role as keyof typeof USER_ROLE_LABELS] || role
  }

  /**
   * Tronquer un texte avec ellipse
   */
  static truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (!text) return ''
    if (text.length <= maxLength) return text
    
    return text.substring(0, maxLength - suffix.length) + suffix
  }

  /**
   * Formater un texte en slug URL
   */
  static slug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9]/g, '-') // Remplacer par des tirets
      .replace(/-+/g, '-') // Fusionner les tirets multiples
      .replace(/^-|-$/g, '') // Supprimer les tirets en début/fin
  }

  /**
   * Formater un texte de recherche (highlight)
   */
  static highlight(text: string, query: string): string {
    if (!query || !text) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  /**
   * Formater les initiales d'un nom
   */
  static initials(firstName: string, lastName: string): string {
    const first = firstName?.charAt(0)?.toUpperCase() || ''
    const last = lastName?.charAt(0)?.toUpperCase() || ''
    return first + last
  }

  /**
   * Formater un nombre ordinal (1er, 2ème, etc.)
   */
  static ordinal(number: number): string {
    if (number === 1) return '1er'
    return `${number}ème`
  }

  /**
   * Formater une liste avec "et"
   */
  static list(items: string[], conjunction: string = 'et'): string {
    if (items.length === 0) return ''
    if (items.length === 1) return items[0]
    if (items.length === 2) return items.join(` ${conjunction} `)
    
    const lastItem = items.pop()
    return `${items.join(', ')} ${conjunction} ${lastItem}`
  }

  /**
   * Formater une couleur hex en RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  /**
   * Formater RGB en hex
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }).join("")
  }

  /**
   * Obtenir une couleur de contraste (noir ou blanc)
   */
  static getContrastColor(hexColor: string): string {
    const rgb = this.hexToRgb(hexColor)
    if (!rgb) return '#000000'

    // Calcul de la luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
    return luminance > 0.5 ? '#000000' : '#ffffff'
  }

  /**
   * Formater les métadonnées d'un fichier
   */
  static fileMetadata(file: File): string {
    const size = this.fileSize(file.size)
    const date = DateUtils.format(new Date(file.lastModified), 'dd/MM/yyyy')
    return `${size} • ${date}`
  }

  /**
   * Formater un score ou une note
   */
  static score(value: number, max: number = 5, showMax: boolean = true): string {
    const formatted = this.number(value, 1)
    return showMax ? `${formatted}/${max}` : formatted
  }

  /**
   * Formater une progression en pourcentage
   */
  static progress(current: number, total: number): string {
    if (total === 0) return '0%'
    const percent = (current / total) * 100
    return this.percentage(percent, 0)
  }

  /**
   * Formater des coordonnées GPS
   */
  static coordinates(lat: number, lng: number, precision: number = 6): string {
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`
  }

  /**
   * Formater une URL pour l'affichage
   */
  static displayUrl(url: string, maxLength: number = 40): string {
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.replace('www.', '')
      const path = urlObj.pathname + urlObj.search

      if (domain.length + path.length <= maxLength) {
        return domain + path
      }

      if (domain.length >= maxLength - 3) {
        return this.truncate(domain, maxLength - 3) + '...'
      }

      const availableLength = maxLength - domain.length - 3
      return domain + this.truncate(path, availableLength) + '...'
    } catch {
      return this.truncate(url, maxLength)
    }
  }

  /**
   * Formater un temps écoulé relatif
   */
  static timeAgo(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'à l\'instant'
    if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} h`
    if (diffInSeconds < 2592000) return `il y a ${Math.floor(diffInSeconds / 86400)} j`
    if (diffInSeconds < 31536000) return `il y a ${Math.floor(diffInSeconds / 2592000)} mois`
    
    return `il y a ${Math.floor(diffInSeconds / 31536000)} an${Math.floor(diffInSeconds / 31536000) > 1 ? 's' : ''}`
  }
}

// Raccourcis pour les fonctions les plus utilisées
export const {
  currency,
  percentage,
  number,
  phone,
  address,
  fullName,
  textCase,
  email,
  fileSize,
  duration,
  eventStatus,
  flowerCategory,
  userRole,
  truncate,
  slug,
  highlight,
  initials,
  ordinal,
  list,
  timeAgo,
  progress,
  score
} = DataFormatter

// Formatters spécialisés pour Mathilde Fleurs
export const EventFormatter = {
  /**
   * Formater les détails d'un événement
   */
  eventSummary(event: any): string {
    const date = DateUtils.format(new Date(event.date), 'dd MMMM yyyy')
    const budget = currency(event.budget)
    const status = eventStatus(event.status)
    
    return `${event.title} • ${date} • ${budget} • ${status}`
  },

  /**
   * Formater la liste des fleurs d'un événement
   */
  flowerList(flowers: any[]): string {
    if (!flowers || flowers.length === 0) return 'Aucune fleur sélectionnée'
    
    const flowerNames = flowers.map(f => `${f.quantity} ${f.name}`)
    return list(flowerNames)
  },

  /**
   * Formater les informations de client
   */
  clientInfo(client: any): string {
    const name = fullName(client.firstName, client.lastName)
    const contact = client.phone ? phone(client.phone) : client.email
    
    return `${name} • ${contact}`
  }
}

// Export par défaut
export default DataFormatter
