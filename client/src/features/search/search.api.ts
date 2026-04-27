import { apiClient } from "../../api/client";
import type { SearchRoomsResponse, SearchUsersResponse } from "./search.types";

export const searchApi = {

  searchRooms: async (roomName: string): Promise<SearchRoomsResponse> => {
    const response = await apiClient.get<SearchRoomsResponse>("/search/rooms", {
      params: { roomName },
    });
    return response.data;
  },

  searchUsers: async (userName: string): Promise<SearchUsersResponse> => {
    const response = await apiClient.get<SearchUsersResponse>("/search/users", {
      params: { userName },
    });
    return response.data;
  },

};