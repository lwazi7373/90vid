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

export const useUploadVideo = (roomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      thumbnailBlob,
      durationSeconds,
    }: {
      file: File;
      title: string;
      description?: string;
      thumbnailBlob?: Blob; // extracted by the client from the video using Canvas API
      durationSeconds?: number;
    }) => {
      // Step 1 — get presigned URL for the video
      const { uploadUrl, fileUrl } = await mediaApi.getPresignedVideoUrl(roomId, {
        mimeType: file.type,
      });

      // Step 2 — upload video directly to S3
      await mediaApi.uploadVideoToS3(uploadUrl, file);

      // Step 1.5 — if a thumbnail frame was extracted, upload it too
      let thumbnailUrl: string | undefined;
      if (thumbnailBlob) {
        // Step 1.5a — get presigned URL for the thumbnail
        const { uploadUrl: thumbnailUploadUrl, thumbnailUrl: generatedThumbnailUrl } =
          await mediaApi.getPresignedThumbnailUrl(roomId);

        // Step 1.5b — upload thumbnail frame directly to S3
        await mediaApi.uploadThumbnailToS3(thumbnailUploadUrl, thumbnailBlob);

        thumbnailUrl = generatedThumbnailUrl;
      }

      // Step 3 — confirm with the API, saving all metadata to DB
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