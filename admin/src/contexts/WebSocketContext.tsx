import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toast } from 'react-toastify'

type WebSocketContextType = {
  isConnected: boolean
  lastMessage: any | null
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  lastMessage: null
})

export const useWebSocket = () => useContext(WebSocketContext)

interface WebSocketProviderProps {
  children: ReactNode
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    // Generate a random client ID
    const clientId = Math.random().toString(36).substring(7)
    // Determine WS URL
    let wsUrl = import.meta.env.VITE_WS_URL

    if (!wsUrl) {
      // Fallback for local development if not set
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.hostname
      // Assuming locally backend is on 8000, or use same port if proxied
      // Ideally in prod VITE_WS_URL should be set
      wsUrl = `${protocol}//${host}:8000/ws/${clientId}`
    } else {
      // If env var is set (e.g. wss://api.mydomain.com/ws), just append client id if needed or strict url
      wsUrl = `${wsUrl}/${clientId}`
    }

    console.log(`Connecting to WebSocket: ${wsUrl}`)
    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    }

    socket.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
      // Retry logic could be added here
    }

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log('WebSocket message received:', message)
        setLastMessage(message)

        // Global notifications based on message type
        if (message.type === 'new_appointment') {
          toast.info(`Novo agendamento: ${message.data.patient} - ${message.data.time}`)
        } else if (message.type === 'appointment_cancelled') {
          toast.warning('Agendamento cancelado')
        } else if (message.type === 'new_patient') {
          toast.success(`Novo paciente cadastrado: ${message.data.name}`)
        } else if (message.type === 'staff_updated') {
          toast.info('Equipe atualizada')
        } else if (message.type === 'units_updated') {
          toast.info('Clínicas/Unidades atualizadas')
        } else if (message.type === 'services_updated') {
          toast.info('Serviços atualizados')
        } else if (message.type === 'doctors_updated') {
          toast.info('Doutores atualizados')
        } else if (message.type === 'inventory_updated') {
          toast.info('Estoque atualizado')
        } else if (message.type === 'appointment_updated') {
          toast.info('Agendamento atualizado')
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    setWs(socket)

    return () => {
      socket.close()
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  )
}
