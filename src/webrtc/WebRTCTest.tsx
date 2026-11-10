
import { useEffect, useRef, useState } from 'react'
import { PeerConnectionClient } from './peerConnection'
import './WebRTCTest.css'

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
      <div className="webrtc-header">
        <p className="webrtc-eyebrow">PEER-TO-PEER SHARING</p>
        <h2>CampusShare Connection</h2>
        <p className="webrtc-description">
          Connect with another student to exchange messages and academic
          resources directly between devices.
        </p>
      </div>

      <div className="webrtc-connection">
        <div className="webrtc-panel-heading">
          <h3>Connection</h3>
          <span className="webrtc-status">{status}</span>
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
            Send a message to the connected peer.
          </p>

          <div className="webrtc-field">
            <label htmlFor="webrtc-message">Your message</label>
            <div className="webrtc-message-row">
              <input
                id="webrtc-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type a message..."
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
          <h3>File Sharing</h3>
          <p className="webrtc-panel-description">
            Select an academic resource to send to your connected peer.
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

          <div className="webrtc-selected-file">
            <strong>Selected file:</strong>{' '}
            {selectedFile ? selectedFile.name : 'No file selected'}
          </div>

          <div className="webrtc-actions" style={{ marginTop: '16px' }}>
            <button
              type="button"
              className="webrtc-button"
              onClick={sendFile}
              disabled={!selectedFile}
            >
              Send File
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="webrtc-feedback webrtc-error" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {receivedFile && (
        <div className="webrtc-received">
          <h3>File Received Successfully</h3>
          <p>
            <strong>File name:</strong> {receivedFile.name}
          </p>
          <p>
            <strong>File size:</strong>{' '}
            {(receivedFile.size / 1024).toFixed(2)} KB
          </p>
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