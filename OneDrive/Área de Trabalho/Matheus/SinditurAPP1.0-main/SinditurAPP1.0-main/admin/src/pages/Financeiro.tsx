import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiDollarSign, FiTrendingUp, FiCalendar, FiMapPin, FiBarChart2 } from 'react-icons/fi'
import { financialAPI, unitsAPI } from '../services/api'
import './Financeiro.css'

export default function Financeiro() {
  const [summary, setSummary] = useState<any>(null)
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedUnit, setSelectedUnit] = useState('')

  useEffect(() => {
    loadUnits()
  }, [])

  useEffect(() => {
    loadSummary()
  }, [selectedMonth, selectedYear, selectedUnit])

  const loadUnits = async () => {
    try {
      const response = await unitsAPI.getAll()
      setUnits(response.data)
    } catch (error) {
      console.error('Error loading units:', error)
    }
  }

  const loadSummary = async () => {
    setLoading(true)
    try {
      const response = await financialAPI.getSummary(selectedMonth, selectedYear, selectedUnit || undefined)
      setSummary(response.data)
    } catch (error) {
      toast.error('Erro ao carregar dados financeiros')
    } finally {
      setLoading(false)
    }
  }

  const months = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <div className="financeiro-page">
      <div className="page-header">
        <h1><FiDollarSign /> Financeiro</h1>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label>Mes:</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Ano:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label><FiMapPin /> Clinica:</label>
          <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
            <option value="">Todas</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : summary && (
        <>
          {/* Consolidated Cards */}
          <div className="financial-cards">
            <div className="fin-card revenue">
              <div className="fin-icon">
                <FiDollarSign />
              </div>
              <div className="fin-info">
                <span className="fin-label">Receita Total</span>
                <span className="fin-value">R$ {summary.total_revenue.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="fin-card appointments">
              <div className="fin-icon">
                <FiCalendar />
              </div>
              <div className="fin-info">
                <span className="fin-label">Atendimentos</span>
                <span className="fin-value">{summary.total_appointments}</span>
              </div>
            </div>
            
            <div className="fin-card average">
              <div className="fin-icon">
                <FiTrendingUp />
              </div>
              <div className="fin-info">
                <span className="fin-label">Ticket Medio</span>
                <span className="fin-value">
                  R$ {(summary.average_ticket || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Per-Clinic Breakdown Cards */}
          {summary.clinic_breakdown && summary.clinic_breakdown.length > 0 && !selectedUnit && (
            <div className="clinic-breakdown">
              <h2><FiBarChart2 /> Lucro por Clinica</h2>
              <div className="clinic-cards">
                {summary.clinic_breakdown.map((clinic: any) => (
                  <div key={clinic.unit_id} className="clinic-card">
                    <div className="clinic-card-header">
                      <FiMapPin />
                      <span>{clinic.unit_name}</span>
                    </div>
                    <div className="clinic-card-body">
                      <div className="clinic-stat">
                        <span className="clinic-stat-label">Receita</span>
                        <span className="clinic-stat-value revenue">R$ {clinic.total_revenue.toFixed(2)}</span>
                      </div>
                      <div className="clinic-stat">
                        <span className="clinic-stat-label">Atendimentos</span>
                        <span className="clinic-stat-value">{clinic.total_appointments}</span>
                      </div>
                      <div className="clinic-stat">
                        <span className="clinic-stat-label">Ticket Medio</span>
                        <span className="clinic-stat-value">
                          R$ {clinic.total_appointments > 0 
                            ? (clinic.total_revenue / clinic.total_appointments).toFixed(2)
                            : '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions Table */}
          <div className="transactions-section">
            <h2>Atendimentos Concluidos - {months[selectedMonth - 1]} {selectedYear}</h2>
            
            {summary.appointments.length === 0 ? (
              <div className="empty">Nenhum atendimento concluido neste periodo</div>
            ) : (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Paciente</th>
                    <th>Servico</th>
                    <th>Doutor</th>
                    <th>Unidade</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.appointments.map((apt: any) => (
                    <tr key={apt.id}>
                      <td>{apt.date}</td>
                      <td>{apt.user_name || 'N/A'}</td>
                      <td>{apt.service_name}</td>
                      <td>{apt.doctor_name}</td>
                      <td>{apt.unit_name}</td>
                      <td className="value">R$ {(apt.paid_value || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
