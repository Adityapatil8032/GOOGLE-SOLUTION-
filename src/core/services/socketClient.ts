import { io, type Socket } from 'socket.io-client';
import { apiBaseUrl, socketServerUrl } from '../config/api';

let socketInstance: Socket | null = null;
let activeIdentity: { userId: string; userRole: string } | null = null;
let connectListener: (() => void) | null = null;

const resolveSocketUrl = () => {
  if (socketServerUrl) {
    return socketServerUrl;
  }

  if (typeof window === 'undefined') {
    return apiBaseUrl || 'http://localhost:8080';
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }

  return window.location.origin;
};

export const connectSocket = (userId: string, userRole: string) => {
  if (!userId) return null;

  if (!socketInstance) {
    socketInstance = io(resolveSocketUrl(), {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
  }

  const identityChanged =
    !activeIdentity ||
    activeIdentity.userId !== userId ||
    activeIdentity.userRole !== userRole;

  if (identityChanged || !socketInstance.connected) {
    if (connectListener) {
      socketInstance.off('connect', connectListener);
    }

    connectListener = () => {
      socketInstance?.emit('user_connected', { userId, userRole });
    };
    socketInstance.on('connect', connectListener);

    if (socketInstance.connected) {
      socketInstance.emit('user_connected', { userId, userRole });
    }
  }

  activeIdentity = { userId, userRole };
  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    if (connectListener) {
      socketInstance.off('connect', connectListener);
      connectListener = null;
    }

    // Only disconnect if we have an instance to prevent warnings during rapid remounts
    if (socketInstance.connected) {
      socketInstance.disconnect();
    }
    socketInstance = null;
  }
  activeIdentity = null;
};
