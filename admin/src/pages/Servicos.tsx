import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2, FiSettings } from 'react-icons/fi'
import { servicesAPI } from '../services/api'
import './Config.css'

export default function Servicos() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', description: '', duration_minutes: 30, price: 0 })

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const response = await servicesAPI.getAll()
      setServices(response.data)
    } catch (error) {
      toast.error('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (service?: any) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        description: service.description,
        duration_minutes: service.duration_minutes,
        price: service.price || 0
      })
    } else {
      setEditingService(null)
      setFormData({ name: '', description: '', duration_minutes: 30, price: 0 })
    }
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      toast.warning('Preencha nome e descrição')
      return
    }

    try {
      if (editingService) {
        await servicesAPI.update(editingService.id, formData)
        toast.success('Serviço atualizado!')
      } else {
        await servicesAPI.create(formData)
        toast.success('Serviço adicionado!')
      }
      setShowModal(false)
      loadServices()
    } catch (error) {
      toast.error('Erro ao salvar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este serviço?')) return
    
    try {
      await servicesAPI.delete(id)
      toast.success('Serviço removido!')
      loadServices()
    } catch (error) {
      toast.error('Erro ao remover')
    }
  }

  return (
    <div className="config-page">
      <div className="page-header">
        <h1>Serviços / Procedimentos</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          <FiPlus /> Novo Serviço
        </button>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : services.length === 0 ? (
        <div className="empty">Nenhum serviço cadastrado</div>
      ) : (
        <div className="items-list">
          {services.map((service) => (
            <div key={service.id} className="item-card">
              <div className="item-icon">
                <FiSettings />
              </div>
              <div className="item-info">
                <span className="item-name">{service.name}</span>
                <span className="item-detail">{service.description}</span>
                <span className="item-detail">{service.duration_minutes} min - R$ {(service.price || 0).toFixed(2)}</span>
              </div>
              <div className="item-actions">
                <button onClick={() => openModal(service)}><FiEdit2 /></button>
                <button onClick={() => handleDelete(service.id)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h3>
            
            <div className="form-group">
              <label>Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label>Descrição *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Duração (minutos)</label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
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
