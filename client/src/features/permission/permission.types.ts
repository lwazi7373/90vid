// ===================================================== ENTITY TYPES ===========================================================

export interface PermittedUser {
  permissionId: number;
  canUpload: number;
  canDelete: number;
  canEditRoom: number;
  grantedAt: string;
  userId: number;
  userName: string;
}

// ===================================================== REQUEST TYPES ===========================================================

export interface PermitUserRequest {
  userId: number;
  canUpload: number;
  canDelete: number;
  canEditRoom: number;
}

// ===================================================== RESPONSE TYPES ===========================================================

export interface GetPermittedUsersResponse {
  results: PermittedUser[];
  count: number;
}

export interface PermitUserResponse {
  permissionId: number;
  roomId: number;
  userId: number;
  canUpload: number;
  canDelete: number;
  canEditRoom: number;
  grantedBy: number;
}

export interface RevokeUserResponse {
  message: string;
}