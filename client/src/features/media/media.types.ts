// ===================================================== ENTITY TYPES ===========================================================

export interface Image {
  imageId: number;
  fileUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
  uploadedById: number;
  uploadedByName: string;
}

export interface Video {
  videoId: number;
  title: string;
  description: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  createdAt: string;
  uploadedById: number;
  uploadedByName: string;
}

// ===================================================== REQUEST TYPES ===========================================================

// Image upload is handled by multer — no request type needed, it's a FormData file

export interface GetPresignedVideoUploadUrlRequest {
  mimeType: string;
}

export interface ConfirmVideoUploadRequest {
  title: string;
  fileUrl: string;
  description?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
}

export interface DeleteMediaResponse {
  message: string;
}

// ===================================================== RESPONSE TYPES ===========================================================

export interface GetImagesResponse {
  results: Image[];
  count: number;
}

export interface GetVideosResponse {
  results: Video[];
  count: number;
}

// Single image — same shape as Image entity
export interface GetImageResponse extends Image {}

// Single video — same shape as Video entity
export interface GetVideoResponse extends Video {}

// POST /images response
export interface PostImageResponse {
  imageId: number;
  fileUrl: string;
  thumbnailUrl: string;
  roomId: number;
  uploadedBy: number;
}

// POST /videos/presigned-url response
export interface GetPresignedVideoUploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
}

// POST /videos/thumbnail-url
export interface GetPresignedVideoThumbnailUrlResponse {
   uploadUrl: string;
   thumbnailUrl: string;
}

// POST /videos/confirm response
export interface ConfirmVideoUploadResponse {
  videoId: number;
  title: string;
  fileUrl: string;
  roomId: number;
  uploadedBy: number;
}