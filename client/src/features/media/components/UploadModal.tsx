import { useState, useRef, useCallback } from "react";
import { X, ImagePlus, Upload, FileVideo, Loader2 } from "lucide-react";
import { usePostImage } from "../media.mutations";
import { useUploadVideo } from "../media.mutations";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  mode: "image" | "video";
}

export const UploadModal = ({ isOpen, onClose, roomId, mode }: UploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: postImage, isPending: isImagePending } = usePostImage(roomId);
  const { mutateAsync: uploadVideo, isPending: isVideoPending } = useUploadVideo(roomId);
  const isPending = isImagePending || isVideoPending;

  const acceptedTypes = mode === "image" ? "image/*" : "video/*";

  const handleFile = (f: File) => {
    if (mode === "image" && !f.type.startsWith("image/")) return;
    if (mode === "video" && !f.type.startsWith("video/")) return;
    setFile(f);
    if (mode === "image") setPreview(URL.createObjectURL(f));
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file) return;
    if (mode === "image") {
      await postImage(file);
    } else {
      if (!videoTitle.trim()) return;
      await uploadVideo({ file, title: videoTitle.trim() });
    }
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setVideoTitle("");
    onClose();
  };

  const canSubmit = file !== null && !isPending && (mode === "image" || videoTitle.trim().length > 0);

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
            {/* Video title input */}
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

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDragging(false)}
              className={`relative w-full h-[160px] rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
                ${isDragging
                  ? "border-[#4F8EF7] bg-[#4F8EF7]/10"
                  : file
                  ? "border-[#424753]/30"
                  : "border-[#424753]/30 hover:border-[#4F8EF7]/50 hover:bg-[#4F8EF7]/5"
                }`}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e13]/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Upload size={14} /> Replace
                    </span>
                  </div>
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
              ) : file && mode === "video" ? (
                /* Video selected — no preview, just filename */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <FileVideo size={28} className="text-[#4F8EF7]" strokeWidth={1.5} />
                  <p className="text-xs font-semibold text-[#e3e1e9]/80 truncate max-w-[80%] px-2">{file.name}</p>
                  <button
                    onClick={handleRemove}
                    className="text-[10px] text-[#9497a1] hover:text-[#e3e1e9] transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
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
              className="px-6 py-2.5 text-sm font-bold bg-[#4F8EF7] text-white rounded-xl hover:bg-[#6ba3f9] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};