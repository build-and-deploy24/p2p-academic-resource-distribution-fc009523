
type PeerCallbacks = {
  onStatus?: (status: string) => void
  onMessage?: (message: string) => void
  onFileReceived?: (file: File) => void
  onError?: (error: string) => void
}

export class PeerConnectionClient {
  private socket: WebSocket | null = null
  private peerConnection: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null
  private pendingCandidates: RTCIceCandidateInit[] = []

  private callbacks: PeerCallbacks
  
  private incomingFile:
  | { name: string; type: string; size: number; receivedSize: number; chunks: ArrayBuffer[] }
  | null = null

  constructor(callbacks: PeerCallbacks = {}) {
  this.callbacks = callbacks
  }

  connect(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const socket = new WebSocket(
        `${protocol}//${window.location.host}/ws/signaling`,
      )

      this.socket = socket

      socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'join', roomId }))
        resolve()
      }

      socket.onerror = () => {
        this.callbacks.onError?.('Could not connect to signaling server.')
        reject(new Error('WebSocket connection failed.'))
      }

      socket.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data)
          await this.handleSignal(message)
        } catch (error) {
          this.callbacks.onError?.(
            error instanceof Error ? error.message : 'Signaling error.',
          )
        }
      }

      socket.onclose = () => {
        this.callbacks.onStatus?.('Disconnected')
      }
    })
  }

  private createPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) return this.peerConnection

    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    })

    this.peerConnection = peer

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal('ice-candidate', event.candidate)
      }
    }

    peer.onconnectionstatechange = () => {
      this.callbacks.onStatus?.(peer.connectionState)
    }

    peer.ondatachannel = (event) => {
      this.setupDataChannel(event.channel)
    }

    return peer
  }

  private setupDataChannel(channel: RTCDataChannel): void {
    this.dataChannel = channel

    channel.binaryType = 'arraybuffer'

    channel.onopen = () => {
      this.callbacks.onStatus?.('Data channel connected')
    }

    channel.onmessage = (event) => {
    this.handleDataMessage(event.data)
 }

    channel.onclose = () => {
      this.callbacks.onStatus?.('Data channel closed')
    }
  }

    private handleDataMessage(data: string | ArrayBuffer): void {
    if (data instanceof ArrayBuffer) {
    if (!this.incomingFile) return

    this.incomingFile.chunks.push(data)
    this.incomingFile.receivedSize += data.byteLength

    if (this.incomingFile.receivedSize === this.incomingFile.size) {
      const file = new File(
        this.incomingFile.chunks,
        this.incomingFile.name,
        { type: this.incomingFile.type },
      )

      this.callbacks.onFileReceived?.(file)
      this.incomingFile = null
    }

    return
  }

  try {
    const message = JSON.parse(data)

    if (message.type === 'file-start') {
      this.incomingFile = {
        name: message.name,
        type: message.fileType,
        size: message.size,
        receivedSize: 0,
        chunks: [],
      }
      return
    }
  } catch {
    // Ordinary text messages are not JSON.
  }

  this.callbacks.onMessage?.(data)
}

    

  private async handleSignal(message: {
    type: string
    payload?: unknown
    message?: string
  }): Promise<void> {
    switch (message.type) {
      case 'joined':
        this.callbacks.onStatus?.('Joined room')
        break

      case 'waiting':
        this.callbacks.onStatus?.('Waiting for another peer')
        break

      case 'peer-joined': {
        this.callbacks.onStatus?.('Peer joined. Creating offer...')

        const peer = this.createPeerConnection()
        this.setupDataChannel(peer.createDataChannel('campusshare'))

        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        this.sendSignal('offer', offer)
        break
      }

      case 'offer': {
        const peer = this.createPeerConnection()

        await peer.setRemoteDescription(
          message.payload as RTCSessionDescriptionInit,
        )

        await this.processPendingCandidates()

        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        this.sendSignal('answer', answer)
        break
      }

      case 'answer': {
        if (!this.peerConnection) return

        await this.peerConnection.setRemoteDescription(
          message.payload as RTCSessionDescriptionInit,
        )

        await this.processPendingCandidates()
        break
      }

      case 'ice-candidate': {
        const candidate = message.payload as RTCIceCandidateInit

        if (this.peerConnection?.remoteDescription) {
          await this.peerConnection.addIceCandidate(candidate)
        } else {
          this.pendingCandidates.push(candidate)
        }
        break
      }

      case 'peer-left':
        this.callbacks.onStatus?.('Peer disconnected')
        break

      case 'error':
        this.callbacks.onError?.(message.message ?? 'Signaling error.')
        break
    }
  }

  private async processPendingCandidates(): Promise<void> {
    if (!this.peerConnection) return

    for (const candidate of this.pendingCandidates) {
      await this.peerConnection.addIceCandidate(candidate)
    }

    this.pendingCandidates = []
  }

  private sendSignal(type: string, payload: unknown): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return

    this.socket.send(JSON.stringify({ type, payload }))
  }

  sendMessage(message: string): void {
    if (this.dataChannel?.readyState !== 'open') {
      throw new Error('Data channel is not connected.')
    }

    this.dataChannel.send(message)
  }

  async sendFile(file: File): Promise<void> {
  const channel = this.dataChannel

if (!channel || channel.readyState !== 'open') {
  throw new Error('Data channel is not connected.')
}

channel.bufferedAmountLowThreshold = 256 * 1024
  channel.send(JSON.stringify({
    type: 'file-start',
    name: file.name,
    fileType: file.type,
    size: file.size,
  }))

  const buffer = await file.arrayBuffer()
  const chunkSize = 16 * 1024

  for (let offset = 0; offset < buffer.byteLength; offset += chunkSize) {
    const chunk = buffer.slice(offset, offset + chunkSize)
    channel.send(chunk)

    if (channel.bufferedAmount > 1024 * 1024) {
    await this.waitForBufferLow(channel)
   }
  }
}
private waitForBufferLow(channel: RTCDataChannel): Promise<void> {
  if (channel.bufferedAmount <= channel.bufferedAmountLowThreshold) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      channel.removeEventListener('bufferedamountlow', onLow)
      channel.removeEventListener('close', onClose)
    }

    const onLow = () => {
      cleanup()
      resolve()
    }

    const onClose = () => {
      cleanup()
      reject(new Error('Connection closed during file transfer.'))
    }

    channel.addEventListener('bufferedamountlow', onLow, { once: true })
    channel.addEventListener('close', onClose, { once: true })

    if (channel.bufferedAmount <= channel.bufferedAmountLowThreshold) {
      onLow()
    }
  })
}

  disconnect(): void {
    this.dataChannel?.close()
    this.peerConnection?.close()
    this.socket?.close()

    this.dataChannel = null
    this.peerConnection = null
    this.socket = null
    this.pendingCandidates = []

    this.callbacks.onStatus?.('Disconnected')
  }
}
