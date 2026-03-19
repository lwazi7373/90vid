// ============= ENTITY TYPES =============
export interface AuthUser {
  userId: number;
  userName: string;
}

export interface User {
  userId: number;
  userName: string;
  emailAddress: string;
  contactNo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  rooms: {
    created: Room[];
    permitted: Room[];
  };
  uploadStats: {
    totalImages: number;
    totalVideos: number;
    totalDurationSeconds: string;
  };
}

// Room shape used inside User --> Return to this
export interface Room {
  roomId: number;
  roomName: string;
  description: string | null;
  createdAt: string;
}

// ============= REQUEST TYPES ============= 
export interface RegisterRequest {
    userName: string;
    userPassword: string;
    emailAddress: string;
    contactNo?: string; // string, not number
    isActive?: boolean;
}

export interface LoginRequest {
    userName: string;
    userPassword: string;
}

// ============= RESPONSE TYPES ============= 
export interface RegisterResponse {
    msg: string;
}

export interface LoginResponse {
    msg: string;
    authToken: string;
    user: AuthUser;
}

export interface GetMeResponse {
    msg: string;
    user: User;
}

// ============= CONTEXT TYPES =============
export interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginPending: boolean;
  isRegisterPending: boolean;
  // Actions
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
}