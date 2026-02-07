import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiHome, FiCalendar, FiDollarSign, FiPackage, FiUsers, FiFileText, FiUserCheck, FiMapPin, FiUser, FiSettings, FiLogOut } from 'react-icons/fi'
import './Layout.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/', icon: FiHome, label: 'Início' },
    { path: '/agenda', icon: FiCalendar, label: 'Agenda' },
    { path: '/financeiro', icon: FiDollarSign, label: 'Financeiro' },
    { path: '/estoque', icon: FiPackage, label: 'Estoque' },
    { path: '/pacientes', icon: FiUsers, label: 'Pacientes' },
    { path: '/documentos', icon: FiFileText, label: 'Documentos' },
    { path: '/equipe', icon: FiUserCheck, label: 'Equipe' },
    { path: '/clinicas', icon: FiMapPin, label: 'Clínicas' },
    { path: '/doutores', icon: FiUser, label: 'Doutores' },
    { path: '/servicos', icon: FiSettings, label: 'Serviços' },
  ]

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/logo.jpg" alt="Logo" className="sidebar-logo" />
          <h2>Odonto Sinditur</h2>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Sair</span>
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
