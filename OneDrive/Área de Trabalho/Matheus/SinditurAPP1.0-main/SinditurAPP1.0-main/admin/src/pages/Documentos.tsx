import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiFileText, FiPrinter, FiDownload, FiEdit2 } from 'react-icons/fi'
import { documentsAPI, patientsAPI, doctorsAPI } from '../services/api'
import './Documentos.css'

export default function Documentos() {
  const [templates, setTemplates] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [customFields, setCustomFields] = useState<any>({})
  const [generatedDoc, setGeneratedDoc] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [editContent, setEditContent] = useState('')

  const templateNames: any = {
    atestado: 'Atestado',
    afastamento: 'Afastamento',
    termo_consentimento: 'Termo de Consentimento',
    receita: 'Receita Médica'
  }

  const templateFields: any = {
    atestado: ['dias_afastamento'],
    afastamento: ['data_inicio', 'data_fim', 'procedimentos'],
    termo_consentimento: ['procedimento'],
    receita: ['medicamentos', 'observacoes']
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [templatesRes, patientsRes, doctorsRes] = await Promise.all([
        documentsAPI.getTemplates(),
        patientsAPI.getAll(),
        doctorsAPI.getAll()
      ])
      setTemplates(templatesRes.data)
      setPatients(patientsRes.data)
      setDoctors(doctorsRes.data)
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedTemplate || !selectedPatient || !selectedDoctor) {
      toast.warning('Selecione todos os campos')
      return
    }

    try {
      const response = await documentsAPI.generate({
        template_type: selectedTemplate,
        patient_id: selectedPatient,
        doctor_id: selectedDoctor,
        custom_fields: customFields
      })
      setGeneratedDoc(response.data)
      toast.success('Documento gerado!')
    } catch (error) {
      toast.error('Erro ao gerar documento')
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${templateNames[generatedDoc.template_type]}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.8; }
              pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            <pre>${generatedDoc.content}</pre>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await documentsAPI.generatePDF({
        template_type: selectedTemplate,
        patient_id: selectedPatient,
        doctor_id: selectedDoctor,
        custom_fields: customFields
      })
      
      // Download PDF
      const link = document.createElement('a')
      link.href = `data:application/pdf;base64,${response.data.pdf_base64}`
      link.download = response.data.filename
      link.click()
      
      toast.success('PDF baixado!')
    } catch (error) {
      toast.error('Erro ao gerar PDF')
    }
  }

  const openEditModal = (template: any) => {
    setEditingTemplate(template)
    setEditContent(template.content)
    setShowEditModal(true)
  }

  const handleSaveTemplate = async () => {
    try {
      await documentsAPI.updateTemplate(editingTemplate.type, editContent)
      toast.success('Modelo atualizado!')
      setShowEditModal(false)
      loadData()
    } catch (error) {
      toast.error('Erro ao salvar modelo')
    }
  }

  return (
    <div className="documentos-page">
      <div className="page-header">
        <h1>Documentos</h1>
      </div>

      <div className="docs-grid">
        <div className="docs-form">
          <h2>Gerar Documento</h2>
          
          <div className="form-group">
            <label>Tipo de Documento</label>
            <select value={selectedTemplate} onChange={(e) => {
              setSelectedTemplate(e.target.value)
              setCustomFields({})
              setGeneratedDoc(null)
            }}>
              <option value="">Selecione...</option>
              {templates.map((t) => (
                <option key={t.type} value={t.type}>{templateNames[t.type]}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Paciente</label>
            <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
              <option value="">Selecione...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} - {p.cpf}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Doutor</label>
            <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
              <option value="">Selecione...</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} - CRO: {d.cro}</option>
              ))}
            </select>
          </div>

          {selectedTemplate && templateFields[selectedTemplate]?.map((field: string) => (
            <div key={field} className="form-group">
              <label>{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
              {field === 'medicamentos' || field === 'procedimentos' || field === 'observacoes' ? (
                <textarea
                  value={customFields[field] || ''}
                  onChange={(e) => setCustomFields({ ...customFields, [field]: e.target.value })}
                  rows={3}
                />
              ) : (
                <input
                  type="text"
                  value={customFields[field] || ''}
                  onChange={(e) => setCustomFields({ ...customFields, [field]: e.target.value })}
                />
              )}
            </div>
          ))}

          <button className="btn-primary" onClick={handleGenerate}>
            <FiFileText /> Gerar Documento
          </button>
        </div>

        <div className="docs-preview">
          <h2>Pré-visualização</h2>
          
          {generatedDoc ? (
            <>
              <div className="preview-content">
                <pre>{generatedDoc.content}</pre>
              </div>
              <div className="preview-actions">
                <button className="btn-secondary" onClick={handlePrint}>
                  <FiPrinter /> Imprimir
                </button>
                <button className="btn-primary" onClick={handleDownloadPDF}>
                  <FiDownload /> Baixar PDF
                </button>
              </div>
            </>
          ) : (
            <div className="preview-empty">
              Selecione os campos e clique em "Gerar Documento" para visualizar
            </div>
          )}
        </div>
      </div>

      <div className="templates-section">
        <h2>Modelos de Documentos</h2>
        <p className="templates-hint">Clique para editar o modelo</p>
        
        <div className="templates-grid">
          {templates.map((template) => (
            <div key={template.type} className="template-card" onClick={() => openEditModal(template)}>
              <FiFileText className="template-icon" />
              <span className="template-name">{templateNames[template.type]}</span>
              <FiEdit2 className="edit-icon" />
            </div>
          ))}
        </div>
      </div>

      {/* Edit Template Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal template-modal">
            <h3>Editar Modelo: {templateNames[editingTemplate?.type]}</h3>
            <p className="modal-hint">
              Use as variáveis: {'{NOME_PACIENTE}'}, {'{CPF_PACIENTE}'}, {'{NOME_DOUTOR}'}, {'{CRO_DOUTOR}'}, {'{DATA}'}, {'{DATA_EXTENSO}'}, etc.
            </p>
            <textarea
              className="template-editor"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={15}
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSaveTemplate}>Salvar Modelo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
