import React, { useState } from 'react'
import Home from '@/pages/Home'
import EventsPage from '@/pages/Events/EventsPage'
import ClientsPage from '@/pages/Clients/ClientsPage'
import CalendarPage from '@/pages/Calendar/CalendarPage'
import AnalyticsPage from '@/pages/Analytics/AnalyticsPage'
import FleuristePage from '@/pages/Fleuriste/FleuristePage'
import SettingsPage from '@/pages/Settings/SettingsPage'

export type PageName = 'home' | 'events' | 'clients' | 'calendar' | 'analytics' | 'fleuriste' | 'settings'

interface SimpleRouterProps {
  currentPage: PageName
}

const SimpleRouter: React.FC<SimpleRouterProps> = ({ currentPage }) => {
  switch (currentPage) {
    case 'home':
      return <Home />
    case 'events':
      return <EventsPage />
    case 'clients':
      return <ClientsPage />
    case 'calendar':
      return <CalendarPage />
    case 'analytics':
      return <AnalyticsPage />
    case 'fleuriste':
      return <FleuristePage />
    case 'settings':
      return <SettingsPage />
    default:
      return <Home />
  }
}

export default SimpleRouter
