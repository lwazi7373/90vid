import { apiClient } from "../../api/client";
import type {
  GetImagesResponse,
  GetImageResponse,
  GetVideosResponse,
  GetVideoResponse,
  PostImageResponse,
  GetPresignedUrlRequest,
  GetPresignedUrlResponse,
  ConfirmVideoUploadRequest,
  ConfirmVideoUploadResponse,
  DeleteMediaResponse,
} from "./media.types";

export const mediaApi = {

  // =========================================================== IMAGES ==================================================================

  getImages: async (roomId: number): Promise<GetImagesResponse> => {
    const response = await apiClient.get<GetImagesResponse>(`/rooms/${roomId}/images`);
    return response.data;
  },

  getImage: async (roomId: number, imageId: number): Promise<GetImageResponse> => {
    const response = await apiClient.get<GetImageResponse>(`/rooms/${roomId}/images/${imageId}`);
    return response.data;
  },

  // File comes in as FormData — multer handles it on the backend
  postImage: async (roomId: number, file: File): Promise<PostImageResponse> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post<PostImageResponse>(
      `/rooms/${roomId}/images`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  removeImage: async (roomId: number, imageId: number): Promise<DeleteMediaResponse> => {
    const response = await apiClient.delete<DeleteMediaResponse>(`/rooms/${roomId}/images/${imageId}`);
    return response.data;
  },

  // ========================================================== VIDEOS ===============================================================

  getVideos: async (roomId: number): Promise<GetVideosResponse> => {
    const response = await apiClient.get<GetVideosResponse>(`/rooms/${roomId}/videos`);
    return response.data;
  },

  getVideo: async (roomId: number, videoId: number): Promise<GetVideoResponse> => {
    const response = await apiClient.get<GetVideoResponse>(`/rooms/${roomId}/videos/${videoId}`);
    return response.data;
  },

  // Step 1 — get presigned URL from your API
  getPresignedUrl: async (roomId: number, data: GetPresignedUrlRequest): Promise<GetPresignedUrlResponse> => {
    const response = await apiClient.post<GetPresignedUrlResponse>(
      `/rooms/${roomId}/videos/presigned-url`,
      data
    );
    return response.data;
  },

  // Step 2a — upload video file directly to S3 using the presigned URL
  // This goes directly to S3, NOT through your API — so no apiClient here
  uploadVideoToS3: async (uploadUrl: string, file: File): Promise<void> => {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
  },

  // Step 2b — confirm upload by saving metadata to DB
  confirmVideoUpload: async (roomId: number, data: ConfirmVideoUploadRequest): Promise<ConfirmVideoUploadResponse> => {
    const response = await apiClient.post<ConfirmVideoUploadResponse>(
      `/rooms/${roomId}/videos/confirm`,
      data
    );
    return response.data;
  },

  removeVideo: async (roomId: number, videoId: number): Promise<DeleteMediaResponse> => {
    const response = await apiClient.delete<DeleteMediaResponse>(`/rooms/${roomId}/videos/${videoId}`);
    return response.data;
  },

};