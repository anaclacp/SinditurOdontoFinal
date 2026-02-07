import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiCheck, FiX, FiClock, FiFilter } from 'react-icons/fi'
import { appointmentsAPI } from '../services/api'
import './Agenda.css'

export default function Agenda() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('pt-BR'))

  useEffect(() => {
    loadAppointments()
  }, [filter])

  const loadAppointments = async () => {
    try {
      const params: any = {}
      if (filter !== 'todos') params.status = filter
      const response = await appointmentsAPI.getAll(params)
      setAppointments(response.data)
    } catch (error) {
      toast.error('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string, paidValue?: number) => {
    try {
      await appointmentsAPI.update(id, { status, paid_value: paidValue })
      toast.success(status === 'concluido' ? 'Agendamento concluído!' : 'Agendamento cancelado')
      loadAppointments()
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleConcluir = (apt: any) => {
    const value = prompt('Valor cobrado (R$):', apt.service_price?.toString() || '0')
    if (value !== null) {
      handleUpdateStatus(apt.id, 'concluido', parseFloat(value))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return '#1E88E5'
      case 'concluido': return '#4CAF50'
      case 'cancelado': return '#F44336'
      default: return '#666'
    }
  }

  return (
    <div className="agenda-page">
      <div className="page-header">
        <h1>Agenda</h1>
        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="agendado">Agendados</option>
            <option value="concluido">Concluídos</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : appointments.length === 0 ? (
        <div className="empty">Nenhum agendamento encontrado</div>
      ) : (
        <div className="appointments-list">
          {appointments.map((apt) => (
            <div key={apt.id} className="appointment-card">
              <div className="apt-header">
                <div className="apt-datetime">
                  <span className="apt-date">{apt.date}</span>
                  <span className="apt-time">{apt.time}</span>
                </div>
                <span className="apt-status" style={{ background: `${getStatusColor(apt.status)}20`, color: getStatusColor(apt.status) }}>
                  {apt.status}
                </span>
              </div>
              
              <div className="apt-body">
                <div className="apt-info">
                  <strong>Paciente:</strong> {apt.user_name || 'N/A'}
                </div>
                <div className="apt-info">
                  <strong>CPF:</strong> {apt.user_cpf || 'N/A'}
                </div>
                <div className="apt-info">
                  <strong>Serviço:</strong> {apt.service_name}
                </div>
                <div className="apt-info">
                  <strong>Doutor:</strong> {apt.doctor_name}
                </div>
                <div className="apt-info">
                  <strong>Unidade:</strong> {apt.unit_name}
                </div>
                {apt.notes && (
                  <div className="apt-info">
                    <strong>Obs:</strong> {apt.notes}
                  </div>
                )}
                {apt.status === 'concluido' && apt.paid_value > 0 && (
                  <div className="apt-info apt-value">
                    <strong>Valor:</strong> R$ {apt.paid_value.toFixed(2)}
                  </div>
                )}
              </div>
              
              {apt.status === 'agendado' && (
                <div className="apt-actions">
                  <button className="btn-success" onClick={() => handleConcluir(apt)}>
                    <FiCheck /> Concluir
                  </button>
                  <button className="btn-danger" onClick={() => handleUpdateStatus(apt.id, 'cancelado')}>
                    <FiX /> Cancelar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
