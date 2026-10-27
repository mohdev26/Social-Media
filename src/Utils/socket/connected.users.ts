const connectedUsers = new Map<string, Set<string>>();

export const addConnection = (userId: string, socketId: string): boolean => {
  const sockets = connectedUsers.get(userId);

  if (!sockets) {
    connectedUsers.set(userId, new Set([socketId]));
    return true;
  }
  sockets.add(socketId);
  return false;
};

export const removeConnection = (userId: string, socketId: string): boolean => {
  const sockets = connectedUsers.get(userId);

  if (!sockets) return true;

  sockets.delete(socketId);

  if (sockets.size > 0) return false;

  connectedUsers.delete(userId);

  return true;
};

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};

export const getOnlineUserOnline = (): string[] => {
  return [...connectedUsers.keys()];
};

export const getUserSocketCount = (userId: string): number => {
  return connectedUsers.get(userId)?.size ?? 0;
};

