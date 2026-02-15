import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<Function>> = new Map()

  connect() {
    if (this.socket?.connected) return

    // Connect to the backend websocket
    this.socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })

    this.socket.on('connect', () => {
      console.log('Socket.IO connected')
      // Join admin room
      this.socket?.emit('join_admin', {})
    })

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected')
    })

    // Listen for events
    const events = [
      'new_appointment',
      'new_patient',
      'appointment_cancelled',
      'appointment_updated'
    ]

    events.forEach(event => {
      this.socket?.on(event, (data: any) => {
        this.notifyListeners(event, data)
      })
    })
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(callback)

    // Return cleanup function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  private notifyListeners(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data))
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()
export default socketService
