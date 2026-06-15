import { useQuery } from "@tanstack/react-query";
import { permissionApi } from "./permission.api";

export const permissionKeys = {
  all: ['permissions'] as const,
  roomPermissions: (roomId: number) => [...permissionKeys.all, 'room', roomId] as const,
};

export const useGetPermittedUsers = (roomId: number, enabled = true) => {
  return useQuery({
    queryKey: permissionKeys.roomPermissions(roomId),
    queryFn: () => permissionApi.getPermittedUsers(roomId),
    enabled: !!roomId && enabled,
  });
};
