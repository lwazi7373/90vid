import { apiClient } from "../../api/client";
import type {
  CreateRoomRequest,
  UpdateRoomRequest,
  CreateRoomResponse,
  UpdateRoomResponse,
  DeleteRoomResponse,
  GetRoomResponse,
  GetRoomsResponse,
  GetMyRoomsResponse,
  GetPermittedRoomsResponse,
} from "./room.types";

export const roomApi = {

  getRooms: async (): Promise<GetRoomsResponse> => {
    const response = await apiClient.get<GetRoomsResponse>("/rooms");
    return response.data;
  },

  getMyRooms: async (): Promise<GetMyRoomsResponse> => {
    const response = await apiClient.get<GetMyRoomsResponse>("/rooms/mine");
    return response.data;
  },

  getPermittedRooms: async (): Promise<GetPermittedRoomsResponse> => {
    const response = await apiClient.get<GetPermittedRoomsResponse>("/rooms/permitted");
    return response.data;
  },

  getRoom: async (roomId: number): Promise<GetRoomResponse> => {
    const response = await apiClient.get<GetRoomResponse>(`/rooms/${roomId}`);
    return response.data;
  },

  createRoom: async (data: CreateRoomRequest): Promise<CreateRoomResponse> => {
    const formData = new FormData();
    formData.append("roomName", data.roomName);
    if (data.description) formData.append("description", data.description);
    formData.append("image", data.thumbnail); // "image" must match imageUpload.single("image")

    const response = await apiClient.post<CreateRoomResponse>("/rooms", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateRoom: async (roomId: number, data: UpdateRoomRequest): Promise<UpdateRoomResponse> => {
    const formData = new FormData();
    if (data.roomName) formData.append("roomName", data.roomName);
    if (data.description) formData.append("description", data.description);
    if (data.thumbnail) formData.append("image", data.thumbnail); // only append if sent

    const response = await apiClient.patch<UpdateRoomResponse>(`/rooms/${roomId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteRoom: async (roomId: number): Promise<DeleteRoomResponse> => {
    const response = await apiClient.delete<DeleteRoomResponse>(`/rooms/${roomId}`);
    return response.data;
  },

};
