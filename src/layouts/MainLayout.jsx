import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="main-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="main-layout__content">
        <Header onMenuToggle={() => setIsSidebarOpen((current) => !current)} />
        <main className="main-layout__body">
          <Outlet />
        </main>
      </div>
      {isSidebarOpen ? (
        <button
          className="main-layout__backdrop"
          onClick={closeSidebar}
          aria-label="Cerrar menú"
          type="button"
        />
      ) : null}
    </div>
  )
}