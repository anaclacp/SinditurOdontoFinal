import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi'
import { unitsAPI } from '../services/api'
import { useWebSocket } from '../contexts/WebSocketContext'
import './Config.css'

export default function Clinicas() {
  const { lastMessage } = useWebSocket()
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' })

  useEffect(() => {
    loadUnits()
  }, [])

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'units_updated') {
      loadUnits()
    }
  }, [lastMessage])

  const loadUnits = async () => {
    try {
      const response = await unitsAPI.getAll()
      setUnits(response.data)
    } catch (error) {
      toast.error('Erro ao carregar clínicas')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (unit?: any) => {
    if (unit) {
      setEditingUnit(unit)
      setFormData({ name: unit.name, address: unit.address, phone: unit.phone || '' })
    } else {
      setEditingUnit(null)
      setFormData({ name: '', address: '', phone: '' })
    }
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.address) {
      toast.warning('Preencha nome e endereço')
      return
    }

    try {
      if (editingUnit) {
        await unitsAPI.update(editingUnit.id, formData)
        toast.success('Clínica atualizada!')
      } else {
        await unitsAPI.create(formData)
        toast.success('Clínica adicionada!')
      }
      setShowModal(false)
      loadUnits()
    } catch (error) {
      toast.error('Erro ao salvar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta clínica?')) return
    
    try {
      await unitsAPI.delete(id)
      toast.success('Clínica removida!')
      loadUnits()
    } catch (error) {
      toast.error('Erro ao remover')
    }
  }

  return (
    <div className="config-page">
      <div className="page-header">
        <h1>Clínicas / Unidades</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          <FiPlus /> Nova Clínica
        </button>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : units.length === 0 ? (
        <div className="empty">Nenhuma clínica cadastrada</div>
      ) : (
        <div className="items-list">
          {units.map((unit) => (
            <div key={unit.id} className="item-card">
              <div className="item-icon">
                <FiMapPin />
              </div>
              <div className="item-info">
                <span className="item-name">{unit.name}</span>
                <span className="item-detail">{unit.address}</span>
                {unit.phone && <span className="item-detail">{unit.phone}</span>}
              </div>
              <div className="item-actions">
                <button onClick={() => openModal(unit)}><FiEdit2 /></button>
                <button onClick={() => handleDelete(unit.id)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingUnit ? 'Editar Clínica' : 'Nova Clínica'}</h3>
            
            <div className="form-group">
              <label>Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label>Endereço *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label>Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
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
