/**
 * 🧪 MOCKS - Lucide React
 * Mock des icônes Lucide React pour les tests
 */

import React from 'react'
import { vi } from 'vitest'

// Mock générique pour toutes les icônes Lucide
const createMockIcon = (name: string) => {
  const MockIcon = ({ className, size, ...props }: any) => (
    <svg
      data-testid={`icon-${name.toLowerCase()}`}
      className={className}
      width={size || 24}
      height={size || 24}
      {...props}
    >
      <title>{name}</title>
    </svg>
  )
  MockIcon.displayName = `Mock${name}Icon`
  return MockIcon
}

// Export des icônes utilisées dans l'application
export const Menu = createMockIcon('Menu')
export const X = createMockIcon('X')
export const Search = createMockIcon('Search')
export const Bell = createMockIcon('Bell')
export const Settings = createMockIcon('Settings')
export const User = createMockIcon('User')
export const LogOut = createMockIcon('LogOut')
export const Calendar = createMockIcon('Calendar')
export const Users = createMockIcon('Users')
export const Flower = createMockIcon('Flower')
export const BarChart3 = createMockIcon('BarChart3')
export const Home = createMockIcon('Home')
export const Download = createMockIcon('Download')
export const Smartphone = createMockIcon('Smartphone')
export const WifiOff = createMockIcon('WifiOff')
export const Wifi = createMockIcon('Wifi')
export const Eye = createMockIcon('Eye')
export const EyeOff = createMockIcon('EyeOff')
export const AlertCircle = createMockIcon('AlertCircle')
export const Loader2 = createMockIcon('Loader2')
export const Check = createMockIcon('Check')
export const Plus = createMockIcon('Plus')
export const Edit = createMockIcon('Edit')
export const Trash2 = createMockIcon('Trash2')
export const Filter = createMockIcon('Filter')
export const SortAsc = createMockIcon('SortAsc')
export const SortDesc = createMockIcon('SortDesc')
export const ChevronDown = createMockIcon('ChevronDown')
export const ChevronUp = createMockIcon('ChevronUp')
export const ChevronLeft = createMockIcon('ChevronLeft')
export const ChevronRight = createMockIcon('ChevronRight')
export const Star = createMockIcon('Star')
export const Heart = createMockIcon('Heart')
export const Mail = createMockIcon('Mail')
export const Phone = createMockIcon('Phone')
export const MapPin = createMockIcon('MapPin')
export const Clock = createMockIcon('Clock')
export const Euro = createMockIcon('Euro')
export const Save = createMockIcon('Save')
export const Upload = createMockIcon('Upload')
export const Image = createMockIcon('Image')
export const FileText = createMockIcon('FileText')
export const Copy = createMockIcon('Copy')
export const ExternalLink = createMockIcon('ExternalLink')
export const Info = createMockIcon('Info')
export const HelpCircle = createMockIcon('HelpCircle')
export const RefreshCw = createMockIcon('RefreshCw')
export const Sun = createMockIcon('Sun')
export const Moon = createMockIcon('Moon')
export const Monitor = createMockIcon('Monitor')
export const Palette = createMockIcon('Palette')
export const Shield = createMockIcon('Shield')
export const Lock = createMockIcon('Lock')
export const Unlock = createMockIcon('Unlock')
export const Key = createMockIcon('Key')
export const Activity = createMockIcon('Activity')
export const TrendingUp = createMockIcon('TrendingUp')
export const TrendingDown = createMockIcon('TrendingDown')
export const PieChart = createMockIcon('PieChart')
export const MoreHorizontal = createMockIcon('MoreHorizontal')
export const MoreVertical = createMockIcon('MoreVertical')

// Mock par défaut
export default {
  Menu,
  X,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Calendar,
  Users,
  Flower,
  BarChart3,
  Home,
  Download,
  Smartphone,
  WifiOff,
  Wifi,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Check,
  Plus,
  Edit,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Mail,
  Phone,
  MapPin,
  Clock,
  Euro,
  Save,
  Upload,
  Image,
  FileText,
  Copy,
  ExternalLink,
  Info,
  HelpCircle,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  Palette,
  Shield,
  Lock,
  Unlock,
  Key,
  Activity,
  TrendingUp,
  TrendingDown,
  PieChart,
  MoreHorizontal,
  MoreVertical
}
