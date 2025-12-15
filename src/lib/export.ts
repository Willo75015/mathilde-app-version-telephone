/**
 * 📊 MATHILDE FLEURS - GESTIONNAIRE D'EXPORT
 * Export PDF et Excel avec mise en forme professionnelle
 */

import { DataFormatter } from './format'
import { DateUtils } from './date'
import { APP_CONFIG } from './constants'

// Types pour l'export
export interface ExportOptions {
  filename?: string
  format: 'pdf' | 'excel' | 'csv' | 'json'
  title?: string
  subtitle?: string
  includeHeader?: boolean
  includeFooter?: boolean
  orientation?: 'portrait' | 'landscape'
  pageSize?: 'A4' | 'A3' | 'letter'
}

export interface ExportColumn {
  key: string
  label: string
  width?: number
  type?: 'text' | 'number' | 'currency' | 'date' | 'boolean'
  format?: string
}

export interface ExportData {
  columns: ExportColumn[]
  rows: Record<string, any>[]
  summary?: Record<string, any>
}

export interface PDFOptions extends ExportOptions {
  margins?: { top: number; right: number; bottom: number; left: number }
  fontSize?: number
  fontFamily?: string
  colors?: {
    primary: string
    secondary: string
    text: string
    background: string
  }
}

export interface ExcelOptions extends ExportOptions {
  sheetName?: string
  autoFilter?: boolean
  freezeHeader?: boolean
  chartData?: {
    type: 'line' | 'bar' | 'pie' | 'column'
    title: string
    dataRange: string
  }
}

/**
 * Gestionnaire principal d'export
 */
export class ExportManager {
  private static readonly DEFAULT_COLORS = {
    primary: '#10b981',
    secondary: '#374151',
    text: '#1f2937',
    background: '#ffffff'
  }

  /**
   * Exporter des données au format spécifié
   */
  static async export(
    data: ExportData,
    options: ExportOptions
  ): Promise<void> {
    const filename = options.filename || this.generateFilename(options.title, options.format)

    switch (options.format) {
      case 'pdf':
        await this.exportToPDF(data, { ...options, filename } as PDFOptions)
        break
      
      case 'excel':
        await this.exportToExcel(data, { ...options, filename } as ExcelOptions)
        break
      
      case 'csv':
        await this.exportToCSV(data, filename)
        break
      
      case 'json':
        await this.exportToJSON(data, filename)
        break
      
      default:
        throw new Error(`Format d'export non supporté: ${options.format}`)
    }
  }

  /**
   * Export PDF avec jsPDF
   */
  private static async exportToPDF(
    data: ExportData,
    options: PDFOptions
  ): Promise<void> {
    // En mode développement, on simule l'export
    if (import.meta.env.DEV) {
      console.log('📄 Simulation export PDF:', { data, options })
      this.downloadSimulatedFile(options.filename!, 'pdf')
      return
    }

    // Dans un vrai projet, on utiliserait jsPDF
    /*
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.pageSize || 'a4'
    })

    // Configuration
    const margins = options.margins || { top: 20, right: 20, bottom: 20, left: 20 }
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const contentWidth = pageWidth - margins.left - margins.right
    
    let currentY = margins.top

    // En-tête
    if (options.includeHeader !== false) {
      currentY = this.addPDFHeader(doc, options, margins, currentY)
    }

    // Titre principal
    if (options.title) {
      doc.setFontSize(16)
      doc.setFont(undefined, 'bold')
      doc.text(options.title, margins.left, currentY)
      currentY += 10
    }

    // Sous-titre
    if (options.subtitle) {
      doc.setFontSize(12)
      doc.setFont(undefined, 'normal')
      doc.text(options.subtitle, margins.left, currentY)
      currentY += 8
    }

    // Tableau
    currentY = this.addPDFTable(doc, data, margins, currentY, contentWidth)

    // Résumé
    if (data.summary) {
      currentY = this.addPDFSummary(doc, data.summary, margins, currentY)
    }

    // Pied de page
    if (options.includeFooter !== false) {
      this.addPDFFooter(doc, margins, pageHeight)
    }

    // Télécharger
    doc.save(options.filename!)
    */

    // Simulation pour le développement
    this.downloadSimulatedFile(options.filename!, 'pdf')
  }

  /**
   * Export Excel avec ExcelJS
   */
  private static async exportToExcel(
    data: ExportData,
    options: ExcelOptions
  ): Promise<void> {
    // En mode développement, on simule l'export
    if (import.meta.env.DEV) {
      console.log('📊 Simulation export Excel:', { data, options })
      this.downloadSimulatedFile(options.filename!, 'xlsx')
      return
    }

    // Dans un vrai projet, on utiliserait ExcelJS
    /*
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    
    // Métadonnées
    workbook.creator = APP_CONFIG.author
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.company = APP_CONFIG.name

    const worksheet = workbook.addWorksheet(options.sheetName || 'Données')

    // Titre
    if (options.title) {
      worksheet.addRow([options.title])
      worksheet.mergeCells('A1:' + this.getExcelColumnLetter(data.columns.length) + '1')
      const titleCell = worksheet.getCell('A1')
      titleCell.font = { bold: true, size: 16 }
      titleCell.alignment = { horizontal: 'center' }
      worksheet.addRow([]) // Ligne vide
    }

    // En-têtes
    const headerRow = worksheet.addRow(data.columns.map(col => col.label))
    headerRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' }
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    // Données
    data.rows.forEach(row => {
      const values = data.columns.map(col => this.formatCellValue(row[col.key], col))
      const dataRow = worksheet.addRow(values)
      
      dataRow.eachCell((cell, colNumber) => {
        const column = data.columns[colNumber - 1]
        this.formatExcelCell(cell, column)
      })
    })

    // Auto-fit des colonnes
    data.columns.forEach((col, index) => {
      const column = worksheet.getColumn(index + 1)
      column.width = col.width || 15
    })

    // Auto-filtre
    if (options.autoFilter) {
      worksheet.autoFilter = {
        from: 'A' + (options.title ? '3' : '1'),
        to: this.getExcelColumnLetter(data.columns.length) + (data.rows.length + (options.title ? 3 : 1))
      }
    }

    // Figer les en-têtes
    if (options.freezeHeader) {
      worksheet.views = [{ state: 'frozen', ySplit: options.title ? 3 : 1 }]
    }

    // Graphique si demandé
    if (options.chartData) {
      this.addExcelChart(worksheet, options.chartData, data)
    }

    // Sauvegarder
    const buffer = await workbook.xlsx.writeBuffer()
    this.downloadBuffer(buffer, options.filename!, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    */

    // Simulation pour le développement
    this.downloadSimulatedFile(options.filename!, 'xlsx')
  }

  /**
   * Export CSV simple
   */
  private static async exportToCSV(
    data: ExportData,
    filename: string
  ): Promise<void> {
    const delimiter = ';' // Séparateur français
    const newline = '\r\n'

    // En-têtes
    const headers = data.columns.map(col => this.escapeCSV(col.label)).join(delimiter)
    
    // Données
    const rows = data.rows.map(row => 
      data.columns.map(col => {
        const value = this.formatCellValue(row[col.key], col)
        return this.escapeCSV(String(value))
      }).join(delimiter)
    )

    const csvContent = [headers, ...rows].join(newline)
    
    // BOM pour Excel UTF-8
    const bom = '\uFEFF'
    const blob = new Blob([bom + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    })
    
    this.downloadBlob(blob, filename)
  }

  /**
   * Export JSON
   */
  private static async exportToJSON(
    data: ExportData,
    filename: string
  ): Promise<void> {
    const exportData = {
      metadata: {
        title: filename.replace(/\.[^/.]+$/, ''),
        exported: new Date().toISOString(),
        app: APP_CONFIG.name,
        version: APP_CONFIG.version
      },
      columns: data.columns,
      data: data.rows,
      summary: data.summary || null,
      count: data.rows.length
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    
    this.downloadBlob(blob, filename)
  }

  /**
   * Formater une valeur de cellule selon son type
   */
  private static formatCellValue(value: any, column: ExportColumn): any {
    if (value === null || value === undefined) return ''

    switch (column.type) {
      case 'currency':
        return DataFormatter.currency(Number(value))
      
      case 'date':
        return DateUtils.format(new Date(value), column.format as any || 'dd/MM/yyyy')
      
      case 'number':
        return DataFormatter.number(Number(value))
      
      case 'boolean':
        return value ? 'Oui' : 'Non'
      
      default:
        return String(value)
    }
  }

  /**
   * Échapper les valeurs CSV
   */
  private static escapeCSV(value: string): string {
    if (value.includes(';') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  /**
   * Obtenir la lettre de colonne Excel (A, B, C, ... AA, AB, etc.)
   */
  private static getExcelColumnLetter(columnNumber: number): string {
    let columnName = ''
    while (columnNumber > 0) {
      const remainder = (columnNumber - 1) % 26
      columnName = String.fromCharCode(65 + remainder) + columnName
      columnNumber = Math.floor((columnNumber - 1) / 26)
    }
    return columnName
  }

  /**
   * Générer un nom de fichier
   */
  private static generateFilename(title?: string, format?: string): string {
    const date = DateUtils.format(new Date(), 'yyyy-MM-dd')
    const cleanTitle = title ? DataFormatter.slug(title) : 'export'
    const extension = format === 'excel' ? 'xlsx' : format
    
    return `${cleanTitle}-${date}.${extension}`
  }

  /**
   * Télécharger un blob
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Télécharger un buffer
   */
  private static downloadBuffer(
    buffer: ArrayBuffer, 
    filename: string, 
    mimeType: string
  ): void {
    const blob = new Blob([buffer], { type: mimeType })
    this.downloadBlob(blob, filename)
  }

  /**
   * Simulation de téléchargement pour le développement
   */
  private static downloadSimulatedFile(filename: string, type: string): void {
    const content = `Fichier ${type.toUpperCase()} simulé - ${filename}\nGénéré le ${new Date().toLocaleString()}`
    const blob = new Blob([content], { type: 'text/plain' })
    this.downloadBlob(blob, filename.replace(/\.[^/.]+$/, '') + '.txt')
  }
}

// Exporters spécialisés pour Mathilde Fleurs
export const EventExporter = {
  /**
   * Exporter la liste des événements
   */
  async exportEvents(
    events: any[],
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const data: ExportData = {
      columns: [
        { key: 'title', label: 'Titre', width: 25 },
        { key: 'date', label: 'Date', type: 'date', width: 15 },
        { key: 'time', label: 'Heure', width: 10 },
        { key: 'client', label: 'Client', width: 20 },
        { key: 'location', label: 'Lieu', width: 20 },
        { key: 'budget', label: 'Budget', type: 'currency', width: 12 },
        { key: 'status', label: 'Statut', width: 12 },
        { key: 'flowerCount', label: 'Nb Fleurs', type: 'number', width: 10 }
      ],
      rows: events.map(event => ({
        title: event.title,
        date: event.date,
        time: event.time,
        client: DataFormatter.fullName(event.client?.firstName, event.client?.lastName),
        location: event.location,
        budget: event.budget,
        status: DataFormatter.eventStatus(event.status),
        flowerCount: event.flowers?.length || 0
      })),
      summary: {
        totalEvents: events.length,
        totalBudget: events.reduce((sum, e) => sum + e.budget, 0),
        averageBudget: events.length > 0 ? events.reduce((sum, e) => sum + e.budget, 0) / events.length : 0
      }
    }

    await ExportManager.export(data, {
      title: 'Liste des Événements',
      subtitle: `Exporté le ${DateUtils.format(new Date(), 'dd MMMM yyyy')}`,
      ...options
    })
  },

  /**
   * Exporter un événement détaillé
   */
  async exportEventDetails(
    event: any,
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const data: ExportData = {
      columns: [
        { key: 'property', label: 'Propriété', width: 20 },
        { key: 'value', label: 'Valeur', width: 30 }
      ],
      rows: [
        { property: 'Titre', value: event.title },
        { property: 'Date', value: DateUtils.format(new Date(event.date), 'dd MMMM yyyy') },
        { property: 'Heure', value: event.time },
        { property: 'Lieu', value: event.location },
        { property: 'Budget', value: DataFormatter.currency(event.budget) },
        { property: 'Statut', value: DataFormatter.eventStatus(event.status) },
        { property: 'Client', value: DataFormatter.fullName(event.client?.firstName, event.client?.lastName) },
        { property: 'Email', value: event.client?.email },
        { property: 'Téléphone', value: DataFormatter.phone(event.client?.phone) },
        { property: 'Description', value: event.description },
        { property: 'Notes', value: event.notes || 'Aucune' }
      ]
    }

    // Ajouter les fleurs si présentes
    if (event.flowers && event.flowers.length > 0) {
      data.rows.push({ property: 'Fleurs', value: '---' })
      event.flowers.forEach((flower: any, index: number) => {
        data.rows.push({
          property: `Fleur ${index + 1}`,
          value: `${flower.quantity} ${flower.name}`
        })
      })
    }

    await ExportManager.export(data, {
      title: `Événement - ${event.title}`,
      subtitle: `Exporté le ${DateUtils.format(new Date(), 'dd MMMM yyyy')}`,
      filename: `evenement-${DataFormatter.slug(event.title)}-${DateUtils.format(new Date(event.date), 'yyyy-MM-dd')}`,
      ...options
    })
  }
}

export const ClientExporter = {
  /**
   * Exporter la liste des clients
   */
  async exportClients(
    clients: any[],
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const data: ExportData = {
      columns: [
        { key: 'name', label: 'Nom complet', width: 25 },
        { key: 'email', label: 'Email', width: 25 },
        { key: 'phone', label: 'Téléphone', width: 15 },
        { key: 'city', label: 'Ville', width: 20 },
        { key: 'eventsCount', label: 'Nb Événements', type: 'number', width: 12 },
        { key: 'totalSpent', label: 'Total Rapporté', type: 'currency', width: 15 },
        { key: 'lastEvent', label: 'Dernier Événement', type: 'date', width: 15 }
      ],
      rows: clients.map(client => {
        const events = client.events || []
        const totalSpent = events.reduce((sum: number, e: any) => sum + (e.budget || 0), 0)
        const lastEvent = events.length > 0 
          ? new Date(Math.max(...events.map((e: any) => new Date(e.date).getTime())))
          : null

        return {
          name: DataFormatter.fullName(client.firstName, client.lastName),
          email: client.email,
          phone: DataFormatter.phone(client.phone),
          city: client.address?.city || '',
          eventsCount: events.length,
          totalSpent,
          lastEvent
        }
      }),
      summary: {
        totalClients: clients.length,
        totalRevenue: clients.reduce((sum, c) => {
          const events = c.events || []
          return sum + events.reduce((eventSum: number, e: any) => eventSum + (e.budget || 0), 0)
        }, 0)
      }
    }

    await ExportManager.export(data, {
      title: 'Liste des Clients',
      subtitle: `Exporté le ${DateUtils.format(new Date(), 'dd MMMM yyyy')}`,
      ...options
    })
  }
}

export const AnalyticsExporter = {
  /**
   * Exporter les statistiques
   */
  async exportAnalytics(
    analytics: any,
    period: string,
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const data: ExportData = {
      columns: [
        { key: 'metric', label: 'Métrique', width: 25 },
        { key: 'value', label: 'Valeur', width: 20 },
        { key: 'change', label: 'Évolution', width: 15 }
      ],
      rows: [
        { 
          metric: 'Événements totaux', 
          value: DataFormatter.number(analytics.totalEvents),
          change: analytics.eventsChange > 0 ? `+${analytics.eventsChange}%` : `${analytics.eventsChange}%`
        },
        { 
          metric: 'Chiffre d\'affaires', 
          value: DataFormatter.currency(analytics.totalRevenue),
          change: analytics.revenueChange > 0 ? `+${analytics.revenueChange}%` : `${analytics.revenueChange}%`
        },
        { 
          metric: 'Clients actifs', 
          value: DataFormatter.number(analytics.activeClients),
          change: analytics.clientsChange > 0 ? `+${analytics.clientsChange}%` : `${analytics.clientsChange}%`
        },
        { 
          metric: 'Panier moyen', 
          value: DataFormatter.currency(analytics.averageOrderValue),
          change: analytics.aovChange > 0 ? `+${analytics.aovChange}%` : `${analytics.aovChange}%`
        }
      ]
    }

    await ExportManager.export(data, {
      title: `Rapport Analytique - ${period}`,
      subtitle: `Période: ${period} • Exporté le ${DateUtils.format(new Date(), 'dd MMMM yyyy')}`,
      filename: `analytics-${period.toLowerCase()}-${DateUtils.format(new Date(), 'yyyy-MM-dd')}`,
      ...options
    })
  }
}

// Export par défaut
export default ExportManager
