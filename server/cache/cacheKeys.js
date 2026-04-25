const keys = {
  login: {
    attempts: (userName) => `login:attempts:${userName}`,
  },

  room: (roomId) => `room:${roomId}`,

  rooms: {
    all: () => `rooms:all`,
    user: (userId) => `rooms:user:${userId}`,
    permitted: (userId) => `rooms:permitted:${userId}`,
  },

  user: {
    profile: (userId) => `user:profile:${userId}`,
  },

  permissions: {
    roomUsers: (roomId) => `room:${roomId}:users`,
  },

  media: {
    images: (roomId) => `room:${roomId}:images`,
    videos: (roomId) => `room:${roomId}:videos`,
  },
};

module.exports = keys;