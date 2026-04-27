import { useQuery } from "@tanstack/react-query";
import { searchApi } from "./search.api";

export const searchKeys = {
  all: ['search'] as const,
  rooms: (roomName: string) => [...searchKeys.all, 'rooms', roomName] as const,
  users: (userName: string) => [...searchKeys.all, 'users', userName] as const,
};

export const useSearchRooms = (roomName: string) => {
  return useQuery({
    queryKey: searchKeys.rooms(roomName),
    queryFn: () => searchApi.searchRooms(roomName),
    enabled: roomName.trim().length > 0, // only search when there is actual input
    staleTime: 30 * 1000,               // 30 seconds — search results go stale quickly
  });
};

export const useSearchUsers = (userName: string) => {
  return useQuery({
    queryKey: searchKeys.users(userName),
    queryFn: () => searchApi.searchUsers(userName),
    enabled: userName.trim().length > 0,
    staleTime: 30 * 1000,
  });
};