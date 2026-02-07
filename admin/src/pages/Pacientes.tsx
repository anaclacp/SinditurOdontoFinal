import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiSearch, FiUser, FiX } from 'react-icons/fi'
import { patientsAPI } from '../services/api'
import './Pacientes.css'

export default function Pacientes() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [patientDetails, setPatientDetails] = useState<any>(null)

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      const response = await patientsAPI.getAll()
      setPatients(response.data)
    } catch (error) {
      toast.error('Erro ao carregar pacientes')
    } finally {
      setLoading(false)
    }
  }

  const viewPatientDetails = async (patient: any) => {
    try {
      const response = await patientsAPI.getById(patient.id)
      setPatientDetails(response.data)
      setSelectedPatient(patient)
    } catch (error) {
      toast.error('Erro ao carregar ficha do paciente')
    }
  }

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf.includes(search)
  )

  return (
    <div className="pacientes-page">
      <div className="page-header">
        <h1>Pacientes</h1>
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="empty">Nenhum paciente encontrado</div>
      ) : (
        <div className="patients-grid">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="patient-card" onClick={() => viewPatientDetails(patient)}>
              <div className="patient-avatar">
                <FiUser />
              </div>
              <div className="patient-info">
                <span className="patient-name">{patient.name}</span>
                <span className="patient-cpf">{patient.cpf}</span>
                <span className="patient-birth">Nasc: {patient.birth_date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && patientDetails && (
        <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="modal patient-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedPatient(null)}>
              <FiX />
            </button>
            
            <div className="patient-header">
              <div className="patient-avatar large">
                <FiUser />
              </div>
              <div>
                <h2>{patientDetails.patient.name}</h2>
                <p>CPF: {patientDetails.patient.cpf}</p>
                <p>Data de Nascimento: {patientDetails.patient.birth_date}</p>
              </div>
            </div>

            <div className="patient-history">
              <h3>Histórico de Atendimentos</h3>
              {patientDetails.appointments.length === 0 ? (
                <p className="no-history">Nenhum atendimento registrado</p>
              ) : (
                <div className="history-list">
                  {patientDetails.appointments.map((apt: any) => (
                    <div key={apt.id} className="history-item">
                      <div className="history-date">{apt.date} - {apt.time}</div>
                      <div className="history-service">{apt.service_name}</div>
                      <div className="history-doctor">{apt.doctor_name}</div>
                      <span className={`history-status ${apt.status}`}>{apt.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
