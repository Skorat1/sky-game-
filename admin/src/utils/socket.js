import { io } from 'socket.io-client';
import { CONFIG } from '../config';

export const socket = io(CONFIG.SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 15,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
  query: {
    clientType: 'admin'
  }
});

export default socket;
