// ===================================================== ENTITY TYPES ===========================================================
export interface Room {
  roomId: number;
  roomName: string;
  description: string | null;
  thumbnailUrl: string;
  createdAt: string;
  creatorId: number;
  creatorName: string;
  imageCount: number;
  videoCount: number;
}

export interface MyRoom {
  roomId: number;
  roomName: string;
  description: string | null;
  thumbnailUrl: string;
  createdAt: string;
  imageCount: number;
  videoCount: number;
}

export interface PermittedRoom {
  roomId: number;
  roomName: string;
  description: string | null;
  thumbnailUrl: string;
  createdAt: string;
  creatorId: number;
  creatorName: string;
  canUpload: number;   
  canDelete: number;   
  canEditRoom: number; 
  imageCount: number;
  videoCount: number;  
}

// ===================================================== REQUEST TYPES ===========================================================

export interface CreateRoomRequest {
  roomName: string;
  description?: string;
  thumbnail: File; // room must have a background image
}

export interface UpdateRoomRequest {
  roomName?: string;
  description?: string;
  thumbnail?: File; //  user may only be updating name or description
}

// ===================================================== RESPONSE TYPES ===========================================================

// { roomId, roomName, description, createdBy } — no createdAt
export interface CreateRoomResponse {
  roomId: number;
  roomName: string;
  description: string | null;
  createdBy: number;
  thumbnailUrl: string;
}

// { roomId, roomName, description, createdBy, createdAt }
export interface UpdateRoomResponse {
  roomId: number;
  roomName: string;
  description: string | null;
  thumbnailUrl: string;
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