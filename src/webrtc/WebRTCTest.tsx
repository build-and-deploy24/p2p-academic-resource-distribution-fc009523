import './WebRTCTest.css'
import { useEffect, useRef, useState } from 'react'
import { PeerConnectionClient } from './peerConnection'

export default function WebRTCTest() {
  const clientRef = useRef<PeerConnectionClient | null>(null)

  const [roomId, setRoomId] = useState('campusshare-test')
  const [status, setStatus] = useState('Disconnected')
  const [message, setMessage] = useState('')
  const [receivedMessage, setReceivedMessage] = useState('')
  const [receivedFile, setReceivedFile] = useState<File | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      clientRef.current?.disconnect()
    }
  }, [])

  async function connect() {
    setError('')
    setReceivedMessage('')

    const client = new PeerConnectionClient({
      onStatus: setStatus,
      onMessage: setReceivedMessage,
      onError: setError,
      onFileReceived: setReceivedFile,
    })

    clientRef.current = client

    try {
      await client.connect(roomId.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed.')
    }
  }

  function disconnect() {
    clientRef.current?.disconnect()
    clientRef.current = null
  }

  function sendMessage() {
    try {
      clientRef.current?.sendMessage(message)
      setMessage('')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message could not be sent.')
    }
  }
  async function sendFile() {
  if (!selectedFile) {
    setError('Please select a file first.')
    return
  }

  try {
    await clientRef.current?.sendFile(selectedFile)
    setError('')
  } catch (err) {
    setError(err instanceof Error ? err.message : 'File could not be sent.')
  }
}

  
  return (
    <section className="webrtc-section">
      <header className="webrtc-header">
        <p className="webrtc-eyebrow">PEER-TO-PEER SHARING</p>
        <h2>WebRTC Connection Test</h2>
        <p className="webrtc-description">
          Connect with another peer to exchange messages and files directly.
        </p>
      </header>

      <div className="webrtc-connection">
        <div className="webrtc-panel-heading">
          <h3>Connection Setup</h3>
          <span className="webrtc-status">
            {status}
          </span>
        </div>

        <div className="webrtc-field">
          <label htmlFor="webrtc-room">Room ID</label>
          <input
            id="webrtc-room"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            disabled={status !== 'Disconnected'}
          />
        </div>

        <div className="webrtc-actions">
          <button
            type="button"
            className="webrtc-button"
            onClick={connect}
            disabled={status !== 'Disconnected' || !roomId.trim()}
          >
            Connect
          </button>

          <button
            type="button"
            className="webrtc-button webrtc-button-secondary"
            onClick={disconnect}
            disabled={status === 'Disconnected'}
          >
            Disconnect
          </button>
        </div>
      </div>

      <div className="webrtc-grid">
        <div className="webrtc-panel">
          <h3>Messages</h3>
          <p className="webrtc-panel-description">
            Exchange messages with your connected peer.
          </p>

          <div className="webrtc-field">
            <label htmlFor="webrtc-message">Your message</label>
            <div className="webrtc-message-row">
              <input
                id="webrtc-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type a test message"
              />

              <button
                type="button"
                className="webrtc-button"
                onClick={sendMessage}
                disabled={
                  status !== 'Data channel connected' || !message.trim()
                }
              >
                Send
              </button>
            </div>
          </div>

          {receivedMessage && (
            <div className="webrtc-feedback">
              <strong>Received message:</strong>
              <p>{receivedMessage}</p>
            </div>
          )}
        </div>

        <div className="webrtc-panel">
          <h3>File Transfer</h3>
          <p className="webrtc-panel-description">
            Select a file and send it directly to your connected peer.
          </p>

          <div className="webrtc-field">
            <label htmlFor="webrtc-file">Choose a file</label>
            <input
              id="webrtc-file"
              className="webrtc-file-input"
              type="file"
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] ?? null)
              }}
            />
          </div>

          <div className="webrtc-actions">
            <button
              type="button"
              className="webrtc-button"
              onClick={sendFile}
              disabled={!selectedFile || status !== 'Data channel connected'}
            >
              Send File
            </button>
          </div>

          <div className="webrtc-selected-file">
            Selected file: {selectedFile ? selectedFile.name : 'None'}
          </div>
        </div>
      </div>

      {error && (
        <div className="webrtc-feedback webrtc-error" role="alert">
          {error}
        </div>
      )}

      {receivedFile && (
        <div className="webrtc-received">
          <h3>File received successfully</h3>
          <p>Name: {receivedFile.name}</p>
          <p>Size: {(receivedFile.size / 1024).toFixed(2)} KB</p>

          <a
            className="webrtc-download"
            href={URL.createObjectURL(receivedFile)}
            download={receivedFile.name}
          >
            Download received file
          </a>
        </div>
      )}
    </section>
  )

}
