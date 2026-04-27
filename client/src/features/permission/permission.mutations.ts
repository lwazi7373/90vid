import { useMutation, useQueryClient } from "@tanstack/react-query";
import { permissionApi } from "./permission.api";
import { permissionKeys } from "./permission.queries";
import type { PermitUserRequest } from "./permission.types";

export const usePermitUser = (roomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PermitUserRequest) => permissionApi.permitUser(roomId, data),
    onSuccess: () => {
      // Refresh the permitted users list for this room
      queryClient.invalidateQueries({ queryKey: permissionKeys.roomPermissions(roomId) });
    },
  });
};

export const useRevokeUser = (roomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => permissionApi.revokeUser(roomId, userId),
    onSuccess: () => {
      // Refresh the permitted users list for this room
      queryClient.invalidateQueries({ queryKey: permissionKeys.roomPermissions(roomId) });
    },
  });
};