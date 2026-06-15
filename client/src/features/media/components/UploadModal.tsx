import { useState, useRef, useCallback } from "react";
import { X, ImagePlus, FileVideo, Loader2 } from "lucide-react";
import { usePostImage } from "../media.mutations";
import { useUploadVideo } from "../media.mutations";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  mode: "image" | "video";
}

/**
 * Extracts a thumbnail frame from a video file using the Canvas API.
 * Seeks to `seekTime` seconds, draws the frame onto a canvas, and returns
 * a JPEG Blob + an object URL for preview.
 */
const extractVideoThumbnail = (
  file: File,
  seekTime = 1
): Promise<{ blob: Blob; previewUrl: string; durationSeconds: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.addEventListener("loadedmetadata", () => {
      // Clamp seek time to within the video duration
      video.currentTime = Math.min(seekTime, video.duration * 0.1);
    });

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas context unavailable"));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error("Failed to extract thumbnail frame"));
            return;
          }
          const previewUrl = URL.createObjectURL(blob);
          resolve({ blob, previewUrl, durationSeconds: Math.floor(video.duration) });
        },
        "image/jpeg",
        0.85 // quality
      );
    });

    video.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load video file"));
    });
  });
};

export const UploadModal = ({ isOpen, onClose, roomId, mode }: UploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Video-specific state
  const [videoTitle, setVideoTitle] = useState("");
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | undefined>(undefined);
  const [isExtractingThumb, setIsExtractingThumb] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: postImage, isPending: isImagePending } = usePostImage(roomId);
  const { mutateAsync: uploadVideo, isPending: isVideoPending } = useUploadVideo(roomId);
  const isPending = isImagePending || isVideoPending;

  const acceptedTypes = mode === "image" ? "image/*" : "video/*";

  const handleImageFile = (f: File) => {
    setFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleVideoFile = async (f: File) => {
    setFile(f);
    setThumbnailBlob(null);
    setThumbnailPreview(null);
    setDurationSeconds(undefined);
    setExtractionError(null);
    setIsExtractingThumb(true);

    try {
      const { blob, previewUrl, durationSeconds: dur } = await extractVideoThumbnail(f);
      setThumbnailBlob(blob);
      setThumbnailPreview(previewUrl);
      setDurationSeconds(dur);
    } catch (err) {
      setExtractionError("Couldn't extract thumbnail — the video will still upload without one.");
    } finally {
      setIsExtractingThumb(false);
    }
  };

  const handleFile = (f: File) => {
    if (mode === "image") {
      if (!f.type.startsWith("image/")) return;
      handleImageFile(f);
    } else {
      if (!f.type.startsWith("video/")) return;
      handleVideoFile(f);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [mode]);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setImagePreview(null);
    setThumbnailBlob(null);
    setThumbnailPreview(null);
    setDurationSeconds(undefined);
    setExtractionError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file) return;

    if (mode === "image") {
      await postImage(file);
    } else {
      if (!videoTitle.trim()) return;
      await uploadVideo({
        file,
        title: videoTitle.trim(),
        thumbnailBlob: thumbnailBlob ?? undefined,
        durationSeconds,
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setImagePreview(null);
    setVideoTitle("");
    setThumbnailBlob(null);
    setThumbnailPreview(null);
    setDurationSeconds(undefined);
    setExtractionError(null);
    onClose();
  };

  const canSubmit =
    file !== null &&
    !isPending &&
    !isExtractingThumb &&
    (mode === "image" || videoTitle.trim().length > 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-[500px] bg-[#1A1B21] rounded-2xl border border-[#424753]/20 shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-8 pb-6">
            <div>
              <h2 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-[#e3e1e9]">
                {mode === "image" ? "Upload Image" : "Upload Video"}
              </h2>
              <p className="text-sm text-[#9497a1] mt-1">
                {mode === "image"
                  ? "Add an image to this room's collection."
                  : "Add a video to this room's collection."}
              </p>
            </div>
            <button onClick={handleClose} className="text-[#9497a1] hover:text-[#e3e1e9] transition-colors mt-0.5">
              <X size={20} />
            </button>
          </div>

          <div className="px-8 pb-6 flex flex-col gap-5">
            {/* Video title */}
            {mode === "video" && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4F8EF7]">
                  Title
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. Campaign Reel 2024"
                  className="w-full bg-[#0d0e13] border border-[#424753]/30 rounded-xl px-4 py-3 text-sm text-[#e3e1e9] placeholder:text-[#9497a1]/50 focus:outline-none focus:border-[#4F8EF7]/50 focus:ring-1 focus:ring-[#4F8EF7]/20 transition-all"
                />
              </div>
            )}

            {/* File drop zone */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4F8EF7]">
                {mode === "image" ? "Image File" : "Video File"}
              </label>
              <div
                onClick={() => !file && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`relative w-full h-[140px] rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden
                  ${isDragging
                    ? "border-[#4F8EF7] bg-[#4F8EF7]/10"
                    : file
                    ? "border-[#424753]/30 cursor-default"
                    : "border-[#424753]/30 hover:border-[#4F8EF7]/50 hover:bg-[#4F8EF7]/5 cursor-pointer"
                  }`}
              >
                {/* Image preview */}
                {mode === "image" && imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e13]/60 to-transparent" />
                    <button
                      onClick={handleRemove}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#0d0e13]/80 border border-[#424753]/40 flex items-center justify-center text-[#9497a1] hover:text-[#e3e1e9] transition-colors"
                    >
                      <X size={13} />
                    </button>
                    <span className="absolute bottom-2 left-3 text-[10px] text-[#e3e1e9]/70 font-medium truncate max-w-[80%]">
                      {file?.name}
                    </span>
                  </>
                ) : mode === "video" && file ? (
                  /* Video selected — show filename + remove */
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <FileVideo size={28} className="text-[#4F8EF7]" strokeWidth={1.5} />
                    <p className="text-xs font-semibold text-[#e3e1e9]/80 truncate max-w-[80%] px-2">
                      {file.name}
                    </p>
                    <button
                      onClick={handleRemove}
                      className="text-[10px] text-[#9497a1] hover:text-[#e3e1e9] transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  /* Empty state */
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#9497a1]">
                    <div className="w-10 h-10 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center text-[#acc7ff]">
                      {mode === "image"
                        ? <ImagePlus size={20} strokeWidth={1.5} />
                        : <FileVideo size={20} strokeWidth={1.5} />
                      }
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-[#e3e1e9]/70">
                        Drop a file or <span className="text-[#4F8EF7]">browse</span>
                      </p>
                      <p className="text-[10px] text-[#9497a1]/60 mt-0.5">
                        {mode === "image" ? "PNG, JPG, WEBP" : "MP4, MOV, WEBM"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail preview — video only, shown after extraction */}
            {mode === "video" && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4F8EF7]">
                  Thumbnail Preview
                  <span className="text-[#9497a1] normal-case tracking-normal font-normal ml-1">
                    (auto-extracted)
                  </span>
                </label>

                <div className="w-full h-[100px] rounded-xl border border-[#424753]/20 overflow-hidden bg-[#0d0e13] flex items-center justify-center">
                  {isExtractingThumb ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={20} className="animate-spin text-[#4F8EF7]" />
                      <p className="text-[10px] text-[#9497a1]">Extracting frame...</p>
                    </div>
                  ) : thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Extracted thumbnail"
                      className="w-full h-full object-cover opacity-80"
                    />
                  ) : extractionError ? (
                    <p className="text-[10px] text-[#ffb4ab]/70 text-center px-4">
                      {extractionError}
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#9497a1]/50 text-center px-4">
                      Select a video to auto-extract a thumbnail frame
                    </p>
                  )}
                </div>

                {/* Duration info */}
                {durationSeconds !== undefined && (
                  <p className="text-[10px] text-[#9497a1]">
                    Duration detected:{" "}
                    <span className="text-[#e3e1e9] font-semibold">
                      {Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s
                    </span>
                  </p>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-8 py-6 pt-2">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-semibold text-[#9497a1] hover:text-[#e3e1e9] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2.5 text-sm font-bold bg-[#4F8EF7] text-white rounded-xl hover:bg-[#6ba3f9] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isExtractingThumb
                ? "Processing..."
                : isPending
                ? "Uploading..."
                : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};