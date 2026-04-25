import { useQuery } from "@tanstack/react-query";
import { roomApi } from "./room.api";

export const roomKeys = {
  all: ['rooms'] as const,
  rooms: () => [...roomKeys.all, 'all'] as const,
  myRooms: () => [...roomKeys.all, 'mine'] as const,
  permittedRooms: () => [...roomKeys.all, 'permitted'] as const,
  room: (roomId: number) => [...roomKeys.all, roomId] as const,
};

export const useGetRooms = () => {
  return useQuery({
    queryKey: roomKeys.rooms(),
    queryFn: () => roomApi.getRooms(),
  });
};

export const useGetMyRooms = () => {
  return useQuery({
    queryKey: roomKeys.myRooms(),
    queryFn: () => roomApi.getMyRooms(),
  });
};

export const useGetPermittedRooms = () => {
  return useQuery({
    queryKey: roomKeys.permittedRooms(),
    queryFn: () => roomApi.getPermittedRooms(),
  });
};

export const useGetRoom = (roomId: number) => {
  return useQuery({
    queryKey: roomKeys.room(roomId),
    queryFn: () => roomApi.getRoom(roomId),
    enabled: !!roomId, // don't fire if roomId is 0 or undefined
  });
};