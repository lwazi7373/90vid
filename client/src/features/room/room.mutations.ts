import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomApi } from "./room.api";
import { roomKeys } from "./room.queries";
import type { CreateRoomRequest, UpdateRoomRequest } from "./room.types";

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoomRequest) => roomApi.createRoom(data),
    onSuccess: () => {
      // Invalidate both all rooms and my rooms — both feeds need to update
      queryClient.invalidateQueries({ queryKey: roomKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: roomKeys.myRooms() });
    },
  });
};

export const useUpdateRoom = (roomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRoomRequest) => roomApi.updateRoom(roomId, data),
    onSuccess: () => {
      // Invalidate the specific room + any list that might show its name/description
      queryClient.invalidateQueries({ queryKey: roomKeys.room(roomId) });
      queryClient.invalidateQueries({ queryKey: roomKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: roomKeys.myRooms() });
      queryClient.invalidateQueries({ queryKey: roomKeys.permittedRooms() });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => roomApi.deleteRoom(roomId),
    onSuccess: () => {
      // Invalidate all room lists — the room is gone from everything
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
};