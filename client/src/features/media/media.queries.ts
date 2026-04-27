import { useQuery } from "@tanstack/react-query";
import { mediaApi } from "./media.api";

export const mediaKeys = {
  all: ['media'] as const,
  images: (roomId: number) => [...mediaKeys.all, 'images', roomId] as const,
  image: (roomId: number, imageId: number) => [...mediaKeys.all, 'images', roomId, imageId] as const,
  videos: (roomId: number) => [...mediaKeys.all, 'videos', roomId] as const,
  video: (roomId: number, videoId: number) => [...mediaKeys.all, 'videos', roomId, videoId] as const,
};

export const useGetImages = (roomId: number) => {
  return useQuery({
    queryKey: mediaKeys.images(roomId),
    queryFn: () => mediaApi.getImages(roomId),
    enabled: !!roomId,
  });
};

export const useGetImage = (roomId: number, imageId: number) => {
  return useQuery({
    queryKey: mediaKeys.image(roomId, imageId),
    queryFn: () => mediaApi.getImage(roomId, imageId),
    enabled: !!roomId && !!imageId,
  });
};

export const useGetVideos = (roomId: number) => {
  return useQuery({
    queryKey: mediaKeys.videos(roomId),
    queryFn: () => mediaApi.getVideos(roomId),
    enabled: !!roomId,
  });
};

export const useGetVideo = (roomId: number, videoId: number) => {
  return useQuery({
    queryKey: mediaKeys.video(roomId, videoId),
    queryFn: () => mediaApi.getVideo(roomId, videoId),
    enabled: !!roomId && !!videoId,
  });
};