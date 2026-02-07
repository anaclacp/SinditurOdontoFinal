import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Loading from './pages/Loading'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Agenda from './pages/Agenda'
import Financeiro from './pages/Financeiro'
import Estoque from './pages/Estoque'
import Pacientes from './pages/Pacientes'
import Documentos from './pages/Documentos'
import Equipe from './pages/Equipe'
import Clinicas from './pages/Clinicas'
import Doutores from './pages/Doutores'
import Servicos from './pages/Servicos'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" />

  return <>{children}</>
}

function AppRoutes() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) return <Loading />

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/agenda" element={
        <PrivateRoute>
          <Layout>
            <Agenda />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/financeiro" element={
        <PrivateRoute>
          <Layout>
            <Financeiro />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/estoque" element={
        <PrivateRoute>
          <Layout>
            <Estoque />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/pacientes" element={
        <PrivateRoute>
          <Layout>
            <Pacientes />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/documentos" element={
        <PrivateRoute>
          <Layout>
            <Documentos />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/equipe" element={
        <PrivateRoute>
          <Layout>
            <Equipe />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/clinicas" element={
        <PrivateRoute>
          <Layout>
            <Clinicas />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/doutores" element={
        <PrivateRoute>
          <Layout>
            <Doutores />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/servicos" element={
        <PrivateRoute>
          <Layout>
            <Servicos />
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  )
}

import { WebSocketProvider } from './contexts/WebSocketContext'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} />
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
