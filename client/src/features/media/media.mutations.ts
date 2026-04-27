import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "./media.api";
import { mediaKeys } from "./media.queries";
import type { ConfirmVideoUploadRequest } from "./media.types";

// ========================================================== IMAGES ==============================================================

export const usePostImage = (roomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => mediaApi.postImage(roomId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.images(roomId) });
    },
  });
};

export const useRemoveImage = (roomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: number) => mediaApi.removeImage(roomId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.images(roomId) });
    },
  });
};

// =========================================================== VIDEOS ==================================================================

/**
 * Video upload is a three step process orchestrated in one mutation:
 * 1. Ask the API for a presigned URL (sends mimeType)
 * 2. Upload the file directly to S3 using that URL (bypasses the API)
 * 3. Confirm with the API to save the metadata to DB
 *
 * The caller only needs to provide the file + metadata.
 * All three steps are handled internally here.
 */
export const useUploadVideo = (roomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      thumbnailUrl,
      durationSeconds,
    }: {
      file: File;
      title: string;
      description?: string;
      thumbnailUrl?: string;
      durationSeconds?: number;
    }) => {
      // Step 1 — get presigned URL from your API
      const { uploadUrl, fileUrl } = await mediaApi.getPresignedUrl(roomId, {
        mimeType: file.type,
      });

      // Step 2 — upload directly to S3
      await mediaApi.uploadVideoToS3(uploadUrl, file);

      // Step 3 — confirm with your API
      const confirmData: ConfirmVideoUploadRequest = {
        title,
        fileUrl,
        description,
        thumbnailUrl,
        durationSeconds,
      };

      return mediaApi.confirmVideoUpload(roomId, confirmData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.videos(roomId) });
    },
  });
};

export const useRemoveVideo = (roomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: number) => mediaApi.removeVideo(roomId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.videos(roomId) });
    },
  });
};