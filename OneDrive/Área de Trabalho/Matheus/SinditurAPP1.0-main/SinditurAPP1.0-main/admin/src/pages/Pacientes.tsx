import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiSearch, FiUser, FiX, FiEdit2, FiSave, FiPhone, FiMapPin, FiCalendar, FiClock } from 'react-icons/fi'
import { patientsAPI } from '../services/api'
import socketService from '../services/socket'
import './Pacientes.css'

export default function Pacientes() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [patientDetails, setPatientDetails] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('dados')

  useEffect(() => {
    loadPatients()
    const cleanup = socketService.on('new_patient', () => {
      loadPatients()
    })
    return () => cleanup()
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
      setEditing(false)
      setActiveTab('dados')
    } catch (error) {
      toast.error('Erro ao carregar ficha do paciente')
    }
  }

  const startEditing = () => {
    setEditData({
      name: patientDetails.patient.name || '',
      phone: patientDetails.patient.phone || '',
      address: patientDetails.patient.address || '',
      gender: patientDetails.patient.gender || '',
      associate: patientDetails.patient.associate || '',
      company: patientDetails.patient.company || '',
      birth_date: patientDetails.patient.birth_date || '',
    })
    setEditing(true)
  }

  const savePatient = async () => {
    setSaving(true)
    try {
      await patientsAPI.update(selectedPatient.id, editData)
      toast.success('Paciente atualizado com sucesso!')
      setEditing(false)
      // Refresh data
      const response = await patientsAPI.getById(selectedPatient.id)
      setPatientDetails(response.data)
      loadPatients()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar paciente')
    } finally {
      setSaving(false)
    }
  }

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf.includes(search)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return '#1E88E5'
      case 'concluido': return '#4CAF50'
      case 'cancelado': return '#F44336'
      default: return '#666'
    }
  }

  return (
    <div className="pacientes-page">
      <div className="page-header">
        <h1><FiUser /> Pacientes</h1>
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
        <>
          <div className="patients-count">{filteredPatients.length} paciente(s)</div>
          <div className="patients-grid">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="patient-card" onClick={() => viewPatientDetails(patient)}>
                <div className="patient-avatar">
                  <FiUser />
                </div>
                <div className="patient-info">
                  <span className="patient-name">{patient.name}</span>
                  <span className="patient-cpf">CPF: {patient.cpf}</span>
                  <span className="patient-birth">Nasc: {patient.birth_date}</span>
                  {patient.phone && <span className="patient-phone"><FiPhone size={12} /> {patient.phone}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
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
              </div>
            </div>

            {/* Tabs */}
            <div className="modal-tabs">
              <button className={activeTab === 'dados' ? 'active' : ''} onClick={() => setActiveTab('dados')}>
                Dados Pessoais
              </button>
              <button className={activeTab === 'historico' ? 'active' : ''} onClick={() => setActiveTab('historico')}>
                Historico ({patientDetails.history?.length || 0})
              </button>
              <button className={activeTab === 'retornos' ? 'active' : ''} onClick={() => setActiveTab('retornos')}>
                Retornos ({patientDetails.upcoming?.length || 0})
              </button>
            </div>

            {/* Dados Pessoais Tab */}
            {activeTab === 'dados' && (
              <div className="patient-data">
                {!editing ? (
                  <>
                    <div className="data-grid">
                      <div className="data-item">
                        <label>Nome</label>
                        <span>{patientDetails.patient.name}</span>
                      </div>
                      <div className="data-item">
                        <label>CPF</label>
                        <span>{patientDetails.patient.cpf}</span>
                      </div>
                      <div className="data-item">
                        <label>Data de Nascimento</label>
                        <span>{patientDetails.patient.birth_date}</span>
                      </div>
                      <div className="data-item">
                        <label>Telefone</label>
                        <span>{patientDetails.patient.phone || 'Nao informado'}</span>
                      </div>
                      <div className="data-item">
                        <label>Endereco</label>
                        <span>{patientDetails.patient.address || 'Nao informado'}</span>
                      </div>
                      <div className="data-item">
                        <label>Sexo</label>
                        <span>{patientDetails.patient.gender || 'Nao informado'}</span>
                      </div>
                      <div className="data-item">
                        <label>Associado</label>
                        <span>{patientDetails.patient.associate || 'Nao informado'}</span>
                      </div>
                      <div className="data-item">
                        <label>Empresa</label>
                        <span>{patientDetails.patient.company || 'Nao informado'}</span>
                      </div>
                    </div>
                    <button className="btn-edit" onClick={startEditing}>
                      <FiEdit2 /> Editar Dados
                    </button>
                  </>
                ) : (
                  <>
                    <div className="edit-grid">
                      <div className="form-group">
                        <label>Nome</label>
                        <input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Data Nascimento</label>
                        <input type="text" value={editData.birth_date} onChange={(e) => setEditData({...editData, birth_date: e.target.value})} placeholder="DD/MM/AAAA" />
                      </div>
                      <div className="form-group">
                        <label>Telefone</label>
                        <input type="text" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} placeholder="(XX) XXXXX-XXXX" />
                      </div>
                      <div className="form-group">
                        <label>Endereco</label>
                        <input type="text" value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} placeholder="Rua, numero, bairro..." />
                      </div>
                      <div className="form-group">
                        <label>Sexo</label>
                        <select value={editData.gender} onChange={(e) => setEditData({...editData, gender: e.target.value})}>
                          <option value="">Selecione...</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Feminino">Feminino</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Associado</label>
                        <input type="text" value={editData.associate} onChange={(e) => setEditData({...editData, associate: e.target.value})} placeholder="Nome do associado" />
                      </div>
                      <div className="form-group">
                        <label>Empresa</label>
                        <input type="text" value={editData.company} onChange={(e) => setEditData({...editData, company: e.target.value})} placeholder="Nome da empresa" />
                      </div>
                    </div>
                    <div className="edit-actions">
                      <button className="btn-secondary" onClick={() => setEditing(false)}>Cancelar</button>
                      <button className="btn-save" onClick={savePatient} disabled={saving}>
                        <FiSave /> {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Historico Tab */}
            {activeTab === 'historico' && (
              <div className="patient-history">
                {(!patientDetails.history || patientDetails.history.length === 0) ? (
                  <p className="no-history">Nenhum atendimento no historico</p>
                ) : (
                  <div className="history-list">
                    {patientDetails.history.map((apt: any) => (
                      <div key={apt.id} className="history-item">
                        <div className="history-date-time">
                          <FiCalendar size={14} />
                          <span>{apt.date}</span>
                          <FiClock size={14} />
                          <span>{apt.time}</span>
                        </div>
                        <div className="history-details">
                          <span className="history-service">{apt.service_name}</span>
                          <span className="history-doctor">{apt.doctor_name}</span>
                          <span className="history-unit">{apt.unit_name}</span>
                        </div>
                        <span className="history-status" style={{ color: getStatusColor(apt.status), background: `${getStatusColor(apt.status)}15`, border: `1px solid ${getStatusColor(apt.status)}30` }}>
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Retornos Tab */}
            {activeTab === 'retornos' && (
              <div className="patient-history">
                {(!patientDetails.upcoming || patientDetails.upcoming.length === 0) ? (
                  <p className="no-history">Nenhum retorno agendado</p>
                ) : (
                  <div className="history-list">
                    {patientDetails.upcoming.map((apt: any) => (
                      <div key={apt.id} className="history-item upcoming">
                        <div className="history-date-time">
                          <FiCalendar size={14} />
                          <span>{apt.date}</span>
                          <FiClock size={14} />
                          <span>{apt.time}</span>
                        </div>
                        <div className="history-details">
                          <span className="history-service">{apt.service_name}</span>
                          <span className="history-doctor">{apt.doctor_name}</span>
                          <span className="history-unit">{apt.unit_name}</span>
                        </div>
                        <span className="history-status" style={{ color: '#1E88E5', background: '#e3f2fd', border: '1px solid #bbdefb' }}>
                          Agendado
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
