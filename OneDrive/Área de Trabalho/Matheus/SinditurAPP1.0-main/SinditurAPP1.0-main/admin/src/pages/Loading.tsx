import React from 'react'
import './Loading.css'

export default function Loading() {
  return (
    <div className="loading-container">
      <img src="/logo.jpg" alt="Logo" className="loading-logo" />
      <h1 className="loading-title">Odonto Sinditur</h1>
      <p className="loading-subtitle">Painel de Gestão</p>
      <div className="loading-spinner"></div>
    </div>
  )
}
