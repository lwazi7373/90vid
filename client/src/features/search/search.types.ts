// ===================================================== ENTITY TYPES ===========================================================

export interface SearchedRoom {
  roomId: number;
  roomName: string;
  description: string | null;
  createdAt: string;
  creatorId: number;
  creatorName: string;
}

export interface SearchedUser {
  userId: number;
  userName: string;
  emailAddress: string;
  createdAt: string;
}

// ===================================================== RESPONSE TYPES ===========================================================

export interface SearchRoomsResponse {
  results: SearchedRoom[];
  count: number;
}

export interface SearchUsersResponse {
  results: SearchedUser[];
  count: number;
}