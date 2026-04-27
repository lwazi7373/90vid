import { apiClient } from "../../api/client";
import type {
  GetPermittedUsersResponse,
  PermitUserRequest,
  PermitUserResponse,
  RevokeUserResponse,
} from "./permission.types";

export const permissionApi = {

  getPermittedUsers: async (roomId: number): Promise<GetPermittedUsersResponse> => {
    const response = await apiClient.get<GetPermittedUsersResponse>(`/rooms/${roomId}/permissions`);
    return response.data;
  },

  permitUser: async (roomId: number, data: PermitUserRequest): Promise<PermitUserResponse> => {
    const response = await apiClient.post<PermitUserResponse>(`/rooms/${roomId}/permissions`, data);
    return response.data;
  },

  revokeUser: async (roomId: number, userId: number): Promise<RevokeUserResponse> => {
    const response = await apiClient.delete<RevokeUserResponse>(`/rooms/${roomId}/permissions/${userId}`);
    return response.data;
  },

};