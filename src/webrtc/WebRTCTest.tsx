
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
    <section style={{ padding: '24px', border: '1px solid #ccc', margin: '24px 0' }}>
      <h2>WebRTC Connection Test</h2>

      <label htmlFor="webrtc-room">Room ID</label>
      <input
        id="webrtc-room"
        value={roomId}
        onChange={(event) => setRoomId(event.target.value)}
        disabled={status !== 'Disconnected'}
      />

      <p>Status: {status}</p>

      <button type="button" onClick={connect} disabled={status !== 'Disconnected' || !roomId.trim()}>
        Connect
      </button>

      <button type="button" onClick={disconnect} disabled={status === 'Disconnected'}>
        Disconnect
      </button>

      <hr />

      <label htmlFor="webrtc-message">Message</label>
      <input
        id="webrtc-message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Type a test message"
      />

      <button
        type="button"
        onClick={sendMessage}
        disabled={status !== 'Data channel connected' || !message.trim()}
      >
        Send
      </button>

      <div>
        <h3>File Transfer</h3>

        <input
            type="file"
            onChange={(event) => {
            setSelectedFile(event.target.files?.[0] ?? null)
            }}
        />

        <button
            onClick={sendFile}
            //disabled={!selectedFile || status !== 'Connected'}
            disabled={!selectedFile}
        >
            Send File
        </button>

        {/* {selectedFile && <p>Selected: {selectedFile.name}</p>} */}
        <p>Selected file: {selectedFile ? selectedFile.name : 'None'}</p>
        <p>Connection status: {status}</p>
        </div>

      {receivedMessage && (
        <p>Received: {receivedMessage}</p>
      )}

      {error && (
        <p role="alert" style={{ color: 'red' }}>{error}</p>
      )}
    {receivedFile && (
  <div>
    <h3>File received</h3>
    <p>{receivedFile.name}</p>
    <p>{(receivedFile.size / 1024).toFixed(2)} KB</p>
    <a
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
