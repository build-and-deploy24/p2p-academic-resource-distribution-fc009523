
import type { FastifyInstance } from 'fastify';
import WebSocket, { type RawData } from 'ws';

type SignalType = 'offer' | 'answer' | 'ice-candidate';

type ClientMessage =
  | {
      type: 'join';
      roomId: string;
    }
  | {
      type: SignalType;
      payload: unknown;
    };

type PeerRoom = Set<WebSocket>;

// Stores connected peers, grouped by room ID.
const rooms = new Map<string, PeerRoom>();

function sendMessage(socket: WebSocket, message: object): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function isValidRoomId(roomId: unknown): roomId is string {
  return (
    typeof roomId === 'string' &&
    /^[a-zA-Z0-9_-]{1,64}$/.test(roomId)
  );
}

export async function signalingRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get(
    '/ws/signaling',
    { websocket: true },
    (socket) => {
      let joinedRoomId: string | null = null;

      socket.on('message', (raw: RawData) => {
        let message: ClientMessage;

        try {
          message = JSON.parse(raw.toString()) as ClientMessage;
        } catch {
          sendMessage(socket, {
            type: 'error',
            message: 'Invalid JSON message.',
          });
          return;
        }

        // Handle room joining.
        if (message.type === 'join') {
          if (joinedRoomId !== null) {
            sendMessage(socket, {
              type: 'error',
              message: 'You have already joined a room.',
            });
            return;
          }

          if (!isValidRoomId(message.roomId)) {
            sendMessage(socket, {
              type: 'error',
              message: 'Invalid room ID.',
            });
            return;
          }

          const roomId = message.roomId;
          let room = rooms.get(roomId);

          if (room && room.size >= 2) {
            sendMessage(socket, {
              type: 'error',
              message: 'Room is full.',
            });
            return;
          }

          if (!room) {
            room = new Set<WebSocket>();
            rooms.set(roomId, room);
          }

          room.add(socket);
          joinedRoomId = roomId;

          sendMessage(socket, {
            type: 'joined',
            roomId,
            peerCount: room.size,
          });

          if (room.size === 1) {
            sendMessage(socket, {
              type: 'waiting',
              message: 'Waiting for another peer.',
            });
          } else {
            for (const peer of room) {
              if (peer !== socket) {
                sendMessage(peer, {
                  type: 'peer-joined',
                  roomId,
                });
              }
            }
          }

          return;
        }

        // Only peers that have joined a room can exchange signals.
        if (!joinedRoomId) {
          sendMessage(socket, {
            type: 'error',
            message: 'Join a room before sending signals.',
          });
          return;
        }

        // Accept only supported WebRTC signaling messages.
        if (
          !['offer', 'answer', 'ice-candidate'].includes(message.type) ||
          !('payload' in message) ||
          typeof message.payload !== 'object' ||
          message.payload === null
        ) {
          sendMessage(socket, {
            type: 'error',
            message: 'Invalid signaling message.',
          });
          return;
        }

        const room = rooms.get(joinedRoomId);

        if (!room) {
          return;
        }

        // Relay the signaling message to the other peer.
        for (const peer of room) {
          if (peer !== socket) {
            sendMessage(peer, {
              type: message.type,
              payload: message.payload,
            });
          }
        }
      });

      socket.on('close', () => {
        if (!joinedRoomId) {
          return;
        }

        const room = rooms.get(joinedRoomId);

        if (!room) {
          return;
        }

        room.delete(socket);

        for (const peer of room) {
          sendMessage(peer, {
            type: 'peer-left',
            roomId: joinedRoomId,
          });
        }

        if (room.size === 0) {
          rooms.delete(joinedRoomId);
        }
      });
    },
  );
}
