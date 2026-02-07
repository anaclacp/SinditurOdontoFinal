import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiDollarSign, FiTrendingUp, FiCalendar } from 'react-icons/fi'
import { financialAPI } from '../services/api'
import './Financeiro.css'

export default function Financeiro() {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadSummary()
  }, [selectedMonth, selectedYear])

  const loadSummary = async () => {
    setLoading(true)
    try {
      const response = await financialAPI.getSummary(selectedMonth, selectedYear)
      setSummary(response.data)
    } catch (error) {
      toast.error('Erro ao carregar dados financeiros')
    } finally {
      setLoading(false)
    }
  }

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <div className="financeiro-page">
      <div className="page-header">
        <h1>Financeiro</h1>
        <div className="date-selector">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : summary && (
        <>
          <div className="financial-cards">
            <div className="fin-card revenue">
              <div className="fin-icon">
                <FiDollarSign />
              </div>
              <div className="fin-info">
                <span className="fin-label">Receita do Mês</span>
                <span className="fin-value">R$ {summary.total_revenue.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="fin-card appointments">
              <div className="fin-icon">
                <FiCalendar />
              </div>
              <div className="fin-info">
                <span className="fin-label">Atendimentos Concluídos</span>
                <span className="fin-value">{summary.total_appointments}</span>
              </div>
            </div>
            
            <div className="fin-card average">
              <div className="fin-icon">
                <FiTrendingUp />
              </div>
              <div className="fin-info">
                <span className="fin-label">Ticket Médio</span>
                <span className="fin-value">
                  R$ {summary.total_appointments > 0 
                    ? (summary.total_revenue / summary.total_appointments).toFixed(2) 
                    : '0.00'}
                </span>
              </div>
            </div>
          </div>

          <div className="transactions-section">
            <h2>Atendimentos Concluídos - {months[selectedMonth - 1]} {selectedYear}</h2>
            
            {summary.appointments.length === 0 ? (
              <div className="empty">Nenhum atendimento concluído neste período</div>
            ) : (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Paciente</th>
                    <th>Serviço</th>
                    <th>Doutor</th>
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
