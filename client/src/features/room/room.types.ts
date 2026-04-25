// ===================================================== ENTITY TYPES ===========================================================
export interface Room {
  roomId: number;
  roomName: string;
  description: string | null;
  createdAt: string;
  creatorId: number;
  creatorName: string;
}

export interface MyRoom {
  roomId: number;
  roomName: string;
  description: string | null;
  createdAt: string;
}

export interface PermittedRoom {
  roomId: number;
  roomName: string;
  description: string | null;
  createdAt: string;
  creatorId: number;
  creatorName: string;
  canUpload: number;   
  canDelete: number;   
  canEditRoom: number; 
}

// ===================================================== REQUEST TYPES ===========================================================

export interface CreateRoomRequest {
  roomName: string;
  description?: string;
}

export interface UpdateRoomRequest {
  roomName?: string;
  description?: string;
}

// ===================================================== RESPONSE TYPES ===========================================================

// { roomId, roomName, description, createdBy } — no createdAt
export interface CreateRoomResponse {
  roomId: number;
  roomName: string;
  description: string | null;
  createdBy: number;
}

// { roomId, roomName, description, createdBy, createdAt }
export interface UpdateRoomResponse {
  roomId: number;
  roomName: string;
  description: string | null;
  createdBy: number;
  createdAt: string;
}

// { message: "Room deleted successfully" }
export interface DeleteRoomResponse {
  message: string;
}

// Single room — same shape as Room entity
export interface GetRoomResponse extends Room {}

// All rooms
export interface GetRoomsResponse {
  results: Room[];
  count: number;
}

// My rooms
export interface GetMyRoomsResponse {
  results: MyRoom[];
  count: number;
}

// Permitted rooms
export interface GetPermittedRoomsResponse {
  results: PermittedRoom[];
  count: number;
}