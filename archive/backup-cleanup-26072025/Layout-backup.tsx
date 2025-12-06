import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Simple */}
      <aside className="fixed top-0 left-0 bottom-0 w-60 bg-white border-r border-gray-200 p-4">
        <div className="mb-4">
          <h1 className="text-lg font-bold text-gray-900">Mathilde Fleurs</h1>
        </div>
        
        <nav className="space-y-2">
          <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded">Accueil</div>
          <div className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Calendrier</div>
          <div className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Événements</div>
          <div className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Clients</div>
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="ml-60">
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-900">Tableau de bord</h1>
        </header>
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout