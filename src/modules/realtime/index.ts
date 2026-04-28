export { initializeSocketServer } from './socket.server';
export { emitEntityEvent, emitCustomEvent, getIO, setIO } from './realtime.emitter';
export { assignRooms, handleDisconnect, isUserOnline, getOnlineUserCount } from './socket.rooms';
export { persistNotification, getPendingNotifications } from './notification.persister';
export type { EntityContext, RealtimeEvent, SocketUser, PersistentNotification } from './realtime.interface';
