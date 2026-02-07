import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi'
import { doctorsAPI, unitsAPI } from '../services/api'
import './Config.css'

export default function Doutores() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '', specialty: '', unit_id: '', cro: '', phone: '', email: '', bio: '',
    available_days: [] as string[]
  })

  const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [doctorsRes, unitsRes] = await Promise.all([
        doctorsAPI.getAll(),
        unitsAPI.getAll()
      ])
      setDoctors(doctorsRes.data)
      setUnits(unitsRes.data)
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (doctor?: any) => {
    if (doctor) {
      setEditingDoctor(doctor)
      setFormData({
        name: doctor.name,
        specialty: doctor.specialty,
        unit_id: doctor.unit_id,
        cro: doctor.cro || '',
        phone: doctor.phone || '',
        email: doctor.email || '',
        bio: doctor.bio || '',
        available_days: doctor.available_days || []
      })
    } else {
      setEditingDoctor(null)
      setFormData({ name: '', specialty: '', unit_id: '', cro: '', phone: '', email: '', bio: '', available_days: [] })
    }
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.specialty || !formData.unit_id || !formData.cro) {
      toast.warning('Preencha todos os campos obrigatórios')
      return
    }

    try {
      if (editingDoctor) {
        await doctorsAPI.update(editingDoctor.id, formData)
        toast.success('Doutor atualizado!')
      } else {
        await doctorsAPI.create(formData)
        toast.success('Doutor adicionado!')
      }
      setShowModal(false)
      loadData()
    } catch (error) {
      toast.error('Erro ao salvar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este doutor?')) return
    
    try {
      await doctorsAPI.delete(id)
      toast.success('Doutor removido!')
      loadData()
    } catch (error) {
      toast.error('Erro ao remover')
    }
  }

  const toggleDay = (day: string) => {
    const days = formData.available_days.includes(day)
      ? formData.available_days.filter(d => d !== day)
      : [...formData.available_days, day]
    setFormData({ ...formData, available_days: days })
  }

  const getUnitName = (unitId: string) => {
    const unit = units.find(u => u.id === unitId)
    return unit?.name || 'N/A'
  }

  return (
    <div className="config-page">
      <div className="page-header">
        <h1>Doutores</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          <FiPlus /> Novo Doutor
        </button>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : doctors.length === 0 ? (
        <div className="empty">Nenhum doutor cadastrado</div>
      ) : (
        <div className="items-list">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="item-card">
              <div className="item-icon">
                <FiUser />
              </div>
              <div className="item-info">
                <span className="item-name">{doctor.name}</span>
                <span className="item-detail">{doctor.specialty} - CRO: {doctor.cro}</span>
                <span className="item-detail">{getUnitName(doctor.unit_id)}</span>
              </div>
              <div className="item-actions">
                <button onClick={() => openModal(doctor)}><FiEdit2 /></button>
                <button onClick={() => handleDelete(doctor.id)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingDoctor ? 'Editar Doutor' : 'Novo Doutor'}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Nome *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Especialidade *</label>
                <input type="text" value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>CRO *</label>
                <input type="text" value={formData.cro} onChange={(e) => setFormData({ ...formData, cro: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Unidade *</label>
                <select value={formData.unit_id} onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}>
                  <option value="">Selecione...</option>
                  {units.map((unit) => (<option key={unit.id} value={unit.id}>{unit.name}</option>))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Telefone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            
            <div className="form-group">
              <label>Bio</label>
              <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={2} />
            </div>
            
            <div className="form-group">
              <label>Dias Disponíveis</label>
              <div className="days-grid">
                {weekDays.map((day) => (
                  <label key={day} className="day-item">
                    <input type="checkbox" checked={formData.available_days.includes(day)} onChange={() => toggleDay(day)} />
                    {day}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSubmit}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
