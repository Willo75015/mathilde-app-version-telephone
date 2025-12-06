/**
 * 🎭 MOCK - Lucide React Icons
 * Mock de toutes les icônes Lucide React pour les tests
 */

import { vi } from 'vitest'
import React from 'react'

// Créer un mock d'icône générique
const createMockIcon = (name: string) => {
  return vi.fn().mockImplementation((props: any) => 
    React.createElement('svg', {
      'data-testid': `${name.toLowerCase()}-icon`,
      'data-icon-name': name,
      width: props.size || props.width || 24,
      height: props.size || props.height || 24,
      className: props.className,
      style: props.style,
      fill: 'currentColor',
      viewBox: '0 0 24 24',
      ...props
    }, React.createElement('title', null, name))
  )
}

// Export de toutes les icônes utilisées dans l'app
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
export const CheckCircle = createMockIcon('CheckCircle')
export const XCircle = createMockIcon('XCircle')
export const Info = createMockIcon('Info')
export const Loader2 = createMockIcon('Loader2')
export const ChevronDown = createMockIcon('ChevronDown')
export const ChevronUp = createMockIcon('ChevronUp')
export const ChevronLeft = createMockIcon('ChevronLeft')
export const ChevronRight = createMockIcon('ChevronRight')
export const Plus = createMockIcon('Plus')
export const Minus = createMockIcon('Minus')
export const Edit = createMockIcon('Edit')
export const Trash2 = createMockIcon('Trash2')
export const Save = createMockIcon('Save')
export const Upload = createMockIcon('Upload')
export const Image = createMockIcon('Image')
export const FileText = createMockIcon('FileText')
export const Send = createMockIcon('Send')
export const Phone = createMockIcon('Phone')
export const Mail = createMockIcon('Mail')
export const MapPin = createMockIcon('MapPin')
export const Clock = createMockIcon('Clock')
export const DollarSign = createMockIcon('DollarSign')
export const Euro = createMockIcon('Euro')
export const Star = createMockIcon('Star')
export const Heart = createMockIcon('Heart')
export const Filter = createMockIcon('Filter')
export const SortAsc = createMockIcon('SortAsc')
export const SortDesc = createMockIcon('SortDesc')
export const Grid = createMockIcon('Grid')
export const List = createMockIcon('List')
export const Copy = createMockIcon('Copy')
export const ExternalLink = createMockIcon('ExternalLink')
export const Refresh = createMockIcon('Refresh')
export const MoreHorizontal = createMockIcon('MoreHorizontal')
export const MoreVertical = createMockIcon('MoreVertical')
export const Check = createMockIcon('Check')
export const Share = createMockIcon('Share')
export const Bookmark = createMockIcon('Bookmark')
export const Tag = createMockIcon('Tag')
export const Calendar = createMockIcon('Calendar')
export const Clock3 = createMockIcon('Clock3')
export const Palette = createMockIcon('Palette')
export const Scissors = createMockIcon('Scissors')
export const Package = createMockIcon('Package')
export const Truck = createMockIcon('Truck')
export const CreditCard = createMockIcon('CreditCard')
export const Receipt = createMockIcon('Receipt')
export const TrendingUp = createMockIcon('TrendingUp')
export const TrendingDown = createMockIcon('TrendingDown')
export const Activity = createMockIcon('Activity')
export const PieChart = createMockIcon('PieChart')
export const LineChart = createMockIcon('LineChart')
export const Maximize2 = createMockIcon('Maximize2')
export const Minimize2 = createMockIcon('Minimize2')
export const ZoomIn = createMockIcon('ZoomIn')
export const ZoomOut = createMockIcon('ZoomOut')
export const RotateCcw = createMockIcon('RotateCcw')
export const RotateCw = createMockIcon('RotateCw')
export const Move = createMockIcon('Move')
export const MousePointer = createMockIcon('MousePointer')
export const Cursor = createMockIcon('Cursor')
export const Hand = createMockIcon('Hand')

// Icônes spécifiques à Mathilde Fleurs
export const Flower2 = createMockIcon('Flower2')
export const TreePine = createMockIcon('TreePine')
export const Leaf = createMockIcon('Leaf')
export const Sun = createMockIcon('Sun')
export const Moon = createMockIcon('Moon')
export const CloudRain = createMockIcon('CloudRain')
export const Snowflake = createMockIcon('Snowflake')

// Icônes d'état et notification
export const AlertTriangle = createMockIcon('AlertTriangle')
export const ShieldCheck = createMockIcon('ShieldCheck')
export const Lock = createMockIcon('Lock')
export const Unlock = createMockIcon('Unlock')
export const Key = createMockIcon('Key')
export const HelpCircle = createMockIcon('HelpCircle')

// Icônes de navigation et interface
export const ArrowLeft = createMockIcon('ArrowLeft')
export const ArrowRight = createMockIcon('ArrowRight')
export const ArrowUp = createMockIcon('ArrowUp')
export const ArrowDown = createMockIcon('ArrowDown')
export const Navigation = createMockIcon('Navigation')
export const Compass = createMockIcon('Compass')

// Utilitaire pour créer de nouvelles icônes mock à la volée
export const createIcon = createMockIcon

// Export par défaut pour la compatibilité
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
  CheckCircle,
  XCircle,
  Info,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Upload,
  Image,
  FileText,
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Euro,
  Star,
  Heart,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Copy,
  ExternalLink,
  Refresh,
  MoreHorizontal,
  MoreVertical,
  Check,
  Share,
  Bookmark,
  Tag,
  Clock3,
  Palette,
  Scissors,
  Package,
  Truck,
  CreditCard,
  Receipt,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart,
  LineChart,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Move,
  MousePointer,
  Cursor,
  Hand,
  Flower2,
  TreePine,
  Leaf,
  Sun,
  Moon,
  CloudRain,
  Snowflake,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Navigation,
  Compass,
  createIcon
}
